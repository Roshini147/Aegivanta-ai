from typing import List
from fastapi import APIRouter, HTTPException
from app.schemas.payloads import EvidenceCreate, EvidenceResponse
from app.services.evidence_service import EvidenceService
from app.database.session import SyncSessionLocal

router = APIRouter(prefix="/api/evidence", tags=["Verification Evidence"])

@router.post("", response_model=EvidenceResponse)
def record_evidence(payload: EvidenceCreate):
    db = SyncSessionLocal()
    try:
        ev = EvidenceService.record_evidence(
            db=db,
            task_id=payload.task_id,
            evidence_type=payload.evidence_type,
            source=payload.source,
            description=payload.description,
            is_simulated=payload.is_simulated,
            actor="web_user"
        )
        return EvidenceResponse(
            id=ev.id,
            task_id=ev.task_id,
            evidence_type=ev.evidence_type,
            source=ev.source,
            description=ev.description,
            classification=ev.classification,
            is_simulated=ev.is_simulated,
            timestamp=ev.timestamp
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        db.close()

@router.get("/{task_id}", response_model=List[EvidenceResponse])
def get_evidence(task_id: str):
    db = SyncSessionLocal()
    try:
        ev_list = EvidenceService.get_evidence_for_task(db, task_id)
        return [
            EvidenceResponse(
                id=e.id,
                task_id=e.task_id,
                evidence_type=e.evidence_type,
                source=e.source,
                description=e.description,
                classification=e.classification,
                is_simulated=e.is_simulated,
                timestamp=e.timestamp
            )
            for e in ev_list
        ]
    finally:
        db.close()
