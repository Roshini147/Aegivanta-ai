from datetime import datetime, timezone
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models.entities import SafetyPlan, Task, TaskStatus
from app.services.plan_service import PlanService
from app.schemas.payloads import SafetyReport, TaskResponse, EvidenceResponse

class ReportService:
    @staticmethod
    def generate_safety_report(db: Session, plan_id: str) -> SafetyReport:
        plan = PlanService.get_plan(db, plan_id)
        if not plan:
            raise ValueError(f"Safety Plan {plan_id} not found.")

        metrics = PlanService.compute_metrics(db, plan_id)
        tasks = db.query(Task).filter(Task.plan_id == plan_id).all()

        def to_task_response(t: Task) -> TaskResponse:
            ev_list = [
                EvidenceResponse(
                    id=e.id,
                    task_id=e.task_id,
                    evidence_type=e.evidence_type,
                    source=e.source,
                    description=e.description,
                    classification=e.classification,
                    is_simulated=e.is_simulated,
                    timestamp=e.timestamp
                ) for e in t.evidence
            ]
            return TaskResponse(
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
                evidence=ev_list
            )

        verified = [to_task_response(t) for t in tasks if t.status == TaskStatus.VERIFIED.value]
        completed_unverified = [to_task_response(t) for t in tasks if t.status == TaskStatus.COMPLETED.value]
        pending = [to_task_response(t) for t in tasks if t.status == TaskStatus.PENDING.value]
        action_required = [to_task_response(t) for t in tasks if t.status == TaskStatus.ACTION_REQUIRED.value]
        unable_to_verify = [to_task_response(t) for t in tasks if t.status == TaskStatus.UNABLE_TO_VERIFY.value]

        # Dynamic recommendations based on plan state
        recommendations: List[str] = []
        if pending:
            recommendations.append(f"Resolve remaining {len(pending)} pending safety checks prior to departure.")
        if action_required:
            recommendations.append(f"URGENT: {len(action_required)} tasks have detected anomalies requiring manual physical remediation.")
        if completed_unverified:
            recommendations.append(f"{len(completed_unverified)} tasks are self-reported as completed but lack secondary photo or sensor verification.")
        if not recommendations:
            recommendations.append("All primary departure checklists and verification controls are fully satisfied.")

        recommendations.append("Ensure secondary emergency contact possesses physical key and local security authorization.")
        if plan.duration_days >= 7:
            recommendations.append("For trips of 7+ days, hold mail/package delivery or schedule regular porch pickup.")

        disclaimer = (
            "SAFETY NOTICE & DISCLAIMER: Aegivanta AI organizes, coordinates, and verifies home preparation tasks "
            "based on available user attestations and telemetry. This report is an organizational aid and does NOT "
            "guarantee physical security, weather resistance, or prevention of household incidents. Verify critical "
            "locks and valves directly before leaving."
        )

        return SafetyReport(
            plan_id=plan.id,
            plan_title=plan.title,
            user_request=plan.user_request,
            duration_days=plan.duration_days,
            generated_at=datetime.now(timezone.utc),
            metrics=metrics,
            verified_tasks=verified,
            completed_unverified_tasks=completed_unverified,
            pending_tasks=pending,
            action_required_tasks=action_required,
            unable_to_verify_tasks=unable_to_verify,
            recommendations=recommendations,
            disclaimer=disclaimer
        )
