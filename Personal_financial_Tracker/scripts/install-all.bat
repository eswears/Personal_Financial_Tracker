@echo off
setlocal enabledelayedexpansion

echo ===============================================
echo Installing All Dependencies
echo ===============================================
echo.

REM Colors for output
set ESC=
set GREEN=[92m
set RED=[91m
set YELLOW=[93m
set CYAN=[96m
set RESET=[0m

REM Navigate to root directory
cd /d "%~dp0\.."

echo %CYAN%[1/3] Installing root dependencies...%RESET%
call npm install
if !errorlevel! neq 0 (
    echo %RED%Failed to install root dependencies%RESET%
    pause
    exit /b 1
) else (
    echo %GREEN%Root dependencies installed successfully%RESET%
)

echo.
echo %CYAN%[2/3] Installing backend dependencies...%RESET%
cd src\backend
call npm install
if !errorlevel! neq 0 (
    echo %RED%Failed to install backend dependencies%RESET%
    pause
    exit /b 1
) else (
    echo %GREEN%Backend dependencies installed successfully%RESET%
)

echo.
echo %CYAN%[3/3] Installing frontend dependencies...%RESET%
cd ..\frontend
call npm install
if !errorlevel! neq 0 (
    echo %RED%Failed to install frontend dependencies%RESET%
    pause
    exit /b 1
) else (
    echo %GREEN%Frontend dependencies installed successfully%RESET%
)

echo.
echo ===============================================
echo %GREEN%All dependencies installed successfully!%RESET%
echo ===============================================
echo.

pause