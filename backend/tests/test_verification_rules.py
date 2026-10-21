import pytest
import asyncio
from app.database.session import SyncSessionLocal, init_db
from app.models.entities import TaskStatus, EvidenceClassification
from app.services.plan_service import PlanService
from app.services.task_service import TaskService
from app.services.evidence_service import EvidenceService

@pytest.fixture(scope="module", autouse=True)
def setup_test_db():
    asyncio.run(init_db())

def test_unsupported_verified_transition_rejected():
    db = SyncSessionLocal()
    try:
        plan = PlanService.create_safety_plan(
            db=db,
            user_request="Testing verification rule constraints",
            duration_days=3
        )
        task = TaskService.create_task(
            db=db,
            plan_id=plan.id,
            title="Check Water Shutoff",
            description="Turn off main valve",
            category="Plumbing & Appliances"
        )
        assert task.status == TaskStatus.PENDING.value

        # Attempt to mark VERIFIED without any evidence
        updated_task, final_status, reason = TaskService.update_task_status(
            db=db,
            task_id=task.id,
            requested_status=TaskStatus.VERIFIED.value,
            completion_method="unbacked_claim"
        )
        # MUST REJECT and set to UNABLE_TO_VERIFY
        assert final_status == TaskStatus.UNABLE_TO_VERIFY.value
        assert updated_task.status == TaskStatus.UNABLE_TO_VERIFY.value
        assert "REJECTED" in reason

        # Now attach genuine photo evidence
        ev = EvidenceService.record_evidence(
            db=db,
            task_id=task.id,
            evidence_type="PHOTO_REFERENCE",
            source="Mobile Inspection Camera",
            description="Clear timestamped photo of quarter-turn brass ball valve in perpendicular 90-degree closed position.",
            is_simulated=False
        )
        assert ev.classification == EvidenceClassification.DIRECT_EVIDENCE.value

        # Now attempt VERIFIED transition again
        updated_task2, final_status2, reason2 = TaskService.update_task_status(
            db=db,
            task_id=task.id,
            requested_status=TaskStatus.VERIFIED.value,
            completion_method="photo_attestation"
        )
        assert final_status2 == TaskStatus.VERIFIED.value
        assert updated_task2.status == TaskStatus.VERIFIED.value
        assert "VERIFIED:" in reason2

    finally:
        db.close()

def test_simulated_evidence_labeling():
    db = SyncSessionLocal()
    try:
        plan = PlanService.create_safety_plan(
            db=db,
            user_request="Testing simulated evidence labeling",
            duration_days=5
        )
        task = TaskService.create_task(
            db=db,
            plan_id=plan.id,
            title="Patio Slider Lock Check",
            description="Verify sensor reading",
            category="Doors & Perimeter"
        )
        
        # Record simulated evidence
        ev = EvidenceService.record_evidence(
            db=db,
            task_id=task.id,
            evidence_type="SIMULATED_SENSOR_TELEMETRY",
            source="Patio Contact Sensor (Simulated)",
            description="Simulated contact closure event received.",
            is_simulated=True
        )
        assert ev.is_simulated is True
        
        # Verify status updates properly
        updated_task, final_status, reason = TaskService.update_task_status(
            db=db,
            task_id=task.id,
            requested_status=TaskStatus.VERIFIED.value
        )
        assert final_status == TaskStatus.VERIFIED.value
        assert "SIMULATION AUDIT" in reason
    finally:
        db.close()
