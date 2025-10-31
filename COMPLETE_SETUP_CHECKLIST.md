# 🚀 Complete Setup Checklist for ZunoTasks

Follow these steps in order to get your website fully working.

## ✅ Step 1: Install Node.js and Dependencies

### 1.1 Check Node.js Installation
```bash
node --version  # Should be v18 or higher
npm --version
```

If not installed, download from [nodejs.org](https://nodejs.org/)

### 1.2 Install Project Dependencies
Open terminal in the project folder and run:
```bash
npm install
```

---

## ✅ Step 2: Create Firebase Project

### 2.1 Go to Firebase Console
1. Visit: https://console.firebase.google.com/
2. Click **"Add project"** or **"Create a project"**
3. Enter project name: `zuno-tasks` (or any name)
4. Click **Continue**
5. Disable Google Analytics (optional) → **Continue**
6. Click **Create project**
7. Wait for project creation → Click **Continue**

### 2.2 Enable Authentication

1. In Firebase Console, click **"Authentication"** in left sidebar
2. Click **"Get started"**
3. Go to **"Sign-in method"** tab
4. Enable **"Email/Password"**:
   - Click on "Email/Password"
   - Toggle **Enable**
   - Click **Save**
5. Enable **"Google"**:
   - Click on "Google"
   - Toggle **Enable**
   - Enter project support email
   - Click **Save**

### 2.3 Create Firestore Database

1. Click **"Firestore Database"** in left sidebar
2. Click **"Create database"**
3. Choose **"Start in production mode"** → **Next**
4. Choose database location (e.g., `asia-south1` for India) → **Enable**
5. Wait for database creation

---

## ✅ Step 3: Get Firebase Configuration

1. In Firebase Console, click the **gear icon** ⚙️ (Settings)
2. Click **"Project settings"**
3. Scroll down to **"Your apps"** section
4. Click the **Web icon** `</>`
5. Register app:
   - App nickname: `ZunoTasks Web`
   - Check "Also set up Firebase Hosting" (optional)
   - Click **"Register app"**
6. **Copy the `firebaseConfig` object** (looks like this):

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

### 3.1 Update Firebase Config File

Open `src/firebase/config.js` and replace the placeholder values:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",           // Paste your actual apiKey
  authDomain: "YOUR_AUTH_DOMAIN",        // Paste your authDomain
  projectId: "YOUR_PROJECT_ID",          // Paste your projectId
  storageBucket: "YOUR_STORAGE_BUCKET",  // Paste your storageBucket
  messagingSenderId: "YOUR_SENDER_ID",   // Paste your messagingSenderId
  appId: "YOUR_APP_ID"                   // Paste your appId
};
```

**Save the file after updating!**

---

## ✅ Step 4: Set Up Firestore Security Rules

1. In Firebase Console, go to **Firestore Database**
2. Click **"Rules"** tab
3. Replace all the default rules with this:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // Users - can read/write their own data
    match /users/{userId} {
      allow read, write: if isOwner(userId);
      allow read: if isAuthenticated(); // Allow reading all users (for admin)
    }
    
    // Offers - authenticated users can read active offers
    match /offers/{offerId} {
      allow read: if isAuthenticated() && resource.data.active == true;
      allow write: if false; // Only admins via Cloud Functions
    }
    
    // Transactions - users can read their own transactions
    match /transactions/{transactionId} {
      allow read: if isAuthenticated() && resource.data.userId == request.auth.uid;
      allow write: if false; // Only Cloud Functions can write
    }
    
    // Withdrawal requests
    match /withdrawRequests/{requestId} {
      allow read: if isAuthenticated() && resource.data.userId == request.auth.uid;
      allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
      allow update, delete: if false; // Only admins via Cloud Functions
    }
    
    // Task history (for fraud prevention)
    match /taskHistory/{historyId} {
      allow read, write: if false; // Only Cloud Functions can access
    }
  }
}
```

4. Click **"Publish"** button

---

## ✅ Step 5: Create Firestore Indexes

1. In Firestore Database, click **"Indexes"** tab
2. Click **"Create Index"**

**Index 1:**
- Collection ID: `transactions`
- Fields to index:
  - `userId` → Ascending
  - `timestamp` → Descending
- Click **"Create"**

**Index 2:**
- Collection ID: `withdrawRequests`
- Fields to index:
  - `userId` → Ascending
  - `createdAt` → Descending
- Click **"Create"**

Wait for indexes to build (may take a few minutes).

---

## ✅ Step 6: Set Admin Email

1. Open `src/App.jsx` in your code editor
2. Find this line (around line 18):

```javascript
const isAdmin = user?.email === 'admin@zunotasks.com';
```

3. Replace `'admin@zunotasks.com'` with **YOUR email address** that you'll use as admin:

```javascript
const isAdmin = user?.email === 'your-email@gmail.com';
```

4. **Save the file**

---

## ✅ Step 7: Test the Application

### 7.1 Start Development Server

```bash
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### 7.2 Open in Browser

Open: `http://localhost:5173`

### 7.3 Test Sign Up

1. Click **"Switch to Sign Up"**
2. Enter:
   - Name: Your name
   - Email: test@example.com
   - Password: (minimum 6 characters)
3. Click **"Sign Up"**
4. You should be redirected to Dashboard

### 7.4 Check Firestore

1. Go to Firebase Console → Firestore Database → Data tab
2. You should see a new collection called `users`
3. Click on it → You should see a document with your user ID
4. Verify it has fields: `name`, `email`, `points`, `watchCount`, etc.

### 7.5 Test Admin Panel

1. Logout
2. Login with your **admin email** (the one you set in Step 6)
3. You should see **"Admin"** link in navbar
4. Click it → You should see admin panel

---

## ✅ Step 8: Set Up Cloud Functions (Optional but Recommended)

### 8.1 Install Firebase CLI

```bash
npm install -g firebase-tools
```

### 8.2 Login to Firebase

```bash
firebase login
```

This will open browser for authentication.

### 8.3 Initialize Firebase in Project

```bash
firebase init functions
```

When prompted:
- Select your Firebase project
- Choose JavaScript
- Say "Yes" to ESLint
- Say "No" to installing dependencies now (we'll do it manually)

### 8.4 Install Function Dependencies

```bash
cd functions
npm install
cd ..
```

### 8.5 Update Secret Key in Functions

1. Open `functions/index.js`
2. Find this line:
```javascript
const expectedSecret = 'YOUR_SECRET_KEY';
```

3. Replace with a strong random string (save this for postback URLs):
```javascript
const expectedSecret = 'your-random-secret-key-12345';
```

### 8.6 Enable Cloud Scheduler

The daily reset function uses Cloud Scheduler. Enable it:

1. Go to Firebase Console
2. Click **"Functions"** in left sidebar
3. Click **"Cloud Scheduler"** tab
4. Enable Cloud Scheduler API (if prompted)

### 8.7 Deploy Functions

```bash
firebase deploy --only functions
```

Wait for deployment to complete.

---

## ✅ Step 9: Add Your First Offer (Test)

1. Login as admin
2. Go to **Admin Panel** → **Offers** tab
3. Click **"Add Offer"**
4. Fill in:
   - **Title**: Test Offer
   - **Description**: Complete this test task
   - **Reward Points**: 100
   - **Task Link**: https://www.google.com (test link)
5. Click **"Add Offer"**

### 9.1 Test Task

1. Logout and login as a regular user
2. Go to Dashboard
3. You should see "Test Offer" card
4. Click **"Start Task"** → Should open link in new tab

---

## ✅ Step 10: Test Complete Flow

### 10.1 Watch Ad
1. On Dashboard, click **"Watch Ad"**
2. Wait for countdown
3. Watch ad simulation
4. Check if points increased by 20
5. Try watching 2 more ads (total 3)
6. Try 4th ad → Should show limit message

### 10.2 Check Wallet
1. Go to **Wallet** page
2. Verify points and ₹ conversion
3. Check transaction history

### 10.3 Test Withdrawal (if you have ₹100 worth points)
1. Make sure you have at least 10,000 points
2. Go to **Withdraw** page
3. Enter amount: 100
4. Enter UPI: test@paytm
5. Submit request
6. Check Admin Panel → Withdrawals tab → Should see pending request

---

## ✅ Step 11: Deploy to Production (Optional)

### Option A: Vercel (Easiest)

1. Push code to GitHub
2. Go to https://vercel.com
3. Sign up/Login with GitHub
4. Click **"New Project"**
5. Import your GitHub repository
6. Settings:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
7. Click **"Deploy"**

### Option B: Firebase Hosting

```bash
# Build the project
npm run build

# Initialize hosting
firebase init hosting

# Deploy
firebase deploy --only hosting
```

---

## 🔍 Troubleshooting

### Issue: "Firebase: Error (auth/configuration-not-found)"
**Solution**: Make sure you updated `src/firebase/config.js` with correct values

### Issue: "Permission denied" in Firestore
**Solution**: 
1. Check if security rules are published
2. Check if user is authenticated
3. Verify collection names match

### Issue: Admin panel not showing
**Solution**: 
1. Check if you're logged in with the admin email
2. Verify admin email in `src/App.jsx` matches your email

### Issue: Functions not deploying
**Solution**: 
1. Make sure Firebase CLI is logged in: `firebase login`
2. Check if you have billing enabled (Cloud Functions requires billing)
3. Verify Node.js version in `functions/package.json` (should be 18)

### Issue: Points not updating
**Solution**:
1. Check browser console for errors
2. Verify Firestore rules allow writes
3. Check Firebase Console → Firestore → Data to see if documents update

---

## 📋 Final Checklist

Before going live, verify:

- [ ] Firebase project created
- [ ] Authentication enabled (Email + Google)
- [ ] Firestore database created
- [ ] Security rules published
- [ ] Indexes created
- [ ] Firebase config updated in code
- [ ] Admin email set in `src/App.jsx`
- [ ] Can sign up and login
- [ ] Can watch ads (3/day limit works)
- [ ] Can see tasks
- [ ] Admin panel accessible
- [ ] Can add offers as admin
- [ ] Withdrawal request works
- [ ] Cloud Functions deployed (optional)

---

## 🎉 You're All Set!

Your ZunoTasks website should now be fully functional. 

**Next Steps:**
1. Add real offers/tasks from CPA networks
2. Integrate real ad networks (Adsterra, AdSense)
3. Customize branding/colors
4. Set up analytics
5. Start promoting!

**For support:** Check browser console (F12) for any errors and verify Firebase Console logs.

Happy earning! 💰

