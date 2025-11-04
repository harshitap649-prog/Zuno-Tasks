# API Deployment Guide for Captcha System

## Issue: API Endpoints Not Working

The API endpoints (`/api/submit-captcha` and `/api/get-captcha-result`) are **Vercel serverless functions** that need to be deployed to work.

## Quick Fix: Use Firestore Functions Directly (Recommended)

Since your API endpoints are placeholders, the **easiest solution** is to have clients use your Firestore functions directly or use the Admin Panel test form.

### Option 1: Use Admin Panel (Easiest for Testing)

1. Go to **Admin Panel → Captchas Tab**
2. Click **"Submit Test Captcha"**
3. Enter base64 image or URL
4. Submit - captcha will be stored in Firestore
5. Users can solve it immediately

### Option 2: Use Firestore Functions from Client Code

Clients can call your Firestore functions directly:

```javascript
// Client-side code (requires Firebase client SDK)
import { submitClientCaptcha, getCaptchaResult } from './firebase/firestore';

// Submit captcha
const result = await submitClientCaptcha({
  captchaImage: 'data:image/png;base64,...',
  captchaType: 'image',
  clientId: 'client123'
});

console.log('Captcha ID:', result.captchaId);

// Check result (poll every 5 seconds)
const checkResult = async () => {
  const result = await getCaptchaResult(result.captchaId);
  if (result.status === 'solved') {
    console.log('Solution:', result.solution);
  } else {
    setTimeout(checkResult, 5000); // Poll again
  }
};
```

## Option 3: Deploy API Endpoints with Firebase Admin SDK

To make the API endpoints work, you need to:

### Step 1: Install Firebase Admin SDK

```bash
npm install firebase-admin
```

### Step 2: Create Firebase Service Account

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to **Project Settings → Service Accounts**
4. Click **"Generate New Private Key"**
5. Download the JSON file

### Step 3: Set Up Environment Variables in Vercel

1. Go to your Vercel project settings
2. Go to **Environment Variables**
3. Add:
   - `FIREBASE_ADMIN_SDK` - Paste the entire JSON content from service account file
   - OR use individual variables

### Step 4: Update API Endpoints

I'll update the API files to use Firebase Admin SDK (see updated files).

### Step 5: Deploy to Vercel

```bash
# Push to GitHub (if not already)
git add .
git commit -m "Add captcha API endpoints"
git push

# Vercel will auto-deploy
# Or deploy manually:
vercel --prod
```

## Option 4: Use Firebase Cloud Functions Instead

If Vercel serverless functions are too complex, you can use Firebase Cloud Functions:

1. Move API files to `functions/` folder
2. Convert to Firebase Functions format
3. Deploy: `firebase deploy --only functions`

## Current Status

✅ **Working:**
- Admin Panel test form (stores in Firestore)
- User solving interface
- Firestore functions (can be called from client code)

❌ **Not Working Yet:**
- `/api/submit-captcha` endpoint (needs Admin SDK setup)
- `/api/get-captcha-result` endpoint (needs Admin SDK setup)

## Recommended Approach

**For now, use the Admin Panel test form** to submit captchas. This works immediately without any setup.

For production with external clients, choose:
- **Option 2** if clients can use Firebase SDK
- **Option 3** if you want REST API endpoints (requires Admin SDK setup)

Would you like me to:
1. Set up Firebase Admin SDK integration for the API endpoints?
2. Create Firebase Cloud Functions instead?
3. Or keep using the Admin Panel for now?

