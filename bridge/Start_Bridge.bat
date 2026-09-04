@echo off
setlocal
cd /d "%~dp0"
title Meme Trader Scanner to Paper Engine Bridge
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
if not defined SCANNER_URL set "SCANNER_URL=http://localhost:8787"
if not defined ENGINE_URL set "ENGINE_URL=http://localhost:8790"
if not defined ENGINE_TOKEN set "ENGINE_TOKEN=meme-trader-local-2026"
if not defined BRIDGE_PORT set "BRIDGE_PORT=8791"
if not defined MIN_SCORE set "MIN_SCORE=70"
if not defined POSITION_USD set "POSITION_USD=10"
if not defined STOP_LOSS_PCT set "STOP_LOSS_PCT=12"
if not defined TAKE_PROFIT_PCT set "TAKE_PROFIT_PCT=25"
echo ==============================================
echo   MEME TRADER LOCAL PAPER BRIDGE
echo ==============================================
echo Scanner: %SCANNER_URL%
echo Engine:  %ENGINE_URL%
echo Bridge:  http://localhost:%BRIDGE_PORT%
echo Min score: %MIN_SCORE%
echo Position:  $%POSITION_USD%
echo SL / TP:   %STOP_LOSS_PCT%%% / %TAKE_PROFIT_PCT%%%
echo.
echo Paper-mode guard enabled. No wallet transactions.
echo.
node index.js
pause
