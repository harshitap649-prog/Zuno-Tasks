# How to Enable Captcha Feature When Ready

## When You Get Your First Client:

### Step 1: Enable the Feature

1. Open `src/pages/SolveCaptchas.jsx`
2. Find this line (around line 92):
   ```javascript
   {/* <CaptchaSolver userId={user.uid} onComplete={handleCaptchaComplete} /> */}
   ```
3. Uncomment it:
   ```javascript
   <CaptchaSolver userId={user.uid} onComplete={handleCaptchaComplete} />
   ```

4. Remove or comment out the "Coming Soon" section (lines 64-89)

### Step 2: Enable Dashboard Button

1. Open `src/pages/Dashboard.jsx`
2. Find the "Solve Captchas" section (around line 344)
3. Replace the disabled button with:
   ```javascript
   <button
     onClick={() => navigate('/captchas')}
     className="btn-primary flex items-center"
   >
     <ShieldCheck className="w-5 h-5 mr-2" />
     Open
   </button>
   ```
4. Remove the "Feature Coming Soon" badge

### Step 3: Test

1. Go to Admin Panel → Captchas Tab
2. Submit a test captcha
3. Go to Dashboard → Click "Solve Captchas"
4. Verify users can solve captchas

## Quick Enable Script:

When ready, just:
1. Uncomment `<CaptchaSolver>` in `SolveCaptchas.jsx`
2. Remove "Coming Soon" message
3. Enable button in `Dashboard.jsx`

That's it! The feature is ready to go.

