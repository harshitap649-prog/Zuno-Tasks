@echo off
echo ========================================
echo   DEPLOY TO NETLIFY - QUICK DEPLOY
echo ========================================
echo.

echo Step 1: Building project...
call npm run build
if errorlevel 1 (
    echo.
    echo ERROR: Build failed!
    echo Please fix errors and try again.
    pause
    exit /b 1
)

echo.
echo Step 2: Checking Netlify CLI...
where netlify >nul 2>&1
if errorlevel 1 (
    echo Netlify CLI not found. Installing...
    call npm install -g netlify-cli
    if errorlevel 1 (
        echo ERROR: Failed to install Netlify CLI
        echo Please run manually: npm install -g netlify-cli
        pause
        exit /b 1
    )
)

echo.
echo Step 3: Deploying to Netlify...
echo.
echo NOTE: If first time, you may need to login:
echo   Run: netlify login
echo   Then run this script again
echo.
echo Deploying now...
call netlify deploy --prod --dir=dist

echo.
echo ========================================
echo   DEPLOYMENT COMPLETE!
echo ========================================
echo.
echo Your site is now live on Netlify!
echo Copy the URL shown above and:
echo   1. Add it to Firebase Authorized domains
echo   2. Share it with your users!
echo.
pause

