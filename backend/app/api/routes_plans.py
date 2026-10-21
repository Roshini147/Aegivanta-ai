from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database.session import get_async_db
from app.models.entities import SafetyPlan, Task, VerificationEvidence
from app.schemas.payloads import (
    SafetyPlanCreate,
    SafetyPlanUpdate,
    SafetyPlanResponse,
    SafetyPlanDetailResponse,
    TaskResponse,
    DashboardMetrics
)

from app.services.plan_service import PlanService
from app.services.evidence_service import EvidenceService
from app.services.task_service import TaskService
from app.database.session import SyncSessionLocal

router = APIRouter(prefix="/api/plans", tags=["Safety Plans"])

@router.get("", response_model=List[SafetyPlanResponse])
async def list_plans(db: AsyncSession = Depends(get_async_db)):
    result = await db.execute(select(SafetyPlan).order_by(SafetyPlan.created_at.desc()))
    plans = result.scalars().all()
    
    response = []
    for p in plans:
        # Count tasks
        t_result = await db.execute(select(Task).where(Task.plan_id == p.id))
        tasks = t_result.scalars().all()
        response.append(SafetyPlanResponse(
            id=p.id,
            user_id=p.user_id,
            title=p.title,
            user_request=p.user_request,
            duration_days=p.duration_days,
            household_context=p.household_context,
            created_at=p.created_at,
            updated_at=p.updated_at,
            task_count=len(tasks)
        ))
    return response

@router.post("", response_model=SafetyPlanResponse)
async def create_plan(payload: SafetyPlanCreate):
    sync_db = SyncSessionLocal()
    try:
        plan = PlanService.create_safety_plan(
            db=sync_db,
            user_request=payload.user_request,
            duration_days=payload.duration_days,
            context=payload.household_context,
            title=payload.title
        )
        
        # Seed core safety tasks for the departure plan
        default_tasks = [
            ("Check exterior doors and locks", "Verify all entry deadbolts and sliding glass doors are locked.", "Perimeter Security", "HIGH"),
            ("Check accessible windows", "Ensure all ground-floor and accessible windows are latched.", "Perimeter Security", "HIGH"),
            ("Review appliance safety", "Verify oven, stove, and high-draw heat appliances are off.", "Fire & Electrical", "MEDIUM"),
            ("Review lighting preferences", "Configure automated twilight lighting schedules.", "Lighting Automation", "MEDIUM"),
            ("Arrange pet care", "Confirm feeding, water, and emergency contact for pets.", "Household", "MEDIUM"),
            ("Review emergency contacts", "Verify trusted neighbor and emergency contact numbers.", "Emergency", "LOW"),
            ("Shut off main water valve", "Close the main residential supply line to prevent leaks.", "Water & Plumbing", "HIGH"),
            ("Set HVAC thermostat to eco mode", "Set temperature to 62°F to prevent freeze damage while saving energy.", "HVAC", "LOW"),
            ("Unplug high-draw small electronics", "Unplug countertop appliances, space heaters, and chargers.", "Fire & Electrical", "MEDIUM"),
            ("Test smoke and CO detector alarms", "Ensure smoke and carbon monoxide detectors have active battery telemetry.", "Fire & Electrical", "HIGH"),
            ("Verify smart lock on garden side-gate", "Check physical padlock or smart gate latch.", "Perimeter Security", "MEDIUM"),
            ("Place mail hold with postal service", "Hold deliveries to avoid visual signals of vacancy.", "Household", "LOW")
        ]
        for title, desc, cat, prio in default_tasks:
            TaskService.create_task(sync_db, plan.id, title, desc, cat, prio)

        return SafetyPlanResponse(
            id=plan.id,
            user_id=plan.user_id,
            title=plan.title,
            user_request=plan.user_request,
            duration_days=plan.duration_days,
            household_context=plan.household_context,
            created_at=plan.created_at,
            updated_at=plan.updated_at,
            task_count=len(default_tasks)
        )
    finally:
        sync_db.close()

@router.get("/{plan_id}", response_model=SafetyPlanDetailResponse)
async def get_plan(plan_id: str, db: AsyncSession = Depends(get_async_db)):
    result = await db.execute(select(SafetyPlan).where(SafetyPlan.id == plan_id))
    plan = result.scalars().first()
    if not plan:
        raise HTTPException(status_code=404, detail="Safety plan not found")
        
    t_result = await db.execute(select(Task).where(Task.plan_id == plan_id).order_by(Task.created_at.asc()))
    tasks = t_result.scalars().all()
    
    sync_db = SyncSessionLocal()
    task_responses = []
    try:
        for t in tasks:
            ev_list = EvidenceService.get_evidence_for_task(sync_db, t.id)
            task_responses.append(TaskResponse(
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
                evidence_count=len(ev_list),
                evidence=[]
            ))
    finally:
        sync_db.close()
        
    return SafetyPlanDetailResponse(
        id=plan.id,
        user_id=plan.user_id,
        title=plan.title,
        user_request=plan.user_request,
        duration_days=plan.duration_days,
        household_context=plan.household_context,
        created_at=plan.created_at,
        updated_at=plan.updated_at,
        task_count=len(task_responses),
        tasks=task_responses
    )

@router.get("/{plan_id}/metrics", response_model=DashboardMetrics)
async def get_plan_metrics(plan_id: str):
    sync_db = SyncSessionLocal()
    try:
        plan = PlanService.get_plan(sync_db, plan_id)
        if not plan:
            raise HTTPException(status_code=404, detail="Safety plan not found")
        metrics = PlanService.compute_metrics(sync_db, plan_id)
        return metrics
    finally:
        sync_db.close()

@router.put("/{plan_id}", response_model=SafetyPlanDetailResponse)
async def update_plan(plan_id: str, payload: SafetyPlanUpdate):
    from app.schemas.payloads import SafetyPlanUpdate
    from app.models.entities import Notification
    import uuid
    
    sync_db = SyncSessionLocal()
    try:
        plan = sync_db.query(SafetyPlan).filter(SafetyPlan.id == plan_id).first()
        if not plan:
            raise HTTPException(status_code=404, detail="Safety plan not found")
            
        if payload.title is not None:
            plan.title = payload.title
        if payload.duration_days is not None:
            plan.duration_days = payload.duration_days
        if payload.user_request is not None:
            plan.user_request = payload.user_request
        if payload.household_context is not None:
            plan.household_context = payload.household_context
            
        # Notification
        notif = Notification(
            id=str(uuid.uuid4()),
            title="Safety Plan Updated",
            message=f"Plan '{plan.title}' configuration updated.",
            category="SUCCESS",
            link_tab="planner",
            is_read=False
        )
        sync_db.add(notif)
        
        sync_db.commit()
        sync_db.refresh(plan)
        
        # Load tasks
        tasks = sync_db.query(Task).filter(Task.plan_id == plan.id).order_by(Task.created_at.asc()).all()
        task_responses = []
        for t in tasks:
            ev_list = EvidenceService.get_evidence_for_task(sync_db, t.id)
            task_responses.append(TaskResponse(
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
                evidence_count=len(ev_list),
                evidence=[]
            ))
            
        return SafetyPlanDetailResponse(
            id=plan.id,
            user_id=plan.user_id,
            title=plan.title,
            user_request=plan.user_request,
            duration_days=plan.duration_days,
            household_context=plan.household_context,
            created_at=plan.created_at,
            updated_at=plan.updated_at,
            task_count=len(task_responses),
            tasks=task_responses
        )
    finally:
        sync_db.close()

@router.delete("/{plan_id}")
async def delete_plan(plan_id: str):
    from app.models.entities import Notification
    import uuid
    
    sync_db = SyncSessionLocal()
    try:
        plan = sync_db.query(SafetyPlan).filter(SafetyPlan.id == plan_id).first()
        if not plan:
            raise HTTPException(status_code=404, detail="Safety plan not found")
        plan_title = plan.title
        sync_db.delete(plan)
        
        notif = Notification(
            id=str(uuid.uuid4()),
            title="Plan Deleted",
            message=f"Deleted plan: {plan_title}",
            category="WARNING",
            link_tab="dashboard",
            is_read=False
        )
        sync_db.add(notif)
        
        sync_db.commit()
        return {"success": True, "plan_id": plan_id, "message": f"Plan '{plan_title}' deleted."}
    finally:
        sync_db.close()

