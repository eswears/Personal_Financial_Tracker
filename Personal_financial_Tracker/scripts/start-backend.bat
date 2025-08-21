@echo off
setlocal enabledelayedexpansion

echo ===============================================
echo Starting Backend Server Only
echo ===============================================
echo.

REM Define port
set BACKEND_PORT=3001

REM Colors for output
set ESC=
set GREEN=[92m
set RED=[91m
set YELLOW=[93m
set RESET=[0m

echo %YELLOW%Checking port %BACKEND_PORT%...%RESET%

REM Kill existing process on backend port
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :%BACKEND_PORT%') do (
    set PID=%%a
    if !PID! GTR 0 (
        echo Found process !PID! on port %BACKEND_PORT%, terminating...
        taskkill /F /PID !PID! >nul 2>&1
        if !errorlevel! == 0 (
            echo %GREEN%Successfully killed process !PID!%RESET%
        ) else (
            echo %RED%Failed to kill process !PID!%RESET%
        )
    )
)

REM Navigate to backend directory
cd /d "%~dp0\..\src\backend"

REM Check if node_modules exists
if not exist "node_modules" (
    echo.
    echo %YELLOW%Installing backend dependencies...%RESET%
    call npm install
    if !errorlevel! neq 0 (
        echo %RED%Failed to install dependencies%RESET%
        pause
        exit /b 1
    )
)

echo.
echo %YELLOW%Starting Backend Server on port %BACKEND_PORT%...%RESET%
echo.

REM Start the backend server
npm run dev

pause