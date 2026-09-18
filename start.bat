@echo off
title Momentum
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo  Node.js is not installed. Opening the download page...
  echo  Install the LTS version, then run start.bat again.
  echo.
  start "" https://nodejs.org/
  pause
  exit /b 1
)
for /f "tokens=1 delims=v." %%a in ('node -v') do set NODEMAJOR=%%a
if %NODEMAJOR% LSS 22 (
  echo.
  echo  Node.js is too old ^(v%NODEMAJOR%^). Version 22 or newer is required.
  echo.
  start "" https://nodejs.org/
  pause
  exit /b 1
)
node server.js --open
if errorlevel 1 pause
