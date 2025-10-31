# ZunoTasks Setup Guide

## Quick Start Checklist

### 1. Firebase Project Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (or use existing)
3. Enable Authentication:
   - Go to Authentication > Sign-in method
   - Enable **Email/Password**
   - Enable **Google** (add your OAuth consent screen credentials)
4. Create Firestore Database:
   - Go to Firestore Database
   - Click "Create database"
   - Start in **production mode** (you'll add security rules later)
   - Choose your location

### 2. Get Firebase Config

1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps"
3. Click the web icon (`</>`)
4. Register your app
5. Copy the `firebaseConfig` object
6. Paste it into `src/firebase/config.js`

### 3. Firestore Security Rules

Go to Firestore Database > Rules tab and paste:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper function to check if user owns the document
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // Users collection
    match /users/{userId} {
      allow read, write: if isOwner(userId);
      allow read: if isAuthenticated(); // Allow admins to read all (implement admin check in your app)
    }
    
    // Offers collection
    match /offers/{offerId} {
      allow read: if isAuthenticated() && resource.data.active == true;
      allow write: if false; // Only admins via Cloud Functions
    }
    
    // Transactions collection
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

### 4. Install Dependencies

```bash
npm install
```

### 5. Run Development Server

```bash
npm run dev
```

The app will start at `http://localhost:5173`

### 6. Set Up Admin Access

In `src/App.jsx`, update the admin email:

```javascript
// Change this to your admin email
const isAdmin = user?.email === 'your-admin-email@example.com';
```

### 7. Cloud Functions Setup (Optional but Recommended)

1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Login to Firebase:
```bash
firebase login
```

3. Initialize Firebase in your project:
```bash
firebase init functions
```

4. Install function dependencies:
```bash
cd functions
npm install
```

5. Update the secret key in `functions/index.js`:
```javascript
const expectedSecret = 'YOUR_SECRET_KEY_HERE';
```

6. Deploy functions:
```bash
firebase deploy --only functions
```

### 8. Firestore Indexes

Create these indexes in Firestore Database > Indexes:

1. **transactions** collection:
   - Fields: `userId` (Ascending), `timestamp` (Descending)

2. **withdrawRequests** collection:
   - Fields: `userId` (Ascending), `createdAt` (Descending)

### 9. Test the Application

1. **Sign Up**: Create a new account
2. **Dashboard**: Check if you can see your points
3. **Watch Ad**: Test the ad watching (3 per day limit)
4. **Tasks**: Add a test offer in Admin Panel and try completing it
5. **Withdrawal**: Request a withdrawal (need ₹100 minimum)

### 10. Add Your First Offer (Admin Panel)

1. Login as admin
2. Go to Admin Panel > Offers tab
3. Click "Add Offer"
4. Fill in:
   - Title: "Install XYZ App"
   - Description: "Download and install our app"
   - Reward Points: 100
   - Task Link: https://play.google.com/store/apps/details?id=...
5. Click "Add Offer"

## Production Deployment

### Option 1: Vercel (Recommended)

1. Push code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import your GitHub repo
4. Set build command: `npm run build`
5. Set output directory: `dist`
6. Deploy!

### Option 2: Firebase Hosting

1. Install Firebase CLI (if not already)
2. Build the project:
```bash
npm run build
```

3. Initialize hosting:
```bash
firebase init hosting
```

4. Deploy:
```bash
firebase deploy --only hosting
```

## Monetization Setup

### Adsterra Integration

1. Sign up at [Adsterra](https://adsterra.com)
2. Add their script to `src/components/WatchAdModal.jsx`:
```javascript
// Add before the ad watching logic
<script src="YOUR_ADSTERRA_SCRIPT_URL"></script>
```

### Google AdSense

1. Apply for AdSense (requires traffic)
2. Add AdSense code to your `index.html` or create an AdSense component

### CPA Networks

Integrate with offerwalls:
- OGAds
- CPALead
- AdWorkMedia
- OfferToro

Add their postback URLs to your Cloud Function.

## Important Notes

- **Minimum Withdrawal**: ₹100 (10,000 points)
- **Conversion Rate**: 1000 points = ₹10
- **Daily Ad Limit**: 3 ads per day per user
- **Points per Ad**: 20 points
- **Admin Email**: Update in `src/App.jsx`

## Troubleshooting

### Firebase Auth Not Working
- Check if authentication is enabled in Firebase Console
- Verify Firebase config in `src/firebase/config.js`
- Check browser console for errors

### Firestore Permissions Denied
- Verify security rules are deployed
- Check if user is authenticated
- Verify collection names match

### Cloud Functions Not Running
- Verify functions are deployed
- Check Firebase Console > Functions for logs
- Ensure Node.js version is 18+

## Support

For issues, check:
1. Browser console for errors
2. Firebase Console logs
3. Network tab for API calls

Happy earning! 💰

