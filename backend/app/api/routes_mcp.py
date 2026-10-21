from typing import List, Dict, Any
from fastapi import APIRouter, HTTPException
from app.mcp.client_bridge import mcp_client
from app.schemas.payloads import MCPToolInfo, MCPDirectCallRequest, MCPDirectCallResponse
from app.core.config import settings

router = APIRouter(prefix="/api/mcp", tags=["MCP Developer Bridge"])

@router.get("/status")
def get_mcp_status():
    return {
        "status": "ONLINE",
        "protocol_version": settings.MCP_SPEC_VERSION,
        "transport": "Streamable HTTP",
        "endpoint": settings.MCP_PATH,
        "server_url": settings.MCP_SERVER_URL,
        "tool_count": 7,
        "supported_features": [
            "Streamable HTTP Transport (POST & SSE)",
            "tools/list discovery",
            "tools/call execution",
            "Session Management (MCP-Session-Id)",
            "Audit Trail & Redaction"
        ]
    }

@router.get("/tools", response_model=List[MCPToolInfo])
async def list_mcp_tools():
    try:
        tools = await mcp_client.list_tools_live()
        return [
            MCPToolInfo(
                name=t["name"],
                description=t["description"],
                input_schema=t["input_schema"]
            )
            for t in tools
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/tools/call", response_model=MCPDirectCallResponse)
async def call_mcp_tool(payload: MCPDirectCallRequest):
    result = await mcp_client.call_tool_live(payload.tool_name, payload.arguments)
    return MCPDirectCallResponse(
        tool_name=payload.tool_name,
        success=result["success"],
        data=result.get("data"),
        error=result.get("error"),
        execution_time_ms=result.get("duration_ms", 0.0)
    )

@router.get("/history")
def get_mcp_history():
    return {
        "count": len(mcp_client.call_history),
        "history": mcp_client.call_history[-50:]  # Last 50 calls
    }
