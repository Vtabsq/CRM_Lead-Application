# PowerShell script to create a clean .env file
$envContent = @"
# Google Sheets configuration
GOOGLE_SHEET_NAME=CRM Leads
GOOGLE_SHEET_ID=your_google_sheet_id_here
CREDENTIALS_FILE=google_credentials.json

PATIENT_ADMISSION_SHEET_ID=13NOTcuCrFDrTVbow0GsWobcX84oGmAkjepOLCDRZKzw

# Home Care Configuration
HOMECARE_SHEET_ID=13NOTcuCrFDrTVbow0GsWobcX84oGmAkjepOLCDRZKzw
HOMECARE_BILLING_TIME=09:00

# API configuration
API_HOST=0.0.0.0
API_PORT=8000
"@

Set-Content -Path ".env" -Value $envContent
Write-Host "✅ Created clean .env file" -ForegroundColor Green
