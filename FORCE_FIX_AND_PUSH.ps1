# CRITICAL FIX - Force Push Correct index.html to GitHub

Write-Host "🔧 CRITICAL FIX: Ensuring correct index.html is pushed to GitHub" -ForegroundColor Red
Write-Host ""

# Verify index.html is correct
$indexContent = Get-Content "index.html" -Raw
if ($indexContent -match '/assets/index-.*\.(js|css)') {
    Write-Host "❌ ERROR: index.html still has hardcoded assets!" -ForegroundColor Red
    Write-Host "Fix needed before pushing!"
    exit 1
}

if ($indexContent -match '/src/main\.jsx') {
    Write-Host "✅ index.html is CORRECT (references /src/main.jsx)" -ForegroundColor Green
} else {
    Write-Host "❌ ERROR: index.html doesn't reference /src/main.jsx!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📤 Adding all changes..." -ForegroundColor Cyan
git add -A

Write-Host ""
Write-Host "💾 Committing..." -ForegroundColor Cyan
git commit -m "CRITICAL FIX: Ensure index.html uses source entry, remove all hardcoded assets"

Write-Host ""
Write-Host "🚀 Force pushing to GitHub (main branch)..." -ForegroundColor Yellow
Write-Host "⚠️  This will overwrite any conflicting files on GitHub" -ForegroundColor Yellow
git push origin main --force

Write-Host ""
Write-Host "✅ PUSHED! Netlify will auto-deploy in 30-60 seconds" -ForegroundColor Green
Write-Host "⏱️  Wait 2-3 minutes, then check Netlify dashboard" -ForegroundColor Yellow
Write-Host ""

