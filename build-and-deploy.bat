@echo off
echo 🚀 Starting Build and Deploy Process...

REM Step 1: Install dependencies
echo.
echo 📦 Installing dependencies...
call npm install
if errorlevel 1 (
    echo ❌ Failed to install dependencies!
    exit /b 1
)

REM Step 2: Build the project
echo.
echo 🔨 Building project...
call npm run build
if errorlevel 1 (
    echo ❌ Build failed!
    exit /b 1
)

echo ✅ Build completed successfully!

REM Step 3: Deployment
echo.
echo 📋 Deployment Options:
echo 1. Deploy to Vercel (Recommended)
echo 2. Deploy to Firebase Hosting
echo 3. Deploy to both
echo 4. Just build (no deployment)
echo.
set /p choice="Select option (1-4): "

if "%choice%"=="1" (
    echo.
    echo 🚀 Deploying to Vercel...
    where vercel >nul 2>&1
    if errorlevel 1 (
        echo ⚠️  Installing Vercel CLI...
        call npm install -g vercel
    )
    call vercel --prod
) else if "%choice%"=="2" (
    echo.
    echo 🚀 Deploying to Firebase...
    where firebase >nul 2>&1
    if errorlevel 1 (
        echo ⚠️  Installing Firebase CLI...
        call npm install -g firebase-tools
        call firebase login
    )
    call firebase deploy --only hosting
) else if "%choice%"=="3" (
    echo.
    echo 🚀 Deploying to Vercel...
    where vercel >nul 2>&1
    if errorlevel 1 (
        call npm install -g vercel
    )
    call vercel --prod
    
    echo.
    echo 🚀 Deploying to Firebase...
    where firebase >nul 2>&1
    if errorlevel 1 (
        call npm install -g firebase-tools
        call firebase login
    )
    call firebase deploy --only hosting
) else if "%choice%"=="4" (
    echo.
    echo ✅ Build complete. Files are in the 'dist' folder.
    echo 📁 You can manually upload the 'dist' folder to your hosting provider.
) else (
    echo ❌ Invalid option selected!
    exit /b 1
)

echo.
echo ✅ Process completed!
echo 🌐 Your website should be live now!
pause

