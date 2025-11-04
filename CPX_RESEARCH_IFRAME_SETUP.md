# 🎯 CPX Research - How to Use Your Iframe Code

## ✅ Your CPX Research Details:
- **App ID**: `29825`
- **App Name**: zunotasks
- **Status**: Active ✅

## 📋 Your Iframe Code:
```html
<iframe width="100%" frameBorder="0" height="2000px" src="https://offers.cpx-research.com/index.php?app_id=29825&ext_user_id={unique_user_id}&secure_hash={secure_hash}&username={user_name}&email={user_email}&subid_1=&subid_2"></iframe>
```

## 🔧 How to Use This in Admin Panel:

### Step 1: Extract the URL from iframe

From your iframe code, copy **ONLY the `src` URL**:

```
https://offers.cpx-research.com/index.php?app_id=29825&ext_user_id={unique_user_id}&secure_hash={secure_hash}&username={user_name}&email={user_email}&subid_1=&subid_2
```

### Step 2: Configure in Admin Panel

1. Go to **Admin Panel** → **Offers** tab
2. Click **"CPX Research (Quizzes)"** button
3. Paste the URL above in the **"Offerwall URL"** field
4. Click **"Enable CPX Research"**
5. ✅ Done!

## 🎯 What Happens Automatically:

The system will automatically replace:
- `{unique_user_id}` → User's actual Firebase UID
- `{user_name}` → User's name from their profile
- `{user_email}` → User's email address
- `{secure_hash}` → (Optional - can be left empty or removed)
- `subid_1` and `subid_2` → (Optional - will be empty)

## ⚙️ About Secure Hash (Optional):

**Current Status**: Secure hash is optional. You can:
- **Option 1**: Remove `&secure_hash={secure_hash}` from the URL (simplest)
- **Option 2**: Keep it empty (system will remove it automatically)
- **Option 3**: Get your secure hash key from CPX Research dashboard and configure it later

**To get secure hash key**:
1. Go to CPX Research dashboard → Your app settings
2. Look for "Secure Hash" or "App Secure Hash"
3. Copy it (we can add this feature later if needed)

## 📝 Recommended URL (Simplified):

For now, use this simplified URL (works perfectly):

```
https://offers.cpx-research.com/index.php?app_id=29825&ext_user_id={unique_user_id}&username={user_name}&email={user_email}
```

This includes:
- ✅ App ID (required)
- ✅ User ID (required) 
- ✅ Username (recommended)
- ✅ Email (recommended)
- ❌ Secure hash (optional - removed for now)
- ❌ subid_1 and subid_2 (optional - not needed)

## 🚀 Quick Setup:

1. **Copy this URL**:
   ```
   https://offers.cpx-research.com/index.php?app_id=29825&ext_user_id={unique_user_id}&username={user_name}&email={user_email}
   ```

2. **Paste in Admin Panel** → CPX Research → Offerwall URL

3. **Click "Enable CPX Research"**

4. **Test it** - Go to Tasks → Quizzes tab

## 💡 What Each Parameter Does:

- **`app_id=29825`**: Your CPX Research app ID (required)
- **`ext_user_id={unique_user_id}`**: User's unique ID (automatically replaced)
- **`username={user_name}`**: User's name (automatically replaced)
- **`email={user_email}`**: User's email (automatically replaced, helps prevent duplicates)
- **`secure_hash={secure_hash}`**: Security hash (optional, can skip for now)
- **`subid_1` and `subid_2`**: Additional tracking (optional, can leave empty)

## 🎉 You're Ready!

Once configured, users will see high-paying CPX Research quizzes in the Quizzes category. The system handles all the parameter replacements automatically!

