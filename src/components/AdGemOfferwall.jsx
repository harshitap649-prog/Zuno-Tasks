import { useEffect, useRef, useCallback } from 'react';
import { updateUserPoints } from '../firebase/firestore';
import { Gift } from 'lucide-react';

/**
 * AdGem Offerwall Component
 * Instant approval for surveys, apps, videos, and more
 */
export default function AdGemOfferwall({ apiKey, userId, offerwallUrl, onClose, onComplete }) {
  const iframeRef = useRef(null);
  const pointsAwardedRef = useRef(new Set());
  const offerWindowRef = useRef(null);
  const offerStartTimeRef = useRef(null);

  const buildOfferwallUrl = useCallback(() => {
    if (offerwallUrl) {
      // Replace placeholders in the provided URL
      return offerwallUrl
        .replace(/{{\s*USER_ID\s*}}/g, userId)
        .replace(/{USER_ID}/g, userId)
        .replace(/{player_id}/g, userId)
        .replace(/{{\s*player_id\s*}}/g, userId)
        .replace(/{sub}/g, userId)
        .replace(/{subid}/g, userId)
        .replace(/{externalIdentifier}/g, userId);
    }
    // AdGem format: https://www.adgem.com/offers?pub=API_KEY&sub=USER_ID
    if (apiKey) {
      return `https://www.adgem.com/offers?pub=${apiKey}&sub=${userId}`;
    }
    return null;
  }, [apiKey, userId, offerwallUrl]);

  const finalOfferwallUrl = buildOfferwallUrl();

  const awardPointsForOffer = useCallback(async (offerId, rewardPoints) => {
    if (pointsAwardedRef.current.has(offerId)) {
      console.log(`Points already awarded for offer ${offerId}`);
      return { success: false, error: 'Already awarded' };
    }

    if (rewardPoints > 0 && userId) {
      try {
        console.log(`Awarding ${rewardPoints} points for AdGem offer completion: ${offerId}`);
        const result = await updateUserPoints(userId, rewardPoints, 'task');
        
        if (result.success) {
          pointsAwardedRef.current.add(offerId);
          console.log(`✅ Successfully awarded ${rewardPoints} points!`);
          if (onComplete) {
            onComplete({ offerId: offerId, reward: rewardPoints, userId: userId, success: true });
          }
          alert(`🎉 Success! You earned ${rewardPoints} points!`);
          return { success: true };
        } else {
          console.error('Failed to award points:', result.error);
          alert(`⚠️ Failed to award points: ${result.error || 'Unknown error'}`);
          return { success: false, error: result.error };
        }
      } catch (error) {
        console.error('Error awarding points:', error);
        alert(`⚠️ Error awarding points: ${error.message}`);
        return { success: false, error: error.message };
      }
    } else {
      console.warn('Invalid reward points or userId:', { rewardPoints, userId });
      return { success: false, error: 'Invalid reward or userId' };
    }
  }, [userId, onComplete]);

  useEffect(() => {
    const handleMessage = async (event) => {
      if (!event.origin.includes('adgem.com')) {
        return;
      }
      console.log('Received message from AdGem:', event.origin, event.data);

      if (event.data && typeof event.data === 'object') {
        const offerId = event.data.offer_id || event.data.id || event.data.transaction_id || `adgem_${Date.now()}`;
        const rewardPoints = parseInt(event.data.reward || event.data.amount || event.data.payout || event.data.points || 0);
        const isComplete = event.data.type === 'offer_complete' || event.data.event === 'offer_complete' || event.data.status === 'complete' || event.data.completed === true;
        
        if (isComplete && rewardPoints > 0) {
          await awardPointsForOffer(offerId, rewardPoints);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [awardPointsForOffer]);

  if (!finalOfferwallUrl) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600 mb-4">AdGem is not configured. Please add your API key or offerwall URL in Admin Panel.</p>
      </div>
    );
  }

  const handleOpenInNewTab = () => {
    try {
      const newWindow = window.open(finalOfferwallUrl, '_blank', 'noopener,noreferrer');
      if (newWindow && !newWindow.closed) {
        offerWindowRef.current = newWindow;
        offerStartTimeRef.current = Date.now();
        console.log('AdGem offerwall opened in new tab, tracking for completion...');
      }
    } catch (error) {
      console.error('Error opening AdGem offerwall:', error);
      window.location.href = finalOfferwallUrl;
    }
  };

  return (
    <div className="w-full h-full">
      <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 text-2xl">💡</div>
          <div className="flex-1">
            <p className="text-sm text-green-800 mb-2 font-semibold">
              Complete surveys, apps, videos, and more to earn points!
            </p>
            <p className="text-xs text-green-700 mb-2">
              ✓ Click "Open in New Tab" for the best experience.
              <br />✓ Make sure popups are allowed.
            </p>
          </div>
        </div>
      </div>

      <div className="mb-4 flex justify-center">
        <button
          onClick={handleOpenInNewTab}
          className="bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded-lg flex items-center gap-2 font-semibold"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          Open Offerwall in New Tab (Recommended)
        </button>
      </div>

      <iframe
        ref={iframeRef}
        src={finalOfferwallUrl}
        width="100%"
        height="800"
        frameBorder="0"
        scrolling="yes"
        className="border-0 rounded-lg"
        title="AdGem Offerwall"
        allow="payment; popups; popups-to-escape-sandbox; fullscreen"
        style={{ pointerEvents: 'auto' }}
      />
    </div>
  );
}

