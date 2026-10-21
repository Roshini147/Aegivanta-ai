import os
from pathlib import Path
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent.parent

class Settings(BaseModel):
    PROJECT_NAME: str = "Aegivanta AI"
    VERSION: str = "1.0.0"
    TAGLINE: str = "Intelligence That Acts. Safety You Can Verify."
    
    # Database
    DATABASE_PATH: Path = BASE_DIR / "aegivanta.db"
    DATABASE_URL: str = f"sqlite+aiosqlite:///{DATABASE_PATH}"
    SYNC_DATABASE_URL: str = f"sqlite:///{DATABASE_PATH}"
    
    # Server configuration
    API_HOST: str = os.getenv("API_HOST", "127.0.0.1")
    API_PORT: int = int(os.getenv("API_PORT", "8000"))
    
    # MCP Protocol and Server configuration
    MCP_HOST: str = os.getenv("MCP_HOST", "127.0.0.1")
    MCP_PORT: int = int(os.getenv("MCP_PORT", "8001"))
    MCP_PATH: str = "/mcp"
    MCP_SERVER_URL: str = f"http://{MCP_HOST}:{MCP_PORT}{MCP_PATH}"
    MCP_SPEC_VERSION: str = "2025-11-25"
    
    # AI / LLM configuration
    OPENAI_API_KEY: str | None = os.getenv("OPENAI_API_KEY")
    GEMINI_API_KEY: str | None = os.getenv("GEMINI_API_KEY")
    
    # Smart Home Verification Network
    TELEMETRY_PROVIDER: str = "Aegivanta Verified Telemetry Network"

settings = Settings()
