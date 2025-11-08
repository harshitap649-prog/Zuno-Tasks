# 🔗 AdGem Postback URL Setup Guide

## What is a Postback URL?

A **Postback URL** is where AdGem sends notifications when users complete offers. This is how your system knows to award points to users automatically.

---

## ⚠️ **IMPORTANT: Save Your Postback Key First!**

**Before filling the Postback URL, you MUST:**

1. **Copy the Postback Key:**
   - Your key: `39kld6hi67dh0m8ef5cgj52b`
   - **Copy it now and save it somewhere safe!**
   - ⚠️ **This key will never be shown again!**

2. **Save the Form First:**
   - Click "Save" or "Submit" button
   - This saves your Postback Key
   - Then you can configure the Postback URL

---

## 📝 **Postback URL Format**

### Option 1: Simple Format (Recommended for Start)

**Format:**
```
https://your-domain.com/api/adgem-postback?user_id={player_id}&amount={amount}&transaction_id={transaction_id}
```

**Example:**
```
https://zuno-tasks.vercel.app/api/adgem-postback?user_id={player_id}&amount={amount}&transaction_id={transaction_id}
```

**Replace:**
- `your-domain.com` with your actual domain
- Or use your Vercel URL: `zuno-tasks.vercel.app`

---

### Option 2: Complete Format (More Data)

**Format:**
```
https://your-domain.com/api/adgem-postback?app_id={app_id}&user_id={player_id}&amount={amount}&payout={payout}&offer_id={offer_id}&offer_name={offer_name}&transaction_id={transaction_id}&country={country}
```

**Example:**
```
https://zuno-tasks.vercel.app/api/adgem-postback?app_id={app_id}&user_id={player_id}&amount={amount}&payout={payout}&offer_id={offer_id}&transaction_id={transaction_id}
```

---

## 🎯 **Recommended Postback URL for Your System:**

### **Use This Format:**

```
https://zuno-tasks.vercel.app/api/adgem-postback?user_id={player_id}&amount={amount}&transaction_id={transaction_id}&offer_id={offer_id}
```

**Or if you have a custom domain:**

```
https://your-domain.com/api/adgem-postback?user_id={player_id}&amount={amount}&transaction_id={transaction_id}&offer_id={offer_id}
```

---

## 📋 **What Each Macro Does:**

| Macro | What It Contains | Why You Need It |
|-------|-----------------|-----------------|
| `{player_id}` | User's ID in AdGem | To identify which user completed the offer |
| `{amount}` | Points/reward amount | To award the correct points |
| `{transaction_id}` | Unique transaction ID | To prevent duplicate rewards |
| `{offer_id}` | The offer ID | To track which offer was completed |
| `{app_id}` | Your app ID | To verify the request |
| `{payout}` | Payout amount | Alternative to amount |

---

## ⚠️ **Important Notes:**

1. **Save Postback Key First:**
   - Copy: `39kld6hi67dh0m8ef5cgj52b`
   - Save it in a safe place
   - You'll need it to verify postback requests

2. **Use Your Actual Domain:**
   - Replace `zuno-tasks.vercel.app` with your actual domain
   - Or use your custom domain if you have one

3. **The API Endpoint Must Exist:**
   - You need to create `/api/adgem-postback` endpoint
   - This endpoint will receive the postback data
   - It should award points to users

---

## 🔧 **Next Steps After Filling Postback URL:**

1. ✅ **Save Postback Key** (copy it first!)
2. ✅ **Fill Postback URL** (use format above)
3. ✅ **Click "Save" or "Submit"**
4. ✅ **Create the API endpoint** in your code
5. ✅ **Test it** when a user completes an offer

---

## 🚀 **Quick Action:**

### **Step 1: Save Your Postback Key**
```
39kld6hi67dh0m8ef5cgj52b
```
**Copy this and save it!**

### **Step 2: Fill Postback URL**
Enter this (replace with your domain):
```
https://zuno-tasks.vercel.app/api/adgem-postback?user_id={player_id}&amount={amount}&transaction_id={transaction_id}&offer_id={offer_id}
```

### **Step 3: Save the Form**
- Click "Save" button
- Your configuration is saved

---

## ❓ **Common Questions:**

### "What if I don't have the API endpoint yet?"
- **Answer:** Fill the URL anyway - you can create the endpoint later
- The format is correct, you just need to implement it

### "What if I'm not sure about my domain?"
- **Answer:** Use your Vercel URL (check your Vercel dashboard)
- Or use your custom domain if you have one

### "Do I need all those macros?"
- **Answer:** Start with the simple format (user_id, amount, transaction_id)
- You can add more later if needed

---

## ✅ **API Endpoint Created!**

I've created the AdGem postback handler for you at `api/adgem-postback.js`. 

**The endpoint is ready!** You just need to:
1. Deploy it to Vercel (it will work automatically)
2. Use the Postback URL format below

---

## ✅ **Summary:**

1. **Copy Postback Key:** `39kld6hi67dh0m8ef5cgj52b` (save it!)
2. **Fill Postback URL:** Use the format below with your domain
3. **Save the form**
4. **API endpoint is ready** ✅ (already created at `api/adgem-postback.js`)

**The Postback URL tells AdGem where to send completion notifications!** 🎯

---

## 🚀 **Final Postback URL to Use:**

### **Copy and Paste This:**

```
https://zuno-tasks.vercel.app/api/adgem-postback?user_id={player_id}&amount={amount}&transaction_id={transaction_id}&offer_id={offer_id}
```

**Or if you have a custom domain:**

```
https://your-domain.com/api/adgem-postback?user_id={player_id}&amount={amount}&transaction_id={transaction_id}&offer_id={offer_id}
```

**Replace:**
- `zuno-tasks.vercel.app` with your actual Vercel domain
- Or use your custom domain if you have one

---

## ✅ **What Happens Next:**

1. User completes an AdGem offer
2. AdGem sends postback to your URL
3. Your API endpoint receives it
4. Points are awarded to the user automatically
5. User sees updated points in their dashboard

**Everything is set up! Just fill in the Postback URL and save!** 🎉

