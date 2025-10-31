# 📺 Adsterra Ads Integration Guide

## Types of Ads Integrated

1. **Rewarded Ads** - In Watch Ad modal (3 per day)
2. **Banner Ad** - Bottom of page (always visible, non-intrusive)
3. **Sidebar Ad** - Right sidebar on desktop (non-disturbing)
4. **Inline Ad** - Small ads between content sections

---

## How to Add Your Adsterra Codes

### Step 1: Get Your Ad Codes from Adsterra

1. **Login to Adsterra**: https://publishers.adsterra.com/
2. **Create Ad Units:**
   - **Rewarded Ad**: Social Bar or Pushunder (for watch ad modal)
   - **Banner Ad**: Banner (728x90 or 320x50)
   - **Sidebar Ad**: Native or Display (300x250)
   - **Inline Ad**: Native or Banner (responsive)

3. **Copy the Script Tags** for each ad unit

### Step 2: Create `.env` File

In your project root folder (`C:\Users\Keshav\Desktop\Zuno Tasks\`), create a file named `.env`

Add your Adsterra codes:

```env
# Rewarded Ad (for Watch Ad modal - 3 per day)
VITE_ADSTERRA_REWARDED_CODE=<script type="text/javascript">atOptions = { 'key' : 'YOUR_KEY', 'format' : 'iframe', 'height' : 90, 'width' : 728, 'params' : {} }; document.write('<scr' + 'ipt type="text/javascript" src="//www.topcreativeformat.com/YOUR_CODE/invoke.js"></scr' + 'ipt>');</script>

# Bottom Banner Ad (always visible)
VITE_ADSTERRA_BANNER_CODE=<script type="text/javascript">atOptions = { 'key' : 'YOUR_KEY', 'format' : 'iframe', 'height' : 90, 'width' : 728, 'params' : {} }; document.write('<scr' + 'ipt type="text/javascript" src="//www.topcreativeformat.com/YOUR_CODE/invoke.js"></scr' + 'ipt>');</script>

# Sidebar Ad (desktop only, right side)
VITE_ADSTERRA_SIDEBAR_CODE=<script type="text/javascript">atOptions = { 'key' : 'YOUR_KEY', 'format' : 'iframe', 'height' : 250, 'width' : 300, 'params' : {} }; document.write('<scr' + 'ipt type="text/javascript" src="//www.topcreativeformat.com/YOUR_CODE/invoke.js"></scr' + 'ipt>');</script>

# Inline Ad (small ads between content)
VITE_ADSTERRA_INLINE_CODE=<script type="text/javascript">atOptions = { 'key' : 'YOUR_KEY', 'format' : 'iframe', 'height' : 90, 'width' : 728, 'params' : {} }; document.write('<scr' + 'ipt type="text/javascript" src="//www.topcreativeformat.com/YOUR_CODE/invoke.js"></scr' + 'ipt>');</script>
```

### Step 3: Important Notes

- **Replace `<script...>` with your actual Adsterra script tag**
- **Keep quotes** - Don't remove the quotes around the script
- **No spaces** after `=` sign
- **Example format:**
  ```env
  VITE_ADSTERRA_BANNER_CODE="<script type='text/javascript'>...your code...</script>"
  ```

### Step 4: Restart Dev Server

After adding `.env` file:
```bash
# Stop server (Ctrl+C)
npm run dev
```

### Step 5: Test Ads

1. **Rewarded Ad**: Dashboard → Watch Ad button → Ad should appear
2. **Banner Ad**: Bottom of any page after login
3. **Sidebar Ad**: Right side on desktop Dashboard
4. **Inline Ad**: Between content sections

---

## Ad Placement Details

### 1. Rewarded Ad (Watch Ad Modal)
- **Location**: Modal popup when clicking "Watch Ad"
- **Frequency**: 3 times per day per user
- **Size**: Full modal (responsive)
- **Best Format**: Social Bar or Pushunder

### 2. Bottom Banner Ad
- **Location**: Fixed at bottom of page
- **Visibility**: Always visible when logged in
- **Size**: 728x90 (desktop) or 320x50 (mobile)
- **Best Format**: Banner

### 3. Sidebar Ad
- **Location**: Right sidebar on desktop
- **Visibility**: Desktop only (hidden on mobile)
- **Size**: 300x250
- **Best Format**: Native or Display

### 4. Inline Ad
- **Location**: Between content sections
- **Visibility**: On Dashboard and Wallet pages
- **Size**: Responsive
- **Best Format**: Native or Banner

---

## Adsterra Recommended Ad Types

### For Maximum Revenue:
1. **Social Bar** - High CPM, works great for rewarded ads
2. **Pushunder** - Good revenue, user-friendly
3. **Native Ads** - Non-intrusive, blends with content
4. **Display Banners** - Reliable revenue

### Avoid:
- Pop-ups (bad user experience)
- Interstitial (too intrusive)
- Auto-redirect (against policies)

---

## Troubleshooting

### Ads Not Showing?

1. **Check `.env` file exists** in project root
2. **Verify script tags** are correct (no syntax errors)
3. **Restart dev server** after adding codes
4. **Check browser console** (F12) for errors
5. **Verify Adsterra account** is approved and active

### Ads Showing But Not Earning?

1. **Wait 24-48 hours** for statistics to update
2. **Check Adsterra dashboard** for impressions
3. **Verify traffic** is from approved domain
4. **Check ad unit settings** in Adsterra

### Script Error in Console?

- Make sure quotes are properly escaped
- Check for special characters in script
- Verify script tag format is correct

---

## Production Deployment

When deploying to Vercel/Firebase:

1. **Add Environment Variables** in hosting platform:
   - Vercel: Project Settings → Environment Variables
   - Firebase: Firebase Console → Functions → Config

2. **Add all 4 variables:**
   - `VITE_ADSTERRA_REWARDED_CODE`
   - `VITE_ADSTERRA_BANNER_CODE`
   - `VITE_ADSTERRA_SIDEBAR_CODE`
   - `VITE_ADSTERRA_INLINE_CODE`

3. **Redeploy** your site

---

## Revenue Optimization Tips

1. **Start with Banner Ad** - Easiest approval, good revenue
2. **Add Rewarded Ad** - Higher engagement, better rates
3. **A/B Test** - Try different ad sizes and positions
4. **Monitor Performance** - Check which ads perform best
5. **Mobile Optimized** - Ensure ads work on mobile devices

---

## Example .env File

```env
VITE_ADSTERRA_REWARDED_CODE="<script type='text/javascript'>atOptions = { 'key' : 'abc123', 'format' : 'iframe', 'height' : 90, 'width' : 728, 'params' : {} }; document.write('<scr' + 'ipt type=\"text/javascript\" src=\"//www.topcreativeformat.com/abc123/invoke.js\"></scr' + 'ipt>');</script>"

VITE_ADSTERRA_BANNER_CODE="<script type='text/javascript'>atOptions = { 'key' : 'xyz789', 'format' : 'iframe', 'height' : 90, 'width' : 728, 'params' : {} }; document.write('<scr' + 'ipt type=\"text/javascript\" src=\"//www.topcreativeformat.com/xyz789/invoke.js\"></scr' + 'ipt>');</script>"

VITE_ADSTERRA_SIDEBAR_CODE="<script type='text/javascript'>atOptions = { 'key' : 'def456', 'format' : 'iframe', 'height' : 250, 'width' : 300, 'params' : {} }; document.write('<scr' + 'ipt type=\"text/javascript\" src=\"//www.topcreativeformat.com/def456/invoke.js\"></scr' + 'ipt>');</script>"

VITE_ADSTERRA_INLINE_CODE="<script type='text/javascript'>atOptions = { 'key' : 'ghi012', 'format' : 'iframe', 'height' : 90, 'width' : 728, 'params' : {} }; document.write('<scr' + 'ipt type=\"text/javascript\" src=\"//www.topcreativeformat.com/ghi012/invoke.js\"></scr' + 'ipt>');</script>"
```

---

**Note**: Replace the example keys (`abc123`, `xyz789`, etc.) with your actual Adsterra ad unit codes!

