// AdGem Postback Handler for Vercel Serverless Function
// This endpoint receives postback notifications from AdGem when users complete offers

export default async function handler(req, res) {
  // Allow both GET and POST (AdGem may use either)
  const method = req.method || 'GET';

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  try {
    // Get parameters from query string (GET) or body (POST)
    const params = method === 'GET' ? req.query : req.body;
    
    // Extract AdGem postback data
    const userId = params.user_id || params.player_id || params.userId;
    const amount = params.amount || params.payout || params.points || 0;
    const transactionId = params.transaction_id || params.transactionId;
    const offerId = params.offer_id || params.offerId;
    const appId = params.app_id || params.appId;
    
    console.log('📨 AdGem Postback Received:', {
      userId,
      amount,
      transactionId,
      offerId,
      appId,
      method,
      allParams: params
    });

    // Validate required parameters
    if (!userId) {
      console.warn('⚠️ AdGem postback missing userId');
      res.status(400).json({ success: false, error: 'Missing user_id' });
      return;
    }

    if (!amount || amount === '0') {
      console.warn('⚠️ AdGem postback missing or zero amount');
      res.status(400).json({ success: false, error: 'Missing or invalid amount' });
      return;
    }

    // Convert amount to points (if needed)
    const rewardPoints = parseInt(amount) || 0;
    
    if (rewardPoints <= 0) {
      console.warn('⚠️ AdGem postback invalid reward points:', rewardPoints);
      res.status(400).json({ success: false, error: 'Invalid reward amount' });
      return;
    }

    // Forward to Firebase Cloud Function or process directly
    const forwardUrl = process.env.ADGEM_POSTBACK_FORWARD_URL || process.env.POSTBACK_FORWARD_URL;
    
    if (forwardUrl) {
      // Forward to your backend (Firebase Cloud Function, etc.)
      try {
        const forwardPayload = {
          userId,
          offerId: offerId || 'adgem_offer',
          rewardPoints,
          transactionId,
          source: 'adgem',
          timestamp: new Date().toISOString(),
          rawParams: params
        };

        const forwardResp = await fetch(forwardUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(forwardPayload),
        });

        const forwardText = await forwardResp.text();
        console.log('✅ AdGem postback forwarded:', forwardResp.status);

        // Return success to AdGem
        res.status(200).json({ 
          success: true, 
          message: 'Postback processed',
          forwarded: true 
        });
        return;
      } catch (forwardError) {
        console.error('❌ Error forwarding AdGem postback:', forwardError);
        // Still return success to AdGem (don't fail the postback)
        res.status(200).json({ 
          success: true, 
          message: 'Postback received (forward failed)',
          error: forwardError.message 
        });
        return;
      }
    }

    // If no forward URL, just acknowledge (you can process later)
    // AdGem expects a 200 response to confirm receipt
    console.log('✅ AdGem postback acknowledged (no forward URL configured)');
    res.status(200).json({ 
      success: true, 
      message: 'Postback received',
      userId,
      rewardPoints,
      transactionId,
      forwarded: false,
      note: 'Configure ADGEM_POSTBACK_FORWARD_URL to process postbacks'
    });

  } catch (error) {
    console.error('❌ Error processing AdGem postback:', error);
    // Still return 200 to AdGem (don't fail the postback)
    res.status(200).json({ 
      success: false, 
      error: error.message,
      note: 'Postback received but processing failed'
    });
  }
}

