import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database.session import init_db
import asyncio

client = TestClient(app)

@pytest.fixture(scope="module", autouse=True)
def setup_db():
    asyncio.run(init_db())

def test_task_crud_lifecycle_and_notifications():
    # 1. Fetch available plans
    plans_res = client.get("/api/plans")
    assert plans_res.status_code == 200
    plans = plans_res.json()
    assert len(plans) > 0
    plan_id = plans[0]["id"]

    # 2. Create manual task via POST /api/tasks
    new_task_payload = {
        "plan_id": plan_id,
        "title": "Test Smoke Alarm Sensors",
        "description": "Run battery self-test on kitchen ionization detector.",
        "category": "Fire & Electrical",
        "priority": "HIGH",
        "status": "PENDING"
    }
    create_res = client.post("/api/tasks", json=new_task_payload)
    assert create_res.status_code == 200
    created_task = create_res.json()
    task_id = created_task["id"]
    assert created_task["title"] == "Test Smoke Alarm Sensors"
    assert created_task["priority"] == "HIGH"

    # 3. Verify notification created
    notifs_res = client.get("/api/notifications")
    assert notifs_res.status_code == 200
    notifs = notifs_res.json()
    assert len(notifs) > 0
    assert any("Test Smoke Alarm Sensors" in n["message"] for n in notifs)

    # 4. Update task via PUT /api/tasks/{task_id}
    update_payload = {
        "title": "Test Smoke Alarm Sensors - Completed",
        "priority": "CRITICAL",
        "status": "COMPLETED",
        "completion_notes": "Batteries verified at 98% charge."
    }
    update_res = client.put(f"/api/tasks/{task_id}", json=update_payload)
    assert update_res.status_code == 200
    updated_task = update_res.json()
    assert updated_task["title"] == "Test Smoke Alarm Sensors - Completed"
    assert updated_task["priority"] == "CRITICAL"
    assert updated_task["status"] == "COMPLETED"
    assert updated_task["completion_notes"] == "Batteries verified at 98% charge."

    # 5. Update plan via PUT /api/plans/{plan_id}
    plan_update_payload = {
        "title": "Trip to Chennai - Updated Schedule",
        "duration_days": 16
    }
    plan_update_res = client.put(f"/api/plans/{plan_id}", json=plan_update_payload)
    assert plan_update_res.status_code == 200
    updated_plan = plan_update_res.json()
    assert updated_plan["title"] == "Trip to Chennai - Updated Schedule"
    assert updated_plan["duration_days"] == 16

    # 6. Mark notification as read
    first_notif = notifs[0]
    mark_read_res = client.patch(f"/api/notifications/{first_notif['id']}/read")
    assert mark_read_res.status_code == 200

    # 7. Mark all notifications as read
    mark_all_res = client.post("/api/notifications/mark-all-read")
    assert mark_all_res.status_code == 200

    # Verify all are read
    recheck_notifs = client.get("/api/notifications").json()
    assert all(n["is_read"] is True for n in recheck_notifs)

    # 8. Delete task via DELETE /api/tasks/{task_id}
    del_res = client.delete(f"/api/tasks/{task_id}")
    assert del_res.status_code == 200

    # Verify task no longer exists
    get_deleted = client.get(f"/api/tasks/{task_id}")
    assert get_deleted.status_code == 404
