from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from app.schemas.payloads import (
    TaskResponse,
    TaskStatusUpdate,
    TaskEventResponse,
    EvidenceResponse,
    TaskCreateManual,
    TaskUpdateManual
)

from app.services.task_service import TaskService
from app.services.evidence_service import EvidenceService
from app.models.entities import TaskEvent
from app.database.session import SyncSessionLocal

router = APIRouter(prefix="/api/tasks", tags=["Tasks"])

@router.get("", response_model=List[TaskResponse])
def get_tasks(
    plan_id: str = Query(..., description="Plan ID to retrieve tasks for"),
    status: Optional[str] = Query(None, description="Status filter")
):
    db = SyncSessionLocal()
    try:
        tasks = TaskService.get_tasks_for_plan(db, plan_id, status)
        responses = []
        for t in tasks:
            ev_list = EvidenceService.get_evidence_for_task(db, t.id)
            ev_models = [
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
            responses.append(TaskResponse(
                id=t.id,
                plan_id=t.plan_id,
                title=t.title,
                description=t.description,
                category=t.category,
                priority=t.priority,
                status=t.status,
                completion_source=t.completion_source,
                completion_notes=t.completion_notes,
                created_at=t.created_at,
                updated_at=t.updated_at,
                evidence_count=len(ev_models),
                evidence=ev_models
            ))
        return responses
    finally:
        db.close()

@router.get("/{task_id}", response_model=TaskResponse)
def get_task(task_id: str):
    db = SyncSessionLocal()
    try:
        task = TaskService.get_task_by_id(db, task_id)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        ev_list = EvidenceService.get_evidence_for_task(db, task.id)
        ev_models = [
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
        return TaskResponse(
            id=task.id,
            plan_id=task.plan_id,
            title=task.title,
            description=task.description,
            category=task.category,
            priority=task.priority,
            status=task.status,
            completion_source=task.completion_source,
            completion_notes=task.completion_notes,
            created_at=task.created_at,
            updated_at=task.updated_at,
            evidence_count=len(ev_models),
            evidence=ev_models
        )
    finally:
        db.close()

@router.patch("/{task_id}/status")
def update_task_status(task_id: str, payload: TaskStatusUpdate):
    db = SyncSessionLocal()
    try:
        task, final_status, reason = TaskService.update_task_status(
            db=db,
            task_id=task_id,
            requested_status=payload.requested_status,
            completion_method=payload.completion_method,
            notes=payload.notes,
            actor="web_user"
        )
        return {
            "task_id": task.id,
            "status": task.status,
            "final_status": final_status,
            "reason": reason,
            "completion_source": task.completion_source
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        db.close()

@router.post("", response_model=TaskResponse)
def create_manual_task(payload: TaskCreateManual):
    db = SyncSessionLocal()
    try:
        from app.models.entities import Task, TaskEvent, Notification, get_utc_now
        import uuid
        
        task_id = str(uuid.uuid4())
        task = Task(
            id=task_id,
            plan_id=payload.plan_id,
            title=payload.title,
            description=payload.description,
            category=payload.category,
            priority=payload.priority.upper(),
            status=payload.status.upper()
        )
        db.add(task)
        
        event = TaskEvent(
            id=str(uuid.uuid4()),
            task_id=task.id,
            event_type="TASK_CREATED",
            from_status=None,
            to_status=payload.status.upper(),
            actor="user",
            notes="Task manually created by homeowner."
        )
        db.add(event)
        
        # Add notification
        notif = Notification(
            id=str(uuid.uuid4()),
            title="New Safety Task Created",
            message=f"Created task: {payload.title}",
            category="INFO",
            link_tab="tasks",
            is_read=False
        )
        db.add(notif)
        
        db.commit()
        db.refresh(task)
        
        return TaskResponse(
            id=task.id,
            plan_id=task.plan_id,
            title=task.title,
            description=task.description,
            category=task.category,
            priority=task.priority,
            status=task.status,
            completion_source=task.completion_source,
            completion_notes=task.completion_notes,
            created_at=task.created_at,
            updated_at=task.updated_at,
            evidence_count=0,
            evidence=[]
        )
    finally:
        db.close()

@router.put("/{task_id}", response_model=TaskResponse)
def update_manual_task(task_id: str, payload: TaskUpdateManual):
    db = SyncSessionLocal()
    try:
        from app.models.entities import Task, TaskEvent, Notification, get_utc_now
        import uuid
        
        task = db.query(Task).filter(Task.id == task_id).first()
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
            
        old_status = task.status
        if payload.title is not None:
            task.title = payload.title
        if payload.description is not None:
            task.description = payload.description
        if payload.category is not None:
            task.category = payload.category
        if payload.priority is not None:
            task.priority = payload.priority.upper()
        if payload.status is not None:
            task.status = payload.status.upper()
        if payload.completion_notes is not None:
            task.completion_notes = payload.completion_notes
            
        event = TaskEvent(
            id=str(uuid.uuid4()),
            task_id=task.id,
            event_type="TASK_UPDATED",
            from_status=old_status,
            to_status=task.status,
            actor="user",
            notes="Task details modified by homeowner."
        )
        db.add(event)
        
        # Add notification
        notif = Notification(
            id=str(uuid.uuid4()),
            title="Task Updated",
            message=f"Updated task: {task.title}",
            category="INFO",
            link_tab="tasks",
            is_read=False
        )
        db.add(notif)
        
        db.commit()
        db.refresh(task)
        
        ev_list = EvidenceService.get_evidence_for_task(db, task.id)
        ev_models = [
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
        
        return TaskResponse(
            id=task.id,
            plan_id=task.plan_id,
            title=task.title,
            description=task.description,
            category=task.category,
            priority=task.priority,
            status=task.status,
            completion_source=task.completion_source,
            completion_notes=task.completion_notes,
            created_at=task.created_at,
            updated_at=task.updated_at,
            evidence_count=len(ev_models),
            evidence=ev_models
        )
    finally:
        db.close()

@router.delete("/{task_id}")
def delete_task(task_id: str):
    db = SyncSessionLocal()
    try:
        from app.models.entities import Task, TaskEvent, VerificationEvidence, Notification
        import uuid
        
        task = db.query(Task).filter(Task.id == task_id).first()
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
            
        task_title = task.title
        
        # Delete related evidence and events
        db.query(VerificationEvidence).filter(VerificationEvidence.task_id == task_id).delete()
        db.query(TaskEvent).filter(TaskEvent.task_id == task_id).delete()
        db.delete(task)
        
        notif = Notification(
            id=str(uuid.uuid4()),
            title="Task Deleted",
            message=f"Deleted task: {task_title}",
            category="WARNING",
            link_tab="tasks",
            is_read=False
        )
        db.add(notif)
        
        db.commit()
        return {"success": True, "task_id": task_id, "message": f"Task '{task_title}' deleted successfully."}
    finally:
        db.close()

@router.get("/{task_id}/events", response_model=List[TaskEventResponse])
def get_task_events(task_id: str):
    db = SyncSessionLocal()
    try:
        events = db.query(TaskEvent).filter(TaskEvent.task_id == task_id).order_by(TaskEvent.timestamp.desc()).all()
        return [
            TaskEventResponse(
                id=e.id,
                task_id=e.task_id,
                event_type=e.event_type,
                from_status=e.from_status,
                to_status=e.to_status,
                actor=e.actor,
                notes=e.notes,
                timestamp=e.timestamp
            )
            for e in events
        ]
    finally:
        db.close()

