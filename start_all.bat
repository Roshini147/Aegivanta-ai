@echo off
title Aegivanta AI - Complete Launcher
echo ===================================================
echo           Starting Aegivanta AI Platform
echo ===================================================
echo.

echo [1/3] Starting Backend Server (FastAPI + MCP)...
start "Aegivanta AI - Backend" cmd /k "cd backend && call .venv\Scripts\activate.bat && python run_backend.py"

echo [2/3] Starting Frontend Dev Server (Vite React)...
start "Aegivanta AI - Frontend" cmd /k "cd frontend && npm run dev -- --host 127.0.0.1"

echo.
echo [3/3] Waiting for servers to initialize...
timeout /t 3 /nobreak >nul

echo Opening Aegivanta AI Web Application in your default browser...
start http://127.0.0.1:5173

echo.
echo ===================================================
echo  Frontend URL: http://127.0.0.1:5173
echo  Backend API:  http://127.0.0.1:8000
echo  API Docs:     http://127.0.0.1:8000/docs
echo ===================================================
echo Leave the backend and frontend terminal windows open.
echo.
pause
