# Auto-Deploy Fix Script - Prepares project for Vercel deployment

Write-Host "🔧 Preparing project for automatic Vercel deployment..." -ForegroundColor Cyan
Write-Host ""

# Step 1: Verify build works
Write-Host "📦 Testing build..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed! Fix errors first." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build successful!" -ForegroundColor Green
Write-Host ""

# Step 2: Check git status
Write-Host "📋 Checking Git status..." -ForegroundColor Yellow
$status = git status --porcelain

if ($status) {
    Write-Host "📤 Uncommitted changes found. Committing..." -ForegroundColor Yellow
    Write-Host ""
    
    git add -A
    git commit -m "Fix: Prepare for Vercel deployment - add vercel.json and ensure build works"
    
    Write-Host ""
    Write-Host "🚀 Pushing to GitHub..." -ForegroundColor Cyan
    git push origin main
    
    Write-Host ""
    Write-Host "✅ Pushed to GitHub!" -ForegroundColor Green
    Write-Host "⏱️  Vercel will auto-detect and redeploy in 30-60 seconds..." -ForegroundColor Yellow
} else {
    Write-Host "✅ No uncommitted changes" -ForegroundColor Green
    
    # Check if behind
    $ahead = git rev-list --count origin/main..HEAD 2>$null
    if ($ahead -gt 0) {
        Write-Host "📤 You have $ahead commit(s) not pushed. Pushing now..." -ForegroundColor Yellow
        git push origin main
        Write-Host "✅ Pushed! Vercel will auto-deploy." -ForegroundColor Green
    } else {
        Write-Host "✅ Everything is up to date on GitHub!" -ForegroundColor Green
        Write-Host ""
        Write-Host "💡 Go to Vercel dashboard and click 'Redeploy' button" -ForegroundColor Yellow
        Write-Host "   OR trigger a new deployment by making a small change" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  ✅ PROJECT READY FOR DEPLOYMENT!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Yellow
Write-Host "   1. Go to Vercel dashboard" -ForegroundColor White
Write-Host "   2. Check the latest deployment" -ForegroundColor White
Write-Host "   3. If failed, check build logs for errors" -ForegroundColor White
Write-Host "   4. Or click 'Redeploy' to try again" -ForegroundColor White
Write-Host ""

