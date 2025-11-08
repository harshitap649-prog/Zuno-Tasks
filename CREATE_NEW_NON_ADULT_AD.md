# 🆕 Create New Non-Adult Ad Unit - Step by Step

## Solution: Create a Brand New Ad Unit

Since you can't edit the existing ad unit, we'll create a **new one** with adult ads disabled from the start.

---

## Step-by-Step Instructions

### Step 1: Go to Ad Units Section
1. In Adsterra dashboard, go to **"Websites"**
2. Click on your website
3. Click **"Ad Units"** tab
4. Look for **"Create Ad Unit"** or **"Add New"** button (usually top right)

### Step 2: Create New Popunder Ad
1. Click **"Create Ad Unit"** or **"Add New"**
2. Select **"Popunder"** format
3. Fill in the form:
   - **Name**: `Popunder_NonAdult` (or any name you like)
   - **Format**: Popunder (should be pre-selected)
   - **Category**: Select **"Other"** or **"General"**

### Step 3: IMPORTANT - Disable Adult Ads During Creation
When creating the new ad unit, look for:
- **"Show adult ads"** toggle** or checkbox
- **"Adult ads"** option
- **"Content Category"** dropdown

**Make sure:**
- ✅ Toggle is **OFF** (gray, not green)
- ✅ Or select **"General"** / **"Non-Adult"** category
- ✅ Do NOT enable adult ads

### Step 4: Save and Get Code
1. Click **"SAVE"** or **"CREATE"**
2. After saving, you'll see a modal with code
3. The code will look like:
   ```html
   <script type='text/javascript' src='//plXXXXX.effectivegatecpm.com/XX/XX/XX/XXXXXXXXXX.js'></script>
   ```
4. **Copy the entire code** or just the URL part

### Step 5: Extract the URL
From the code, extract just the URL:

**Example:**
- Full code: `<script type='text/javascript' src='//pl12345.effectivegatecpm.com/ab/cd/ef/abcdef123456.js'></script>`
- **URL to give me**: `pl12345.effectivegatecpm.com/ab/cd/ef/abcdef123456.js`

---

## Alternative: Contact Adsterra Support

If you still can't create a new ad unit or can't disable adult ads:

1. **Contact Adsterra Support:**
   - Email: support@adsterra.com
   - Or use the support chat in dashboard
   - Ask them: *"I need to disable adult ads for my popunder ad unit. Can you help me create a new non-adult popunder ad unit?"*

2. **Or ask them to:**
   - Disable adult ads on your existing ad unit (ID: 27903083)
   - Or create a new popunder ad unit with adult ads disabled

---

## What I'll Do After You Get the New Code

Once you provide me the new ad URL, I'll automatically:
- ✅ Update `src/pages/Dashboard.jsx` with new ad URL
- ✅ Update `src/components/WatchAdModal.jsx` with new ad detection
- ✅ Replace all old ad code references

**Just paste the new URL here and I'll update everything!**

---

## Quick Checklist

- [ ] Created new Popunder ad unit
- [ ] Made sure adult ads toggle is OFF during creation
- [ ] Copied the new ad code/URL
- [ ] Ready to provide me the new URL for code update

