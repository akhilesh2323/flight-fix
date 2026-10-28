@echo off
echo ===================================================
echo     FlightFix - Push to GitHub Automation Script
echo ===================================================
echo.

cd /d "%~dp0"

echo 1. Verifying Git Status...
git status

echo.
echo 2. Pushing to GitHub (origin main)...
git push -u origin main

if %ERRORLEVEL% equ 0 (
    echo.
    echo ===================================================
    echo    SUCCESS: FlightFix has been pushed to GitHub!
    echo ===================================================
) else (
    echo.
    echo ===================================================
    echo  NOTICE: If you see "Repository not found":
    echo  1. Go to https://github.com/new
    echo  2. Create a repository named: flightfix
    echo  3. Run this script again!
    echo ===================================================
)

pause
