$root = $PSScriptRoot

# PHP & MySQL dari Laragon (versi terbaru yang terpasang)
$php   = (Get-ChildItem "C:\laragon\bin\php\php-*\php.exe" | Select-Object -Last 1).FullName
$mysql = (Get-ChildItem "C:\laragon\bin\mysql\mysql-*" -Directory | Select-Object -Last 1).FullName

if (-not (Get-NetTCPConnection -LocalPort 3306 -State Listen -ErrorAction SilentlyContinue)) {
    Start-Process "$mysql\bin\mysqld.exe" -ArgumentList "--defaults-file=`"$mysql\my.ini`"", "--bind-address=127.0.0.1", "--console" -WindowStyle Minimized
    Start-Sleep -Seconds 6
}

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\backend'; & '$php' artisan serve --port=8000"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\frontend'; pnpm dev"

Write-Host "MySQL (Laragon), backend (localhost:8000) dan frontend (localhost:3000) dibuka."
