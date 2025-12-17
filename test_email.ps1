$body = @{ to = "harishkadhi18022001@gmail.com" } | ConvertTo-Json
Write-Host "Sending test email to harishkadhi18022001@gmail.com..."
Invoke-RestMethod -Method Post -Uri http://localhost:8000/test_email -ContentType "application/json" -Body $body
