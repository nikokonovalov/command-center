@echo off
set DIR=%~dp0
echo Starting Command Center Local Demo...
if not exist "%DIR%bin\command-center-win-x64.exe" (
    echo Error: Could not find bin\command-center-win-x64.exe
    pause
    exit /b 1
)
echo The server is running! Close this window to stop it.
"%DIR%bin\command-center-win-x64.exe"
echo.
echo Server stopped.
pause
