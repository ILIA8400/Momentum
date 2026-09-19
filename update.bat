@echo off
title Momentum - Update
cd /d "%~dp0"
echo.
echo  Momentum update
echo  ------------------------------
echo  1) Backing up data folder...
if not exist backups mkdir backups
for /f "tokens=1-3 delims=/ " %%a in ("%date%") do set D=%%a-%%b-%%c
for /f "tokens=1-2 delims=:." %%a in ("%time%") do set T=%%a%%b
set T=%T: =0%
if exist data\plan.db (
  copy /y data\plan.db "backups\plan-manual-update-%D%-%T%.db" >nul
  if exist data\plan.db-wal copy /y data\plan.db-wal "backups\plan-manual-update-%D%-%T%.db-wal" >nul
  echo     OK: backups\plan-manual-update-%D%-%T%.db
) else (
  echo     (no database yet)
)
echo.
echo  2) Stopping the running app (if any)...
node server.js --stop >nul 2>nul
echo.
where git >nul 2>nul
if errorlevel 1 goto nogit
if not exist .git goto nogit
echo  3) Pulling latest version from GitHub...
git pull --ff-only
if errorlevel 1 (
  echo.
  echo  git pull failed. Your data is safe. Download the ZIP from
  echo  https://github.com/ILIA8400/Momentum and copy the files over this folder
  echo  (keep the data and backups folders).
  start "" https://github.com/ILIA8400/Momentum
  pause
  exit /b 1
)
goto done
:nogit
echo  3) This folder is not a git checkout (or git is not installed).
echo     Download the latest ZIP and extract it over this folder.
echo     Your data\ and backups\ folders are NOT part of the ZIP, so they stay intact.
start "" https://github.com/ILIA8400/Momentum/archive/refs/heads/main.zip
:done
echo.
echo  4) Done. Starting Momentum...
start "" "%~dp0start-hidden.vbs"
timeout /t 3 >nul
