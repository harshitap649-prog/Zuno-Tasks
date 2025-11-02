@echo off
echo ========================================
echo Pushing final fix to GitHub
echo ========================================
echo.

echo Checking netlify.toml...
findstr /C:"functions = \"functions\"" netlify.toml >nul
if %errorlevel% equ 0 (
    echo [ERROR] netlify.toml still has functions config!
    echo This needs to be commented out!
    pause
    exit /b 1
)

findstr /C:"# functions = \"functions\"" netlify.toml >nul
if %errorlevel% equ 0 (
    echo [OK] netlify.toml is correct (functions config commented out)
) else (
    echo [WARNING] Could not verify netlify.toml fix
)

echo.
echo Adding netlify.toml...
git add netlify.toml

echo.
echo Committing...
git commit -m "Fix: Remove functions config - Firebase Functions not Netlify Functions"

echo.
echo Pushing to GitHub...
git push origin main

echo.
echo ========================================
echo Done! Check Netlify dashboard in 30 seconds.
echo A new deploy should start automatically.
echo ========================================
pause

