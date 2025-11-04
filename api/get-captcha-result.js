// Vercel serverless endpoint for clients to check if their captcha is solved
// Clients poll this endpoint with their captchaId

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).send('OK');
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { captchaId } = req.query;

    if (!captchaId) {
      return res.status(400).json({ error: 'Missing captchaId' });
    }

    // Query Firestore to check if captcha is solved
    // Note: This requires Firebase Admin SDK setup (see API_DEPLOYMENT_GUIDE.md)
    // TODO: Add Firebase Admin SDK integration
    // const admin = require('firebase-admin');
    // if (!admin.apps.length) {
    //   admin.initializeApp({
    //     credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_ADMIN_SDK))
    //   });
    // }
    // const db = admin.firestore();
    // const snapshot = await db.collection('clientCaptchas')
    //   .where('captchaId', '==', captchaId)
    //   .limit(1)
    //   .get();
    // if (!snapshot.empty) {
    //   const data = snapshot.docs[0].data();
    //   return res.json({ success: true, ...data });
    // }

    return res.status(200).json({
      success: true,
      captchaId,
      status: 'pending', // pending, solving, solved, expired
      solution: null,
      message: 'This endpoint needs Firebase Admin SDK setup. Use Firestore functions directly or see API_DEPLOYMENT_GUIDE.md',
      warning: 'Endpoint not fully configured. Use Admin Panel or Firestore functions for now.',
    });

  } catch (error) {
    console.error('Error getting captcha result:', error);
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
}

