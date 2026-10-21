import pytest
import asyncio
import httpx
from app.database.session import init_db
from app.mcp.server import mcp_server
from app.mcp.client_bridge import mcp_client

@pytest.fixture(scope="module", autouse=True)
def setup_test_db():
    asyncio.run(init_db())

@pytest.mark.asyncio
async def test_mcp_streamable_http_initialization():
    app = mcp_server.streamable_http_app()
    async with app.router.lifespan_context(app):
        async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://127.0.0.1:8000") as client:
            init_payload = {
                "jsonrpc": "2.0",
                "id": 1,
                "method": "initialize",
                "params": {
                    "protocolVersion": "2025-11-25",
                    "capabilities": {},
                    "clientInfo": {"name": "test_alexa_plus_client", "version": "1.0.0"}
                }
            }
            resp = await client.post("/mcp", json=init_payload, headers={"Accept": "application/json, text/event-stream"})
            assert resp.status_code == 200
            assert "mcp-session-id" in resp.headers
            assert "2025-11-25" in resp.text
            assert "AegivantaSafetyCoordinator" in resp.text

@pytest.mark.asyncio
async def test_mcp_tool_discovery():
    tools = await mcp_client.list_tools_live()
    tool_names = [t["name"] for t in tools]
    expected_tools = [
        "create_safety_plan",
        "get_tasks",
        "update_task_status",
        "record_verification_evidence",
        "get_verification_evidence",
        "request_action_confirmation",
        "generate_safety_report"
    ]
    for expected in expected_tools:
        assert expected in tool_names, f"Missing MCP tool {expected}"

@pytest.mark.asyncio
async def test_mcp_tool_execution_flow():
    # 1. create_safety_plan
    plan_res = await mcp_client.call_tool_live(
        "create_safety_plan",
        {"user_request": "Leaving for 2 weeks. Prepare my home.", "duration_days": 14}
    )
    assert plan_res["success"] is True
    plan_id = plan_res["data"]["plan_id"]
    assert plan_id is not None
    assert plan_res["data"]["total_tasks_created"] > 0

    # 2. get_tasks
    tasks_res = await mcp_client.call_tool_live("get_tasks", {"plan_id": plan_id})
    assert tasks_res["success"] is True
    task_list = tasks_res["data"]["tasks"]
    assert len(task_list) > 0
    first_task = task_list[0]
    task_id = first_task["id"]

    # 3. update_task_status to COMPLETED
    update_res = await mcp_client.call_tool_live(
        "update_task_status",
        {"task_id": task_id, "requested_status": "COMPLETED", "notes": "Done manually"}
    )
    assert update_res["success"] is True
    assert update_res["data"]["final_status"] == "COMPLETED"

    # 4. record_verification_evidence
    ev_res = await mcp_client.call_tool_live(
        "record_verification_evidence",
        {
            "task_id": task_id,
            "evidence_type": "PHOTO_REFERENCE",
            "description": "Timestamped smartphone photo of locked deadbolt",
            "source": "Homeowner Camera",
            "is_simulated": False
        }
    )
    assert ev_res["success"] is True
    assert ev_res["data"]["classification"] == "DIRECT_EVIDENCE"

    # 5. get_verification_evidence
    get_ev_res = await mcp_client.call_tool_live("get_verification_evidence", {"task_id": task_id})
    assert get_ev_res["success"] is True
    assert get_ev_res["data"]["count"] >= 1

    # 6. request_action_confirmation
    conf_res = await mcp_client.call_tool_live(
        "request_action_confirmation",
        {
            "action_type": "ARM_PERIMETER_SYSTEM",
            "target_id": plan_id,
            "rationale": "Arm security system in Away mode 30 minutes before flight."
        }
    )
    assert conf_res["success"] is True
    assert conf_res["data"]["status"] == "PENDING"

    # 7. generate_safety_report
    report_res = await mcp_client.call_tool_live("generate_safety_report", {"plan_id": plan_id})
    assert report_res["success"] is True
    assert report_res["data"]["plan_id"] == plan_id
    assert "metrics" in report_res["data"]
