/**
 * OfferToro Integration Utility
 * 
 * OfferToro provides an offerwall system that can be integrated in two ways:
 * 1. Iframe Embed (simpler, recommended)
 * 2. API Integration (requires additional setup)
 * 
 * To get your API key:
 * 1. Sign up at https://www.offertoro.com/
 * 2. Add your website to your account
 * 3. Get your API key from the dashboard
 */

const OFFERTORO_BASE_URL = 'https://www.offertoro.com';

/**
 * Get OfferToro Offerwall URL for iframe embedding
 * @param {string} apiKey - Your OfferToro API key (Publisher ID)
 * @param {string} userId - Unique user ID for tracking
 * @param {object} options - Additional options (currency, language, etc.)
 * @returns {string} Offerwall URL
 */
export const getOfferwallUrl = (apiKey, userId, options = {}) => {
  if (!apiKey || !userId) {
    console.error('OfferToro: API key and User ID are required');
    return null;
  }

  // OfferToro offerwall URL format: https://www.offertoro.com/offerwall/[PUBLISHER_ID]/[USER_ID]
  // Additional parameters can be added as query strings
  const params = new URLSearchParams({
    ...(options.currency && { currency: options.currency }),
    ...(options.language && { lang: options.language }),
  });

  const baseUrl = `${OFFERTORO_BASE_URL}/offerwall/${apiKey}/${userId}`;
  const queryString = params.toString();
  
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
};

/**
 * Fetch offers from OfferToro API (if available)
 * Note: OfferToro primarily uses iframe offerwalls, but some plans may have API access
 * @param {string} apiKey - Your OfferToro API key
 * @param {string} userId - User ID for tracking
 * @returns {Promise<Array>} Array of offers
 */
export const fetchOffersFromAPI = async (apiKey, userId) => {
  try {
    // Note: This is a placeholder. OfferToro's API endpoint may vary
    // Check their documentation or contact support for the correct endpoint
    const response = await fetch(
      `${OFFERTORO_BASE_URL}/api/v1/offers?api_key=${apiKey}&user_id=${userId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`OfferToro API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.offers || [];
  } catch (error) {
    console.error('Error fetching OfferToro offers:', error);
    // Return empty array if API is not available or fails
    return [];
  }
};

/**
 * Convert OfferToro offer to our internal format
 * @param {object} offerToroOffer - Offer from OfferToro
 * @returns {object} Formatted offer for our system
 */
export const formatOfferToroOffer = (offerToroOffer) => {
  return {
    title: offerToroOffer.name || offerToroOffer.title || 'Complete Task',
    description: offerToroOffer.description || offerToroOffer.instructions || 'Complete this task to earn rewards',
    rewardPoints: Math.round((offerToroOffer.reward || offerToroOffer.payout || 0) * 100), // Convert to points (assuming $1 = 100 points)
    link: offerToroOffer.tracking_url || offerToroOffer.url || '',
    offerId: offerToroOffer.offer_id || offerToroOffer.id || '',
    category: offerToroOffer.category || 'general',
    source: 'offertoro',
    active: true,
  };
};

/**
 * Validate OfferToro API key format
 * @param {string} apiKey - API key to validate
 * @returns {boolean} True if valid format
 */
export const validateApiKey = (apiKey) => {
  if (!apiKey || typeof apiKey !== 'string') {
    return false;
  }
  // OfferToro API keys are typically alphanumeric strings
  return apiKey.length > 10 && /^[a-zA-Z0-9]+$/.test(apiKey);
};

/**
 * Get postback URL for OfferToro callbacks
 * This URL will be called when a user completes a task
 * @param {string} baseUrl - Your website's base URL
 * @returns {string} Postback URL
 */
export const getPostbackUrl = (baseUrl) => {
  return `${baseUrl}/api/offertoro/postback`;
};

/**
 * Verify OfferToro postback signature
 * @param {object} postbackData - Postback data from OfferToro
 * @param {string} secretKey - Your OfferToro secret key
 * @returns {boolean} True if signature is valid
 */
export const verifyPostbackSignature = (postbackData, secretKey) => {
  // This is a placeholder - check OfferToro documentation for actual verification method
  // Most offer networks use HMAC SHA256
  try {
    // Example verification (placeholder - implement based on OfferToro docs)
    const crypto = require('crypto');
    const signature = postbackData.signature || '';
    const data = postbackData.data || '';
    
    const expectedSignature = crypto
      .createHmac('sha256', secretKey)
      .update(JSON.stringify(data))
      .digest('hex');
    
    return signature === expectedSignature;
  } catch (error) {
    console.error('Error verifying postback:', error);
    return false;
  }
};

