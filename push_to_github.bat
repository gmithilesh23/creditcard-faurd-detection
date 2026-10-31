@echo off
title FinGuard AI - Push to GitHub
echo =====================================================================
echo  FinGuard AI | Push to GitHub (gmithilesh23)
echo =====================================================================
echo.
echo Remote repository target:
echo https://github.com/gmithilesh23/credit-card-fraud-intelligence.git
echo.
echo Make sure you have created the repository on https://github.com/new
echo with the name: credit-card-fraud-intelligence
echo.

set GIT_EXE=C:\Users\gmith\.local\git\cmd\git.exe

"%GIT_EXE%" push -u origin main

echo.
pause
