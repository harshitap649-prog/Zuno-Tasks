# 🚀 Deploy to Render - Complete Guide

## ✅ What I Fixed

1. **Added `serve` package** - For serving static files
2. **Added `start` script** - `npm run start` now serves the built files
3. **Created `render.yaml`** - Render configuration file

---

## 📋 Step-by-Step: Deploy to Render

### Step 1: Install Dependencies Locally (Optional but Recommended)

First, install the new `serve` package:

```bash
npm install
```

This will add the `serve` package to your `node_modules` and update `package-lock.json`.

### Step 2: Commit and Push Changes

```bash
git add .
git commit -m "Add Render deployment configuration"
git push origin main
```

### Step 3: Configure Render Dashboard

#### Option A: Using render.yaml (Automatic Configuration)

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Render will automatically detect `render.yaml` and configure:
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm run start`
   - **Environment:** Node

#### Option B: Manual Configuration

If you prefer to configure manually:

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Name:** `zuno-tasks` (or your preferred name)
   - **Environment:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm run start`
   - **Root Directory:** `./` (leave as default)
5. Click **"Create Web Service"**

### Step 4: Environment Variables (If Needed)

If your app uses environment variables (like Firebase config):

1. In Render Dashboard → Your Service → **"Environment"**
2. Add any required variables:
   - `VITE_*` variables for Vite
   - `NODE_ENV=production`

### Step 5: Deploy

Render will automatically:
1. Install dependencies
2. Build your project (`npm run build`)
3. Start the server (`npm run start`)
4. Your site will be live!

---

## 🔧 Render Configuration Details

### Build Process:
- **Build Command:** `npm install && npm run build`
- **Output:** Files are built to `dist/` folder

### Start Process:
- **Start Command:** `npm run start`
- **Server:** Uses `serve` package to serve static files
- **Port:** Listens on port 10000 (Render auto-assigns port)

### Auto-Deploy:
- Every push to `main` branch = automatic deployment
- Render watches your GitHub repo for changes

---

## 🌐 After Deployment

1. **Get Your URL:**
   - Render will provide a URL like: `https://zuno-tasks.onrender.com`
   - Free tier URLs: `*.onrender.com`

2. **Custom Domain (Optional):**
   - Go to Settings → Custom Domains
   - Add your domain

3. **Monitor Deployments:**
   - Check the "Events" tab for deployment logs
   - View logs in real-time

---

## ⚠️ Important Notes

### Free Tier Limitations:
- **Spins down after 15 minutes of inactivity**
- First request after spin-down takes ~50 seconds
- Consider upgrading for always-on service

### Troubleshooting:

**Build fails?**
- Check Render logs in the dashboard
- Ensure all dependencies are in `package.json`
- Verify `render.yaml` syntax is correct

**Site shows 404?**
- The `serve -s` flag handles SPA routing
- All routes redirect to `index.html`

**Port issues?**
- Render automatically assigns `PORT` environment variable
- The `serve` command uses port 10000, but Render will override if needed

---

## 🔄 Switching from Vercel to Render

Your app is currently on Vercel. To fully switch:

1. **Deploy to Render** (follow steps above)
2. **Test Render deployment** thoroughly
3. **Update DNS/Custom Domain** (if using custom domain)
4. **Optional:** Remove Vercel deployment after confirming Render works

---

## ✅ Success Checklist

- [ ] `package.json` has `serve` package
- [ ] `package.json` has `start` script
- [ ] `render.yaml` exists in project root
- [ ] Changes committed and pushed to GitHub
- [ ] Render service created and configured
- [ ] Build succeeds on Render
- [ ] Site is accessible on Render URL

---

## 🎉 You're All Set!

Your app should now deploy successfully on Render! The deployment will take 2-5 minutes on first deploy.

