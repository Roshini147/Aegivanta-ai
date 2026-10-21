from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.models.entities import Task, TaskEvent, VerificationEvidence, TaskStatus
from app.services.verification_engine import VerificationEngine
import uuid

class TaskService:
    @staticmethod
    def get_tasks_for_plan(db: Session, plan_id: str, status_filter: Optional[str] = None) -> List[Task]:
        query = db.query(Task).filter(Task.plan_id == plan_id)
        if status_filter:
            query = query.filter(Task.status == status_filter.upper())
        return query.order_by(Task.created_at.asc()).all()

    @staticmethod
    def get_task_by_id(db: Session, task_id: str) -> Optional[Task]:
        return db.query(Task).filter(Task.id == task_id).first()

    @staticmethod
    def create_task(
        db: Session,
        plan_id: str,
        title: str,
        description: str,
        category: str,
        priority: str = "HIGH"
    ) -> Task:
        task = Task(
            id=str(uuid.uuid4()),
            plan_id=plan_id,
            title=title,
            description=description,
            category=category,
            priority=priority,
            status=TaskStatus.PENDING.value
        )
        db.add(task)
        
        event = TaskEvent(
            id=str(uuid.uuid4()),
            task_id=task.id,
            event_type="TASK_CREATED",
            from_status=None,
            to_status=TaskStatus.PENDING.value,
            actor="agent",
            notes="Task generated from home-preparation safety plan."
        )
        db.add(event)
        db.commit()
        db.refresh(task)
        return task

    @staticmethod
    def update_task_status(
        db: Session,
        task_id: str,
        requested_status: str,
        completion_method: str = "manual_user_attestation",
        notes: Optional[str] = None,
        actor: str = "user"
    ) -> Tuple[Task, str, str]:
        """
        Executes a validated state transition.
        Returns: (task, transition_outcome, explanation)
        """
        task = db.query(Task).filter(Task.id == task_id).first()
        if not task:
            raise ValueError(f"Task with ID {task_id} not found.")

        old_status = task.status
        evidence_list = db.query(VerificationEvidence).filter(VerificationEvidence.task_id == task_id).all()

        final_status, classification, reason = VerificationEngine.evaluate_task_verification(
            current_status=old_status,
            requested_status=requested_status.upper(),
            evidence_list=evidence_list,
            completion_method=completion_method
        )

        task.status = final_status
        task.completion_source = completion_method
        if notes:
            task.completion_notes = notes

        event = TaskEvent(
            id=str(uuid.uuid4()),
            task_id=task.id,
            event_type="STATUS_CHANGE",
            from_status=old_status,
            to_status=final_status,
            actor=actor,
            notes=f"Requested {requested_status}. Evaluated as {final_status}. {reason}"
        )
        db.add(event)
        db.commit()
        db.refresh(task)
        return task, final_status, reason
