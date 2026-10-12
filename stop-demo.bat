@echo off
setlocal EnableExtensions
title Harmoni Clothing - Matikan Demo
set "LARAGON=C:\laragon"
echo ============================================================
echo   HARMONI CLOTHING - MEMATIKAN LINGKUNGAN DEMO
echo ============================================================
echo.
taskkill /FI "WINDOWTITLE eq Harmoni - Backend*" /T /F >nul 2>&1 && echo [OK] Backend dimatikan
taskkill /FI "WINDOWTITLE eq Harmoni - Scheduler*" /T /F >nul 2>&1 && echo [OK] Scheduler dimatikan
taskkill /FI "WINDOWTITLE eq Harmoni - Reverb*" /T /F >nul 2>&1 && echo [OK] Reverb dimatikan
taskkill /FI "WINDOWTITLE eq Harmoni - Tunnel*" /T /F >nul 2>&1 && echo [OK] Tunnel dimatikan
echo.
choice /C YN /M "Matikan MySQL juga"
if errorlevel 2 goto :done
set "MYSQL_DIR="
for /d %%D in ("%LARAGON%\bin\mysql\mysql-*") do set "MYSQL_DIR=%%~fD"
"%MYSQL_DIR%\bin\mysqladmin.exe" -u root shutdown && echo [OK] MySQL dimatikan
:done
echo.
echo Selesai.
if not defined HARMONI_NOPAUSE pause >nul