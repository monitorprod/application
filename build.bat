REM build frontend
set application=%cd%
cd %application%/server
set backend=%cd%
cd %backend%/public
for /F "delims=" %%i in ('dir /b') do (rmdir "%%i" /s/q || del "%%i" /s/q)
cd %backend%/../client
set frontend=%cd%
call yarn build

REM copy frontend/build to backend/public
xcopy/e/y/c %frontend%\build\* "%backend%\public\"
