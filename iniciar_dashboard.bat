@echo off
setlocal EnableExtensions EnableDelayedExpansion
cd /d "%~dp0"
title Universidad Analytics - Local

echo.
echo ==============================================
echo      UNIVERSIDAD ANALYTICS 3.2 - LOCAL
echo ==============================================
echo.

where python >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Python no esta instalado o no esta en PATH.
  pause
  exit /b 1
)

echo [1/4] Python:
python --version

echo.
echo [2/4] Cerrando servidores anteriores en el puerto 8000...
for /f "tokens=5" %%P in ('netstat -ano ^| findstr ":8000" ^| findstr "LISTENING"') do (
    echo Cerrando proceso %%P...
    taskkill /PID %%P /F >nul 2>nul
)

timeout /t 1 /nobreak >nul

echo.
echo [3/4] Iniciando servidor...
start "Universidad Analytics - Servidor" cmd /k "cd /d ""%~dp0"" && python run.py"

echo Esperando al servidor...
timeout /t 2 /nobreak >nul

echo.
echo [4/4] Abriendo dashboard...
start "" "http://localhost:8000"

echo.
echo ==============================================
echo Dashboard: http://localhost:8000
echo ==============================================
echo.
echo IMPORTANTE:
echo - Mantenga abierta la ventana negra del servidor.
echo - No abra index.html directamente.
echo.
pause
