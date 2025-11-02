@echo off
echo ========================================
echo CRITICAL FIX - Pushing to GitHub
echo ========================================
echo.

echo Checking index.html...
findstr /C:"/src/main.jsx" index.html >nul
if %errorlevel% equ 0 (
    echo [OK] index.html is CORRECT
) else (
    echo [ERROR] index.html is WRONG!
    pause
    exit /b 1
)

findstr /C:"/assets/index-" index.html >nul
if %errorlevel% equ 0 (
    echo [ERROR] index.html has hardcoded assets!
    pause
    exit /b 1
) else (
    echo [OK] No hardcoded assets found
)

echo.
echo Adding all files...
git add -A

echo.
echo Committing...
git commit -m "CRITICAL FIX: Ensure index.html uses /src/main.jsx, remove hardcoded assets"

echo.
echo Pushing to GitHub (main branch)...
git push origin main

echo.
echo ========================================
echo Done! Netlify will auto-deploy now.
echo Wait 2-3 minutes, then check dashboard.
echo ========================================
pause

