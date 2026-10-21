import uuid
import json
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any, Tuple
from sqlalchemy.orm import Session
from app.models.entities import ActionConfirmation, ConfirmationStatus

class ConfirmationService:
    @staticmethod
    def request_confirmation(
        db: Session,
        action_type: str,
        target_id: str,
        rationale: str,
        parameters: Optional[Dict[str, Any]] = None
    ) -> ActionConfirmation:
        """
        Creates a pending confirmation request for a consequential action.
        DOES NOT execute the action.
        """
        confirmation = ActionConfirmation(
            id=str(uuid.uuid4()),
            action_type=action_type,
            target_id=target_id,
            parameters=json.dumps(parameters or {}),
            rationale=rationale,
            status=ConfirmationStatus.PENDING.value
        )
        db.add(confirmation)
        db.commit()
        db.refresh(confirmation)
        return confirmation

    @staticmethod
    def get_pending_confirmations(db: Session) -> List[ActionConfirmation]:
        return db.query(ActionConfirmation).filter(ActionConfirmation.status == ConfirmationStatus.PENDING.value).all()

    @staticmethod
    def get_confirmation(db: Session, confirmation_id: str) -> Optional[ActionConfirmation]:
        return db.query(ActionConfirmation).filter(ActionConfirmation.id == confirmation_id).first()

    @staticmethod
    def resolve_confirmation(
        db: Session,
        confirmation_id: str,
        approved: bool,
        notes: Optional[str] = None
    ) -> Tuple[ActionConfirmation, str]:
        confirmation = db.query(ActionConfirmation).filter(ActionConfirmation.id == confirmation_id).first()
        if not confirmation:
            raise ValueError(f"Confirmation {confirmation_id} not found.")

        if confirmation.status != ConfirmationStatus.PENDING.value:
            raise ValueError(f"Confirmation {confirmation_id} is already {confirmation.status}.")

        confirmation.status = ConfirmationStatus.APPROVED.value if approved else ConfirmationStatus.REJECTED.value
        confirmation.resolved_at = datetime.now(timezone.utc)
        
        outcome_message = (
            f"Action '{confirmation.action_type}' was APPROVED by user. Execution authorized."
            if approved
            else f"Action '{confirmation.action_type}' was REJECTED by user. Consequential action halted."
        )

        db.commit()
        db.refresh(confirmation)
        return confirmation, outcome_message
