@echo off
setlocal enabledelayedexpansion

echo ===============================================
echo Port Status Check - Personal Financial Tracker
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
set CYAN=[96m
set RESET=[0m

echo %CYAN%Checking port usage...%RESET%
echo.

REM Check backend port
echo %YELLOW%Backend Port (%BACKEND_PORT%):%RESET%
set BACKEND_FOUND=0
for /f "tokens=1,2,3,4,5" %%a in ('netstat -ano ^| findstr :%BACKEND_PORT%') do (
    set BACKEND_FOUND=1
    echo   Protocol: %%a
    echo   Local Address: %%b
    echo   Foreign Address: %%c
    echo   State: %%d
    echo   PID: %%e
    
    REM Get process name for PID
    for /f "tokens=1,2" %%i in ('tasklist /FI "PID eq %%e" 2^>nul ^| findstr %%e') do (
        echo   Process: %%i
    )
    echo   ---
)
if !BACKEND_FOUND! == 0 (
    echo   %GREEN%Port %BACKEND_PORT% is available%RESET%
)

echo.

REM Check frontend port
echo %YELLOW%Frontend Port (%FRONTEND_PORT%):%RESET%
set FRONTEND_FOUND=0
for /f "tokens=1,2,3,4,5" %%a in ('netstat -ano ^| findstr :%FRONTEND_PORT%') do (
    set FRONTEND_FOUND=1
    echo   Protocol: %%a
    echo   Local Address: %%b
    echo   Foreign Address: %%c
    echo   State: %%d
    echo   PID: %%e
    
    REM Get process name for PID
    for /f "tokens=1,2" %%i in ('tasklist /FI "PID eq %%e" 2^>nul ^| findstr %%e') do (
        echo   Process: %%i
    )
    echo   ---
)
if !FRONTEND_FOUND! == 0 (
    echo   %GREEN%Port %FRONTEND_PORT% is available%RESET%
)

echo.
echo ===============================================
echo %CYAN%Node.js Processes:%RESET%
echo.

set NODE_FOUND=0
for /f "tokens=1,2" %%a in ('tasklist ^| findstr "node.exe"') do (
    set NODE_FOUND=1
    echo   Process: %%a (PID: %%b)
)
if !NODE_FOUND! == 0 (
    echo   No Node.js processes found
)

echo.
echo ===============================================
echo.

pause