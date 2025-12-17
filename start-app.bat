@echo off
echo ========================================
echo   CRM Lead Form Application Launcher
echo ========================================
echo.
echo This will start both backend and frontend servers.
echo.
echo Press any key to continue...
pause > nul

start "CRM Backend" cmd /k "cd /d %~dp0 && start-backend.bat"
timeout /t 3 /nobreak > nul
start "CRM Frontend" cmd /k "cd /d %~dp0 && start-frontend.bat"

echo.
echo ========================================
echo Both servers are starting...
echo.
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo.
echo Check the opened terminal windows for status.
echo ========================================
echo.
pause
