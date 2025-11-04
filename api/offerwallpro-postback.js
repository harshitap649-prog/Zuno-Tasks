// Simple Vercel serverless endpoint to receive Offerwall PRO postbacks
// and optionally forward them to a backend (e.g., Firebase Cloud Function).

export default async function handler(req, res) {
  // Allow both GET and POST (Offerwall providers vary)
  const method = req.method || 'GET';

  // Basic CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  try {
    const forwardUrl = process.env.POSTBACK_FORWARD_URL || '';
    const secret = process.env.POSTBACK_SECRET || '';

    // Merge query and body; many providers send GET query params
    const payload = {
      ...req.query,
      ...(typeof req.body === 'object' ? req.body : {}),
      // Attach secret if we have one configured
      ...(secret ? { secret } : {}),
    };

    if (!forwardUrl) {
      // No forwarding configured: acknowledge success so provider accepts the postback
      // You can inspect logs in Vercel to see payloads and wire real processing later.
      res.status(200).json({ success: true, forwarded: false });
      return;
    }

    const forwardResp = await fetch(forwardUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const text = await forwardResp.text();

    // Try to return JSON if possible, otherwise raw text
    try {
      const json = JSON.parse(text);
      res.status(forwardResp.status).json(json);
    } catch (_) {
      res.status(forwardResp.status).send(text);
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}


