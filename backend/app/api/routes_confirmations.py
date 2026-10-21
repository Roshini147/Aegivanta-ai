from typing import List
from fastapi import APIRouter, HTTPException
from app.schemas.payloads import ConfirmationCreate, ConfirmationResolve, ConfirmationResponse
from app.services.confirmation_service import ConfirmationService
from app.database.session import SyncSessionLocal

router = APIRouter(prefix="/api/confirmations", tags=["Action Confirmations"])

@router.get("", response_model=List[ConfirmationResponse])
def get_pending_confirmations():
    db = SyncSessionLocal()
    try:
        conf_list = ConfirmationService.get_pending_confirmations(db)
        return [
            ConfirmationResponse(
                id=c.id,
                action_type=c.action_type,
                target_id=c.target_id,
                parameters=c.parameters,
                rationale=c.rationale,
                status=c.status,
                requested_at=c.requested_at,
                resolved_at=c.resolved_at
            )
            for c in conf_list
        ]
    finally:
        db.close()

@router.post("", response_model=ConfirmationResponse)
def create_confirmation_request(payload: ConfirmationCreate):
    db = SyncSessionLocal()
    try:
        c = ConfirmationService.request_confirmation(
            db=db,
            action_type=payload.action_type,
            target_id=payload.target_id,
            rationale=payload.rationale,
            parameters=payload.parameters
        )
        return ConfirmationResponse(
            id=c.id,
            action_type=c.action_type,
            target_id=c.target_id,
            parameters=c.parameters,
            rationale=c.rationale,
            status=c.status,
            requested_at=c.requested_at,
            resolved_at=c.resolved_at
        )
    finally:
        db.close()

@router.post("/{confirmation_id}/resolve")
def resolve_confirmation(confirmation_id: str, payload: ConfirmationResolve):
    db = SyncSessionLocal()
    try:
        c, message = ConfirmationService.resolve_confirmation(
            db=db,
            confirmation_id=confirmation_id,
            approved=payload.approved,
            notes=payload.notes
        )
        return {
            "confirmation_id": c.id,
            "action_type": c.action_type,
            "status": c.status,
            "outcome_message": message
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        db.close()
