@echo off
title Momentum - Stop
cd /d "%~dp0"
node server.js --stop
timeout /t 2 >nul
