# 🚫 How to Change from Adult Ads to Non-Adult Ads

## Quick Steps

### Step 1: Get New Non-Adult Ad Code from Adsterra

1. **Login to Adsterra Dashboard**
   - Go to: https://publishers.adsterra.com/
   - Login with your account

2. **Create New Popunder Ad Unit**
   - Go to **"Websites"** → Select your website
   - Click **"Ad Units"** tab
   - Click **"Create Ad Unit"** or **"Add New"**
   - Select **"Popunder"** as ad type

3. **Configure Ad Settings (IMPORTANT)**
   - **Content Category**: Select **"General"** or **"Non-Adult"**
   - **DO NOT** select "Adult" category
   - Set other settings as needed
   - Click **"Save"** or **"Create"**

4. **Get the Code**
   - After creating, you'll see a modal with code
   - Click **"COPY CODE"** button
   - The code will look like:
     ```html
     <script type='text/javascript' src='//plXXXXX.effectivegatecpm.com/XX/XX/XX/XXXXXXXXXX.js'></script>
     ```
   - **Copy the entire URL** (the part after `src='` and before `'></script>`)

### Step 2: Extract the Ad URL

From your new code, extract just the URL part:

**Example:**
- Code: `<script type='text/javascript' src='//pl12345.effectivegatecpm.com/ab/cd/ef/abcdef123456.js'></script>`
- **URL to use**: `//pl12345.effectivegatecpm.com/ab/cd/ef/abcdef123456.js`

### Step 3: Update Your Code

Once you have the new URL, provide it to me and I'll update all the code automatically.

**OR** you can manually update:

1. Open `src/pages/Dashboard.jsx`
2. Find line 188:
   ```javascript
   const scriptUrl = `${protocol}//pl28003582.effectivegatecpm.com/59/59/a6/5959a647de320ea10184d9a4f67f817e.js`;
   ```
3. Replace `pl28003582.effectivegatecpm.com/59/59/a6/5959a647de320ea10184d9a4f67f817e.js` with your new URL

4. Also update the script detection in:
   - `src/pages/Dashboard.jsx` line 169 (replace `pl28003582` with your new ID)
   - `src/components/WatchAdModal.jsx` lines 20 and 40 (replace `pl28003582` with your new ID)

---

## ⚠️ Important Notes

- **Content Category**: Make sure you select **"General"** or **"Non-Adult"** when creating the ad unit in Adsterra
- **Testing**: After updating, test the ads to ensure they're non-adult
- **Revenue**: Non-adult ads may have slightly different CPM rates, but they're more suitable for general audiences

---

## 🆘 Need Help?

If you can't find the settings or need help:
1. In Adsterra dashboard, look for **"Content Category"** or **"Ad Type"** settings
2. Contact Adsterra support if you can't change the category
3. You may need to create a completely new ad unit with non-adult settings

---

## 📝 What I'll Update

Once you provide the new ad URL, I'll automatically update:
- ✅ `src/pages/Dashboard.jsx` - Main ad loading code
- ✅ `src/components/WatchAdModal.jsx` - Ad detection code
- ✅ All references to the old ad code

**Just provide me the new URL and I'll do the rest!**

