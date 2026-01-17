# PowerShell script to add HOMECARE_SHEET_ID to .env file
# This script will add or update the HOMECARE_SHEET_ID in your .env file

$envFile = ".env"
$sheetId = "13NOTcuCrFDrTVbow0GsWobcX84oGmAkjepOLCDRZKzw"

# Check if .env file exists
if (-not (Test-Path $envFile)) {
    Write-Host "Creating .env file from .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" $envFile
}

# Read the current .env file
$content = Get-Content $envFile -Raw

# Check if HOMECARE_SHEET_ID already exists
if ($content -match "HOMECARE_SHEET_ID=") {
    Write-Host "Updating existing HOMECARE_SHEET_ID..." -ForegroundColor Yellow
    $content = $content -replace "HOMECARE_SHEET_ID=.*", "HOMECARE_SHEET_ID=$sheetId"
} else {
    Write-Host "Adding HOMECARE_SHEET_ID to .env file..." -ForegroundColor Yellow
    # Add it after PATIENT_ADMISSION_SHEET_ID or at the end
    if ($content -match "PATIENT_ADMISSION_SHEET_ID") {
        $content = $content -replace "(PATIENT_ADMISSION_SHEET_ID=.*)", "`$1`r`n`r`n# Home Care Configuration`r`nHOMECARE_SHEET_ID=$sheetId`r`nHOMECARE_BILLING_TIME=09:00"
    } else {
        $content += "`r`n`r`n# Home Care Configuration`r`nHOMECARE_SHEET_ID=$sheetId`r`nHOMECARE_BILLING_TIME=09:00`r`n"
    }
}

# Write back to .env file
Set-Content -Path $envFile -Value $content -NoNewline

Write-Host "`n✅ Successfully updated .env file!" -ForegroundColor Green
Write-Host "HOMECARE_SHEET_ID=$sheetId" -ForegroundColor Cyan
Write-Host "`nPlease restart your backend server for changes to take effect:" -ForegroundColor Yellow
Write-Host "  1. Stop the current backend (Ctrl+C)" -ForegroundColor White
Write-Host "  2. Run: python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000" -ForegroundColor White
