$envPath = Join-Path $PSScriptRoot 'backend\.env'
if (-not (Test-Path $envPath)) {
  Write-Error "Env file not found: $envPath"; exit 1
}
$content = Get-Content -Path $envPath -Raw
if ($content -match "(?m)^EMAIL_TRANSPORT=") {
  $content = [regex]::Replace($content, "(?m)^EMAIL_TRANSPORT=.*", "EMAIL_TRANSPORT=gmail_api")
} else {
  if ($content.Length -gt 0 -and -not $content.EndsWith("`r`n")) {
    $content += "`r`n"
  }
  $content += "EMAIL_TRANSPORT=gmail_api`r`n"
}
Set-Content -Path $envPath -Value $content -Encoding UTF8
Write-Host "✓ EMAIL_TRANSPORT set to gmail_api" -ForegroundColor Green
