@echo off
setlocal enabledelayedexpansion

echo ===============================================
echo Personal Financial Tracker - Stopping All Services
echo ===============================================
echo.

REM Define ports
set BACKEND_PORT=3001
set FRONTEND_PORT=5173

REM Colors for output
set ESC=
set GREEN=[92m
set RED=[91m
set YELLOW=[93m
set RESET=[0m

echo %YELLOW%Stopping all services...%RESET%
echo.

REM Kill processes on backend port
echo [1/3] Stopping Backend Server (port %BACKEND_PORT%)...
set FOUND_BACKEND=0
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :%BACKEND_PORT%') do (
    set PID=%%a
    if !PID! GTR 0 (
        set FOUND_BACKEND=1
        echo   Found process !PID! on port %BACKEND_PORT%, terminating...
        taskkill /F /PID !PID! >nul 2>&1
        if !errorlevel! == 0 (
            echo   %GREEN%Successfully stopped backend process !PID!%RESET%
        ) else (
            echo   %RED%Failed to stop backend process !PID!%RESET%
        )
    )
)
if !FOUND_BACKEND! == 0 (
    echo   No backend process found on port %BACKEND_PORT%
)

echo.

REM Kill processes on frontend port
echo [2/3] Stopping Frontend Dev Server (port %FRONTEND_PORT%)...
set FOUND_FRONTEND=0
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :%FRONTEND_PORT%') do (
    set PID=%%a
    if !PID! GTR 0 (
        set FOUND_FRONTEND=1
        echo   Found process !PID! on port %FRONTEND_PORT%, terminating...
        taskkill /F /PID !PID! >nul 2>&1
        if !errorlevel! == 0 (
            echo   %GREEN%Successfully stopped frontend process !PID!%RESET%
        ) else (
            echo   %RED%Failed to stop frontend process !PID!%RESET%
        )
    )
)
if !FOUND_FRONTEND! == 0 (
    echo   No frontend process found on port %FRONTEND_PORT%
)

echo.

REM Also try to kill by window title as backup
echo [3/3] Closing any remaining console windows...
taskkill /FI "WindowTitle eq Backend Server*" /F >nul 2>&1
taskkill /FI "WindowTitle eq Frontend Dev Server*" /F >nul 2>&1

REM Kill any node processes that might be lingering
echo.
echo Cleaning up any remaining Node.js processes...
for /f "tokens=2" %%a in ('tasklist ^| findstr "node.exe"') do (
    set PID=%%a
    REM Check if this node process is using our ports
    netstat -ano | findstr !PID! | findstr ":%BACKEND_PORT% :%FRONTEND_PORT%" >nul 2>&1
    if !errorlevel! == 0 (
        echo   Terminating Node.js process !PID!...
        taskkill /F /PID !PID! >nul 2>&1
    )
)

echo.
echo ===============================================
echo %GREEN%All services stopped successfully!%RESET%
echo ===============================================
echo.

pause