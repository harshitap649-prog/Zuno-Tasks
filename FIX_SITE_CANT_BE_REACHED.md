# 🔧 Fix "Site Can't Be Reached /reload" Error

## Quick Fix Steps:

### Step 1: Stop Everything
- In your terminal, press **Ctrl + C** to stop any running server
- Close all terminal windows

### Step 2: Open Terminal in Project Folder
1. Open File Explorer
2. Go to: `C:\Users\Keshav\Desktop\Zuno Tasks`
3. Click in the address bar
4. Type: `cmd` and press Enter
5. Terminal will open in the correct folder

### Step 3: Start Dev Server
Type this command:
```bash
npm run dev
```

### Step 4: Wait for This Message
You should see:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### Step 5: Open the Correct URL
**Open your browser and go to:**
```
http://localhost:5173
```

**NOT** `http://localhost:5173/reload` ❌

---

## Common Mistakes:

### ❌ Wrong URL
- `http://localhost:5173/reload` ← Don't use this
- `http://localhost:3000` ← Wrong port
- `localhost:5173` ← Missing http://

### ✅ Correct URL
- `http://localhost:5173` ← This is correct!

---

## If Still Not Working:

### Check 1: Is Server Running?
Look at terminal - do you see:
```
VITE v5.x.x  ready
➜  Local:   http://localhost:5173/
```
If YES → Server is running, use the URL shown
If NO → Follow steps above to start it

### Check 2: Port Already in Use?
If you see error about port 5173:
```bash
# Kill the process or use different port
npm run dev -- --port 3000
```
Then use: `http://localhost:3000`

### Check 3: Firewall Blocking?
Try this URL instead:
```
http://127.0.0.1:5173
```

---

## Step-by-Step Commands:

```bash
# 1. Make sure you're in project folder
cd "C:\Users\Keshav\Desktop\Zuno Tasks"

# 2. Start server
npm run dev

# 3. Wait for "ready" message

# 4. Open browser to: http://localhost:5173
```

---

## Still Having Issues?

**Share these details:**
1. What do you see in terminal when you run `npm run dev`?
2. What exact error message do you see in browser?
3. What URL are you trying to access?

