# 🎥 Ayet Studios Video Integration - Setup Guide

## ✅ What's Been Added

1. **AyetStudiosOfferwall Component** - Video watching component
2. **Admin Panel Configuration** - Easy setup interface
3. **Videos Category Integration** - Appears in Videos tab
4. **Point Awarding System** - Automatic points after video completion
5. **Firestore Settings** - Global configuration storage

## 🚀 How to Set Up

### Step 1: Get Your Ayet Studios Credentials

1. Go to: https://ayetstudios.com/publishers
2. Sign up or log in
3. Get your **Offerwall URL** or **API Key** from dashboard
4. The URL typically looks like:
   - `https://offerwall.ayetstudios.com/?pub=YOUR_PUB_ID`
   - Or similar format

### Step 2: Configure in Admin Panel

1. Go to your website → **Admin Panel**
2. Click on **"Offers"** tab
3. Click **"Ayet Studios (Videos)"** button
4. Enter either:
   - **API Key** (if you have one)
   - **Offerwall URL** (recommended - paste your full URL)
5. Click **"Enable Ayet Studios"**
6. Done! ✅

### Step 3: Users Can Now Watch Videos

Users will see **"Ayet Studios Videos"** in the **Videos** category on the Tasks page.

## 📍 Where It Appears

- **Location**: Tasks page → **Videos** tab
- **Display**: "Ayet Studios Videos" card with red/orange gradient button
- **Action**: Click "Watch Videos" to open video offerwall

## 💰 How It Works

1. User clicks "Watch Videos" button
2. Ayet Studios offerwall opens (iframe or new tab)
3. User watches videos
4. Points are automatically awarded after completion
5. Points appear in user's dashboard

## 🎯 Features

- ✅ **Automatic Point Awarding**: Points added after video completion
- ✅ **Duplicate Prevention**: Each video only awards once
- ✅ **PostMessage Support**: Listens for completion events
- ✅ **New Tab Option**: Users can open in new tab if iframe has issues
- ✅ **Real-time Updates**: Changes sync across all users instantly

## 🔧 Configuration Options

### Option 1: Offerwall URL (Recommended)
- Paste your full offerwall URL from Ayet Studios dashboard
- Can include `{USER_ID}` or `{sub}` placeholder
- System will automatically replace with actual user ID

### Option 2: API Key
- Enter your API key if provided
- System will construct the URL automatically

## 📊 Revenue Tracking

- Points are awarded with transaction type: `'video'`
- All completions tracked in Firestore
- Check Admin Panel → Stats for revenue metrics

## 🐛 Troubleshooting

### Videos Not Showing?
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

1. **Get Approved**: Wait for Ayet Studios approval (usually instant)
2. **Configure**: Add your offerwall URL in Admin Panel
3. **Test**: Watch a video yourself to verify points are awarded
4. **Monitor**: Check Admin Panel stats to track revenue

## 🎉 You're All Set!

Once configured, users can watch videos and earn points immediately. The integration is ready to go!

