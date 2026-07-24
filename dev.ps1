$root = $PSScriptRoot

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\backend'; php artisan serve --port=8000"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\frontend'; pnpm dev"

Write-Host "Backend (localhost:8000) dan frontend (localhost:3000) dibuka di jendela baru."
