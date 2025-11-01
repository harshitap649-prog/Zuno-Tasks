# 🚀 Deploy to Netlify - Step by Step

## Method 1: Drag & Drop (FASTEST - 2 minutes) ⭐

### Step 1: Build Your Project
1. Open terminal/command prompt
2. Run this command:
   ```bash
   npm run build
   ```
3. Wait for "Build completed" message

### Step 2: Go to Netlify
1. Open browser
2. Go to: **https://app.netlify.com**
3. **Sign up** (if new) or **Login** (if existing)
   - Use GitHub account - easiest way
   - Or use email

### Step 3: Deploy by Drag & Drop
1. After login, you'll see Netlify dashboard
2. Look for area that says **"Want to deploy a new site without connecting to Git?"**
3. **Drag your `dist` folder** from your project folder
   - Location: `C:\Users\Keshav\Desktop\Zuno Tasks\dist`
   - Just drag the entire `dist` folder onto Netlify
4. **Wait 30-60 seconds**
5. ✅ **DONE!** Your site is live!

### Step 4: Get Your URL
- Netlify will show: `https://random-name-123.netlify.app`
- **Copy this URL** - This is your live website! 🎉

---

## Method 2: GitHub Integration (Auto-Deploy)

### Step 1: Push to GitHub

**Option A: Using VS Code (Easiest)**
1. Open VS Code
2. Open your project folder
3. Click **Source Control** icon (left sidebar) - looks like a branch
4. Click **"Publish to GitHub"**
5. Create repository name: `zuno-tasks`
6. Choose **Public** or **Private**
7. Click **"Publish"**

**Option B: Using Git Commands**
```bash
git init
git add .
git commit -m "Ready to deploy"
git branch -M main
# Then create repo on github.com and push
```

### Step 2: Connect to Netlify
1. Go to: **https://app.netlify.com**
2. Click **"Add new site"** → **"Import an existing project"**
3. Click **"GitHub"**
4. Authorize Netlify (if first time)
5. **Select your repository**: `zuno-tasks`
6. Build settings (should auto-detect):
   - Build command: `npm run build`
   - Publish directory: `dist`
7. Click **"Deploy site"**

### Step 3: Wait for Deployment
- Takes 2-3 minutes
- Watch the deployment logs
- When you see ✅ "Site is live" - Done!

---

## ⚠️ IMPORTANT: Add Domain to Firebase

**Without this, login won't work!**

1. Go to: **https://console.firebase.google.com**
2. Select your Firebase project
3. Go to: **Authentication** → **Settings**
4. Scroll to **"Authorized domains"**
5. Click **"Add domain"**
6. Paste your Netlify URL: `https://your-site-name.netlify.app`
7. Click **"Add"**
8. ✅ Done!

---

## ✅ Test Your Live Site

1. Open your Netlify URL
2. Try to **Sign Up**
3. Try to **Login**
4. Check if **Dashboard** loads
5. Check if **banner ads** show at bottom

If everything works - **Your site is live!** 🎉

---

## 🆘 Troubleshooting

### "Build failed" on Netlify
- Make sure you ran `npm run build` successfully first
- Check Netlify build logs for errors

### "Site not showing"
- Wait 1-2 minutes after deployment
- Clear browser cache (Ctrl+F5)
- Check Netlify dashboard for deployment status

### "Login doesn't work"
- **MOST COMMON FIX:** Add your Netlify URL to Firebase Authorized domains (see above)
- Check Firebase console for errors

---

## 📝 Quick Checklist

- [ ] Ran `npm run build`
- [ ] Went to app.netlify.com
- [ ] Logged in
- [ ] Dragged `dist` folder OR connected GitHub
- [ ] Got live URL
- [ ] Added URL to Firebase Authorized domains
- [ ] Tested login/signup
- [ ] Site is working!

---

**Your site will be live at:** `https://your-site-name.netlify.app` 🚀

