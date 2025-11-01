# OfferToro Integration Setup Guide

This guide will help you integrate OfferToro into your website to start earning revenue through task completions.

## Step 1: Sign Up for OfferToro

1. Visit [https://www.offertoro.com/](https://www.offertoro.com/)
2. Click "Sign Up" and create an account
3. Complete the registration process
4. Verify your email address

## Step 2: Get Your API Key

1. Log in to your OfferToro dashboard
2. Navigate to **Settings** or **API Settings**
3. Find your **Publisher ID** or **API Key**
4. Copy this key (you'll need it in the next step)

## Step 3: Configure OfferToro in Admin Panel

1. Log in to your website as an admin
2. Go to **Admin Panel** → **Offers** tab
3. Click the **"OfferToro"** button (purple button)
4. Enter your OfferToro API key in the input field
5. Click **"Enable OfferToro"**
6. Your API key will be saved automatically

## Step 4: Test the Integration

1. Go to the **Tasks** page (click "View All Tasks" from Dashboard)
2. You should see a new section called **"OfferToro Tasks"**
3. Click **"View OfferToro Tasks"** to see the offerwall
4. The offerwall will display various tasks users can complete

## Step 5: Configure Postback URL (Important!)

To automatically reward users when they complete tasks, you need to set up a postback URL:

1. In your OfferToro dashboard, go to **Settings** → **Postback URL**
2. Set your postback URL to:
   ```
   https://your-website.com/api/offertoro/postback
   ```
   (Replace with your actual website URL)

3. This will allow OfferToro to notify your server when a task is completed
4. Your server will then automatically award points to the user

## How It Works

### For Users:
1. User visits the **Tasks** page
2. They see two sections:
   - **OfferToro Tasks**: High-paying tasks from OfferToro network
   - **Available Tasks**: Manual tasks you've added
3. When they complete an OfferToro task:
   - They earn rewards directly through OfferToro
   - Your system can track the completion and award additional points

### For You (Revenue):
- Each time a user completes an OfferToro task, you earn a commission
- Typical earnings: $0.50 - $15+ per task completion
- You pay users points (which you control), but earn actual money
- Profit margin: Usually 70-90% after paying users

## Example Earnings

**Scenario**: User completes "Install Game XYZ - Reach Level 5"

- **Your commission from OfferToro**: $2.50
- **You award user**: 200 points (₹2.00)
- **Your profit**: ₹183 per completion

If 50 users complete this task daily:
- **Daily profit**: ₹9,150
- **Monthly profit**: ₹2,74,500

## Troubleshooting

### OfferToro offerwall not showing?
- Make sure you've entered the API key in Admin Panel
- Check that the API key is correct
- Refresh the page after saving

### Tasks not appearing?
- OfferToro shows tasks based on user's device and location
- Some tasks may only appear on mobile devices
- Try accessing from different devices

### Postback not working?
- Verify the postback URL is correctly set in OfferToro dashboard
- Check your server logs for incoming requests
- Make sure your server can receive POST requests

## Support

- **OfferToro Support**: Contact them through their dashboard
- **Documentation**: [OfferToro Help Center](https://www.offertoro.com/help)

## Next Steps

Once OfferToro is set up:
1. Monitor task completion rates
2. Adjust point rewards based on profitability
3. Add more manual tasks for variety
4. Track your earnings in the Admin Panel

---

**Note**: OfferToro primarily uses an iframe-based offerwall. The tasks shown are dynamically loaded from OfferToro's servers based on the user's device, location, and preferences.

