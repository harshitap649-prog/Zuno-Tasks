# 🔍 Troubleshooting Blank Page Issue

## Quick Fixes (Try These First)

### 1. Check Browser Console
1. Open your website
2. Press **F12** (or right-click → Inspect)
3. Go to **Console** tab
4. Look for **RED errors**
5. **Copy the error message** and share it

### 2. Clear Browser Cache
- Press **Ctrl + Shift + Delete**
- Select "Cached images and files"
- Click "Clear data"
- Refresh page with **Ctrl + Shift + R**

### 3. Check Terminal for Errors
Look at your terminal where `npm run dev` is running - are there any errors?

---

## Common Causes & Solutions

### Issue 1: Firebase Configuration Error
**Error in console:** `Firebase: Error (auth/invalid-api-key)` or similar

**Fix:**
1. Open `src/firebase/config.js`
2. Make sure all Firebase values are correct
3. Check Firebase Console → Project Settings
4. Verify your Firebase project is active

### Issue 2: Missing Dependencies
**Error:** `Cannot find module` or `lucide-react not found`

**Fix:**
```bash
npm install
npm install lucide-react
```

### Issue 3: Port Already in Use
**Error:** Port 5173 already in use

**Fix:**
```bash
# Stop other servers
# Or use different port:
npm run dev -- --port 3000
```

### Issue 4: Build Errors
**Error:** Syntax errors in code

**Fix:**
1. Check terminal for error messages
2. Fix syntax errors shown
3. Save files and refresh

---

## Step-by-Step Debugging

### Step 1: Check if Server is Running
```bash
# Make sure you see:
VITE v5.x.x  ready in xxx ms
➜  Local:   http://localhost:5173/
```

### Step 2: Open Browser Console
1. Open http://localhost:5173
2. Press **F12**
3. Check **Console** tab for errors
4. Check **Network** tab - are files loading?

### Step 3: Verify Files Load
In browser:
- Right-click → View Page Source
- Check if you see `<div id="root"></div>`
- If not, the HTML file might be wrong

### Step 4: Check React Mounting
In Console, type:
```javascript
document.getElementById('root')
```
- Should return the root element
- If `null`, HTML file has issue

---

## Test if React is Working

Add this temporary test in `src/App.jsx`:

```javascript
function App() {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Test - React is Working!</h1>
      <p>If you see this, React is mounted correctly.</p>
    </div>
  );
}
```

If this shows, React works - the issue is in components.
If still blank, React isn't mounting.

---

## Most Common Fix

**90% of blank pages are due to:**
1. JavaScript errors (check console)
2. Firebase connection issues
3. Missing CSS/styles

**Quick test:**
- Open http://localhost:5173
- Press F12
- Console tab
- Screenshot or copy the error message

---

## If Still Not Working

Share these details:
1. ✅ Screenshot of browser console errors
2. ✅ Terminal output from `npm run dev`
3. ✅ What you see when you open http://localhost:5173
4. ✅ Any error messages

