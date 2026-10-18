@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js 20 or newer is required. Install from https://nodejs.org/
  pause
  exit /b 1
)
echo.
echo Starting isolated HaloSpark M01 Blue Ocean Research Demo...
echo The demo does not call EverBee or OpenAI.
echo Open in your browser: http://127.0.0.1:4177
start "" "http://127.0.0.1:4177"
node server.mjs
pause
