# How to Get Captcha Images for Testing

## Quick Test Methods:

### Method 1: Use Online Captcha Generator
1. Go to: https://www.google.com/recaptcha/api2/demo
2. Or search "captcha generator" on Google
3. Take a screenshot of the captcha
4. Convert to base64:
   - Go to https://www.base64-image.de/
   - Upload screenshot
   - Copy the base64 string
   - Paste in Admin Panel form

### Method 2: Use a Captcha Image URL
1. Find any captcha image online
2. Right-click → Copy image address
3. Paste URL directly in Admin Panel form
4. Example: `https://example.com/captcha.png`

### Method 3: Create Simple Test Image
1. Create a simple image with text (like "ABC123")
2. Convert to base64 using: https://www.base64-image.de/
3. Paste in Admin Panel

### Method 4: Use Real Captcha from 2Captcha
1. Sign up at https://2captcha.com
2. Use their API to get captcha images
3. Submit to your system

## For Production (Real Clients):

Clients will submit captchas from:
- Their websites that need captcha solving
- Their applications
- Via API integration

