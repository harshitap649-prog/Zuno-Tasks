# 🚀 Automatic Build and Deploy Guide

This guide shows you how to automatically build and deploy your website.

## Quick Deploy Options

### Option 1: Use the PowerShell Script (Windows)
```powershell
.\build-and-deploy.ps1
```

### Option 2: Use the Batch Script (Windows)
```cmd
build-and-deploy.bat
```

### Option 3: Use NPM Scripts
```bash
# Deploy to Vercel
npm run deploy:vercel

# Deploy to Firebase
npm run deploy:firebase

# Deploy to both
npm run deploy:all
```

## Automatic Deployment with GitHub Actions

Your project includes a GitHub Actions workflow that automatically builds and deploys when you push to the `main` branch.

### Setup Steps:

1. **Push your code to GitHub:**
   ```bash
   git add .
   git commit -m "Setup automatic deployment"
   git push origin main
   ```

2. **For Vercel Deployment:**
   - Go to https://vercel.com/dashboard
   - Go to Settings → Tokens
   - Create a new token
   - In your GitHub repo: Settings → Secrets and variables → Actions
   - Add these secrets:
     - `VERCEL_TOKEN`: Your Vercel token
     - `VERCEL_ORG_ID`: Your Vercel org ID (from vercel.json or dashboard)
     - `VERCEL_PROJECT_ID`: Your Vercel project ID (from vercel.json or dashboard)

3. **For Firebase Deployment (optional):**
   - Go to Firebase Console → Project Settings → Service Accounts
   - Generate new private key
   - In GitHub Secrets, add:
     - `FIREBASE_SERVICE_ACCOUNT`: Contents of the JSON file
     - `FIREBASE_PROJECT_ID`: Your Firebase project ID
   - Uncomment the Firebase deploy section in `.github/workflows/deploy.yml`

## Manual Deployment

### Deploy to Vercel:
```bash
npm install -g vercel
vercel --prod
```

### Deploy to Firebase:
```bash
npm install -g firebase-tools
firebase login
firebase deploy --only hosting
```

## What Gets Deployed?

- ✅ All your React components
- ✅ Firebase configuration
- ✅ All static assets
- ✅ Service worker (if configured)
- ✅ All offerwall integrations

## Build Output

The build creates a `dist` folder with:
- `index.html` - Main HTML file
- `assets/` - All JS and CSS files
- Other static files

## Troubleshooting

### Build Fails:
1. Make sure all dependencies are installed: `npm install`
2. Check for errors in the console
3. Verify your environment variables are set

### Deployment Fails:
1. **Vercel**: Make sure you're logged in: `vercel login`
2. **Firebase**: Make sure you're logged in: `firebase login`
3. Check that your project is properly configured

### Website Not Loading:
1. Clear browser cache
2. Check the build output in `dist/` folder
3. Verify your hosting provider settings

## Continuous Deployment

Once set up, every push to `main` branch will automatically:
1. ✅ Build your project
2. ✅ Run tests (if configured)
3. ✅ Deploy to production

No manual steps needed! 🎉

