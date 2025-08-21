@echo off
setlocal enabledelayedexpansion

echo ===============================================
echo Personal Financial Tracker - Starting All Services
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

echo %YELLOW%[1/4] Checking and killing existing processes on ports...%RESET%
echo.

REM Kill processes on backend port
echo Checking port %BACKEND_PORT% (Backend)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :%BACKEND_PORT%') do (
    set PID=%%a
    if !PID! GTR 0 (
        echo   Found process !PID! on port %BACKEND_PORT%, terminating...
        taskkill /F /PID !PID! >nul 2>&1
        if !errorlevel! == 0 (
            echo   %GREEN%Successfully killed process !PID!%RESET%
        ) else (
            echo   %RED%Failed to kill process !PID!%RESET%
        )
    )
)

REM Kill processes on frontend port
echo Checking port %FRONTEND_PORT% (Frontend)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :%FRONTEND_PORT%') do (
    set PID=%%a
    if !PID! GTR 0 (
        echo   Found process !PID! on port %FRONTEND_PORT%, terminating...
        taskkill /F /PID !PID! >nul 2>&1
        if !errorlevel! == 0 (
            echo   %GREEN%Successfully killed process !PID!%RESET%
        ) else (
            echo   %RED%Failed to kill process !PID!%RESET%
        )
    )
)

echo.
echo %YELLOW%[2/4] Installing dependencies...%RESET%
echo.

REM Navigate to root directory
cd /d "%~dp0\.."

REM Check if root node_modules exists
if not exist "node_modules" (
    echo Installing root dependencies...
    call npm install
    if !errorlevel! neq 0 (
        echo %RED%Failed to install root dependencies%RESET%
        pause
        exit /b 1
    )
) else (
    echo Root dependencies already installed, skipping...
)

REM Check backend dependencies
cd src\backend
if not exist "node_modules" (
    echo Installing backend dependencies...
    call npm install
    if !errorlevel! neq 0 (
        echo %RED%Failed to install backend dependencies%RESET%
        pause
        exit /b 1
    )
) else (
    echo Backend dependencies already installed, skipping...
)

REM Check frontend dependencies
cd ..\frontend
if not exist "node_modules" (
    echo Installing frontend dependencies...
    call npm install
    if !errorlevel! neq 0 (
        echo %RED%Failed to install frontend dependencies%RESET%
        pause
        exit /b 1
    )
) else (
    echo Frontend dependencies already installed, skipping...
)

REM Return to root
cd /d "%~dp0\.."

echo.
echo %YELLOW%[3/4] Starting Backend Server on port %BACKEND_PORT%...%RESET%
start "Backend Server" cmd /k "cd src\backend && npm run dev"

REM Wait a bit for backend to start
timeout /t 3 /nobreak >nul

echo.
echo %YELLOW%[4/4] Starting Frontend Dev Server on port %FRONTEND_PORT%...%RESET%
start "Frontend Dev Server" cmd /k "cd src\frontend && npm run dev"

echo.
echo ===============================================
echo %GREEN%All services started successfully!%RESET%
echo.
echo Backend:  http://localhost:%BACKEND_PORT%
echo Frontend: http://localhost:%FRONTEND_PORT%
echo.
echo To stop all services, run: stop-all.bat
echo ===============================================
echo.

REM Keep window open for a moment to show status
timeout /t 3 /nobreak >nul