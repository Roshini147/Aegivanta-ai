import asyncio
from app.mcp.server import mcp_server
from app.core.config import settings

if __name__ == "__main__":
    print(f"Starting Dedicated Aegivanta AI Streamable HTTP MCP Server on http://{settings.MCP_HOST}:{settings.MCP_PORT}{settings.MCP_PATH}")
    asyncio.run(mcp_server.run_streamable_http_async(
        host=settings.MCP_HOST,
        port=settings.MCP_PORT,
        streamable_http_path=settings.MCP_PATH
    ))
