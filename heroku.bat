REM build frontend
set application=%cd%
cd %application%/server
set backend=%cd%
cd %backend%/public
for /F "delims=" %%i in ('dir /b') do (rmdir "%%i" /s/q || del "%%i" /s/q)
cd %backend%/../client
set frontend=%cd%
call yarn build

REM merge master to heroku
REM cd %backend%
REM git checkout master
REM git pull origin master
REM git checkout heroku
REM git merge master

REM copy frontend/build to backend/public
xcopy/e/y/c %frontend%\build\* "%backend%\public\"

REM publish to heroku
REM cd %application%
REM git add server/public/
REM git commit -m "heroku commit"
REM git push heroku heroku:master