@echo off
title FinGuard AI - Vite Frontend Dev Server
echo =====================================================================
echo  FinGuard AI - Frontend Dev Server (Port 5173)
echo =====================================================================
echo.

set PROJECT_DIR=%~dp0
set PATH=C:\Users\gmith\.local\node-v20.18.0-win-x64;%PATH%

cd /d "%PROJECT_DIR%frontend"
npm run dev

pause

