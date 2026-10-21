from fastapi import APIRouter
from app.api.routes_plans import router as plans_router
from app.api.routes_tasks import router as tasks_router
from app.api.routes_evidence import router as evidence_router
from app.api.routes_confirmations import router as confirmations_router
from app.api.routes_reports import router as reports_router
from app.api.routes_agent import router as agent_router
from app.api.routes_mcp import router as mcp_router
from app.api.routes_notifications import router as notifications_router

api_router = APIRouter()
api_router.include_router(plans_router)
api_router.include_router(tasks_router)
api_router.include_router(evidence_router)
api_router.include_router(confirmations_router)
api_router.include_router(reports_router)
api_router.include_router(agent_router)
api_router.include_router(mcp_router)
api_router.include_router(notifications_router)

__all__ = ["api_router"]

