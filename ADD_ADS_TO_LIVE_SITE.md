# 🚀 How to Add Ads to Your Live Website

## ⚠️ Why Ads Don't Show on Live Site

The `.env` file **only works locally** (localhost). For your **live website**, you need to add environment variables in your hosting platform settings.

---

## 🎯 Quick Solution

### If You're Using **Vercel**:

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Login to your account

2. **Select Your Project**
   - Click on your "zuno-tasks" project

3. **Go to Settings**
   - Click **"Settings"** tab (top menu)
   - Click **"Environment Variables"** (left sidebar)

4. **Add All 4 Environment Variables**

   Click **"Add New"** and add each one:

   **Variable 1: Banner Ad**
   - Name: `VITE_ADSTERRA_BANNER_CODE`
   - Value: `<script type="text/javascript">atOptions = { 'key' : '47002b3582acb1f86801d633f2b31e17', 'format' : 'iframe', 'height' : 90, 'width' : 728, 'params' : {} };</script><script type="text/javascript" src="//www.highperformanceformat.com/47002b3582acb1f86801d633f2b31e17/invoke.js"></script>`
   - Environment: **Production** (check this)
   - Click **"Save"**

   **Variable 2: Social Bar**
   - Name: `VITE_ADSTERRA_REWARDED_CODE`
   - Value: `<script type='text/javascript' src='//pl27958285.effectivegatecpm.com/03/c1/e0/03c1e0f2847dcfbd229ef07cc38dd62f.js'></script>`
   - Environment: **Production**
   - Click **"Save"**

   **Variable 3: Sidebar Ad**
   - Name: `VITE_ADSTERRA_SIDEBAR_CODE`
   - Value: `<script async="async" data-cfasync="false" src="//pl27958291.effectivegatecpm.com/6f7d05b8d003aaf5a1da74606db8dcbd/invoke.js"></script><div id="container-6f7d05b8d003aaf5a1da74606db8dcbd"></div>`
   - Environment: **Production**
   - Click **"Save"**

   **Variable 4: Inline Ad**
   - Name: `VITE_ADSTERRA_INLINE_CODE`
   - Value: `<script async="async" data-cfasync="false" src="//pl27958291.effectivegatecpm.com/6f7d05b8d003aaf5a1da74606db8dcbd/invoke.js"></script><div id="container-6f7d05b8d003aaf5a1da74606db8dcbd"></div>`
   - Environment: **Production**
   - Click **"Save"**

5. **Redeploy**
   - Go to **"Deployments"** tab
   - Click **"..."** on latest deployment
   - Click **"Redeploy"**
   - OR: Make a small change in code and push to GitHub (auto-deploys)

---

### If You're Using **Firebase Hosting**:

1. **Install Firebase CLI** (if not installed)
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**
   ```bash
   firebase login
   ```

3. **Set Environment Variables**
   ```bash
   # Set each variable one by one
   firebase functions:config:set adsterra.banner_code="<your banner code>"
   firebase functions:config:set adsterra.rewarded_code="<your social bar code>"
   firebase functions:config:set adsterra.sidebar_code="<your sidebar code>"
   firebase functions:config:set adsterra.inline_code="<your inline code>"
   ```

4. **Or Use .env.production file** (Alternative)
   - Create `.env.production` file in project root
   - Copy content from `.env` file
   - This will be used during build

5. **Build and Deploy**
   ```bash
   npm run build
   firebase deploy --only hosting
   ```

---

## 🔧 Alternative: Add to Build Process

### Method 1: Create `.env.production` File

1. **Copy your `.env` file**
   - In your project root, create `.env.production`
   - Copy all content from `.env` to `.env.production`
   - This file is used during production builds

2. **Redeploy**
   - Push to GitHub (if using Vercel)
   - OR: `npm run build` then deploy manually

### Method 2: Hardcode in Code (NOT RECOMMENDED)

You could hardcode the ads directly in components, but this is **not secure** and makes updates harder.

---

## 📋 Step-by-Step: Vercel (Easiest)

### Step 1: Open Vercel Dashboard
- Go to: https://vercel.com
- Login

### Step 2: Find Your Project
- Click on your project name

### Step 3: Settings → Environment Variables
- Click **"Settings"** (top menu)
- Click **"Environment Variables"** (left sidebar)

### Step 4: Add Variables
Click **"Add New"** 4 times and add:

1. `VITE_ADSTERRA_BANNER_CODE` = `<your banner code>`
2. `VITE_ADSTERRA_REWARDED_CODE` = `<your social bar code>`
3. `VITE_ADSTERRA_SIDEBAR_CODE` = `<your sidebar code>`
4. `VITE_ADSTERRA_INLINE_CODE` = `<your inline code>`

**Important**: 
- ✅ Check **"Production"** environment for each
- ✅ Check **"Preview"** if you want (optional)
- ✅ Check **"Development"** if you want (optional)

### Step 5: Redeploy
- Go to **"Deployments"** tab
- Click **"..."** on latest deployment
- Click **"Redeploy"**
- Wait 2-3 minutes

### Step 6: Test
- Visit your live website URL
- Login
- Check ads are showing

---

## 🔍 Quick Check: Which Platform?

**To check which platform you're using:**

1. **Check your website URL:**
   - `*.vercel.app` → Vercel
   - `*.web.app` or `*.firebaseapp.com` → Firebase Hosting
   - Custom domain → Check hosting provider

2. **Check your project:**
   - Do you have `vercel.json`? → Vercel
   - Do you have `firebase.json`? → Firebase

---

## ✅ After Adding Variables

1. **Wait for redeploy** (2-3 minutes)
2. **Clear browser cache** (Ctrl+Shift+R)
3. **Check your live site**
4. **Test all ad locations**:
   - Bottom banner
   - Watch Ad button
   - Sidebar (desktop)
   - Inline ads

---

## 🆘 Still Not Working?

1. **Check variable names** - Must match exactly (case-sensitive)
2. **Check quotes** - Values should be in quotes
3. **Redeploy again** - Sometimes needs multiple deploys
4. **Clear cache** - Hard refresh browser
5. **Check browser console** - F12 → Console tab for errors
6. **Wait 5 minutes** - Sometimes takes time to update

---

## 💡 Pro Tip

**For Vercel:**
- After adding variables, make a small code change (like add a comment)
- Push to GitHub
- This triggers auto-deploy with new variables

**For Firebase:**
- Update `.env.production` file
- `npm run build`
- `firebase deploy --only hosting`

---

## 📝 Summary

**The Problem:**
- `.env` file only works on localhost
- Live site needs environment variables in hosting platform

**The Solution:**
- Add variables in Vercel/Firebase settings
- Redeploy your site
- Ads will work!

---

**Need more help?** Share:
1. Which hosting platform you're using
2. Your live website URL
3. What you see when checking ads

