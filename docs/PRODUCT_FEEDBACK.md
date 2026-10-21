# Aegivanta AI — MCP SDK & Alexa+ Product Feedback Log

This document records authentic developer experience observations, SDK nuances, and tooling friction encountered while building Aegivanta AI for the Amazon Developer Hackathon (Alexa+ Track).

---

## 1. Official Python MCP SDK (`mcp 2.x`) Observations

### 1.1 `FastMCP` to `MCPServer` Transition
* **Observation:** In `mcp 2.x`, attempting to import `FastMCP` from `mcp.server.fastmcp` raises an explicit migration warning recommending `from mcp.server.mcpserver import MCPServer`.
* **Resolution:** Migrated directly to `MCPServer`, which provides native Streamable HTTP support via `.streamable_http_app(streamable_http_path="/mcp")` and `.run_streamable_http_async()`.
* **Feedback for SDK Maintainers:** The built-in error message was exceptionally helpful because it included the exact import path and migration documentation link.

### 1.2 Streamable HTTP Lifespan Requirement
* **Observation:** When invoking `.streamable_http_app()` as a Starlette app in standalone test harnesses without Uvicorn's server loop, an error occurred: `RuntimeError: Task group is not initialized. Make sure to use run()`.
* **Resolution:** Wrapped the app in `app.router.lifespan_context(app)` during tests, which initializes the session task group and handles graceful shutdown.
* **Feedback for SDK Maintainers:** Clearer documentation on running Streamable HTTP inside custom ASGI application lifespans would assist developers embedding MCP directly into FastAPI or Starlette microservices.

### 1.3 Flexible Input Schema Validation
* **Observation:** Pydantic validation on MCP tool parameters strictly validated `str` types when JSON dictionaries were passed.
* **Resolution:** Typed input parameters to accept flexible structures (`Optional[Any] = None`) with explicit JSON string or dictionary parsing inside the tool implementation.

---

## 2. Alexa+ Developer Experience & Streamable HTTP

### 2.1 Single Endpoint Simplicity vs Legacy SSE
* **Experience:** Moving from the dual-endpoint SSE pattern (`/sse` and `/messages`) to the unified **Streamable HTTP** (`/mcp` handling both POST requests and scoped SSE streams) substantially simplified proxying, CORS management, and client connection logic.
* **Benefit for Alexa+ Agents:** Allows Alexa+ agent runtime to issue standard HTTP POST requests with standard JSON-RPC payloads, with session affinity handled cleanly via `MCP-Session-Id`.

---

## 3. Product Feedback Placeholders (Pending User / Judge Testing)

* *[Awaiting Hackathon Feedback]* — Homeowner comprehension of "Verified" vs "Self-Reported" state designations.
* *[Awaiting Hackathon Feedback]* — User willingness to attach photographic evidence for peace of mind before long trips.
* *[Awaiting Hackathon Feedback]* — Consequential action confirmation dialog friction during last-minute departure packing.
