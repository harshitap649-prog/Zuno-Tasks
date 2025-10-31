# ZunoTasks - Complete, Watch, and Earn

A modern web application that allows users to earn money by completing tasks and watching ads. Built with React, Firebase, and Tailwind CSS.

## 🌟 Features

- **User Authentication**: Sign up/login with Google or Email
- **Task Completion**: Complete tasks to earn points
- **Ad Watching**: Watch up to 3 ads per day for bonus coins
- **Wallet System**: Track earnings and balance
- **Withdrawal**: Convert points to real money via UPI/Paytm
- **Admin Panel**: Manage users, offers, and withdrawals

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Firebase project
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd zuno-tasks
```

2. Install dependencies
```bash
npm install
```

3. Configure Firebase
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Copy your Firebase config
   - Update `src/firebase/config.js` with your Firebase credentials:
   ```javascript
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_AUTH_DOMAIN",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_STORAGE_BUCKET",
     messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
     appId: "YOUR_APP_ID"
   };
   ```

4. Set up Firebase Authentication
   - Enable Email/Password authentication
   - Enable Google Sign-In provider

5. Set up Firestore Database
   - Create Firestore database
   - Set up security rules (see below)

6. Deploy Cloud Functions (optional)
```bash
cd functions
npm install
firebase deploy --only functions
```

### Development

Run the development server:
```bash
npm run dev
```

Build for production:
```bash
npm run build
```

## 🔥 Firestore Security Rules

Add these rules to your Firestore database:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read their own data
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Users can read active offers
    match /offers/{offerId} {
      allow read: if request.resource.data.active == true;
      allow write: if false; // Only admins can write (handled in functions)
    }
    
    // Users can read their own transactions
    match /transactions/{transactionId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow write: if false; // Only functions can write
    }
    
    // Users can create withdrawal requests
    match /withdrawRequests/{requestId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update: if false; // Only admins can update (handled in functions)
    }
    
    // Admin collection (adjust based on your admin setup)
    match /admin/{document=**} {
      allow read, write: if request.auth != null && request.auth.token.admin == true;
    }
  }
}
```

## 📁 Project Structure

```
zuno-tasks/
├── src/
│   ├── components/        # Reusable components
│   ├── pages/            # Page components
│   ├── firebase/         # Firebase configuration and utilities
│   ├── App.jsx           # Main app component
│   ├── main.jsx          # Entry point
│   └── index.css         # Global styles
├── functions/            # Firebase Cloud Functions
├── public/               # Static assets
└── package.json
```

## 💰 Points System

- **1000 points = ₹10**
- **Minimum withdrawal: ₹100 (10,000 points)**
- **Ad reward: 20 points per ad**
- **Daily ad limit: 3 ads per day**

## 🔐 Admin Access

To set up admin access, update the admin check in `src/App.jsx`:

```javascript
const isAdmin = user?.email === 'admin@zunotasks.com';
```

Or implement a more secure method using custom claims in Firebase.

## 📊 Firebase Collections

- **users**: User data (points, watchCount, etc.)
- **offers**: Available tasks/offers
- **transactions**: Transaction history
- **withdrawRequests**: Withdrawal requests
- **taskHistory**: Task completion logs (for fraud prevention)

## 🎨 Customization

- Update colors in `tailwind.config.js`
- Modify reward amounts in `src/firebase/firestore.js`
- Add more ad providers in `src/components/WatchAdModal.jsx`

## 🔒 Security Notes

1. Set up proper Firebase security rules
2. Use Firebase App Check for production
3. Implement rate limiting for API calls
4. Validate all user inputs
5. Set strong secret keys for postback verification

## 📱 Ad Integration

To integrate real ads:

1. **Adsterra** (recommended to start)
   - Get your ad code snippet from Adsterra (e.g., Social Bar/Pushunder)
   - Create `.env` at the project root and paste:
   
   ```env
   VITE_ADSTERRA_CODE=<PASTE_YOUR_FULL_ADSTERRA_SCRIPT_TAG_HERE>
   ```
   
   - Restart the dev server. The code will render inside the Watch Ad modal automatically when an ad starts playing.

2. **Google AdSense** (requires approval)
   - Add the AdSense script to `index.html` or a dedicated component

3. **Custom SDK**
   - Add your provider script to `.env` (same pattern) and it will be injected into the ad slot

## 🚀 Deployment

### Vercel/Netlify
```bash
npm run build
# Deploy the dist folder
```

### Firebase Hosting
```bash
npm run build
firebase deploy --only hosting
```

## 📝 License

This project is for educational purposes.

## 🤝 Support

For issues and questions, please open an issue on GitHub.

---

**ZunoTasks** - Complete. Watch. Earn. Withdraw. 💰

# How to Run the Website

## Local Development

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. View your website at: `http://localhost:3000`

## Production Deployment

1. Install Firebase CLI (if not already installed):
```bash
npm install -g firebase-tools
```

2. Login to Firebase:
```bash
firebase login
```

3. Build the project:
```bash
npm run build
```

4. Deploy to Firebase:
```bash
firebase deploy
```

5. After deployment, you can view your website at:
   - Your Firebase hosting URL (e.g., `https://your-project-id.web.app`)
   - The URL will be shown in the terminal after successful deployment

