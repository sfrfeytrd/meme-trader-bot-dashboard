@echo off
setlocal
cd /d "%~dp0"
title Meme Trader Scanner -> Paper Engine Bridge
where node >nul 2>&1
if errorlevel 1 (
  echo Node.js was not found. Install Node.js 20+ and try again.
  pause
  exit /b 1
)
if not exist .env if exist .env.example copy .env.example .env >nul
if exist .env (
  for /f "usebackq tokens=1,* delims==" %%A in (".env") do set "%%A=%%B"
)
echo ==============================================
echo   MEME TRADER LOCAL PAPER BRIDGE
 echo ==============================================
echo Scanner: %SCANNER_URL%
echo Engine:  %ENGINE_URL%
echo Bridge:  http://localhost:%BRIDGE_PORT%
echo.
echo This bridge is paper-mode only and will refuse
 echo to forward signals unless the engine reports mode=paper.
echo.
node index.js
pause
