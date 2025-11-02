# Fix Vercel Deployment - Push Correct Files
Write-Host "🔧 Fixing Vercel deployment..." -ForegroundColor Cyan

# Stage the correct files
Write-Host "📦 Staging index.html and vercel.json..." -ForegroundColor Yellow
git add index.html vercel.json

# Check status
Write-Host "`n📋 Git Status:" -ForegroundColor Yellow
git status --short

# Commit
Write-Host "`n💾 Committing changes..." -ForegroundColor Yellow
git commit -m "Fix: Remove hardcoded asset references from index.html for Vercel build"

# Push to trigger Vercel auto-deploy
Write-Host "`n🚀 Pushing to GitHub (Vercel will auto-deploy)..." -ForegroundColor Yellow
git push origin main

Write-Host "`n✅ Done! Vercel will detect the push and start a new deployment in 30-60 seconds." -ForegroundColor Green
Write-Host "📊 Check your Vercel dashboard: https://vercel.com/dashboard" -ForegroundColor Cyan

