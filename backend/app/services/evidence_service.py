import uuid
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.entities import VerificationEvidence, Task, TaskEvent, TaskStatus
from app.services.verification_engine import VerificationEngine

class EvidenceService:
    @staticmethod
    def get_evidence_for_task(db: Session, task_id: str) -> List[VerificationEvidence]:
        return db.query(VerificationEvidence).filter(VerificationEvidence.task_id == task_id).order_by(VerificationEvidence.timestamp.desc()).all()

    @staticmethod
    def record_evidence(
        db: Session,
        task_id: str,
        evidence_type: str,
        source: str,
        description: str,
        is_simulated: bool = False,
        actor: str = "user"
    ) -> VerificationEvidence:
        task = db.query(Task).filter(Task.id == task_id).first()
        if not task:
            raise ValueError(f"Task with ID {task_id} not found.")

        classification = VerificationEngine.classify_new_evidence(
            evidence_type=evidence_type,
            description=description,
            source=source,
            is_simulated=is_simulated
        )

        evidence = VerificationEvidence(
            id=str(uuid.uuid4()),
            task_id=task_id,
            evidence_type=evidence_type,
            source=source,
            description=description,
            classification=classification,
            is_simulated=is_simulated
        )
        db.add(evidence)

        # Log event
        event = TaskEvent(
            id=str(uuid.uuid4()),
            task_id=task_id,
            event_type="EVIDENCE_ATTACHED",
            from_status=task.status,
            to_status=task.status,
            actor=actor,
            notes=f"Attached evidence '{evidence_type}' from {source} (classified: {classification}, simulated: {is_simulated})"
        )
        db.add(event)
        db.commit()
        db.refresh(evidence)

        # If task was already completed or unable to verify, re-evaluate to see if it now qualifies for VERIFIED
        all_evidence = db.query(VerificationEvidence).filter(VerificationEvidence.task_id == task_id).all()
        if task.status in [TaskStatus.COMPLETED.value, TaskStatus.UNABLE_TO_VERIFY.value]:
            new_status, _, reason = VerificationEngine.evaluate_task_verification(
                current_status=task.status,
                requested_status=TaskStatus.VERIFIED.value,
                evidence_list=all_evidence,
                completion_method=task.completion_source or "evidence_upgrade"
            )
            if new_status == TaskStatus.VERIFIED.value:
                old_status = task.status
                task.status = TaskStatus.VERIFIED.value
                upgrade_event = TaskEvent(
                    id=str(uuid.uuid4()),
                    task_id=task_id,
                    event_type="STATUS_CHANGE",
                    from_status=old_status,
                    to_status=TaskStatus.VERIFIED.value,
                    actor="verification_engine",
                    notes=f"Auto-upgraded to VERIFIED after evidence attachment. {reason}"
                )
                db.add(upgrade_event)
                db.commit()

        return evidence
