# 🧩 CPX Research Quiz Integration - Setup Guide

## ✅ What's Been Added

1. **CPXResearchQuiz Component** - High-paying quiz component
2. **Admin Panel Configuration** - Easy setup interface
3. **Quizzes Category Integration** - Appears in Quizzes tab
4. **Point Awarding System** - Automatic points after quiz completion
5. **Firestore Settings** - Global configuration storage

## 🚀 How to Set Up

### Step 1: Get Your CPX Research Credentials

1. Go to: https://cpx-research.com/publishers
2. Sign up (usually **instant approval**)
3. Get your **Offerwall URL** or **API Key** from dashboard
4. The URL typically looks like:
   - `https://offers.cpx-research.com/?pub=YOUR_PUB_ID`
   - Or similar format

### Step 2: Configure in Admin Panel

1. Go to your website → **Admin Panel**
2. Click on **"Offers"** tab
3. Click **"CPX Research (Quizzes)"** button
4. Enter either:
   - **API Key** (if you have one)
   - **Offerwall URL** (recommended - paste your full URL)
5. Click **"Enable CPX Research"**
6. Done! ✅

### Step 3: Users Can Now Complete Quizzes

Users will see **"CPX Research Quizzes"** in the **Quizzes** category on the Tasks page.

## 📍 Where It Appears

- **Location**: Tasks page → **Quizzes** tab
- **Display**: "CPX Research Quizzes" card with indigo/purple gradient button
- **Action**: Click "Start Quiz" to open quiz offerwall

## 💰 Revenue Benefits

- ✅ **High Paying**: CPX Research offers some of the highest payouts for quizzes
- ✅ **Instant Approval**: Get approved immediately (usually automatic)
- ✅ **Good Conversion**: Users earn points, you earn revenue
- ✅ **Multiple Quizzes**: Users can complete multiple quizzes

## 🎯 Features

- ✅ **Automatic Point Awarding**: Points added after quiz completion
- ✅ **Duplicate Prevention**: Each quiz only awards once
- ✅ **PostMessage Support**: Listens for completion events
- ✅ **New Tab Option**: Users can open in new tab if iframe has issues
- ✅ **Real-time Updates**: Changes sync across all users instantly

## 🔧 Configuration Options

### Option 1: Offerwall URL (Recommended)
- Paste your full offerwall URL from CPX Research dashboard
- Can include `{USER_ID}`, `{sub}`, or `{subid}` placeholder
- System will automatically replace with actual user ID

### Option 2: API Key
- Enter your API key if provided
- System will construct the URL automatically

## 📊 Revenue Tracking

- Points are awarded with transaction type: `'quiz'`
- All completions tracked in Firestore
- Check Admin Panel → Stats for revenue metrics

## 🐛 Troubleshooting

### Quizzes Not Showing?
- Check Admin Panel → Verify configuration is saved
- Check browser console for errors
- Ensure user is logged in

### Points Not Awarding?
- Check browser console for completion messages
- Verify postMessage events are being received
- Try clicking "Open in New Tab" button

### Configuration Not Saving?
- Check Firestore permissions
- Verify you're logged in as admin
- Check browser console for errors

## 📝 Next Steps

1. **Sign Up**: Go to CPX Research and create account (instant approval)
2. **Get URL**: Copy your offerwall URL from dashboard
3. **Configure**: Add URL in Admin Panel
4. **Test**: Complete a quiz yourself to verify points are awarded
5. **Monitor**: Check Admin Panel stats to track revenue

## 🎉 You're All Set!

CPX Research is known for:
- **High revenue per quiz** (often higher than CPAlead)
- **Instant approval** (no waiting)
- **Good user experience** (easy quizzes)

Once configured, users can complete high-paying quizzes and earn points immediately!

