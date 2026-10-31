@echo off
title FinGuard AI - Unified Platform Launcher
echo =====================================================================
echo  FinGuard AI | Credit Card Fraud Detection Platform Launcher
echo =====================================================================
echo.

set PROJECT_DIR=%~dp0
cd /d "%PROJECT_DIR%"

if exist "%PROJECT_DIR%venv\Scripts\python.exe" (
    set PYTHON_EXE=%PROJECT_DIR%venv\Scripts\python.exe
) else (
    set PYTHON_EXE=python
)

echo [Launcher] Executing FinGuard server on http://localhost:8000 ...
"%PYTHON_EXE%" run_platform.py

pause

