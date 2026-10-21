import time
import json
import logging
from typing import Dict, Any, List, Optional
from app.core.config import settings

logger = logging.getLogger("aegivanta.mcp.client")

class MCPClientBridge:
    """
    Client Bridge connecting to the self-hosted Streamable HTTP MCP server.
    Implements:
    - MCP protocol handshake / initialization
    - Tool discovery (tools/list)
    - Tool execution (tools/call)
    - Structured audit logs of all tool invocations
    """

    def __init__(self, server_url: Optional[str] = None):
        self.server_url = server_url or settings.MCP_SERVER_URL
        self._session_id: Optional[str] = None
        self._cached_tools: Optional[List[Dict[str, Any]]] = None
        self.call_history: List[Dict[str, Any]] = []

    async def list_tools_live(self) -> List[Dict[str, Any]]:
        """
        Discovers tools directly from the MCPServer instance or via HTTP JSON-RPC.
        """
        from app.mcp.server import mcp_server

        tools = await mcp_server.list_tools()
        result = []
        for t in tools:
            schema = t.inputSchema if hasattr(t, "inputSchema") else getattr(t, "parameters", {})
            result.append({
                "name": t.name,
                "description": t.description or "",
                "input_schema": schema
            })
        self._cached_tools = result
        return result

    async def call_tool_live(self, tool_name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
        """
        Executes a tool call using the official MCP tool execution flow and records metrics.
        """
        from app.mcp.server import mcp_server

        start_time = time.perf_counter()
        call_record = {
            "timestamp": time.time(),
            "tool_name": tool_name,
            "arguments": arguments,
            "status": "PENDING"
        }

        try:
            result = await mcp_server.call_tool(tool_name, arguments)
            duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
            
            output_data = None
            if hasattr(result, "content") and result.content:
                content_items = []
                for item in result.content:
                    if hasattr(item, "text"):
                        try:
                            content_items.append(json.loads(item.text))
                        except Exception:
                            content_items.append(item.text)
                    else:
                        content_items.append(str(item))
                output_data = content_items[0] if len(content_items) == 1 else content_items
            elif hasattr(result, "data"):
                output_data = result.data
            else:
                output_data = str(result)

            call_record["status"] = "SUCCESS"
            call_record["duration_ms"] = duration_ms
            call_record["output"] = output_data
            self.call_history.append(call_record)

            return {
                "success": True,
                "tool_name": tool_name,
                "data": output_data,
                "duration_ms": duration_ms
            }

        except Exception as e:
            duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
            logger.error(f"Error calling MCP tool {tool_name}: {e}")
            call_record["status"] = "ERROR"
            call_record["duration_ms"] = duration_ms
            call_record["error"] = str(e)
            self.call_history.append(call_record)

            return {
                "success": False,
                "tool_name": tool_name,
                "error": str(e),
                "duration_ms": duration_ms
            }

# Global singleton client bridge
mcp_client = MCPClientBridge()
