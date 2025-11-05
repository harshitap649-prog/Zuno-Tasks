# Deploy to Vercel - Step by Step Guide

## Option 1: Deploy via Vercel CLI (Recommended)

### Step 1: Install Vercel CLI (if not already installed)
```bash
npm install -g vercel
```

### Step 2: Login to Vercel
```bash
vercel login
```

### Step 3: Deploy Your Project
```bash
vercel
```

Follow the prompts:
- Set up and deploy? **Yes**
- Which scope? (Select your account)
- Link to existing project? **No** (for first time)
- Project name? **zuno-tasks** (or your preferred name)
- Directory? **./** (current directory)
- Override settings? **No**

### Step 4: Deploy to Production
```bash
vercel --prod
```

## Option 2: Deploy via Vercel Website (Easier)

### Step 1: Push to GitHub
1. Commit your changes:
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

### Step 2: Connect to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign up/Login with GitHub
3. Click **"Add New Project"**
4. Import your GitHub repository
5. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `./`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

### Step 3: Environment Variables (if needed)
If you have any `VITE_` environment variables, add them in:
- Vercel Dashboard → Your Project → Settings → Environment Variables

### Step 4: Deploy
Click **"Deploy"** - Vercel will automatically deploy!

## Your Site Configuration
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Framework:** Vite
- **Node Version:** 18.x or higher

## After Deployment
1. Your site will be live at: `https://your-project-name.vercel.app`
2. You can add a custom domain in Vercel Dashboard
3. Every push to `main` branch will auto-deploy

## Troubleshooting
- If build fails, check Vercel logs
- Make sure all dependencies are in `package.json`
- Environment variables should start with `VITE_` for Vite projects

