# 🚀 Quick Deploy to Vercel

## Easiest Method: Via Vercel Website (Recommended)

### Step 1: Push to GitHub
```bash
git push origin main
```

### Step 2: Deploy on Vercel
1. Go to **https://vercel.com**
2. Click **"Sign Up"** or **"Login"**
3. Choose **"Continue with GitHub"**
4. Click **"Add New Project"**
5. Select your **Zuno Tasks** repository
6. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `./` (leave as is)
   - **Build Command:** `npm run build` (auto-detected)
   - **Output Directory:** `dist` (auto-detected)
7. Click **"Deploy"**

### Step 3: Wait for Deployment
- Vercel will automatically:
  - Install dependencies
  - Build your project
  - Deploy to production
- Takes about 2-3 minutes

### Step 4: Your Site is Live! 🎉
- You'll get a URL like: `https://zuno-tasks.vercel.app`
- You can add a custom domain later

## Method 2: Via Command Line

### Quick Deploy Script
Run this PowerShell script:
```powershell
.\deploy-vercel.ps1
```

### Manual CLI Deployment
```bash
# Install Vercel CLI (if not installed)
npm install -g vercel

# Login to Vercel
vercel login

# Deploy (first time)
vercel

# Deploy to production
vercel --prod
```

## Important Notes

### ✅ Your Project is Ready!
- ✅ `vercel.json` is configured
- ✅ Build command is set
- ✅ Output directory is set
- ✅ All changes are committed

### 🔧 Environment Variables (if needed)
If you use any `VITE_` environment variables:
1. Go to Vercel Dashboard → Your Project
2. Settings → Environment Variables
3. Add variables (e.g., `VITE_OFFERTORO_API_KEY`)

### 🔄 Auto-Deploy
- Every push to `main` branch = automatic deployment
- No need to redeploy manually!

### 📱 Your Site Features
- ✅ Real-time updates (no redeploy needed for tasks/offers)
- ✅ Admin panel for managing tasks
- ✅ User authentication
- ✅ All features working live

## Troubleshooting

**Build fails?**
- Check Vercel logs in dashboard
- Make sure all dependencies are in `package.json`

**Site not loading?**
- Check build logs
- Verify Firebase config is correct
- Check browser console for errors

**Need help?**
- Vercel has excellent documentation
- Check your Vercel dashboard logs

---

## 🎉 You're All Set!

Your site will be live in minutes. Share the URL with your users!

