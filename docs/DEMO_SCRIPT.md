# Aegivanta AI — 3-Minute Hackathon Demonstration Script
**Track:** Amazon Developer Hackathon — Alexa+ Track  
**Tagline:** *"Intelligence That Acts. Safety You Can Verify."*

---

## Act 1: The Problem & The Agentic Prompt (0:00 – 0:45)

1. **Presenter Introduction:**
   > "Welcome to Aegivanta AI. Millions of travelers experience departure anxiety—wondering if they left an oven on, a patio door unlatched, or pipes vulnerable to a freeze. Aegivanta AI transforms ordinary travel requests into verified home preparation plans using self-hosted Model Context Protocol (MCP) servers."

2. **Action — Open the Dashboard & AI Planning Studio:**
   - Navigate to `http://127.0.0.1:5173/` and click the **AI Planning Studio** tab.
   - Show the natural language input pre-populated with:
     > *"I'm leaving home for two weeks. Help me prepare my home safely."*
   - Set trip duration to **14 Days**. Toggle **Winter Freeze Risk** and **Houseplants**.
   - Click **Generate Plan**.

3. **What the Judges See:**
   - The **Agent Orchestration & MCP Protocol Trace** immediately expands in real time.
   - Point out Step 1: `tools/list` discovering 7 available tools over Streamable HTTP.
   - Point out Step 2: `create_safety_plan` dynamically converting the prompt into 11 categorized tasks.
   - Point out Step 3: `get_tasks` verifying authoritative persistent storage in SQLite.
   - Point out Step 4: `policy/safety_boundary_check` enforcing that no physical lock or breaker is toggled without explicit human confirmation.

---

## Act 2: Task Management & The Verification Engine (0:45 – 1:45)

1. **Action — Navigate to Task Management:**
   - Switch to the **Task Management** tab. Show the 11 prioritized tasks (Doors & Perimeter, Windows, Plumbing & Appliances, HVAC, Security).
   - On *"Inspect and Deadbolt All Exterior Doors"*, click **Mark Done**.
   - Note the status changes to **COMPLETED** (Self-Reported).
   - Explain the core hackathon distinction:
     > "Notice this task is self-reported as completed, but NOT verified. If we try to mark it verified without evidence, our backend verification rules engine strictly blocks it to prevent false confidence."

2. **Action — Attach Direct Evidence:**
   - Click **Attach Evidence / Verify**.
   - Select **Photographic Reference (Direct Evidence)**.
   - Enter description: *"Smartphone photo of locked front deadbolt throw securely engaged."*
   - Click **Attach & Verify**.
   - Show the task immediately transition to **VERIFIED** with an emerald shield badge!
   - Open the **Audit History** button to reveal the immutable event trail logged in SQLite.

3. **Action — Demo Simulation Disclosure:**
   - Click **Simulate Telemetry (Demo)**.
   - Point out the prominent banner:
     > `DEMO SIMULATION — NOT CONNECTED TO A REAL DEVICE`
   - Explain how simulated telemetry is tracked with `is_simulated = True`, keeping demonstration data transparent and distinct from real user verification.

---

## Act 3: MCP Developer Console & Certified Safety Report (1:45 – 3:00)

1. **Action — Open the MCP Developer Panel:**
   - Switch to the **MCP Dev Panel** tab.
   - Show the live **Connection State: ONLINE** to `/mcp` via Streamable HTTP (specification `2025-11-25`).
   - Show the 7 registered tools discovered via `tools/list`. Expand an input JSON schema.
   - Demonstrate the **Tool Execution Sandbox**: Select `generate_safety_report`, click **Execute**, and show the live JSON response returning in under 20ms with session headers.

2. **Action — Final Safety Report & Print:**
   - Switch to the **Safety Report** tab.
   - Show the certified readiness scorecard: Total tasks, Verified items, Completed unverified, and Outstanding pending checks.
   - Review the actionable coordinator recommendations and prominent legal safety disclaimer.
   - Click **Print / Export PDF** to show the clean print-ready stylesheet.

3. **Conclusion:**
   > "Aegivanta AI satisfies the Alexa+ hackathon requirements with a real, self-hosted MCP server over Streamable HTTP, strict verification rules, human confirmation boundaries, and zero paid API dependencies. Intelligence that acts. Safety you can verify."
