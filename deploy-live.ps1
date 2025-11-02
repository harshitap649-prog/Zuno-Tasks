# Automated Netlify Deployment Script
# This will build and prepare your site for deployment

Write-Host "🚀 Starting Automated Deployment to Netlify..." -ForegroundColor Green
Write-Host ""

# Step 1: Build the project
Write-Host "📦 Step 1: Building your project..." -ForegroundColor Yellow
try {
    npm run build
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Build successful!" -ForegroundColor Green
    } else {
        Write-Host "❌ Build failed!" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Build error: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 2: Check if dist folder exists
if (Test-Path "dist") {
    Write-Host "✅ Build folder (dist) is ready!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 NEXT STEPS TO DEPLOY:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "OPTION 1 - Drag & Drop (FASTEST - 2 minutes):" -ForegroundColor Yellow
    Write-Host "  1. Go to: https://app.netlify.com" -ForegroundColor White
    Write-Host "  2. Sign up/Login (free)" -ForegroundColor White
    Write-Host "  3. Drag the 'dist' folder onto the page" -ForegroundColor White
    Write-Host "  4. Wait 30 seconds - Your site is LIVE! 🎉" -ForegroundColor White
    Write-Host ""
    Write-Host "OPTION 2 - Using Netlify CLI:" -ForegroundColor Yellow
    Write-Host "  Run these commands:" -ForegroundColor White
    Write-Host "    npm install -g netlify-cli" -ForegroundColor Cyan
    Write-Host "    netlify login" -ForegroundColor Cyan
    Write-Host "    netlify deploy --prod --dir=dist" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Your 'dist' folder is ready at:" -ForegroundColor Green
    Write-Host "$(Get-Location)\dist" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host "❌ Build folder not found! Build may have failed." -ForegroundColor Red
    exit 1
}

Write-Host "Press any key to open Netlify in your browser..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Open Netlify in browser
Start-Process "https://app.netlify.com"

Write-Host ""
Write-Host "✅ Browser opened! Follow the drag-and-drop instructions above." -ForegroundColor Green

