@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo 正在启动本地复习工作台...
start "" /b powershell -NoProfile -Command "Start-Sleep -Seconds 2; Start-Process 'http://127.0.0.1:8765'"
where python >nul 2>nul
if %errorlevel%==0 (
    python server.py
) else (
    py -3 server.py
)
echo.
echo 服务已停止。
pause