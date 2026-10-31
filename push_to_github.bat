@echo off
title FinGuard AI - Push to GitHub
echo =====================================================================
echo  FinGuard AI | Push to GitHub (gmithilesh23)
echo =====================================================================
echo.
echo Remote repository target:
echo https://github.com/gmithilesh23/creditcard-faurd-detection.git
echo.

set GIT_EXE=C:\Users\gmith\.local\git\cmd\git.exe

"%GIT_EXE%" push -u origin main

echo.
pause
