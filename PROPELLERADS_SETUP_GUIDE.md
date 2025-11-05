# PropellerAds Setup Guide for Interstitial Ads

## Important: You Need Zone IDs, Not Campaigns

As a **publisher** (website owner), you need to create **Zones** in PropellerAds, not campaigns. Campaigns are for advertisers who want to run ads.

## Step-by-Step Guide to Get Your Interstitial Zone ID

### Step 1: Navigate to Zone Groups

1. In your PropellerAds dashboard, look at the **left sidebar**
2. Click on **"Zone groups"** (NOT "Create campaign")
3. This will take you to the zone management page

### Step 2: Create an Interstitial Zone

1. Click **"Create Zone"** or **"Add Zone"** button
2. Select **"Interstitial"** as the ad format
3. Fill in the zone configuration:
   - **Zone Name**: Give it a descriptive name (e.g., "My Website - Interstitial Ads")
   - **Website**: Select your website from the list
   - **Format**: Interstitial
   - **Size**: Usually auto-selected for interstitial
4. Click **"Create"** or **"Save"**

### Step 3: Get Your Zone ID

1. After creating the zone, you'll see it in your zones list
2. The **Zone ID** will be displayed (usually a number like `12345678`)
3. **Copy this Zone ID** - you'll need it for the Admin Panel

### Step 4: Configure in Your Admin Panel

1. Go to your website's **Admin Panel**
2. Navigate to **Offers Tab**
3. Click the **"PropellerAds"** button
4. Paste your **Interstitial Zone ID** in the field:
   - **"PropellerAds Interstitial Zone ID (For Watch Ad)"**
5. Click **"Enable PropellerAds"**
6. Done! Your Watch Ad feature will now show PropellerAds interstitial ads

## Banner Ads Setup (Optional)

If you also want banner ads:

1. In **Zone Groups**, create another zone
2. Select **"Banner"** as the format
3. Get the Banner Zone ID
4. Paste it in the Admin Panel field:
   - **"PropellerAds Banner Zone ID"**

## Important Notes

- **Zone Groups** = For publishers (you) to create zones where ads will appear
- **Create Campaign** = For advertisers who want to run ads (not what you need)
- The Zone ID is what connects your website to PropellerAds' ad network
- You can have multiple zones (banner, interstitial, etc.) with different IDs
- Make sure your website is approved in PropellerAds before zones will work

## Troubleshooting

**Q: I can't find "Zone Groups" in the sidebar**
- Make sure you're logged in as a publisher account, not an advertiser account
- Contact PropellerAds support if you don't see this option

**Q: Ads aren't showing**
- Verify your Zone ID is correct
- Check that your website is approved in PropellerAds
- Ensure popup blockers are disabled for testing
- Check browser console for any errors

**Q: What's the difference between Zone ID and Campaign?**
- **Zone ID**: Created by publishers (you) to define WHERE ads appear on your site
- **Campaign**: Created by advertisers to define WHAT ads to show
- You only need Zone IDs for your website integration

## Need Help?

If you're still having trouble finding the Zone Groups section or creating zones, contact PropellerAds support and mention you're a publisher trying to create zones for website monetization.

