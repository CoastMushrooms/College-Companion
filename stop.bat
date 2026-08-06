@echo off
echo Stopping servers...
taskkill /F /FI "WINDOWTITLE eq Backend*" >nul 2>&1
taskkill /F /FI "WINDOWTITLE eq Frontend*" >nul 2>&1
taskkill /F /IM node.exe >nul 2>&1
echo Done.