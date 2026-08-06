@echo off
echo Starting backend...
start "Backend" cmd /k "cd /d "%~dp0backend" && venv\Scripts\activate && uvicorn main:app --reload"

timeout /t 3 /nobreak >nul

echo Starting frontend...
start "Frontend" cmd /k "cd /d "%~dp0frontend_fixed" && npm run dev"

echo Both servers starting. The app will open automatically in your browser shortly.