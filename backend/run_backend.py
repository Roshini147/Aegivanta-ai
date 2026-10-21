import uvicorn
from app.core.config import settings

if __name__ == "__main__":
    print(f"Starting Aegivanta AI Backend on http://{settings.API_HOST}:{settings.API_PORT}")
    print(f"Mounted Streamable HTTP MCP Endpoint: http://{settings.API_HOST}:{settings.API_PORT}{settings.MCP_PATH}")
    uvicorn.run("app.main:app", host=settings.API_HOST, port=settings.API_PORT, reload=False)

