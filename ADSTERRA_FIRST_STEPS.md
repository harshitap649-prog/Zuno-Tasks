# 🎯 Adsterra: First Ad Setup Guide

## Recommended Order for Your First Ads

### **Step 1: Create Banner Ad (START HERE)**

**Why First:**
- ✅ Easiest to get approved
- ✅ Highest approval rate
- ✅ Good revenue, reliable
- ✅ Non-intrusive user experience

**What to Create:**
1. Login to Adsterra: https://publishers.adsterra.com/
2. Go to **"Ad Units"** → **"Create New Ad Unit"**
3. Select **"Banner"**
4. Choose size: **728x90** (Leaderboard) or **320x50** (Mobile Banner)
5. Name it: `ZunoTasks Bottom Banner`
6. Copy the script code

**Where it goes:**
- Add to `.env` as: `VITE_ADSTERRA_BANNER_CODE`

---

### **Step 2: Create Social Bar Ad (For Rewarded Ads)**

**Why Second:**
- ✅ Works great for "Watch Ad" modal
- ✅ Good user experience
- ✅ Higher engagement = better rates
- ✅ User-friendly format

**What to Create:**
1. **Ad Units** → **"Create New Ad Unit"**
2. Select **"Social Bar"**
3. Name it: `ZunoTasks Rewarded Ad`
4. Copy the script code

**Where it goes:**
- Add to `.env` as: `VITE_ADSTERRA_REWARDED_CODE`

---

### **Step 3: Create Native Banner (For Sidebar/Inline)**

**Why Third:**
- ✅ Blends with your content
- ✅ Less intrusive
- ✅ Better user experience
- ✅ Good for sidebar positioning

**What to Create:**
1. **Ad Units** → **"Create New Ad Unit"**
2. Select **"Native Banner"**
3. Choose size: **300x250** (Medium Rectangle) for sidebar
4. Name it: `ZunoTasks Sidebar Native`
5. Copy the script code

**Where it goes:**
- Add to `.env` as: `VITE_ADSTERRA_SIDEBAR_CODE`
- Also use for: `VITE_ADSTERRA_INLINE_CODE` (same or different unit)

---

## 📋 Complete Setup Checklist

### Quick Start (Minimum Setup):
- [ ] 1 Banner Ad → Bottom of page
- [ ] 1 Social Bar → Watch Ad modal
- [ ] Done! Start earning

### Full Setup (Recommended):
- [ ] 1 Banner Ad → Bottom banner
- [ ] 1 Social Bar → Rewarded ads
- [ ] 1 Native Banner → Sidebar
- [ ] 1 Native Banner → Inline ads

---

## 🚀 Your First 3 Ad Units (Recommended)

### Unit 1: Banner (Bottom)
```
Type: Banner
Size: 728x90 (or 320x50 for mobile)
Name: Bottom Banner
Location: Bottom of page
.env variable: VITE_ADSTERRA_BANNER_CODE
```

### Unit 2: Social Bar (Rewarded)
```
Type: Social Bar
Name: Rewarded Ad
Location: Watch Ad modal
.env variable: VITE_ADSTERRA_REWARDED_CODE
```

### Unit 3: Native Banner (Sidebar)
```
Type: Native Banner
Size: 300x250
Name: Sidebar Ad
Location: Right sidebar (desktop)
.env variable: VITE_ADSTERRA_SIDEBAR_CODE
```

---

## ⚠️ What NOT to Use Initially

### ❌ Popunder
- **Why avoid:** Too intrusive, users hate it, can hurt retention
- **When to use:** Only if you have very high traffic and need extra revenue
- **Impact:** Might reduce user satisfaction

### ❌ Smartlink
- **Why avoid:** Can redirect users away from your site
- **When to use:** Never for main content areas
- **Impact:** Bad user experience, users leave your site

### ✅ Use Later (Optional)
- **Popunder:** Only after you have steady traffic and want to maximize revenue
- **Smartlink:** Maybe for exit intent, but not recommended for main pages

---

## 💰 Revenue Potential

### Best Revenue (High Traffic):
1. **Popunder** - Highest CPM but intrusive
2. **Social Bar** - Good CPM, user-friendly
3. **Smartlink** - Good revenue but redirects users

### Best Balance (Recommended):
1. **Banner** - Reliable, steady revenue
2. **Native Banner** - Good rates, blends with content
3. **Social Bar** - High engagement, good rates

### Start Strategy:
- **Week 1:** Banner + Social Bar
- **Week 2:** Add Native Banner
- **Month 2:** Consider Popunder if traffic is high

---

## 📝 Your .env File Structure

After creating your first 3 ad units:

```env
# Step 1: Bottom Banner (START HERE)
VITE_ADSTERRA_BANNER_CODE="<script type='text/javascript'>...your banner code...</script>"

# Step 2: Social Bar for Rewarded Ads
VITE_ADSTERRA_REWARDED_CODE="<script type='text/javascript'>...your social bar code...</script>"

# Step 3: Native Banner for Sidebar (Optional but recommended)
VITE_ADSTERRA_SIDEBAR_CODE="<script type='text/javascript'>...your native banner code...</script>"

# Step 4: Inline Ad (can use same as sidebar or different)
VITE_ADSTERRA_INLINE_CODE="<script type='text/javascript'>...your native banner code...</script>"
```

---

## 🎯 Action Plan

### Today:
1. ✅ Create **Banner Ad** in Adsterra
2. ✅ Add code to `.env` as `VITE_ADSTERRA_BANNER_CODE`
3. ✅ Restart server: `npm run dev`
4. ✅ Test: Check bottom of page

### Tomorrow:
5. ✅ Create **Social Bar** in Adsterra
6. ✅ Add code to `.env` as `VITE_ADSTERRA_REWARDED_CODE`
7. ✅ Test: Click "Watch Ad" button

### This Week:
8. ✅ Create **Native Banner** in Adsterra
9. ✅ Add code to `.env` as `VITE_ADSTERRA_SIDEBAR_CODE`
10. ✅ Test: Check right sidebar on Dashboard

---

## 💡 Pro Tips

1. **Start Small:** Begin with Banner + Social Bar (2 ads)
2. **Test Each:** Add one ad at a time, test it works
3. **Monitor Revenue:** Check Adsterra dashboard daily
4. **User Feedback:** Make sure ads don't hurt user experience
5. **A/B Test:** Try different sizes and positions

---

## ✅ Recommended Final Setup

**After you're comfortable:**
- Bottom: **Banner** (always visible)
- Watch Ad: **Social Bar** (3/day)
- Sidebar: **Native Banner** (desktop)
- Inline: **Native Banner** (between content)

**This gives you:**
- ✅ Good revenue
- ✅ Non-intrusive experience
- ✅ User-friendly
- ✅ Mobile optimized

---

**Remember:** Start with Banner, then Social Bar. Add Native Banner later. Avoid Popunder/Smartlink initially!

