# Aegivanta AI — System Architecture & Protocol Specification

## 1. System Overview

**Aegivanta AI** is an AI-powered home-preparation and safety coordination agent created for the **Amazon Developer Hackathon — Alexa+ Track**. The application bridges natural language departure planning with persistent verification and genuine Model Context Protocol (MCP) tool execution.

```
+-----------------------------------------------------------------------------------------+
|                                    Aegivanta AI Architecture                            |
+-----------------------------------------------------------------------------------------+

   [ Web Browser / User ]
             |
             v
   [ React 19 + TypeScript + Vite + Tailwind CSS Frontend ] (Port 5173)
             |
             +----------------------------+
             |                            |
      REST & Agent APIs             MCP Bridge / Dev Panel
             |                            |
             v                            v
   [ FastAPI Backend Layer ] <===> [ MCP Client Bridge ]
             |                            |
             |                   Streamable HTTP (JSON-RPC POST + SSE)
             |                   Endpoint: /mcp (Header: MCP-Session-Id)
             v                            |
   [ Agent Orchestrator ]                 v
   (Rule Engine / LLM)       [ Official Python MCPServer (2025-11-25) ]
             |                            |
             |              +-------------+-------------+
             |              | 7 Typed MCP Tools:        |
             |              | - create_safety_plan      |
             |              | - get_tasks               |
             |              | - update_task_status      |
             |              | - record_verification_... |
             |              | - get_verification_...    |
             |              | - request_action_conf...  |
             |              | - generate_safety_report  |
             |              +-------------+-------------+
             |                            |
             v                            v
   [ Verification Engine ] <==============+
   - Strict transition rules
   - Evidence classification
   - Simulation flagging
             |
             v
   [ Persistent SQLite Database (aegivanta.db) ]
   - users / demo_profiles
   - safety_plans
   - tasks
   - task_events (Audit Trail)
   - verification_evidence
   - action_confirmations
```

---

## 2. MCP Implementation & Streamable HTTP Transport

### 2.1 Specification Compliance
* **Protocol Target:** Model Context Protocol (MCP) specification version `2025-11-25`.
* **SDK:** Official Python SDK `mcp` version `2.3.0` (`from mcp.server.mcpserver import MCPServer`).
* **Transport:** **Streamable HTTP** (`/mcp` endpoint) replacing legacy SSE transport:
  - All JSON-RPC client messages (e.g. `initialize`, `tools/list`, `tools/call`) are transmitted as HTTP `POST` requests.
  - Server responses utilize `text/event-stream` scoped Server-Sent Events with session persistence via `mcp-session-id` header.
  - Dual mounting: Served directly on `http://127.0.0.1:8000/mcp` and executable as a standalone daemon on `http://127.0.0.1:8001/mcp`.

### 2.2 Exposed MCP Tools

1. **`create_safety_plan`**:
   - *Inputs:* `user_request` (string), `duration_days` (integer), `household_context` (dictionary/string).
   - *Behavior:* Converts departure requests into structured safety tasks grouped by category and priority.
   - *Output:* Plan ID, title, duration, and list of created task entities.

2. **`get_tasks`**:
   - *Inputs:* `plan_id` (string), `status_filter` (optional string).
   - *Behavior:* Retrieves authoritative persistent records from SQLite.
   - *Output:* Task list with live statuses, descriptions, and timestamps.

3. **`update_task_status`**:
   - *Inputs:* `task_id` (string), `requested_status` (string), `completion_method` (string), `notes` (optional string).
   - *Behavior:* Validates state transitions through the verification engine. Rejects unsupported promotions to `VERIFIED` without backing evidence.
   - *Output:* Final status, transition rationale, and updated task attributes.

4. **`record_verification_evidence`**:
   - *Inputs:* `task_id` (string), `evidence_type` (string), `description` (string), `source` (string), `is_simulated` (boolean).
   - *Behavior:* Records evidence in SQLite, classifies proof strength (`DIRECT_EVIDENCE`, `CORROBORATIVE`, `INSUFFICIENT`), and upgrades task status when criteria are satisfied.
   - *Output:* Evidence ID, classification, and simulation status.

5. **`get_verification_evidence`**:
   - *Inputs:* `task_id` (string).
   - *Behavior:* Fetches all audit proof records associated with a task.

6. **`request_action_confirmation`**:
   - *Inputs:* `action_type` (string), `target_id` (string), `rationale` (string), `parameters` (optional dictionary/string).
   - *Behavior:* Enforces human confirmation boundaries for consequential actions. Creates a `PENDING` record without executing changes.

7. **`generate_safety_report`**:
   - *Inputs:* `plan_id` (string).
   - *Behavior:* Compiles verified scorecard, completed unverified items, pending items, action required anomalies, and safety disclosures.

---

## 3. Database Schema

* **`users`**: Demo profiles (e.g., `demo_homeowner`).
* **`safety_plans`**: Departure plans with user request, duration, context.
* **`tasks`**: Discrete safety items with priority (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`) and status (`PENDING`, `COMPLETED`, `VERIFIED`, `ACTION_REQUIRED`, `UNABLE_TO_VERIFY`).
* **`task_events`**: Immutable event stream logging status transitions, actors, and notes.
* **`verification_evidence`**: Audit evidence items with evidence type, classification, and `is_simulated` flag.
* **`action_confirmations`**: Human-in-the-loop pending authorization records.

---

## 4. Verification Engine

A central rule evaluator governs all status transitions:
1. `COMPLETED` represents user-attested completion without verified proof.
2. `VERIFIED` strictly requires either:
   - At least 1 `DIRECT_EVIDENCE` item (photo reference or sensor telemetry).
   - At least 2 independent `CORROBORATIVE` items (two-party check or attestation).
3. Attempting to mark a task `VERIFIED` without evidence is rejected by the backend and reverts to `UNABLE_TO_VERIFY`.
4. Simulated telemetry is explicitly tagged with `is_simulated = True` and labeled with the demo disclosure.
5. Overall progress calculates: `(completed_unverified + verified) / total_tasks`, preventing double counting.
