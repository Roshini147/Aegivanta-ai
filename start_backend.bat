@echo off
title Aegivanta AI - Backend Server
echo ===================================================
echo        Starting Aegivanta AI Backend (FastAPI)
echo ===================================================
cd backend
if exist .venv\Scripts\activate.bat (
    call .venv\Scripts\activate.bat
)
python run_backend.py
pause
