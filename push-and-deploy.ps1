# Quick Script to Push Changes and Deploy

Write-Host "🔍 Checking Git status..." -ForegroundColor Cyan
Write-Host ""

# Check if there are uncommitted changes
$status = git status --porcelain

if ($status) {
    Write-Host "⚠️  You have uncommitted changes!" -ForegroundColor Yellow
    Write-Host $status
    Write-Host ""
    Write-Host "📤 Committing and pushing changes..." -ForegroundColor Cyan
    Write-Host ""
    
    git add -A
    git commit -m "Fix Netlify build - remove build artifacts and ensure correct index.html"
    git push origin main
    
    Write-Host ""
    Write-Host "✅ Pushed to GitHub!" -ForegroundColor Green
    Write-Host "⏱️  Netlify will auto-deploy in 30-60 seconds..." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "🎯 Wait 2-3 minutes, then check Netlify dashboard!" -ForegroundColor Cyan
} else {
    Write-Host "✅ No uncommitted changes!" -ForegroundColor Green
    Write-Host ""
    
    # Check if local is ahead of remote
    $ahead = git rev-list --count origin/main..HEAD 2>$null
    if ($ahead -gt 0) {
        Write-Host "⚠️  You have $ahead commit(s) not pushed to GitHub" -ForegroundColor Yellow
        Write-Host "🚀 Pushing now..." -ForegroundColor Cyan
        git push origin main
        Write-Host "✅ Pushed! Netlify will auto-deploy." -ForegroundColor Green
    } else {
        Write-Host "✅ Everything is up to date on GitHub!" -ForegroundColor Green
        Write-Host ""
        Write-Host "🎯 You can now trigger deploy in Netlify dashboard:" -ForegroundColor Yellow
        Write-Host "   1. Go to Netlify dashboard" -ForegroundColor White
        Write-Host "   2. Click 'Trigger deploy'" -ForegroundColor White
        Write-Host "   3. Select 'Clear cache and deploy site'" -ForegroundColor White
        Write-Host "   4. Wait 2-3 minutes" -ForegroundColor White
    }
}

Write-Host ""

