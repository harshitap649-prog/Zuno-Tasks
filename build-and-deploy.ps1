# Build and Deploy Script for Zuno Tasks
# This script builds your website and deploys it automatically

Write-Host "🚀 Starting Build and Deploy Process..." -ForegroundColor Cyan

# Step 1: Install dependencies
Write-Host "`n📦 Installing dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies!" -ForegroundColor Red
    exit 1
}

# Step 2: Build the project
Write-Host "`n🔨 Building project..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build completed successfully!" -ForegroundColor Green

# Step 3: Check deployment options
Write-Host "`n📋 Deployment Options:" -ForegroundColor Cyan
Write-Host "1. Deploy to Vercel (Recommended - Fast & Easy)"
Write-Host "2. Deploy to Firebase Hosting"
Write-Host "3. Deploy to both Vercel and Firebase"
Write-Host "4. Just build (no deployment)"

$choice = Read-Host "`nSelect option (1-4)"

switch ($choice) {
    "1" {
        Write-Host "`n🚀 Deploying to Vercel..." -ForegroundColor Yellow
        if (Get-Command vercel -ErrorAction SilentlyContinue) {
            vercel --prod
        } else {
            Write-Host "⚠️  Vercel CLI not found. Installing..." -ForegroundColor Yellow
            npm install -g vercel
            vercel --prod
        }
    }
    "2" {
        Write-Host "`n🚀 Deploying to Firebase..." -ForegroundColor Yellow
        if (Get-Command firebase -ErrorAction SilentlyContinue) {
            firebase deploy --only hosting
        } else {
            Write-Host "⚠️  Firebase CLI not found. Installing..." -ForegroundColor Yellow
            npm install -g firebase-tools
            firebase login
            firebase deploy --only hosting
        }
    }
    "3" {
        Write-Host "`n🚀 Deploying to Vercel..." -ForegroundColor Yellow
        if (Get-Command vercel -ErrorAction SilentlyContinue) {
            vercel --prod
        } else {
            npm install -g vercel
            vercel --prod
        }
        
        Write-Host "`n🚀 Deploying to Firebase..." -ForegroundColor Yellow
        if (Get-Command firebase -ErrorAction SilentlyContinue) {
            firebase deploy --only hosting
        } else {
            npm install -g firebase-tools
            firebase login
            firebase deploy --only hosting
        }
    }
    "4" {
        Write-Host "`n✅ Build complete. Files are in the 'dist' folder." -ForegroundColor Green
        Write-Host "📁 You can manually upload the 'dist' folder to your hosting provider." -ForegroundColor Cyan
    }
    default {
        Write-Host "❌ Invalid option selected!" -ForegroundColor Red
        exit 1
    }
}

Write-Host "`n✅ Process completed!" -ForegroundColor Green
Write-Host "🌐 Your website should be live now!" -ForegroundColor Cyan

