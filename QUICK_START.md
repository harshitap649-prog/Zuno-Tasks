# ⚡ Quick Start - 5 Minutes Setup

## Essential Steps (Must Do)

### 1️⃣ Install Dependencies
```bash
npm install
```

### 2️⃣ Create Firebase Project
1. Go to https://console.firebase.google.com/
2. Create new project
3. Enable **Authentication** → Enable Email/Password and Google
4. Create **Firestore Database** → Start in production mode

### 3️⃣ Copy Firebase Config
1. Firebase Console → Settings ⚙️ → Project settings
2. Scroll to "Your apps" → Click Web icon `</>`
3. Register app → Copy the `firebaseConfig`
4. Paste into `src/firebase/config.js` (replace all YOUR_* values)

### 4️⃣ Set Firestore Rules
1. Firestore Database → Rules tab
2. Paste rules from `COMPLETE_SETUP_CHECKLIST.md` → Click "Publish"

### 5️⃣ Set Your Admin Email
Open `src/App.jsx` → Find line 27 → Replace admin email with yours:
```javascript
const isAdmin = user?.email === 'your-email@gmail.com';
```

### 6️⃣ Run the App
```bash
npm run dev
```

### 7️⃣ Create Indexes
Firestore Database → Indexes tab → Create:
- Collection: `transactions`, Fields: `userId` (Asc), `timestamp` (Desc)
- Collection: `withdrawRequests`, Fields: `userId` (Asc), `createdAt` (Desc)

### 8️⃣ Test
1. Open http://localhost:5173
2. Sign up with email
3. Login
4. You should see dashboard!

---

## Optional (But Recommended)

### Cloud Functions (For Daily Reset & Postbacks)
```bash
npm install -g firebase-tools
firebase login
cd functions
npm install
cd ..
firebase deploy --only functions
```

---

## 🆘 Still Stuck?

Check `COMPLETE_SETUP_CHECKLIST.md` for detailed step-by-step instructions with screenshots guidance.

