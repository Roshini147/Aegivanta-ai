from fastapi import APIRouter, HTTPException
from app.schemas.payloads import SafetyReport
from app.services.report_service import ReportService
from app.database.session import SyncSessionLocal

router = APIRouter(prefix="/api/reports", tags=["Safety Reports"])

@router.get("/{plan_id}", response_model=SafetyReport)
def get_safety_report(plan_id: str):
    db = SyncSessionLocal()
    try:
        report = ReportService.generate_safety_report(db, plan_id)
        return report
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    finally:
        db.close()
