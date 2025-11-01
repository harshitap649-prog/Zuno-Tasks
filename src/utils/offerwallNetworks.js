/**
 * Offerwall Networks Integration
 * Instant approval networks for app installs, surveys, and tasks
 */

/**
 * Offerwall.me Integration
 * Instant approval, 5-minute setup
 */
export const getOfferwallMeUrl = (userId, apiKey) => {
  if (!apiKey || !userId) return null;
  return `https://offerwall.me/api/v1/offers?user_id=${userId}&api_key=${apiKey}`;
};

/**
 * Offerwall PRO Integration
 * Instant approval, easy setup
 */
export const getOfferwallProUrl = (userId, apiKey) => {
  if (!apiKey || !userId) return null;
  return `https://offerwallpro.com/offers?user=${userId}&key=${apiKey}`;
};

/**
 * Bitlabs Integration
 * Usually 24-hour approval, great for surveys and app installs
 */
export const getBitlabsOfferwallUrl = (userId, apiKey) => {
  if (!apiKey || !userId) return null;
  return `https://api.bitlabs.gg/v1/client/offers?user_id=${userId}&token=${apiKey}`;
};

/**
 * Fetch offers from offerwall network
 */
export const fetchOffersFromNetwork = async (network, userId, apiKey) => {
  try {
    let url;
    switch (network) {
      case 'offerwallme':
        url = getOfferwallMeUrl(userId, apiKey);
        break;
      case 'offerwallpro':
        url = getOfferwallProUrl(userId, apiKey);
        break;
      case 'bitlabs':
        url = getBitlabsOfferwallUrl(userId, apiKey);
        break;
      default:
        return { success: false, error: 'Unknown network' };
    }

    if (!url) {
      return { success: false, error: 'Missing API key or user ID' };
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Network API error: ${response.statusText}`);
    }

    const data = await response.json();
    return { success: true, offers: data.offers || data.data || [] };
  } catch (error) {
    console.error(`Error fetching ${network} offers:`, error);
    return { success: false, error: error.message, offers: [] };
  }
};

/**
 * Format network offer to our internal format
 */
export const formatNetworkOffer = (offer, network) => {
  const baseOffer = {
    title: offer.name || offer.title || 'Complete Task',
    description: offer.description || offer.instructions || 'Complete this task to earn rewards',
    link: offer.tracking_url || offer.url || offer.link || '',
    offerId: offer.offer_id || offer.id || offer.uid || '',
    source: network,
    active: true,
  };

  // Convert reward to points (assuming $1 = 100 points)
  let rewardPoints = 0;
  if (offer.reward) {
    rewardPoints = Math.round(parseFloat(offer.reward) * 100);
  } else if (offer.payout) {
    rewardPoints = Math.round(parseFloat(offer.payout) * 100);
  } else if (offer.amount) {
    rewardPoints = Math.round(parseFloat(offer.amount) * 100);
  }

  return {
    ...baseOffer,
    rewardPoints: rewardPoints || 100, // Default 100 points if not specified
  };
};

