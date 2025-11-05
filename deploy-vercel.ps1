# Vercel Deployment Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ZunoTasks - Vercel Deployment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Vercel CLI is installed
Write-Host "Checking Vercel CLI..." -ForegroundColor Yellow
$vercelCheck = Get-Command vercel -ErrorAction SilentlyContinue

if (-not $vercelCheck) {
    Write-Host "Vercel CLI not found. Installing..." -ForegroundColor Yellow
    npm install -g vercel
    Write-Host "Vercel CLI installed!" -ForegroundColor Green
} else {
    Write-Host "Vercel CLI found!" -ForegroundColor Green
}

Write-Host ""
Write-Host "Step 1: Login to Vercel" -ForegroundColor Cyan
Write-Host "You will be prompted to login via browser..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Press any key to continue with login..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Login to Vercel
vercel login

Write-Host ""
Write-Host "Step 2: Deploying to Vercel..." -ForegroundColor Cyan
Write-Host "Follow the prompts:" -ForegroundColor Yellow
Write-Host "  - Set up and deploy? YES" -ForegroundColor White
Write-Host "  - Link to existing project? NO (first time)" -ForegroundColor White
Write-Host "  - Project name: zuno-tasks (or your choice)" -ForegroundColor White
Write-Host "  - Directory: ./ (current directory)" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to start deployment..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Deploy
vercel

Write-Host ""
Write-Host "Step 3: Deploy to Production" -ForegroundColor Cyan
Write-Host "This will make your site live at production URL" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press any key to deploy to production..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Deploy to production
vercel --prod

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Deployment Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Your site is now live!" -ForegroundColor Green
Write-Host "Check your Vercel dashboard for the URL" -ForegroundColor Yellow
Write-Host ""

