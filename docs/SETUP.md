# Aegivanta AI — Local Setup & Execution Guide

## Prerequisites

1. **Python 3.11+** (Tested on Python 3.14.6)
2. **Node.js 20+** and **npm** (Tested on Node.js v24.21.0, npm 11.19.0)
3. **Operating System:** Windows, macOS, or Linux

---

## 1. Backend Setup

From the project root:

```bash
cd backend

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# On Windows PowerShell:
.venv\Scripts\Activate.ps1
# On Linux/macOS:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
pip install greenlet
```

### Starting the Backend Server
```bash
python run_backend.py
```
* **FastAPI Server URL:** `http://127.0.0.1:8000`
* **Interactive API Docs (Swagger):** `http://127.0.0.1:8000/docs`
* **Streamable HTTP MCP Endpoint:** `http://127.0.0.1:8000/mcp`

### (Optional) Starting the Standalone MCP Server
```bash
python run_mcp.py
```
* **Dedicated MCP Endpoint:** `http://127.0.0.1:8001/mcp`

---

## 2. Frontend Setup

From the project root in a separate terminal:

```bash
cd frontend

# Install packages
npm install

# Start Vite development server
npm run dev
```

* **Frontend Dashboard URL:** `http://127.0.0.1:5173/`

---

## 3. Running the Test Suite

From the `backend` directory:

```bash
# Run all tests with pytest
pytest -v
```

All 7 test suites verify:
- Persistent SQLite database models and reconnection integrity
- MCP protocol Streamable HTTP initialization and session headers
- Discovery of the 7 MCP tools via `tools/list`
- Execution of tools via `tools/call`
- Enforcement of verification criteria (rejecting unsupported `VERIFIED` transitions)
- Simulated data labeling
- End-to-end hackathon departure planning workflow
