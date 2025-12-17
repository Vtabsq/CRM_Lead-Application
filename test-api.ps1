# CRM Lead Form API Test Script
# This script tests the backend API endpoints

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CRM Lead Form API Test Suite" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:8000"
$allTestsPassed = $true

# Function to test endpoint
function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Url,
        [string]$Method = "GET",
        [object]$Body = $null
    )
    
    Write-Host "Testing: $Name" -ForegroundColor Yellow
    Write-Host "URL: $Url" -ForegroundColor Gray
    
    try {
        if ($Method -eq "GET") {
            $response = Invoke-RestMethod -Uri $Url -Method Get -ErrorAction Stop
        } else {
            $jsonBody = $Body | ConvertTo-Json -Depth 10
            $response = Invoke-RestMethod -Uri $Url -Method Post -Body $jsonBody -ContentType "application/json" -ErrorAction Stop
        }
        
        Write-Host "✓ PASSED" -ForegroundColor Green
        return $response
    }
    catch {
        Write-Host "✗ FAILED" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        $script:allTestsPassed = $false
        return $null
    }
    finally {
        Write-Host ""
    }
}

# Test 1: Root Endpoint
Write-Host "Test 1: Root Endpoint" -ForegroundColor Cyan
Write-Host "-------------------" -ForegroundColor Cyan
$rootResponse = Test-Endpoint -Name "GET /" -Url "$baseUrl/"
if ($rootResponse) {
    Write-Host "Message: $($rootResponse.message)" -ForegroundColor Gray
    Write-Host "Status: $($rootResponse.status)" -ForegroundColor Gray
    Write-Host ""
}

# Test 2: Health Check
Write-Host "Test 2: Health Check" -ForegroundColor Cyan
Write-Host "-------------------" -ForegroundColor Cyan
$healthResponse = Test-Endpoint -Name "GET /health" -Url "$baseUrl/health"
if ($healthResponse) {
    Write-Host "Status: $($healthResponse.status)" -ForegroundColor Gray
    Write-Host "Excel File: $($healthResponse.excel_file)" -ForegroundColor $(if ($healthResponse.excel_file) { "Green" } else { "Red" })
    Write-Host "Google Credentials: $($healthResponse.google_credentials)" -ForegroundColor $(if ($healthResponse.google_credentials) { "Green" } else { "Red" })
    Write-Host "Fields Loaded: $($healthResponse.fields_loaded)" -ForegroundColor Gray
    Write-Host ""
    
    if (-not $healthResponse.excel_file) {
        Write-Host "⚠ WARNING: Excel file not found!" -ForegroundColor Yellow
        Write-Host "Please place 'CRM_Lead_Template (1).xlsm' in the backend folder." -ForegroundColor Yellow
        Write-Host ""
    }
    
    if (-not $healthResponse.google_credentials) {
        Write-Host "⚠ WARNING: Google credentials not found!" -ForegroundColor Yellow
        Write-Host "Please place 'google_credentials.json' in the backend folder." -ForegroundColor Yellow
        Write-Host ""
    }
}

# Test 3: Get Fields
Write-Host "Test 3: Get Fields" -ForegroundColor Cyan
Write-Host "-------------------" -ForegroundColor Cyan
$fieldsResponse = Test-Endpoint -Name "GET /get_fields" -Url "$baseUrl/get_fields"
if ($fieldsResponse) {
    Write-Host "Fields Count: $($fieldsResponse.fields.Count)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Field List:" -ForegroundColor Gray
    foreach ($field in $fieldsResponse.fields) {
        Write-Host "  - $($field.name) ($($field.type))" -ForegroundColor Gray
    }
    Write-Host ""
}

# Test 4: Submit Test Data
if ($fieldsResponse -and $fieldsResponse.fields.Count -gt 0) {
    Write-Host "Test 4: Submit Data" -ForegroundColor Cyan
    Write-Host "-------------------" -ForegroundColor Cyan
    
    # Create test data
    $testData = @{
        data = @{}
    }
    
    foreach ($field in $fieldsResponse.fields) {
        $fieldName = $field.name
        $fieldType = $field.type
        
        # Generate appropriate test data based on type
        switch ($fieldType) {
            "email" { $testData.data[$fieldName] = "test@example.com" }
            "tel" { $testData.data[$fieldName] = "555-0123" }
            "number" { $testData.data[$fieldName] = "42" }
            "date" { $testData.data[$fieldName] = "2024-01-15" }
            default { $testData.data[$fieldName] = "Test Value" }
        }
    }
    
    Write-Host "Submitting test data..." -ForegroundColor Gray
    $submitResponse = Test-Endpoint -Name "POST /submit" -Url "$baseUrl/submit" -Method "POST" -Body $testData
    
    if ($submitResponse) {
        Write-Host "Status: $($submitResponse.status)" -ForegroundColor Gray
        Write-Host "Message: $($submitResponse.message)" -ForegroundColor Gray
        Write-Host ""
        Write-Host "✓ Check your Google Sheet for the new row!" -ForegroundColor Green
        Write-Host ""
    }
} else {
    Write-Host "Test 4: Submit Data" -ForegroundColor Cyan
    Write-Host "-------------------" -ForegroundColor Cyan
    Write-Host "⊘ SKIPPED - No fields available" -ForegroundColor Yellow
    Write-Host ""
}

# Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Test Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

if ($allTestsPassed) {
    Write-Host "✓ All tests passed!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Your CRM Lead Form backend is working correctly!" -ForegroundColor Green
} else {
    Write-Host "✗ Some tests failed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please check the errors above and ensure:" -ForegroundColor Yellow
    Write-Host "1. Backend server is running (uvicorn main:app --reload)" -ForegroundColor Yellow
    Write-Host "2. Excel file is in the backend folder" -ForegroundColor Yellow
    Write-Host "3. Google credentials are configured" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
