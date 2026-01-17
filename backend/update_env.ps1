# Update .env file with correct Google Sheet IDs
# Run this script to update the .env file

$envPath = Join-Path $PSScriptRoot ".env"

$envContent = @"
# Google Sheets configuration
GOOGLE_SHEET_ID=1L4jwfA2R_MjT3kSsof93U3V-DKaM4zemGdKeCq2fy9Y
PATIENT_ADMISSION_SHEET_ID=13NOTcuCrFDrTVbow0GsWobcX84oGmAkjepOLCDRZKzw
CREDENTIALS_FILE=google_credentials.json

# API configuration
API_HOST=0.0.0.0
API_PORT=8000
"@

Write-Host "Updating .env file..." -ForegroundColor Green
$envContent | Out-File -FilePath $envPath -Encoding UTF8 -Force

Write-Host "✅ .env file updated successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Configuration:" -ForegroundColor Cyan
Write-Host "  GOOGLE_SHEET_ID (CRM_Lead): 1L4jwfA2R_MjT3kSsof93U3V-DKaM4zemGdKeCq2fy9Y" -ForegroundColor White
Write-Host "  PATIENT_ADMISSION_SHEET_ID: 13NOTcuCrFDrTVbow0GsWobcX84oGmAkjepOLCDRZKzw" -ForegroundColor White
Write-Host ""
Write-Host "Backend will auto-reload. You should now be able to login!" -ForegroundColor Green
