@echo off
title ExamMatrix Backend Server
color 0A
cls
echo ======================================================================
echo             ExamMatrix Examination Conducting System
echo ======================================================================
echo.
echo Detecting your current Local Wi-Fi IPv4 Address...
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4 Address" ^| findstr /v "192.168"') do (
    set "IP=%%a"
)
set "IP=%IP: =%"
if "%IP%"=="" (
    set "IP=172.16.46.191"
)

echo.
echo [SERVER READY]
echo   Backend Port : 5050
echo   Local Access : http://localhost:5050
echo   Android Phone: http://%IP%:5050
echo.
echo Keep this window OPEN while conducting exams or testing the Android App.
echo ======================================================================
echo.

cd /d "%~dp0backend"
node server.js
pause
