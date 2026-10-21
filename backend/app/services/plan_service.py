import uuid
import json
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from app.models.entities import SafetyPlan, Task, UserProfile, TaskStatus
from app.schemas.payloads import DashboardMetrics

class PlanService:
    @staticmethod
    def get_or_create_default_user(db: Session) -> UserProfile:
        user = db.query(UserProfile).filter(UserProfile.username == "roshini").first()
        if not user:
            user = UserProfile(
                id=str(uuid.uuid4()),
                username="roshini",
                display_name="Roshini",
                home_type="Modern Two-Story Residence"
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        return user

    @staticmethod
    def create_safety_plan(
        db: Session,
        user_request: str,
        duration_days: int = 7,
        context: Optional[Dict[str, Any]] = None,
        title: Optional[str] = None
    ) -> SafetyPlan:
        user = PlanService.get_or_create_default_user(db)
        
        computed_title = title or f"{duration_days}-Day Departure Safety Plan"
        
        plan = SafetyPlan(
            id=str(uuid.uuid4()),
            user_id=user.id,
            title=computed_title,
            user_request=user_request,
            duration_days=duration_days,
            household_context=json.dumps(context or {})
        )
        db.add(plan)
        db.commit()
        db.refresh(plan)
        return plan

    @staticmethod
    def get_plan(db: Session, plan_id: str) -> Optional[SafetyPlan]:
        return db.query(SafetyPlan).filter(SafetyPlan.id == plan_id).first()

    @staticmethod
    def list_plans(db: Session) -> List[SafetyPlan]:
        return db.query(SafetyPlan).order_by(SafetyPlan.created_at.desc()).all()

    @staticmethod
    def compute_metrics(db: Session, plan_id: str) -> DashboardMetrics:
        tasks = db.query(Task).filter(Task.plan_id == plan_id).all()
        total = len(tasks)
        if total == 0:
            return DashboardMetrics(
                total_tasks=0,
                completed_unverified=0,
                verified_tasks=0,
                pending_tasks=0,
                action_required_tasks=0,
                unable_to_verify_tasks=0,
                overall_progress_percent=0.0,
                is_fully_prepared=False
            )

        completed_unverified = sum(1 for t in tasks if t.status == TaskStatus.COMPLETED.value)
        verified = sum(1 for t in tasks if t.status == TaskStatus.VERIFIED.value)
        pending = sum(1 for t in tasks if t.status == TaskStatus.PENDING.value)
        action_required = sum(1 for t in tasks if t.status == TaskStatus.ACTION_REQUIRED.value)
        unable_to_verify = sum(1 for t in tasks if t.status == TaskStatus.UNABLE_TO_VERIFY.value)

        # Total addressed tasks (completed + verified)
        addressed_count = completed_unverified + verified
        progress_pct = round((addressed_count / total) * 100, 1)

        is_prepared = (pending == 0 and action_required == 0 and total > 0)

        return DashboardMetrics(
            total_tasks=total,
            completed_unverified=completed_unverified,
            verified_tasks=verified,
            pending_tasks=pending,
            action_required_tasks=action_required,
            unable_to_verify_tasks=unable_to_verify,
            overall_progress_percent=progress_pct,
            is_fully_prepared=is_prepared
        )
