# 🔍 AdGem Offers Not Showing? Troubleshooting Guide

## Common Reasons Why Offers Don't Appear:

### 1. **Property Not Approved Yet** ⚠️ (Most Common)

**Check Your Property Status:**
- Go to AdGem Dashboard → Properties & Apps
- Check the "Status" column for "zunotasks"
- If it says **"New"** (blue badge), it's not approved yet

**Solution:**
- Wait 24-48 hours for approval
- AdGem reviews properties manually
- You'll get an email when approved
- Once status changes to "Active", offers will appear

---

### 2. **AdGem Not Configured in Admin Panel** ⚠️

**Check:**
1. Go to your website Admin Panel → Offers tab
2. Find "AdGem (All Tasks)" section
3. Is it enabled? (Should show green/configured)

**Solution:**
- Make sure you pasted the URL: `https://api.adgem.com/v1/wall?appid=31438&playerid={USER_ID}`
- Clicked "Enable AdGem" button
- Got confirmation message: "✅ AdGem is ready!"

---

### 3. **Wrong URL Format** ⚠️

**Check Your URL:**
- Should be: `https://api.adgem.com/v1/wall?appid=31438&playerid={USER_ID}`
- Make sure `{USER_ID}` is included (not replaced with actual ID)
- Make sure `appid=31438` is correct

**Solution:**
- Go to Admin Panel → Offers → AdGem
- Verify the URL is exactly: `https://api.adgem.com/v1/wall?appid=31438&playerid={USER_ID}`
- If wrong, fix it and save again

---

### 4. **No Offers Available for Your Region** ⚠️

**Possible Reasons:**
- AdGem might not have offers for your user's country
- Your property might be restricted to certain regions
- Offers might be filtered out

**Solution:**
- Check AdGem Dashboard → Reports
- See if there are any offers available
- Contact AdGem support if needed

---

### 5. **User ID Not Being Replaced** ⚠️

**Check:**
- The URL should have `{USER_ID}` placeholder
- Your system should replace it with actual user ID
- Check browser console for errors

**Solution:**
- Verify the URL format is correct
- Check if user is logged in
- Try refreshing the page

---

### 6. **Browser/Cache Issues** ⚠️

**Solution:**
- Clear browser cache
- Try incognito/private mode
- Try different browser
- Hard refresh (Ctrl+F5 or Cmd+Shift+R)

---

## 🔍 **Step-by-Step Troubleshooting:**

### **Step 1: Check Property Status**

1. Go to AdGem Dashboard
2. Click "Properties & Apps"
3. Find "zunotasks" property
4. Check "Status" column

**If Status = "New":**
- ⚠️ Property not approved yet
- Wait 24-48 hours
- Check email for approval notification

**If Status = "Active":**
- ✅ Property is approved
- Move to Step 2

---

### **Step 2: Verify Admin Panel Configuration**

1. Go to your website Admin Panel
2. Click "Offers" tab
3. Find "AdGem (All Tasks)" section
4. Check if it's configured

**What to Check:**
- [ ] Is "AdGem Offerwall URL" field filled?
- [ ] Does it say: `https://api.adgem.com/v1/wall?appid=31438&playerid={USER_ID}`?
- [ ] Did you click "Enable AdGem"?
- [ ] Did you get success message?

**If Not Configured:**
- Fill in the URL
- Click "Enable AdGem"
- Wait a few minutes
- Refresh Tasks page

---

### **Step 3: Check Tasks Page**

1. Go to Tasks page (as regular user, not admin)
2. Look for "Listen to Music" button
3. Click it
4. Check if AdGem section appears

**What Should Happen:**
- "Listen to Music" button should appear in category tabs
- "AdGem Music" section should be visible
- "Listen to Music" button should open offerwall

**If Button Doesn't Appear:**
- Check Admin Panel configuration
- Refresh page
- Clear cache

---

### **Step 4: Test the Offerwall URL**

1. Open browser console (F12)
2. Go to Tasks page
3. Click "Listen to Music"
4. Check for errors in console

**What to Look For:**
- Any JavaScript errors?
- Is the URL being called correctly?
- Is `{USER_ID}` being replaced?

---

## ✅ **Quick Fixes:**

### **Fix 1: Wait for Approval**
- If status is "New", wait 24-48 hours
- Check email for approval

### **Fix 2: Re-configure AdGem**
1. Admin Panel → Offers → AdGem
2. Clear the URL field
3. Paste: `https://api.adgem.com/v1/wall?appid=31438&playerid={USER_ID}`
4. Click "Enable AdGem"
5. Wait 2-3 minutes
6. Refresh Tasks page

### **Fix 3: Check User Login**
- Make sure you're logged in as a user
- Try with a different user account
- Check if user ID is being passed correctly

---

## 📋 **Checklist:**

- [ ] Property status is "Active" (not "New")
- [ ] AdGem is configured in Admin Panel
- [ ] URL is correct: `https://api.adgem.com/v1/wall?appid=31438&playerid={USER_ID}`
- [ ] "Enable AdGem" button was clicked
- [ ] Success message appeared
- [ ] User is logged in
- [ ] Browser cache cleared
- [ ] Page refreshed

---

## 🆘 **Still Not Working?**

### **Contact AdGem Support:**
1. Go to AdGem Dashboard
2. Click "Support" in sidebar
3. Create a ticket
4. Ask: "Why are offers not showing for property ID 31438?"

### **Check AdGem Dashboard:**
1. Go to "Reports" section
2. Check if there are any offers available
3. Check if there are any errors

---

## 💡 **Most Likely Issue:**

**Property Status = "New"** (Not Approved Yet)

This is the #1 reason offers don't show. AdGem needs to approve your property first.

**What to Do:**
1. Wait 24-48 hours
2. Check email for approval
3. Check property status in dashboard
4. Once "Active", offers will appear automatically

---

**Need More Help?** Let me know:
1. What's the property status? (New/Active)
2. Is AdGem configured in Admin Panel?
3. Do you see "Listen to Music" button on Tasks page?

