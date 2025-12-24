# PowerShell Script to Copy Invoice Module Files
# Run this script to copy all invoice files to your running backend

$source = "c:\Users\ragul\OneDrive\Dokumen\CRM_Lead-Application\backend"
$dest = "c:\Users\ragul\Downloads\CRM final pdf gen and analysis(invoice)\CRM-Projects final AICRM\CRM-Projects\backend"

Write-Host "Copying Invoice Module Files..." -ForegroundColor Green
Write-Host "From: $source" -ForegroundColor Yellow
Write-Host "To: $dest" -ForegroundColor Yellow
Write-Host ""

# Copy invoice module files
$files = @(
    "invoice_service.py",
    "pdf_generator.py",
    "invoice_routes.py",
    "setup_accounts_receivable_sheet.py",
    "test_sheets_connection.py",
    "ADD_TO_ENV.txt"
)

foreach ($file in $files) {
    $sourcePath = Join-Path $source $file
    $destPath = Join-Path $dest $file
    
    if (Test-Path $sourcePath) {
        Copy-Item $sourcePath -Destination $destPath -Force
        Write-Host "[OK] Copied: $file" -ForegroundColor Green
    } else {
        Write-Host "[SKIP] Not found: $file" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Files copied successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Update main.py in the running backend directory" -ForegroundColor White
Write-Host "2. Add the invoice router code (see instructions below)" -ForegroundColor White
Write-Host "3. Restart the backend server" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
