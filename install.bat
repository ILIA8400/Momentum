@echo off
title Momentum - Setup
cd /d "%~dp0"
echo.
echo  Momentum setup
echo  ------------------------------
where node >nul 2>nul
if errorlevel 1 (
  echo  Node.js is not installed. Opening the download page...
  echo  Install the LTS version, then run install.bat again.
  start "" https://nodejs.org/
  pause
  exit /b 1
)
for /f "delims=" %%v in ('node -v') do echo  Found Node.js %%v
echo.
echo  Installing dependencies...
npm install 2>&1 | findstr /v /r "^$" | findstr /v "npm notice" | findstr /v "added" | findstr /v "audited" | findstr /v "vulnerabilities" | findstr /v "run.*npm fund"
echo.
echo  Creating desktop shortcut...
powershell -NoProfile -ExecutionPolicy Bypass -Command "$w=New-Object -ComObject WScript.Shell; $d=[Environment]::GetFolderPath('Desktop'); $s=$w.CreateShortcut(\"$d\Momentum.lnk\"); $s.TargetPath='%~dp0start-hidden.vbs'; $s.WorkingDirectory='%~dp0'; $s.IconLocation='%~dp0momentum.ico,0'; $s.Description='Momentum'; $s.Save()"
echo  OK: "Momentum" shortcut is on your desktop (runs in background, no black window).
echo.
set /p AUTO=  Start automatically when Windows starts? (y/n):
if /i "%AUTO%"=="y" (
  powershell -NoProfile -ExecutionPolicy Bypass -Command "$w=New-Object -ComObject WScript.Shell; $st=[Environment]::GetFolderPath('Startup'); $s=$w.CreateShortcut(\"$st\Momentum.lnk\"); $s.TargetPath='%~dp0start-hidden.vbs'; $s.WorkingDirectory='%~dp0'; $s.Save()"
  echo  OK: added to Startup. To remove: Win+R, shell:startup, delete Momentum.lnk
)
echo.
echo  Done! Run from the desktop shortcut or start.bat. To stop: stop.bat
echo.
:: Unblock downloaded files (Mark of the Web)
powershell -NoProfile -Command "Get-ChildItem -Path '%~dp0' -Recurse | Unblock-File" 2>nul
set /p RUN=  Run it now? (y/n):
if /i "%RUN%"=="y" start "" "%~dp0start.bat"
pause
