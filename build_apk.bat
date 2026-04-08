@echo off
setlocal enabledelayedexpansion

set "ROOT=%~dp0"
set "SOURCE_ICON=%ROOT%ressources\icon.png"
set "PUBLIC_ICON=%ROOT%public\favicon.png"
set "PUBLIC_APP_ICON=%ROOT%public\app-icon.png"

if exist "%SOURCE_ICON%" (
  copy /Y "%SOURCE_ICON%" "%PUBLIC_ICON%" >nul
  copy /Y "%SOURCE_ICON%" "%PUBLIC_APP_ICON%" >nul
) else (
  echo Icon introuvable: %SOURCE_ICON%
  exit /b 1
)

call npm run build
if errorlevel 1 exit /b !errorlevel!

if exist "%ROOT%android" (
  call npx cap sync android
  if errorlevel 1 exit /b !errorlevel!
) else (
  call npx cap add android
  if errorlevel 1 exit /b !errorlevel!
  call npx cap sync android
  if errorlevel 1 exit /b !errorlevel!
)

set "ANDROID_RES=%ROOT%android\app\src\main\res"
powershell -NoProfile -ExecutionPolicy Bypass -File "%ROOT%scripts\generate_android_icons.ps1" -SourceIcon "%SOURCE_ICON%" -AndroidRes "%ANDROID_RES%"
if errorlevel 1 (
  echo Echec generation icones Android.
  exit /b 1
)

pushd "%ROOT%android"
call gradlew.bat assembleDebug
set "APK_EXIT=%errorlevel%"
popd

if not "%APK_EXIT%"=="0" exit /b %APK_EXIT%

set "APK_BUILD_DIR=%ROOT%android\app\build\outputs\apk\debug"
set "APK_OUTPUT_DIR=%ROOT%android\app\outputs\apk"

if exist "%APK_BUILD_DIR%" (
  if not exist "%APK_OUTPUT_DIR%" mkdir "%APK_OUTPUT_DIR%"
  xcopy /E /I /Y "%APK_BUILD_DIR%\*" "%APK_OUTPUT_DIR%\" >nul
  if errorlevel 2 (
    echo Echec copie APK vers %APK_OUTPUT_DIR%.
    exit /b 1
  )
) else (
  echo Dossier APK introuvable: %APK_BUILD_DIR%
  exit /b 1
)

endlocal
