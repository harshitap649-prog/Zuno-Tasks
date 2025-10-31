# 🚀 Step-by-Step: Deploy Your Website Live

## Method 1: Deploy to Vercel (Easiest - 5 minutes)

### Step 1: Push Your Code to GitHub

1. **Create a GitHub account** (if you don't have one): https://github.com/signup

2. **Create a new repository:**
   - Go to https://github.com/new
   - Repository name: `zuno-tasks` (or any name)
   - Choose **Private** or **Public**
   - **DO NOT** check "Add a README file" (you already have one)
   - Click **"Create repository"**

3. **Upload your code to GitHub:**
   
   **Option A: Using GitHub Desktop (Easiest)**
   - Download: https://desktop.github.com/
   - Install and login
   - File → Add Local Repository → Select your `Zuno Tasks` folder
   - Click "Publish repository"
   - Your code will be uploaded!

   **Option B: Using Git Commands (Terminal)**
   ```bash
   # Open terminal in your project folder
   cd "C:\Users\Keshav\Desktop\Zuno Tasks"
   
   # Initialize git (if not already)
   git init
   
   # Add all files
   git add .
   
   # Commit
   git commit -m "Initial commit"
   
   # Add your GitHub repository (replace YOUR_USERNAME and REPO_NAME)
   git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git
   
   # Push to GitHub
   git branch -M main
   git push -u origin main
   ```
   
   **Option C: Using VS Code**
   - Open your project in VS Code
   - Click the Source Control icon (left sidebar)
   - Click "Publish to GitHub"
   - Follow the prompts

### Step 2: Deploy to Vercel

1. **Go to Vercel:**
   - Visit: https://vercel.com
   - Click **"Sign Up"** (use GitHub to login - easiest)

2. **Import Your Project:**
   - After login, click **"Add New..."** → **"Project"**
   - Click **"Import"** next to your GitHub repository (`zuno-tasks`)
   - If you don't see it, click **"Adjust GitHub App Permissions"** and grant access

3. **Configure Project:**
   - Framework Preset: **Vite** (should auto-detect)
   - Root Directory: `./` (leave default)
   - Build Command: `npm run build` (should be auto-filled)
   - Output Directory: `dist` (should be auto-filled)
   - Install Command: `npm install` (should be auto-filled)

4. **Add Environment Variables (Important!):**
   - Scroll down to **"Environment Variables"**
   - Click **"Add"**
   - Name: `VITE_ADSTERRA_CODE`
   - Value: (paste your Adsterra script code here - you can add this later)
   - Click **"Add"**

5. **Deploy:**
   - Click **"Deploy"** button at the bottom
   - Wait 2-3 minutes for deployment

6. **Get Your URL:**
   - After deployment completes, you'll see:
   - ✅ **Your website URL will be shown like:** 
     - `https://zuno-tasks-xxxxx.vercel.app`
   - **Copy this URL** - This is your live website! 🎉

### Step 3: Update Firebase Authorized Domains

1. **Go to Firebase Console:**
   - https://console.firebase.google.com/
   - Select your project

2. **Add Your Domain:**
   - Go to **Authentication** → **Settings** → **Authorized domains**
   - Click **"Add domain"**
   - Paste your Vercel URL: `zuno-tasks-xxxxx.vercel.app`
   - Click **"Add"**

3. **Update Firestore Rules** (if needed):
   - Your existing rules should work, but make sure they allow your new domain

---

## Method 2: Deploy to Firebase Hosting (Alternative)

### Step 1: Install Firebase CLI

```bash
npm install -g firebase-tools
```

### Step 2: Login to Firebase

```bash
firebase login
```
- This will open browser → Login with your Google account → Allow access

### Step 3: Initialize Firebase Hosting

```bash
# Make sure you're in your project folder
cd "C:\Users\Keshav\Desktop\Zuno Tasks"

# Initialize hosting
firebase init hosting
```

**When prompted:**
- Select your Firebase project: `zuno-tasks`
- Public directory: `dist`
- Single-page app: **Yes**
- Overwrite index.html: **No**

### Step 4: Build Your Project

```bash
npm run build
```

### Step 5: Deploy

```bash
firebase deploy --only hosting
```

### Step 6: Get Your URL

After deployment, you'll see:
- ✅ **Your website URL:** `https://zuno-tasks.web.app`
- ✅ **Alternative URL:** `https://zuno-tasks.firebaseapp.com`

**Copy this URL** - This is your live website! 🎉

---

## ✅ After Deployment - What to Do Next

1. **Test Your Website:**
   - Open your URL in browser
   - Try signing up/login
   - Test all features

2. **Add to Adsterra:**
   - Use your live URL when registering with Adsterra
   - Example: `https://zuno-tasks-xxxxx.vercel.app` or `https://zuno-tasks.web.app`

3. **Share Your Website:**
   - Share the URL with users
   - Start promoting!

4. **Optional - Custom Domain:**
   - In Vercel: Settings → Domains → Add your domain
   - In Firebase: Hosting → Add custom domain
   - Update DNS records as instructed

---

## 🆘 Troubleshooting

### Build Fails on Vercel
- Check build logs in Vercel dashboard
- Make sure `package.json` has correct scripts
- Verify all dependencies are listed

### Website Shows Blank Page
- Check browser console (F12) for errors
- Verify Firebase config is correct
- Check Firebase rules allow your domain

### Authentication Not Working
- Make sure you added your domain to Firebase Authorized domains
- Check Firebase Authentication is enabled

---

## 📝 Quick Checklist

- [ ] Code pushed to GitHub
- [ ] Deployed to Vercel (or Firebase)
- [ ] Got live URL
- [ ] Added domain to Firebase Authorized domains
- [ ] Tested website works
- [ ] Ready to add Adsterra URL!

---

**Your website will be live at:** `https://your-url.vercel.app` or `https://your-project.web.app` 🚀

