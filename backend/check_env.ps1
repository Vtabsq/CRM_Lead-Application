# PowerShell script to update .env with correct Google Sheet ID
# We need the user to provide the CRM Leads Google Sheet ID

Write-Host "⚠️ GOOGLE_SHEET_ID is missing!" -ForegroundColor Yellow
Write-Host ""
Write-Host "The .env file needs the Google Sheet ID for CRM Leads (for login authentication)" -ForegroundColor Cyan
Write-Host ""
Write-Host "Please provide the Google Sheet ID for your CRM Leads sheet" -ForegroundColor White
Write-Host "You can find it in the URL: https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit" -ForegroundColor Gray
Write-Host ""
Write-Host "Current .env configuration:" -ForegroundColor Yellow
Get-Content .env
