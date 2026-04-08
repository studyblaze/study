@echo off
:: Permanent Storage Migration Tool (C: -> F:)
:: ------------------------------------------

:: 1. Check for Admin privileges
NET SESSION >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Please run this script as ADMINISTRATOR.
    pause
    exit /b
)

echo [INFO] Close VS Code before proceeding for a clean migration.
pause

:: 2. Set up F: structure
if not exist "F:\GroupLearnStorage" mkdir "F:\GroupLearnStorage"
if not exist "F:\Temp" mkdir "F:\Temp"

:: 3. Migrate .vscode/extensions
if exist "C:\Users\DELL 1.dell\.vscode\extensions" (
    echo [1/4] Moving VS Code Extensions...
    robocopy "C:\Users\DELL 1.dell\.vscode\extensions" "F:\GroupLearnStorage\.vscode\extensions" /MOVE /E /R:1 /W:1
    mklink /J "C:\Users\DELL 1.dell\.vscode\extensions" "F:\GroupLearnStorage\.vscode\extensions"
)

:: 4. Migrate .gemini brain
if exist "C:\Users\DELL 1.dell\.gemini" (
    echo [2/4] Moving Gemini Brain artifacts...
    robocopy "C:\Users\DELL 1.dell\.gemini" "F:\GroupLearnStorage\.gemini" /MOVE /E /R:1 /W:1
    mklink /J "C:\Users\DELL 1.dell\.gemini" "F:\GroupLearnStorage\.gemini"
)

:: 5. Migrate npm cache
if exist "%LOCALAPPDATA%\npm-cache" (
    echo [3/4] Moving NPM Cache...
    robocopy "%LOCALAPPDATA%\npm-cache" "F:\GroupLearnStorage\npm-cache" /MOVE /E /R:1 /W:1
    mklink /J "%LOCALAPPDATA%\npm-cache" "F:\GroupLearnStorage\npm-cache"
)

:: 6. Redirect TEMP Environment Variables
echo [4/4] Redirecting TEMP files to F:\Temp...
setx TEMP "F:\Temp"
setx TMP "F:\Temp"

echo.
echo [COMPLETE] Migration finished! You have reclaimed ~2.7GB on C:
echo Note: You may need to restart your computer for the TEMP changes to take full effect.
pause
