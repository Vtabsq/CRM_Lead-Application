@echo off
echo ========================================
echo Starting WhatsApp Service (Flask)
echo ========================================
echo.
echo Service will run on http://localhost:5000
echo Press Ctrl+C to stop the service
echo.

cd /d "%~dp0"
python whatsapp_service.py

pause
