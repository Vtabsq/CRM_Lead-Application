# Test all dashboard API endpoints
$baseUrl = "http://localhost:8000/api/dashboard"
$endpoints = @(
    "previous-day-enquiries",
    "converted-leads-yesterday",
    "admitted-patients-yesterday",
    "complaints-received-yesterday",
    "complaints-resolved-yesterday",
    "follow-ups-due-today",
    "admissions-by-center?care_center=RS%20Puram&date_filter=today",
    "admissions-by-center?care_center=ram%20nagar&date_filter=today",
    "admissions-by-center?care_center=chennai&date_filter=today",
    "discharges-by-center?care_center=RS%20Puram&date_filter=today",
    "discharges-by-center?care_center=ram%20nagar&date_filter=today",
    "discharges-by-center?care_center=chennai&date_filter=today"
)

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Dashboard API Endpoint Test Results" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$results = @()
$passCount = 0
$failCount = 0

foreach ($endpoint in $endpoints) {
    $url = "$baseUrl/$endpoint"
    Write-Host "Testing: $endpoint" -ForegroundColor Yellow
    
    try {
        $response = Invoke-WebRequest -Uri $url -UseBasicParsing -ErrorAction Stop
        $json = $response.Content | ConvertFrom-Json
        
        if ($response.StatusCode -eq 200) {
            $count = $json.count
            $dataLength = if ($json.data) { $json.data.Count } else { 0 }
            
            Write-Host "  Status: 200 OK" -ForegroundColor Green
            Write-Host "  Count: $count | Data Records: $dataLength" -ForegroundColor Green
            
            $results += [PSCustomObject]@{
                Endpoint    = $endpoint
                Status      = "PASS"
                StatusCode  = 200
                Count       = $count
                DataRecords = $dataLength
            }
            $passCount++
        }
    }
    catch {
        $statusCode = if ($_.Exception.Response) { $_.Exception.Response.StatusCode.value__ } else { "Error" }
        Write-Host "  Status: FAILED ($statusCode)" -ForegroundColor Red
        
        $results += [PSCustomObject]@{
            Endpoint    = $endpoint
            Status      = "FAIL"
            StatusCode  = $statusCode
            Count       = "N/A"
            DataRecords = "N/A"
        }
        $failCount++
    }
    
    Write-Host ""
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Total Endpoints: $($endpoints.Count)" -ForegroundColor White
Write-Host "Passed: $passCount" -ForegroundColor Green
Write-Host "Failed: $failCount" -ForegroundColor Red
Write-Host ""

# Display results table
$results | Format-Table -AutoSize

if ($failCount -eq 0) {
    Write-Host "All endpoints are working correctly!" -ForegroundColor Green
}
else {
    Write-Host "Some endpoints failed. Please check the errors above." -ForegroundColor Yellow
}
