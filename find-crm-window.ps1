Get-Process | Where-Object {$_.ProcessName -like "*CRM*" -or $_.ProcessName -like "*electron*"} | Select-Object Id, ProcessName, MainWindowTitle | Format-Table -AutoSize
