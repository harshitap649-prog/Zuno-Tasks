# Redeploy Website to Vercel - Make it Live
Write-Host "🚀 Redeploying website to Vercel..." -ForegroundColor Cyan

# Navigate to project directory
Set-Location "C:\Users\Keshav\Desktop\Zuno Tasks"

# Stage all changes
Write-Host "`n📦 Staging changes..." -ForegroundColor Yellow
git add package.json vercel.json index.html

# Commit
Write-Host "`n💾 Committing changes..." -ForegroundColor Yellow
git commit -m "Trigger fresh deployment - v1.0.1"

# Push to GitHub (triggers Vercel auto-deploy)
Write-Host "`n🚀 Pushing to GitHub (Vercel will auto-deploy)..." -ForegroundColor Yellow
git push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Successfully pushed! Vercel will start deployment in 30-60 seconds." -ForegroundColor Green
    Write-Host "`n📊 Check your Vercel dashboard: https://vercel.com/dashboard" -ForegroundColor Cyan
    Write-Host "`n🌐 Website will be live at: https://zuno-tasks-kg4t.vercel.app" -ForegroundColor Cyan
    Write-Host "`n⏱️  Wait 2-3 minutes for deployment to complete, then check the website!" -ForegroundColor Yellow
} else {
    Write-Host "`n❌ Push failed. Check the error above." -ForegroundColor Red
}

