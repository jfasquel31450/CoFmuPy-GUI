@echo off
setlocal EnableDelayedExpansion

REM ensure we are in the correct working directory, allows one-click launch
cd /D "%~dp0"

REM set /P BackendPort=What is Backend API port (default port is 5000) ?
set /P WebAppPort=What is your preferred web app port (default port is 4400) ?

if '!BackendPort!'=='' set BackendPort=5000

if '!WebAppPort!'=='' set WebAppPort=4400

:start
set choice=
echo.
echo ============================================ General commands
echo -: stop all
echo ^^!: quit
echo /: clean screen
echo i: install cofmupy library
echo s: start application

echo.
set /P choice=What do you want to do : 
echo.
echo.

REM Ignore empty choices
if '!choice!'=='' goto start

REM take only the first characters of choice
set choice=!choice:~0,1!


REM match choice to an action
if '!choice!'=='/' goto CleanScreen
if '!choice!'=='-' call :KillNodeApps
if '!choice!'=='^^!' goto :eof
if '!choice!'=='s' goto StartWebApp
if '!choice!'=='i' goto InstallCoFmuPy

REM --------------- Hereafter all command action -------------------------

REM FIRST OF ALL so that an unknown command will is trapped
:CleanScreen
cls
goto start

REM Kill the running App
:KillNodeApps
echo i will stop all node programs runned by you
taskkill /F /IM "node.exe"
goto start

:InstallCoFmuPy
echo Installing virtual python environment ...
python -m venv venv
echo Activating virtual environment ...
call ./venv/Scripts/activate
echo Installing CoFmuPy ...
python -m pip install cofmupy
echo Installation Done !

goto start

:StartWebApp

start /B node ./app.js %WebAppPort% %BackendPort%
echo Running Front End Application, available on http://localhost:%WebAppPort%
timeout 4 > NUL
start http://localhost:%WebAppPort%
	
goto start


