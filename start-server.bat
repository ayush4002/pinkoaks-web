@echo off
rem Serves this folder at http://localhost:8000 and opens it in your browser.
rem Double-click this file, then leave this window open while you work.
rem Close the window (or press Ctrl+C) to stop the server.

cd /d "%~dp0"

echo.
echo   Pink Oaks - local preview
echo   http://localhost:8000
echo.
echo   Leave this window open. Close it to stop the server.
echo.

rem Open the browser a couple of seconds from now, once the server is listening.
start "" /b cmd /c "timeout /t 2 /nobreak >nul & start "" http://localhost:8000/"

py -3 server.py 8081
if not errorlevel 1 goto :eof

python server.py 8081
if not errorlevel 1 goto :eof

python3 server.py 8081
if not errorlevel 1 goto :eof

npx --yes serve -l 8000 .
if not errorlevel 1 goto :eof

echo.
echo   Could not start a server.
echo   Install Python from https://www.python.org/downloads/ and run this again.
echo   (Tick "Add python.exe to PATH" during the install.)
echo.
pause
