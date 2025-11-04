// Vercel serverless endpoint to accept captchas from clients
// Clients submit captchas here, and your users will solve them

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).send('OK');
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { captchaImage, captchaType = 'image', clientId, clientSecret } = req.body;

    // Basic validation
    if (!captchaImage) {
      return res.status(400).json({ error: 'Missing captchaImage' });
    }

    // Security: Verify client secret (optional but recommended)
    // For now, we'll accept all requests. In production, validate clientSecret
    const expectedSecret = process.env.CAPTCHA_CLIENT_SECRET || '';
    if (expectedSecret && clientSecret !== expectedSecret) {
      return res.status(401).json({ error: 'Invalid client secret' });
    }

    // Generate unique captcha ID
    const captchaId = `captcha_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Store captcha in Firestore
    // Note: This requires Firebase Admin SDK setup (see API_DEPLOYMENT_GUIDE.md)
    // For now, this endpoint returns the captcha ID but doesn't store it
    // Use Admin Panel test form or Firestore functions directly for now
    
    // TODO: Add Firebase Admin SDK integration
    // const admin = require('firebase-admin');
    // if (!admin.apps.length) {
    //   admin.initializeApp({
    //     credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_ADMIN_SDK))
    //   });
    // }
    // const db = admin.firestore();
    // await db.collection('clientCaptchas').add({ ...captchaData });

    const captchaData = {
      captchaId,
      captchaImage,
      captchaType,
      clientId: clientId || 'anonymous',
      status: 'pending',
      submittedAt: new Date().toISOString(),
      assignedTo: null,
      solution: null,
      solvedAt: null,
    };

    // Return captcha ID to client
    // IMPORTANT: This endpoint doesn't store to Firestore yet
    // Use Admin Panel → Captchas Tab → Submit Test Captcha for now
    return res.status(200).json({
      success: true,
      captchaId,
      message: 'Captcha submitted successfully. NOTE: This endpoint needs Firebase Admin SDK setup to store in Firestore. Use Admin Panel test form for now. See API_DEPLOYMENT_GUIDE.md for setup instructions.',
      resultEndpoint: `/api/get-captcha-result?captchaId=${captchaId}`,
      warning: 'This endpoint is not fully configured. Use Admin Panel test form or see API_DEPLOYMENT_GUIDE.md',
    });

  } catch (error) {
    console.error('Error submitting captcha:', error);
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
}

