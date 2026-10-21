import json
from typing import Dict, Any, List, Optional, Union
from mcp.server.mcpserver import MCPServer
from app.database.session import SyncSessionLocal
from app.services.plan_service import PlanService
from app.services.task_service import TaskService
from app.services.evidence_service import EvidenceService
from app.services.confirmation_service import ConfirmationService
from app.services.report_service import ReportService
from app.agent.planner import DeterministicPlanner

# Initialize official MCPServer
mcp_server = MCPServer("AegivantaSafetyCoordinator")

@mcp_server.tool()
def create_safety_plan(
    user_request: str,
    duration_days: int = 7,
    household_context: Optional[Any] = None
) -> Dict[str, Any]:
    """
    Create a safety-preparation plan from a user's departure request and trip details.
    Converts request into structured, prioritized tasks stored persistently in SQLite.
    """
    db = SyncSessionLocal()
    try:
        if isinstance(household_context, dict):
            context_dict = household_context
        elif isinstance(household_context, str):
            try:
                context_dict = json.loads(household_context)
            except Exception:
                context_dict = {}
        else:
            context_dict = {}

        plan = PlanService.create_safety_plan(
            db=db,
            user_request=user_request,
            duration_days=duration_days,
            context=context_dict
        )

        # Generate structured tasks using planner
        task_templates = DeterministicPlanner.generate_task_templates(
            user_request=user_request,
            duration_days=duration_days,
            context=context_dict
        )

        created_tasks = []
        for tmpl in task_templates:
            t = TaskService.create_task(
                db=db,
                plan_id=plan.id,
                title=tmpl["title"],
                description=tmpl["description"],
                category=tmpl["category"],
                priority=tmpl["priority"]
            )
            created_tasks.append({
                "id": t.id,
                "title": t.title,
                "category": t.category,
                "priority": t.priority,
                "status": t.status
            })

        return {
            "success": True,
            "plan_id": plan.id,
            "title": plan.title,
            "duration_days": plan.duration_days,
            "total_tasks_created": len(created_tasks),
            "tasks": created_tasks
        }
    finally:
        db.close()

@mcp_server.tool()
def get_tasks(plan_id: str, status_filter: Optional[str] = None) -> Dict[str, Any]:
    """
    Retrieve tasks associated with a plan from persistent SQLite storage.
    Filters by status if provided (e.g. PENDING, COMPLETED, VERIFIED, ACTION_REQUIRED, UNABLE_TO_VERIFY).
    """
    db = SyncSessionLocal()
    try:
        tasks = TaskService.get_tasks_for_plan(db, plan_id, status_filter)
        task_list = [
            {
                "id": t.id,
                "plan_id": t.plan_id,
                "title": t.title,
                "description": t.description,
                "category": t.category,
                "priority": t.priority,
                "status": t.status,
                "completion_source": t.completion_source,
                "completion_notes": t.completion_notes,
                "created_at": t.created_at.isoformat(),
                "updated_at": t.updated_at.isoformat()
            }
            for t in tasks
        ]
        return {
            "success": True,
            "plan_id": plan_id,
            "status_filter": status_filter,
            "count": len(task_list),
            "tasks": task_list
        }
    finally:
        db.close()

@mcp_server.tool()
def update_task_status(
    task_id: str,
    requested_status: str,
    completion_method: str = "manual_user_attestation",
    notes: Optional[str] = None
) -> Dict[str, Any]:
    """
    Record a legitimate task-status change.
    Validates state transitions through the verification engine.
    Rejects unsupported transitions to VERIFIED without supporting evidence.
    """
    db = SyncSessionLocal()
    try:
        task, final_status, reason = TaskService.update_task_status(
            db=db,
            task_id=task_id,
            requested_status=requested_status,
            completion_method=completion_method,
            notes=notes,
            actor="mcp_agent"
        )
        return {
            "success": True,
            "task_id": task.id,
            "requested_status": requested_status,
            "final_status": final_status,
            "transition_notes": reason,
            "title": task.title
        }
    except Exception as e:
        return {
            "success": False,
            "task_id": task_id,
            "error": str(e)
        }
    finally:
        db.close()

@mcp_server.tool()
def record_verification_evidence(
    task_id: str,
    evidence_type: str,
    description: str,
    source: str = "User Attestation",
    is_simulated: bool = False
) -> Dict[str, Any]:
    """
    Record evidence supporting a task's completion or current state.
    Classifies evidence (DIRECT_EVIDENCE, CORROBORATIVE, INSUFFICIENT) and records simulation markers.
    """
    db = SyncSessionLocal()
    try:
        evidence = EvidenceService.record_evidence(
            db=db,
            task_id=task_id,
            evidence_type=evidence_type,
            source=source,
            description=description,
            is_simulated=is_simulated,
            actor="mcp_agent"
        )
        # Fetch updated task state
        task = TaskService.get_task_by_id(db, task_id)
        return {
            "success": True,
            "evidence_id": evidence.id,
            "task_id": task_id,
            "evidence_type": evidence.evidence_type,
            "classification": evidence.classification,
            "is_simulated": evidence.is_simulated,
            "current_task_status": task.status if task else "UNKNOWN"
        }
    except Exception as e:
        return {
            "success": False,
            "task_id": task_id,
            "error": str(e)
        }
    finally:
        db.close()

@mcp_server.tool()
def get_verification_evidence(task_id: str) -> Dict[str, Any]:
    """
    Retrieve the audit evidence records associated with a task.
    """
    db = SyncSessionLocal()
    try:
        evidence_list = EvidenceService.get_evidence_for_task(db, task_id)
        serialized = [
            {
                "id": ev.id,
                "task_id": ev.task_id,
                "evidence_type": ev.evidence_type,
                "source": ev.source,
                "description": ev.description,
                "classification": ev.classification,
                "is_simulated": ev.is_simulated,
                "timestamp": ev.timestamp.isoformat()
            }
            for ev in evidence_list
        ]
        return {
            "success": True,
            "task_id": task_id,
            "count": len(serialized),
            "evidence": serialized
        }
    finally:
        db.close()

@mcp_server.tool()
def request_action_confirmation(
    action_type: str,
    target_id: str,
    rationale: str,
    parameters: Optional[Any] = None
) -> Dict[str, Any]:
    """
    Create a confirmation request before a consequential action.
    Returns a confirmation identifier and an explicit PENDING status.
    Does not execute the action without human authorization.
    """
    db = SyncSessionLocal()
    try:
        if isinstance(parameters, dict):
            params_dict = parameters
        elif isinstance(parameters, str):
            try:
                params_dict = json.loads(parameters)
            except Exception:
                params_dict = {}
        else:
            params_dict = {}

        confirmation = ConfirmationService.request_confirmation(
            db=db,
            action_type=action_type,
            target_id=target_id,
            rationale=rationale,
            parameters=params_dict
        )
        return {
            "success": True,
            "confirmation_id": confirmation.id,
            "action_type": confirmation.action_type,
            "status": confirmation.status,
            "message": "Action held pending explicit homeowner confirmation."
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }
    finally:
        db.close()

@mcp_server.tool()
def generate_safety_report(plan_id: str) -> Dict[str, Any]:
    """
    Generate a certified safety report from persistent plan, task, and evidence records.
    Computes verified, completed, pending, action required, and unable to verify metrics.
    """
    db = SyncSessionLocal()
    try:
        report = ReportService.generate_safety_report(db, plan_id)
        return {
            "success": True,
            "plan_id": report.plan_id,
            "plan_title": report.plan_title,
            "generated_at": report.generated_at.isoformat(),
            "metrics": report.metrics.model_dump(),
            "verified_count": len(report.verified_tasks),
            "completed_unverified_count": len(report.completed_unverified_tasks),
            "pending_count": len(report.pending_tasks),
            "action_required_count": len(report.action_required_tasks),
            "unable_to_verify_count": len(report.unable_to_verify_tasks),
            "recommendations": report.recommendations,
            "disclaimer": report.disclaimer
        }
    except Exception as e:
        return {
            "success": False,
            "plan_id": plan_id,
            "error": str(e)
        }
    finally:
        db.close()

if __name__ == "__main__":
    import asyncio
    print("Starting Aegivanta AI Streamable HTTP MCP Server on port 8001...")
    asyncio.run(mcp_server.run_streamable_http_async(host="127.0.0.1", port=8001, streamable_http_path="/mcp"))
