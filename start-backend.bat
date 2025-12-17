@echo off
echo Starting CRM Lead Form Backend...
echo.

cd backend

if not exist "venv\" (
    echo Creating virtual environment...
    python -m venv venv
    echo.
)

echo Activating virtual environment...
call venv\Scripts\activate

if not exist "venv\Lib\site-packages\fastapi\" (
    echo Installing dependencies...
    pip install -r requirements.txt
    echo.
)

echo Checking for required files...
if not exist "CRM_Lead_Template (1).xlsm" (
    echo WARNING: Excel file not found!
    echo Please place "CRM_Lead_Template (1).xlsm" in the backend folder.
    echo.
)

if not exist "google_credentials.json" (
    echo WARNING: Google credentials not found!
    echo Please place "google_credentials.json" in the backend folder.
    echo.
)

echo Starting FastAPI server...
echo Backend will be available at: http://localhost:8000
echo.
uvicorn main:app --reload --host 0.0.0.0 --port 8000

pause
