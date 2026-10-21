import pytest
import asyncio
from app.database.session import init_db, SyncSessionLocal
from app.schemas.payloads import AgentPlanRequest
from app.agent.orchestrator import AgentOrchestrator
from app.services.task_service import TaskService
from app.services.evidence_service import EvidenceService
from app.services.plan_service import PlanService
from app.services.report_service import ReportService
from app.models.entities import TaskStatus

@pytest.fixture(scope="module", autouse=True)
def setup_test_db():
    asyncio.run(init_db())

@pytest.mark.asyncio
async def test_full_agentic_key_workflow():
    # Step 1 & 2: User prompt
    user_prompt = "I'm leaving home for two weeks. Help me prepare my home safely."
    req = AgentPlanRequest(
        prompt=user_prompt,
        duration_days=14,
        has_pets=False,
        has_plants=True,
        winter_freeze_risk=False
    )

    # Step 3, 5, 6: Agent orchestrator creates structured plan and tasks via MCP
    result = await AgentOrchestrator.process_departure_request(req)
    assert result.plan is not None
    assert result.plan.duration_days == 14
    plan_id = result.plan.id
    assert len(result.plan.tasks) > 0
    assert len(result.execution_trace) >= 4  # tools/list, create_safety_plan, get_tasks, etc.

    # Step 7 & 8: User completes one task and updates status
    db = SyncSessionLocal()
    try:
        tasks = TaskService.get_tasks_for_plan(db, plan_id)
        assert len(tasks) > 0
        task_to_complete = tasks[0]
        
        updated_task, final_status, reason = TaskService.update_task_status(
            db=db,
            task_id=task_to_complete.id,
            requested_status=TaskStatus.COMPLETED.value,
            completion_method="user_checklist_check",
            notes="Checked by homeowner before baggage packing"
        )
        assert updated_task.status == TaskStatus.COMPLETED.value

        # Step 9 & 10: User records evidence and system verifies
        ev = EvidenceService.record_evidence(
            db=db,
            task_id=task_to_complete.id,
            evidence_type="PHOTO_REFERENCE",
            source="Homeowner Phone Camera",
            description="Clear photo of physical deadbolt engaged securely in door jamb.",
            is_simulated=False
        )
        assert ev.id is not None

        # Re-fetch task: It should now be VERIFIED
        refreshed_task = TaskService.get_task_by_id(db, task_to_complete.id)
        assert refreshed_task.status == TaskStatus.VERIFIED.value

        # Step 11: Real database metrics check
        metrics = PlanService.compute_metrics(db, plan_id)
        assert metrics.total_tasks == len(tasks)
        assert metrics.verified_tasks == 1
        assert metrics.overall_progress_percent > 0

        # Step 12 & 13: Final Report generation
        report = ReportService.generate_safety_report(db, plan_id)
        assert report.plan_id == plan_id
        assert len(report.verified_tasks) == 1
        assert len(report.pending_tasks) == len(tasks) - 1
        assert report.metrics.verified_tasks == 1
        assert report.disclaimer is not None
        assert "SAFETY NOTICE" in report.disclaimer
    finally:
        db.close()
