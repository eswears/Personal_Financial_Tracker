@echo off
setlocal

echo ===============================================
echo Personal Financial Tracker - Restarting All Services
echo ===============================================
echo.

REM Colors for output
set ESC=
set GREEN=[92m
set YELLOW=[93m
set RESET=[0m

echo %YELLOW%[1/2] Stopping all services...%RESET%
echo.

REM Call stop-all.bat
call "%~dp0stop-all.bat"

echo.
echo %YELLOW%[2/2] Starting all services...%RESET%
echo.

REM Wait a moment before restarting
timeout /t 2 /nobreak >nul

REM Call start-all.bat
call "%~dp0start-all.bat"

echo.
echo %GREEN%Restart complete!%RESET%
echo.