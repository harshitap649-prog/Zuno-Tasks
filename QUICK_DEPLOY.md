# ⚡ Quick Deploy Guide

## One-Command Deployment

### Windows (PowerShell):
```powershell
.\build-and-deploy.ps1
```

### Windows (Command Prompt):
```cmd
build-and-deploy.bat
```

### All Platforms (NPM):
```bash
# Build only
npm run build

# Deploy to Vercel
npm run deploy:vercel

# Deploy to Firebase
npm run deploy:firebase

# Deploy to both platforms
npm run deploy:all
```

## What Happens:

1. ✅ Installs all dependencies
2. ✅ Builds your React app (creates `dist/` folder)
3. ✅ Deploys to your chosen platform
4. ✅ Website goes live automatically!

## Requirements:

- **For Vercel**: Need to be logged in (`vercel login`)
- **For Firebase**: Need to be logged in (`firebase login`)

## Automatic Deployment:

If you push to GitHub, the website will deploy automatically via GitHub Actions! 🚀

Just push to `main` branch:
```bash
git add .
git commit -m "Update website"
git push origin main
```

Done! Website deploys automatically! ✨

