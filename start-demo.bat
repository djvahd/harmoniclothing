@echo off
setlocal EnableExtensions
title Harmoni Clothing - Demo Launcher
set "ROOT=%~dp0"
if "%ROOT:~-1%"=="\" set "ROOT=%ROOT:~0,-1%"
set "BACKEND=%ROOT%\backend"
set "LARAGON=C:\laragon"

echo ============================================================
echo   HARMONI CLOTHING - MENYALAKAN LINGKUNGAN DEMO
echo ============================================================
echo.

rem --- 1. Cari PHP, MySQL (Laragon) dan cloudflared
set "PHP_DIR="
for /d %%D in ("%LARAGON%\bin\php\php-*") do set "PHP_DIR=%%~fD"
set "MYSQL_DIR="
for /d %%D in ("%LARAGON%\bin\mysql\mysql-*") do set "MYSQL_DIR=%%~fD"
if not defined PHP_DIR goto :nophp
if not defined MYSQL_DIR goto :nomysql
set "PHP=%PHP_DIR%\php.exe"
set "CF=cloudflared"
where cloudflared >nul 2>&1
if errorlevel 1 set "CF=C:\Program Files (x86)\cloudflared\cloudflared.exe"
if not exist "%PHP%" goto :nophp
echo [OK] PHP    : %PHP_DIR%
echo [OK] MySQL  : %MYSQL_DIR%
echo.

rem --- 2. MySQL (port 3306)
call :isListening 3306
if not errorlevel 1 goto :mysql_running
echo [..] Menyalakan MySQL Laragon...
start "Harmoni - MySQL" /min "%MYSQL_DIR%\bin\mysqld.exe" --defaults-file="%MYSQL_DIR%\my.ini" --bind-address=127.0.0.1 --console
call :waitPort 3306 45
if errorlevel 1 goto :mysql_fail
echo [OK] MySQL menyala di :3306
goto :mysql_done
:mysql_running
powershell -NoProfile -Command "if ((Get-CimInstance Win32_Process -Filter \"name='mysqld.exe'\").ExecutablePath -match 'xampp') { exit 1 } else { exit 0 }"
if errorlevel 1 goto :xampp_conflict
echo [OK] MySQL sudah berjalan di :3306
:mysql_done

rem --- 3. Backend Laravel (port 8000)
call :isListening 8000
if not errorlevel 1 goto :backend_running
echo [..] Menyalakan backend (php artisan serve :8000)...
start "Harmoni - Backend (8000)" /d "%BACKEND%" cmd /k ""%PHP%" artisan serve --host=127.0.0.1 --port=8000"
goto :backend_done
:backend_running
echo [OK] Backend sudah berjalan di :8000
:backend_done

rem --- 4. Scheduler (batal otomatis 24 jam, selesai otomatis, payout komisi)
powershell -NoProfile -Command "if (Get-CimInstance Win32_Process -Filter \"name='php.exe'\" | Where-Object { $_.CommandLine -match 'schedule:work' }) { exit 0 } else { exit 1 }"
if not errorlevel 1 goto :sched_running
echo [..] Menyalakan scheduler (schedule:work)...
start "Harmoni - Scheduler" /d "%BACKEND%" cmd /k ""%PHP%" artisan schedule:work"
goto :sched_done
:sched_running
echo [OK] Scheduler sudah berjalan
:sched_done

rem --- 5. Reverb (hanya jika BROADCAST_CONNECTION=reverb di backend\.env)
findstr /B /I /C:"BROADCAST_CONNECTION=reverb" "%BACKEND%\.env" >nul 2>&1
if errorlevel 1 goto :reverb_skip
call :isListening 8080
if not errorlevel 1 goto :reverb_running
echo [..] Menyalakan Reverb (:8080)...
start "Harmoni - Reverb (8080)" /d "%BACKEND%" cmd /k ""%PHP%" artisan reverb:start"
goto :reverb_done
:reverb_running
echo [OK] Reverb sudah berjalan di :8080
goto :reverb_done
:reverb_skip
echo [--] Reverb dilewati (realtime memakai Pusher; BROADCAST_CONNECTION bukan reverb)
:reverb_done

rem --- 6. Cloudflare Tunnel
powershell -NoProfile -Command "if (Get-CimInstance Win32_Process -Filter \"name='cloudflared.exe'\" | Where-Object { $_.CommandLine -match 'harmoni-api' }) { exit 0 } else { exit 1 }"
if not errorlevel 1 goto :tunnel_running
echo [..] Menyalakan Cloudflare Tunnel (harmoni-api)...
start "Harmoni - Tunnel" cmd /k ""%CF%" tunnel run harmoni-api"
goto :tunnel_done
:tunnel_running
echo [OK] Tunnel sudah berjalan
:tunnel_done

rem --- 7. Cek kesehatan
echo.
echo [..] Mengecek backend lokal...
call :waitHttp http://127.0.0.1:8000/api/catalog/products 45
if errorlevel 1 goto :health_local_fail
echo [OK] Backend lokal merespons
echo [..] Mengecek lewat internet (https://api.harmoniclothing.com)...
call :waitHttp https://api.harmoniclothing.com/api/catalog/products 60
if errorlevel 1 goto :health_public_fail
echo [OK] Tunnel + backend dapat diakses dari internet
echo.
echo ============================================================
echo   SIAP. Buka https://harmoniclothing.com untuk demo/testing.
echo   Untuk mematikan: jalankan stop-demo.bat
echo ============================================================
if defined HARMONI_NOPAUSE goto :eof
start "" https://harmoniclothing.com
echo.
echo Tekan tombol apa saja untuk menutup jendela ini (server tetap jalan).
pause >nul
goto :eof

:nophp
echo [GAGAL] PHP Laragon tidak ditemukan di %LARAGON%\bin\php
goto :fail
:nomysql
echo [GAGAL] MySQL Laragon tidak ditemukan di %LARAGON%\bin\mysql
goto :fail
:mysql_fail
echo [GAGAL] MySQL tidak menyala dalam 45 detik. Lihat jendela "Harmoni - MySQL".
goto :fail
:xampp_conflict
echo [GAGAL] MySQL XAMPP masih berjalan di port 3306. Data demo sekarang ada di Laragon.
echo         Matikan XAMPP (atau hapus) lalu jalankan skrip ini lagi.
goto :fail
:health_local_fail
echo [GAGAL] Backend lokal tidak merespons di http://127.0.0.1:8000. Lihat jendela "Harmoni - Backend".
goto :fail
:health_public_fail
echo [PERINGATAN] Backend lokal OK tetapi https://api.harmoniclothing.com belum merespons.
echo              Cek jendela "Harmoni - Tunnel" dan koneksi internet.
goto :fail

:fail
echo.
if defined HARMONI_NOPAUSE exit /b 1
echo Tekan tombol apa saja untuk menutup.
pause >nul
exit /b 1

rem ---------------------------------------------------------------
:isListening
netstat -ano | findstr /R /C:":%~1 .*LISTENING" >nul
exit /b %errorlevel%

:waitPort
set /a _n=0
:waitPortLoop
call :isListening %~1
if not errorlevel 1 exit /b 0
set /a _n+=1
if %_n% GEQ %~2 exit /b 1
ping -n 2 127.0.0.1 >nul
goto :waitPortLoop

:waitHttp
set /a _h=0
:waitHttpLoop
set "_code="
for /f %%C in ('curl.exe -s -o NUL -m 6 -w "%%{http_code}" %~1') do set "_code=%%C"
if "%_code%"=="200" exit /b 0
set /a _h+=1
if %_h% GEQ %~2 exit /b 1
ping -n 2 127.0.0.1 >nul
goto :waitHttpLoop