import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.database.session import init_db
from app.api import api_router
from app.api.routes_notifications import router as notifications_router
from app.mcp.server import mcp_server


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("aegivanta.main")

# Build MCP Starlette Streamable HTTP application
mcp_asgi_app = mcp_server.streamable_http_app(streamable_http_path="/mcp")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database
    logger.info("Initializing Aegivanta AI SQLite database...")
    await init_db()
    logger.info("Database initialized successfully.")
    
    # Run the MCP Server's lifespan context
    async with mcp_asgi_app.router.lifespan_context(mcp_asgi_app):
        logger.info(f"Streamable HTTP MCP Server mounted at endpoint: {settings.MCP_PATH}")
        yield
    
    logger.info("Aegivanta AI backend shut down cleanly.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Intelligent Home-Safety and Departure Preparation Coordination Agent",
    lifespan=lifespan
)

# CORS configuration for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000"
    ],
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Router
app.include_router(api_router)
app.include_router(notifications_router)


# Mount MCP ASGI App at /mcp
app.mount("/mcp", mcp_asgi_app)

@app.get("/", response_class=HTMLResponse)
def root_index():
    return """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Aegivanta AI — Enterprise Backend & MCP Server</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: #070B14;
      color: #E2E8F0;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .card {
      max-width: 640px;
      width: 100%;
      background: #0D172E;
      border: 1px solid #1A2D52;
      border-radius: 20px;
      padding: 36px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 30px rgba(6, 182, 212, 0.1);
      position: relative;
      overflow: hidden;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 12px;
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: #34D399;
      font-size: 11px;
      font-weight: 700;
      border-radius: 9999px;
      margin-bottom: 16px;
    }
    .badge-dot {
      width: 6px;
      height: 6px;
      background: #10B981;
      border-radius: 50%;
      box-shadow: 0 0 8px #10B981;
    }
    h1 {
      font-size: 26px;
      font-weight: 800;
      color: #FFFFFF;
      letter-spacing: -0.02em;
      margin-bottom: 6px;
    }
    p.subtitle {
      font-size: 13px;
      color: #94A3B8;
      margin-bottom: 24px;
    }
    .primary-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 100%;
      padding: 14px 20px;
      background: linear-gradient(135deg, #06B6D4, #14B8A6);
      color: #020617;
      text-decoration: none;
      font-size: 14px;
      font-weight: 700;
      border-radius: 12px;
      box-shadow: 0 8px 20px rgba(6, 182, 212, 0.25);
      transition: all 0.2s;
      margin-bottom: 24px;
    }
    .primary-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 12px 24px rgba(6, 182, 212, 0.35);
      filter: brightness(1.05);
    }
    .links-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
    }
    .link-item {
      display: block;
      padding: 12px 14px;
      background: #091122;
      border: 1px solid #16274A;
      border-radius: 10px;
      text-decoration: none;
      color: #CBD5E1;
      font-size: 12px;
      font-weight: 600;
      transition: all 0.15s;
    }
    .link-item:hover {
      background: #111F3D;
      border-color: #06B6D4;
      color: #38BDF8;
    }
    .link-desc {
      display: block;
      font-size: 10px;
      color: #64748B;
      font-weight: 400;
      margin-top: 2px;
    }
    .footer {
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid #142340;
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      color: #64748B;
      font-family: 'JetBrains Mono', monospace;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">
      <span class="badge-dot"></span>
      Backend & MCP Server Operational
    </div>
    <h1>Aegivanta AI</h1>
    <p class="subtitle">Intelligence That Acts. Safety You Can Verify.</p>
    
    <a href="http://127.0.0.1:5173" class="primary-btn">
      <span>Open Web Application (http://localhost:5173) &rarr;</span>
    </a>

    <div class="links-grid">
      <a href="/docs" class="link-item">
        Interactive API Docs (Swagger)
        <span class="link-desc">Test REST endpoints directly in browser</span>
      </a>
      <a href="/mcp" class="link-item">
        MCP Endpoint
        <span class="link-desc">Streamable HTTP Model Context Protocol</span>
      </a>
      <a href="/api/plans" class="link-item">
        Safety Plans API
        <span class="link-desc">Query active departure plans</span>
      </a>
      <a href="/health" class="link-item">
        System Health Check
        <span class="link-desc">Service and telemetry status</span>
      </a>
    </div>

    <div class="footer">
      <span>FastAPI v0.115 &bull; SQLite Verified</span>
      <span>Port: 8000</span>
    </div>
  </div>
</body>
</html>
"""

@app.get("/health")
def health_check():
    return {
        "status": "HEALTHY",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "mcp_streamable_http_endpoint": "/mcp",
        "mcp_spec": settings.MCP_SPEC_VERSION
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.API_HOST, port=settings.API_PORT, reload=True)
