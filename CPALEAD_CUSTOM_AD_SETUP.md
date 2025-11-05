# 🎯 How to Add CPAlead Custom Ads for Watch Ad Feature

This guide will help you configure **CPAlead Custom Ads** (video/interstitial ads) for the "Watch Ad" feature to generate revenue from ad views instead of offer completions.

---

## 🎯 Why Custom Ads?

- **Generate Revenue from Views**: Earn money when users watch ads, not just when they complete offers
- **Better User Experience**: Users watch ads for 20 seconds and earn points automatically
- **Higher Revenue Potential**: Multiple ad views per user vs. one-time offer completions

---

## 📋 Prerequisites

1. ✅ **CPAlead Account**: You need a verified CPAlead publisher account
2. ✅ **Admin Access**: You must be logged in as an admin
3. ✅ **CPAlead Dashboard Access**: Access to CPAlead's Ad Tools section

---

## 🚀 Step-by-Step Setup

### **Step 1: Create Custom Ad in CPAlead Dashboard**

1. **Login to CPAlead Dashboard**
   - Go to: https://www.cpalead.com/
   - Login with your publisher account

2. **Navigate to Ad Tools**
   - Click on **"Ad Tools"** in the left sidebar
   - Click on **"Create Custom Ad"**

3. **Configure Your Custom Ad**
   - **Choose Ad Type**: Select video ads or interstitial ads
   - **Set Dimensions**: 
     - For video ads: Use 16:9 aspect ratio (e.g., 640x360, 1280x720)
     - For interstitial ads: Use full-screen dimensions
   - **Set Layout**: Choose number of rows/columns for ad display
   - **Customize Appearance**: Match your website's design

4. **Generate and Get Code**
   - Click **"Generate Code"** or **"Save"**
   - Go to **"Manage Ads"** section
   - Find your newly created custom ad
   - Click **"Get Code"** button
   - Find the **"Direct Link"** URL
   - Copy the Direct Link URL
   - Example format: `https://zwidgetbv3dft.xyz/custom/XXXXX` or similar

---

### **Step 2: Configure in Admin Panel**

1. **Go to Admin Panel**
   - Navigate to your website
   - Login as admin
   - Click on **"Admin"** in the top navigation

2. **Open Offers Tab**
   - Click on the **"Offers"** tab in the admin panel

3. **Open CPAlead Configuration**
   - Find the **"CPALead VIP"** button/section
   - Click on it to open the configuration form

4. **Enter Your Custom Ad URL**
   - Look for the field labeled **"⭐ CPAlead Custom Ad URL (For Watch Ad)"**
   - This field has a purple border and is highlighted
   - Paste the Direct Link URL you copied from Step 1
   - Example: `https://zwidgetbv3dft.xyz/custom/XXXXX`

5. **Save Configuration**
   - Click the **"Enable CPAlead Tools"** button
   - You should see a success message: "⭐ Custom Ad URL added - Watch Ad feature will show real ads!"

---

## ✅ What Happens Next

Once you save the Custom Ad URL:

1. **Watch Ad Feature Updated**: 
   - The "Watch Ad" button will now show actual video/interstitial ads
   - Instead of showing offers that require completion
   - Users watch ads for 20 seconds → earn points automatically

2. **Revenue Generation**:
   - Each ad view generates revenue from CPAlead
   - Users can watch multiple ads per day
   - Revenue is tracked per view/impression

3. **User Experience**:
   - Users see real ads (video/interstitial)
   - Progress bar shows watch time
   - Points awarded automatically after 20 seconds

---

## 🔍 How to Verify It's Working

1. **Go to Dashboard**
   - Click on "Watch Ad" button/card
   - A modal should open

2. **Check Ad Display**:
   - You should see video/interstitial ads loading
   - NOT the offerwall with install tasks
   - Progress bar shows watch time

3. **Test Watch Time**:
   - Watch for 20 seconds
   - Points should be awarded automatically
   - Modal closes after completion

---

## ⚠️ Important Notes

1. **Priority System**: 
   - Custom Ad URL is used first (if configured)
   - Falls back to Offerwall URL if Custom Ad not configured
   - Check console logs to see which URL is being used

2. **Revenue Difference**:
   - **Custom Ads**: Revenue from ad views/impressions
   - **Offerwall**: Revenue only from offer completions
   - Custom Ads typically generate more revenue per user

3. **URL Format**:
   - Must be a Direct Link URL from CPAlead
   - Should NOT be embed code or widget code
   - Should be a full URL starting with `https://`

---

## 🆘 Troubleshooting

### **Still Seeing Offers Instead of Ads?**

- ✅ Check if Custom Ad URL is saved in admin panel
- ✅ Verify the URL is correct (should be Direct Link, not embed code)
- ✅ Check browser console for errors
- ✅ Refresh the page after saving settings

### **Ads Not Loading?**

- ✅ Verify the Custom Ad URL is correct
- ✅ Check CPAlead dashboard to ensure ad is active
- ✅ Check browser console for iframe/CORS errors
- ✅ Try the Direct Link URL directly in browser

### **No Revenue Being Generated?**

- ✅ Verify ad views are being tracked in CPAlead dashboard
- ✅ Check that user tracking (`sub` parameter) is working
- ✅ Ensure ads are actually being viewed (not just loaded)

---

## 📊 Revenue Optimization Tips

1. **Use Video Ads**: Video ads typically generate higher revenue per view
2. **Auto-Play**: Ensure ads auto-play when modal opens
3. **Multiple Ad Types**: Consider creating multiple custom ads for variety
4. **Track Performance**: Monitor CPAlead dashboard for ad performance

---

## ✅ Quick Checklist

- [ ] Logged into CPAlead Dashboard
- [ ] Created Custom Ad in Ad Tools section
- [ ] Got Direct Link URL from "Get Code"
- [ ] Logged into Admin Panel
- [ ] Opened Offers Tab → CPALead VIP
- [ ] Pasted Custom Ad URL in highlighted field
- [ ] Clicked "Enable CPAlead Tools"
- [ ] Verified success message
- [ ] Tested "Watch Ad" button
- [ ] Confirmed ads are showing (not offers)

---

**✅ Once configured, your Watch Ad feature will show real CPAlead ads and generate revenue from ad views!**

