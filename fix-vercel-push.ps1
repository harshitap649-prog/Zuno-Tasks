# Fix Vercel Deployment - Pull and Push Safely
Write-Host "🔧 Fixing Vercel deployment..." -ForegroundColor Cyan

# First, pull remote changes
Write-Host "`n📥 Pulling latest changes from GitHub..." -ForegroundColor Yellow
git pull origin main --no-rebase

# Check for conflicts
if ($LASTEXITCODE -ne 0) {
    Write-Host "`n⚠️  Pull failed or had conflicts. Checking status..." -ForegroundColor Yellow
    git status
    Write-Host "`n🔧 Attempting to resolve..." -ForegroundColor Yellow
    exit 1
}

# Stage the correct files
Write-Host "`n📦 Staging index.html and vercel.json..." -ForegroundColor Yellow
git add index.html vercel.json

# Check status
Write-Host "`n📋 Git Status:" -ForegroundColor Yellow
git status --short

# Commit if there are changes
$status = git status --porcelain
if ($status) {
    Write-Host "`n💾 Committing changes..." -ForegroundColor Yellow
    git commit -m "Fix: Remove hardcoded asset references from index.html for Vercel build"
} else {
    Write-Host "`n✅ No changes to commit (already up to date)" -ForegroundColor Green
}

# Push to trigger Vercel auto-deploy
Write-Host "`n🚀 Pushing to GitHub (Vercel will auto-deploy)..." -ForegroundColor Yellow
git push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Successfully pushed! Vercel will detect the push and start a new deployment in 30-60 seconds." -ForegroundColor Green
    Write-Host "📊 Check your Vercel dashboard: https://vercel.com/dashboard" -ForegroundColor Cyan
} else {
    Write-Host "`n❌ Push failed. Check the error above." -ForegroundColor Red
}

