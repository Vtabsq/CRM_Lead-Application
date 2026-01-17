# Migration Script - Convert Dropdown Format from Row-based to Column-based
# This script will delete the old "Dropdown Options" sheet and let the system create a new one

Write-Host "=== Dropdown Format Migration ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Delete cache file
Write-Host "Step 1: Deleting cache file..." -ForegroundColor Yellow
$cacheFile = "c:\Users\ragul\OneDrive\Dokumen\CRM_Lead-Application\backend\dropdown_cache.json"
if (Test-Path $cacheFile) {
    Remove-Item $cacheFile -Force
    Write-Host "✓ Cache file deleted" -ForegroundColor Green
}
else {
    Write-Host "✓ No cache file found (OK)" -ForegroundColor Green
}
Write-Host ""

# Step 2: Instructions for Google Sheets
Write-Host "Step 2: Delete the 'Dropdown Options' sheet in Google Sheets" -ForegroundColor Yellow
Write-Host "  1. Open your Google Sheet: CRM_Admission" -ForegroundColor White
Write-Host "  2. Right-click on the 'Dropdown Options' tab at the bottom" -ForegroundColor White
Write-Host "  3. Select 'Delete'" -ForegroundColor White
Write-Host "  4. Confirm the deletion" -ForegroundColor White
Write-Host ""
Write-Host "Press Enter when you've deleted the sheet..." -ForegroundColor Cyan
Read-Host

# Step 3: Restart backend
Write-Host "Step 3: Restarting backend server..." -ForegroundColor Yellow
Write-Host "  Please manually restart the backend server:" -ForegroundColor White
Write-Host "  1. Press Ctrl+C in the backend terminal" -ForegroundColor White
Write-Host "  2. Run: python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000" -ForegroundColor White
Write-Host ""

Write-Host "=== Migration Complete ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Wait 1 minute for Google Sheets quota to reset" -ForegroundColor White
Write-Host "2. Open the Select Service modal in your app" -ForegroundColor White
Write-Host "3. The new column-based sheet will be created automatically" -ForegroundColor White
Write-Host ""
Write-Host "New format will look like:" -ForegroundColor Green
Write-Host "Visit ID | Care Center | Provider | Sold By | External Provider | Discount | Status" -ForegroundColor White
Write-Host "---------|-------------|----------|---------|-------------------|----------|--------" -ForegroundColor White
Write-Host "6276666  | HC CBE      | Provider1| Company | External Prov 1   | 500      | Invoiced" -ForegroundColor White
