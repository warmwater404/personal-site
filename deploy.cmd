@echo off
rem ===========================================================================
rem  Deploy launcher
rem  Runs deploy.ps1 with -ExecutionPolicy Bypass, so it works no matter how
rem  the system execution policy is configured.
rem
rem  Usage: in a PowerShell window run  .\deploy.cmd
rem         or just double-click this file.
rem
rem  NOTE: keep this file ASCII-only. cmd.exe reads .cmd files using the OEM
rem        code page, so non-ASCII characters here can be mis-parsed.
rem ===========================================================================

chcp 65001 >nul

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0deploy.ps1" %*
set EXITCODE=%ERRORLEVEL%

rem Keep the window open when launched by double-click.
echo %cmdcmdline% | find /i "%~nx0" >nul
if not errorlevel 1 pause

exit /b %EXITCODE%
