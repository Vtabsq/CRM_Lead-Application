# Create .env file for Invoice Module
# Run this script to create the .env file with correct configuration

$envContent = @"
# Google Sheets configuration
GOOGLE_SHEET_ID=your_crm_lead_sheet_id_here
PATIENT_ADMISSION_SHEET_ID=13NOTcuCrFDrTVbow0GsWobcX84oGmAkjepOLCDRZKzw
CREDENTIALS_FILE=google_credentials.json

# API configuration
API_HOST=0.0.0.0
API_PORT=8000
"@

$envPath = Join-Path $PSScriptRoot ".env"

Write-Host "Creating .env file..." -ForegroundColor Green
$envContent | Out-File -FilePath $envPath -Encoding UTF8 -Force

Write-Host "✅ .env file created at: $envPath" -ForegroundColor Green
Write-Host ""
Write-Host "⚠️  IMPORTANT: You need to update GOOGLE_SHEET_ID" -ForegroundColor Yellow
Write-Host "   Open .env and replace 'your_crm_lead_sheet_id_here' with your actual CRM_Lead Sheet ID" -ForegroundColor Yellow
Write-Host ""
Write-Host "   PATIENT_ADMISSION_SHEET_ID is already set to:" -ForegroundColor Cyan
Write-Host "   13NOTcuCrFDrTVbow0GsWobcX84oGmAkjepOLCDRZKzw" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
