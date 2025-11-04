# 🔒 CPAlead File Locker & Link Locker - Setup Guide

## ✅ What's Been Added

I've successfully added **CPAlead File Locker** and **Link Locker** features to your Dashboard page, positioned below the SMS Verification section.

## 🎯 Location

- **Page**: Dashboard (Home page)
- **Position**: Below "SMS Verification" section, above "Solve Captchas"
- **Components**: 
  - `CPALeadFileLocker` - For file downloads
  - `CPALeadLinkLocker` - For link unlocking

## 💰 How They Work

### File Locker:
- **Purpose**: Users must complete offers to download files
- **Revenue**: Earn commission for each completed offer
- **User Benefit**: Get access to premium file downloads
- **Use Case**: Lock downloadable content (PDFs, software, media files, etc.)

### Link Locker:
- **Purpose**: Users must complete offers to unlock links
- **Revenue**: Earn commission for each completed offer
- **User Benefit**: Get access to premium/exclusive links
- **Use Case**: Lock special links (downloads, sign-ups, exclusive content, etc.)

## 🚀 Setup Steps

### Step 1: Get Your CPAlead Locker URLs

1. **Go to CPAlead Dashboard:**
   - Visit: https://cpalead.com/publisher/
   - Log in with your account

2. **Navigate to Reward Tools:**
   - Look for **"Reward Tools"** or **"Content Lockers"** in the dashboard
   - You'll find:
     - **File Locker** - Direct Link URL
     - **Link Locker** - Direct Link URL

3. **Get Direct Link URLs:**
   - Click on **"File Locker"** → **"Get Code"** → Copy **"Direct Link"**
   - Click on **"Link Locker"** → **"Get Code"** → Copy **"Direct Link"**
   - URLs typically look like:
     ```
     https://zwidgetymz56r.xyz/list/YOUR_FILE_LOCKER_ID
     https://qckclk.com/YOUR_LINK_LOCKER_ID
     ```

### Step 2: Configure in Admin Panel

1. **Go to Admin Panel** → **Offers** tab
2. **Click "CPAlead VIP"** button
3. **Enter your URLs:**
   - **File Locker Direct Link URL**: Paste your file locker URL
   - **Link Locker Direct Link URL**: Paste your link locker URL
4. **Click "Enable CPAlead"**
5. ✅ Done!

### Step 3: Test on Dashboard

1. Go to your **Dashboard** page
2. Scroll down below "SMS Verification"
3. You should see:
   - **"File Locker"** card (green gradient)
   - **"Link Locker"** card (blue gradient)
4. Click **"Open File Locker"** or **"Open Link Locker"**
5. CPAlead locker opens in a new tab
6. Users complete offers → You earn commission!

## 📋 Features

✅ **Automatic Configuration**: Uses existing CPAlead settings from Admin Panel
✅ **Point Awarding**: Automatically awards points after offer completion
✅ **Duplicate Prevention**: Each offer only awards once
✅ **PostMessage Support**: Listens for completion events from CPAlead
✅ **User-Friendly**: Clear instructions and revenue information
✅ **New Tab Opening**: Opens in new tab for better user experience

## 🎨 UI Design

### File Locker:
- **Card Style**: Green/Emerald gradient background
- **Icon**: FileLock icon
- **Button**: Green gradient "Open File Locker" button
- **Info**: Explains how file locker works

### Link Locker:
- **Card Style**: Blue/Cyan gradient background
- **Icon**: Link icon
- **Button**: Blue gradient "Open Link Locker" button
- **Info**: Explains how link locker works

## 💡 How Users See It

1. **File Locker Card**: "Complete offers to unlock premium file downloads"
2. **Link Locker Card**: "Complete offers to unlock premium links"
3. **Click Button**: Opens CPAlead locker in new tab
4. **Complete Offers**: Users complete offers to unlock files/links
5. **Earn Points**: Points automatically awarded after completion

## 🔧 Technical Details

### Components Used:
- `src/components/CPALeadFileLocker.jsx`
- `src/components/CPALeadLinkLocker.jsx`

### Integration: `src/pages/Dashboard.jsx`
- Loads CPAlead locker URLs from Firestore
- Displays cards when URLs are configured
- Manages show/hide state for each locker
- Passes `userId` and `onComplete` props

## 📊 Revenue Tracking

Points awarded for locker completions are tracked in Firestore with:
- **Transaction Type**: Default (or can be customized)
- **User ID**: Tracked for analytics
- **Points**: Amount awarded per completion
- **Timestamp**: When offer was completed

## 🎯 Best Practices

1. **Set Appropriate Rewards**: Balance user motivation with your profit margin
2. **Monitor Completion Rates**: Check CPAlead dashboard for conversion rates
3. **Postback URL**: Configure postback URL in CPAlead dashboard for reliable tracking
4. **Content Strategy**: Use file/link lockers for valuable content to maximize conversions

## 💰 Revenue Potential

**File Locker:**
- Users download files → Complete offers → You earn commission
- Average: $0.50 - $5 per completed offer
- With 20 downloads/day at $1 average = **$20/day = $600/month**

**Link Locker:**
- Users unlock links → Complete offers → You earn commission
- Average: $0.50 - $5 per completed offer
- With 20 unlocks/day at $1 average = **$20/day = $600/month**

**Combined Potential**: $1,200/month additional revenue! 💰

## 🚨 Important Notes

- **CPAlead URLs Required**: Lockers will only show if URLs are configured in Admin Panel
- **Postback Configuration**: Configure postback URL in CPAlead dashboard for reliable tracking
- **Content Locking**: You need to create locked files/links in CPAlead dashboard
- **Revenue**: Earnings depend on CPAlead's offer inventory and user's location

## ✅ You're Ready!

The File Locker and Link Locker features are now live on your Dashboard! Users can start unlocking files and links, while you generate revenue from CPAlead.

**Next Steps:**
1. Get your File Locker and Link Locker URLs from CPAlead dashboard
2. Add them to Admin Panel → CPAlead configuration
3. Test on Dashboard
4. Monitor revenue in CPAlead dashboard
5. Adjust point rewards based on your profit margins

---

**Revenue Potential**: With both lockers active, you can generate significant additional revenue from users unlocking premium content! 💰

