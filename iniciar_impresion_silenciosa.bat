@echo off
TASKKILL /F /IM chrome.exe /T > nul 2>&1
start chrome.exe --kiosk-printing "http://localhost:3000"
exit
