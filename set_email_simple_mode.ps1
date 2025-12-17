$envPath = Join-Path $PSScriptRoot 'backend\.env'
if (-not (Test-Path $envPath)) { Write-Error "Env file not found: $envPath"; exit 1 }
$content = Get-Content -Path $envPath -Raw
if ($content -match "(?m)^EMAIL_SIMPLE_MODE=") {
  $content = [regex]::Replace($content, "(?m)^EMAIL_SIMPLE_MODE=.*", "EMAIL_SIMPLE_MODE=0")
} else {
  if ($content.Length -gt 0 -and -not $content.EndsWith("`r`n")) { $content += "`r`n" }
  $content += "EMAIL_SIMPLE_MODE=0`r`n"
}
Set-Content -Path $envPath -Value $content -Encoding UTF8
Write-Host "EMAIL_SIMPLE_MODE=0 set (CCs enabled)"
