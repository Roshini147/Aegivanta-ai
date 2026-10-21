# Aegivanta AI

> **"Intelligence That Acts. Safety You Can Verify."**  
> *Enterprise-Grade Autonomous Residential Safety & Departure Verification Agent*

[![MCP Specification](https://img.shields.io/badge/MCP%20Spec-2025--11--25-emerald.svg)](https://modelcontextprotocol.io/)
[![Transport](https://img.shields.io/badge/Transport-Streamable%20HTTP-blue.svg)](https://modelcontextprotocol.io/)
[![Python](https://img.shields.io/badge/Python-3.11%2B-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115%2B-teal.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19-cyan.svg)](https://react.dev/)
[![License](https://img.shields.io/badge/License-Apache%202.0-green.svg)](LICENSE)

---

## 1. Project Overview & Problem Statement

When people leave home for vacations, business trips, or holiday travel, departure anxiety is common:
* *Did I lock the back patio sliding door?*
* *Is the main water valve shut off to prevent burst pipes?*
* *Are indoor space heaters unplugged?*
* *Is my furnace set high enough to prevent winter freeze damage?*

**Aegivanta AI** is an AI-powered home-preparation and safety coordination agent. It turns natural language departure prompts (e.g., *"I'm leaving home for two weeks. Help me prepare my home safely."*) into a categorized, prioritized, persistent safety preparation plan. 

Crucially, **Aegivanta AI enforces a strict verification boundary**: it distinguishes self-reported checklist completion from verified physical evidence, prevents false claims of safety, requires human confirmation for consequential actions, and exposes its full agentic workflow through a self-hosted **Model Context Protocol (MCP)** server over **Streamable HTTP**.

---

## 2. Key Features

1. **Natural Language Departure Planning:**
   - Interprets trip duration, weather risks (e.g., sub-zero freeze alerts), home type, and pet/plant care.
   - Deterministic local planner active out of the box with zero required paid API keys.
2. **Official Self-Hosted MCP Server (Streamable HTTP):**
   - Implements MCP specification `2025-11-25` using the official `mcp 2.3.0` Python SDK.
   - Replaces legacy SSE with **Streamable HTTP** (`/mcp` endpoint) supporting JSON-RPC `POST` and scoped `text/event-stream` SSE with session persistence (`mcp-session-id`).
3. **Rigorous Verification Rules Engine:**
   - Tasks cannot be marked `VERIFIED` without direct evidence (photo reference or sensor telemetry).
   - Attempted unbacked promotions are rejected and revert to `UNABLE_TO_VERIFY`.
4. **Human-in-the-Loop Consequential Safety:**
   - Any sensitive action (e.g., arming security systems, altering thermostat modes, utility cutoffs) generates a `PENDING` confirmation requiring explicit homeowner consent.
5. **Real-Time MCP Developer Console:**
   - Live protocol diagnostic status.
   - Interactive Tool Discovery (`tools/list`) with collapsible JSON parameter schemas.
   - Direct Execution Sandbox (`tools/call`) with latency tracking and audit streams.
6. **Certified Safety Report:**
   - Generates readiness scorecard, verified items, self-reported items, pending anomalies, and coordinator recommendations.
   - Clean `@media print` styling for PDF exports.

---

## 3. Technology Stack

* **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons.
* **Backend:** Python 3.11+ / 3.14+, FastAPI, Pydantic v2, SQLAlchemy, aiosqlite.
* **Database:** SQLite (`aegivanta.db`) with persistent tables for users, plans, tasks, events, evidence, and confirmations.
* **Protocol & MCP:** Official Python MCP SDK (`mcp 2.3.0`), `MCPServer`, Streamable HTTP transport.
* **Testing:** pytest, pytest-asyncio, httpx.

---

## 4. Architecture & Protocol Flow

```
   [ User / Web Dashboard ] (Port 5173)
             |
             +----------------------------+
             |                            |
      REST & Agent APIs             MCP Dev Panel
             |                            |
             v                            v
   [ FastAPI Backend Layer ] <===> [ MCP Client Bridge ]
   (Port 8000)                            |
             |                   Streamable HTTP (JSON-RPC POST + SSE)
             |                   Endpoint: /mcp (Header: MCP-Session-Id)
             v                            |
   [ Agent Orchestrator ]                 v
   (Rule Engine / LLM)       [ Official Python MCPServer (2025-11-25) ]
             |                            |
             v                            v
   [ Verification Engine ] <==============+
   - Strict transition rules
   - Evidence classification
   - Simulation flagging
             |
             v
   [ Persistent SQLite Database (aegivanta.db) ]
```

---

## 5. Quick Start Guide

### Step 1: Clone and Set Up Backend
```bash
cd backend
python -m venv .venv

# On Windows:
.venv\Scripts\Activate.ps1
# On Linux/macOS:
source .venv/bin/activate

pip install -r requirements.txt
pip install greenlet
```

### Step 2: Start the Backend Server
```bash
python run_backend.py
```
* **FastAPI Server:** `http://127.0.0.1:8000`
* **Swagger API Documentation:** `http://127.0.0.1:8000/docs`
* **Streamable HTTP MCP Endpoint:** `http://127.0.0.1:8000/mcp`

*(Optional standalone dedicated MCP runner on port 8001: `python run_mcp.py`)*

### Step 3: Start the Frontend Application
In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```
* **Frontend Web App:** `http://127.0.0.1:5173/`

---

## 6. MCP Server Protocol Details

### 6.1 Handshake & Initialization
The server implements the standard MCP initialization handshake over Streamable HTTP:
```http
POST /mcp HTTP/1.1
Host: 127.0.0.1:8000
Content-Type: application/json
Accept: application/json, text/event-stream

{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "initialize",
  "params": {
    "protocolVersion": "2025-11-25",
    "capabilities": {},
    "clientInfo": {
      "name": "alexa_plus_client",
      "version": "1.0.0"
    }
  }
}
```
**Response:** HTTP `200 OK` with `mcp-session-id` header and SSE event message declaring capabilities and protocol version `2025-11-25`.

### 6.2 The 7 Exposed MCP Tools

| Tool Name | Parameters | Description |
|---|---|---|
| `create_safety_plan` | `user_request`, `duration_days`, `household_context` | Generates prioritized preparation plan in SQLite |
| `get_tasks` | `plan_id`, `status_filter` | Retrieves persistent task records |
| `update_task_status` | `task_id`, `requested_status`, `completion_method`, `notes` | Validates state transition through verification engine |
| `record_verification_evidence` | `task_id`, `evidence_type`, `description`, `source`, `is_simulated` | Records audit evidence, triggers verification upgrade |
| `get_verification_evidence` | `task_id` | Fetches audit evidence trail |
| `request_action_confirmation` | `action_type`, `target_id`, `rationale`, `parameters` | Creates pending human confirmation request |
| `generate_safety_report` | `plan_id` | Compiles certified safety report |

---

## 7. Testing & Verification

Run the automated test suite from the `backend/` directory:
```bash
pytest -v
```

### Verified Test Results (All 7 Tests Passing):
* `test_database.py::test_user_and_plan_creation` **PASSED** (Database initialization & cross-session persistence)
* `test_mcp_tools.py::test_mcp_streamable_http_initialization` **PASSED** (Streamable HTTP handshake & session ID)
* `test_mcp_tools.py::test_mcp_tool_discovery` **PASSED** (Discovery of 7 official tools via `tools/list`)
* `test_mcp_tools.py::test_mcp_tool_execution_flow` **PASSED** (Execution of all 7 tools via `tools/call`)
* `test_verification_rules.py::test_unsupported_verified_transition_rejected` **PASSED** (Enforces verification criteria)
* `test_verification_rules.py::test_simulated_evidence_labeling` **PASSED** (Tags simulated data accurately)
* `test_agent_workflow.py::test_full_agentic_key_workflow` **PASSED** (Key end-to-end 13-step workflow)

---

## 8. Telemetry & Verification Integrity Policy

When connecting to IoT sensor hubs and environmental telemetry:
* Verification logs, photographic inspections, and sensor telemetry are authenticated and stored in the audit register.
* User-reported physical completions remain clearly distinguishable from automated sensor verification.
* Cryptographic evidence hashes guarantee tamper-proof audit trails.

---

## 9. Security & Safety Boundaries

1. **Zero Unconfirmed Actuation:** The agent cannot trigger physical locks, valves, or mode changes without explicit human authorization.
2. **Untrusted Input Protection:** Natural language task descriptions cannot override backend database validation.
3. **No Hardcoded Secrets:** All secrets load through environment variables (`.env`).
4. **Origin Validation:** Streamable HTTP binds strictly to `127.0.0.1` locally with DNS rebinding protection.

---

## 10. Documentation Index

* [System Architecture & Protocol Specification](docs/ARCHITECTURE.md)
* [Local Setup & Deployment Guide](docs/SETUP.md)
* [System Demonstration Guide](docs/DEMO_SCRIPT.md)
* [Safety & Verification Specification](docs/HACKATHON_COMPLIANCE.md)
* [Product & Architecture Notes](docs/PRODUCT_FEEDBACK.md)

---

## 11. Disclaimer

Aegivanta AI is an organizational decision-support aid. It does not provide a guarantee of physical safety, weather resistance, or incident prevention. Users must verify critical locks, gas, and plumbing valves directly before departing.
