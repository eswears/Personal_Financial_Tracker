@echo off
setlocal enabledelayedexpansion

echo ===============================================
echo Kill All Node.js Processes
echo ===============================================
echo.

REM Colors for output
set ESC=
set GREEN=[92m
set RED=[91m
set YELLOW=[93m
set CYAN=[96m
set RESET=[0m

echo %YELLOW%WARNING: This will terminate ALL Node.js processes!%RESET%
echo.
choice /C YN /M "Are you sure you want to continue?"
if !errorlevel! neq 1 (
    echo.
    echo Operation cancelled.
    pause
    exit /b 0
)

echo.
echo %CYAN%Finding all Node.js processes...%RESET%
echo.

set COUNT=0
for /f "tokens=1,2" %%a in ('tasklist ^| findstr "node.exe"') do (
    set /a COUNT+=1
    echo Terminating %%a (PID: %%b)...
    taskkill /F /PID %%b >nul 2>&1
    if !errorlevel! == 0 (
        echo   %GREEN%Successfully terminated PID %%b%RESET%
    ) else (
        echo   %RED%Failed to terminate PID %%b%RESET%
    )
)

echo.
if !COUNT! GTR 0 (
    echo %GREEN%Terminated !COUNT! Node.js process(es)%RESET%
) else (
    echo No Node.js processes found
)

echo.
echo ===============================================
echo.

pause