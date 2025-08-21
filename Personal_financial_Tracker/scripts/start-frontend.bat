@echo off
setlocal enabledelayedexpansion

echo ===============================================
echo Starting Frontend Dev Server Only
echo ===============================================
echo.

REM Define port
set FRONTEND_PORT=5173

REM Colors for output
set ESC=
set GREEN=[92m
set RED=[91m
set YELLOW=[93m
set RESET=[0m

echo %YELLOW%Checking port %FRONTEND_PORT%...%RESET%

REM Kill existing process on frontend port
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :%FRONTEND_PORT%') do (
    set PID=%%a
    if !PID! GTR 0 (
        echo Found process !PID! on port %FRONTEND_PORT%, terminating...
        taskkill /F /PID !PID! >nul 2>&1
        if !errorlevel! == 0 (
            echo %GREEN%Successfully killed process !PID!%RESET%
        ) else (
            echo %RED%Failed to kill process !PID!%RESET%
        )
    )
)

REM Navigate to frontend directory
cd /d "%~dp0\..\src\frontend"

REM Check if node_modules exists
if not exist "node_modules" (
    echo.
    echo %YELLOW%Installing frontend dependencies...%RESET%
    call npm install
    if !errorlevel! neq 0 (
        echo %RED%Failed to install dependencies%RESET%
        pause
        exit /b 1
    )
)

echo.
echo %YELLOW%Starting Frontend Dev Server on port %FRONTEND_PORT%...%RESET%
echo.

REM Start the frontend dev server
npm run dev

pause