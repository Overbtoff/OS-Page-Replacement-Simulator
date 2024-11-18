@echo off
set /p env_name="Enter the Conda environment with django: "
call conda activate %env_name%

echo Starting NodeJS server...
start /b cmd /c "node ./os_project_page_replacement/page-replacement-simulator/server.js > nul 2>&1"

echo Starting Django server...
start /b cmd /c "python ./os_project_page_replacement/page_replacement/manage.py runserver"

pause
