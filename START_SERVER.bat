@echo off
echo ========================================
echo  Starting Healthcare System
echo ========================================
echo.

REM Add Node.js to PATH for this session
set PATH=C:\Program Files\nodejs;%PATH%

REM Check if Node.js is accessible
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js not found!
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

echo Node.js found!
echo.

REM Navigate to project directory
cd /d "%~dp0"

REM Install dependencies if needed
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
    echo.
)

REM Start ML API server in background
echo Starting ML API Server (Port 5002)...
start "ML API Server" cmd /k "python heart_disease_api.py"
timeout /t 3 >nul

REM Start the frontend development server
echo Starting Frontend Server (Port 5173)...
echo.
echo ========================================
echo  SERVERS RUNNING:
echo  - Frontend: http://localhost:5173
echo  - ML API:   http://localhost:5002
echo  Press Ctrl+C to stop the frontend
echo ========================================
echo.

npm run dev

pause

