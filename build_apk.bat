@echo off
setlocal enabledelayedexpansion

cd /d "%~dp0"

echo [1/3] Building web assets...
call npm run build
if errorlevel 1 goto :error

echo [2/3] Syncing Capacitor Android project...
call npx cap sync android
if errorlevel 1 goto :error

echo [3/3] Building Android APK (debug)...
cd /d "%~dp0android"
call gradlew.bat assembleDebug
if errorlevel 1 goto :error

if not exist "app\outputs\apk" mkdir "app\outputs\apk"
copy /Y "app\build\outputs\apk\debug\app-debug.apk" "app\outputs\apk\app-debug.apk"
if errorlevel 1 goto :error

echo.
echo APK generated successfully.
echo Output path: android\app\outputs\apk\app-debug.apk
exit /b 0

:error
echo.
echo Build failed.
exit /b 1