# Clean script to add Home Care configuration to .env
$envFile = ".env"
$sheetId = "13NOTcuCrFDrTVbow0GsWobcX84oGmAkjepOLCDRZKzw"

# Read current content
$lines = Get-Content $envFile

# Remove any existing HOMECARE lines
$cleanedLines = $lines | Where-Object { $_ -notmatch "^HOMECARE_" }

# Add new HOMECARE configuration
$cleanedLines += ""
$cleanedLines += "# Home Care Configuration"
$cleanedLines += "HOMECARE_SHEET_ID=$sheetId"
$cleanedLines += "HOMECARE_BILLING_TIME=09:00"

# Write back
$cleanedLines | Set-Content $envFile

Write-Host "✅ Updated .env file successfully!" -ForegroundColor Green
Write-Host "HOMECARE_SHEET_ID=$sheetId" -ForegroundColor Cyan
