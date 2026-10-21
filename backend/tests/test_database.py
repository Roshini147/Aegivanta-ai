import pytest
from app.database.session import SyncSessionLocal, init_db
from app.models.entities import SafetyPlan, Task, UserProfile, TaskStatus
from app.services.plan_service import PlanService
from app.services.task_service import TaskService
import asyncio

@pytest.fixture(scope="module", autouse=True)
def setup_test_db():
    asyncio.run(init_db())

def test_user_and_plan_creation():
    db = SyncSessionLocal()
    try:
        user = PlanService.get_or_create_default_user(db)
        assert user is not None
        assert user.username in ["roshini", "demo_homeowner"]

        plan = PlanService.create_safety_plan(
            db=db,
            user_request="Leaving for 10 days to attend wedding.",
            duration_days=10,
            context={"has_pets": True, "has_plants": True}
        )
        assert plan.id is not None
        assert plan.duration_days == 10
        assert "10-Day" in plan.title

        # Verify task creation
        task = TaskService.create_task(
            db=db,
            plan_id=plan.id,
            title="Inspect front door deadbolt",
            description="Ensure deadbolt engages fully into frame.",
            category="Doors & Perimeter",
            priority="CRITICAL"
        )
        assert task.id is not None
        assert task.status == TaskStatus.PENDING.value

        # Test persistence across reconnect
        db.close()
        new_db = SyncSessionLocal()
        fetched_task = TaskService.get_task_by_id(new_db, task.id)
        assert fetched_task is not None
        assert fetched_task.title == "Inspect front door deadbolt"
        new_db.close()
    finally:
        pass
