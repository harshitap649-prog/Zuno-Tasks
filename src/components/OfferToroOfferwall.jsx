import { useEffect, useRef, useCallback } from 'react';
import { getOfferwallUrl } from '../utils/offertoro';
import { updateUserPoints } from '../firebase/firestore';

/**
 * OfferToro Offerwall Component
 * Embeds the OfferToro offerwall as an iframe
 */
export default function OfferToroOfferwall({ apiKey, userId, onClose, onComplete }) {
  const iframeRef = useRef(null);
  const containerRef = useRef(null);
  const pointsAwardedRef = useRef(new Set()); // Track awarded offer IDs to prevent duplicates
  const offerWindowRef = useRef(null);
  const offerStartTimeRef = useRef(null);

  // Function to award points for completed offer
  const awardPointsForOffer = useCallback(async (offerId, rewardPoints) => {
    // Prevent duplicate awards
    if (pointsAwardedRef.current.has(offerId)) {
      console.log(`Points already awarded for offer ${offerId}`);
      return { success: false, error: 'Already awarded' };
    }

    if (rewardPoints > 0 && userId) {
      try {
        console.log(`Awarding ${rewardPoints} points for OfferToro offer completion: ${offerId}`);
        const result = await updateUserPoints(userId, rewardPoints);
        
        if (result.success) {
          pointsAwardedRef.current.add(offerId);
          console.log(`✅ Successfully awarded ${rewardPoints} points!`);
          
          if (onComplete) {
            onComplete({
              offerId: offerId,
              reward: rewardPoints,
              userId: userId,
              success: true,
            });
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
    // Listen for messages from iframe (if OfferToro supports postMessage)
    const handleMessage = async (event) => {
      // Security: Verify origin
      if (!event.origin.includes('offertoro.com') && !event.origin.includes('offertoro')) {
        console.log('Message from non-OfferToro origin:', event.origin);
        return;
      }

      console.log('Received message from OfferToro:', event.origin, event.data);

      // Handle completion events - check various formats
      if (event.data) {
        let offerId = null;
        let rewardPoints = 0;
        
        if (typeof event.data === 'object') {
          offerId = event.data.offer_id || event.data.offerId || event.data.id || `offertoro_${Date.now()}`;
          rewardPoints = parseInt(
            event.data.reward || 
            event.data.amount || 
            event.data.payout || 
            event.data.points || 
            0
          );
          
          // Check for completion events
          const isComplete = (
            event.data.type === 'offer_complete' || 
            event.data.event === 'offer_complete' ||
            event.data.status === 'complete' ||
            event.data.completed === true
          );
          
          if (isComplete && rewardPoints > 0) {
            await awardPointsForOffer(offerId, rewardPoints);
          }
        } else if (typeof event.data === 'string') {
          const lowerData = event.data.toLowerCase();
          if (lowerData.includes('complete') || lowerData.includes('success')) {
            console.log('Completion detected but reward amount not found in message');
            // Try to extract reward or use default
            // For now, we'll need postback URL or user will need to refresh
          }
        }
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [userId, onComplete, awardPointsForOffer]);

  if (!apiKey || !userId) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600 mb-4">OfferToro is not configured. Please add your API key in settings.</p>
        {onClose && (
          <button onClick={onClose} className="btn-primary">
            Close
          </button>
        )}
      </div>
    );
  }

  const offerwallUrl = getOfferwallUrl(apiKey, userId, {
    currency: 'INR',
    language: 'en',
  });

  if (!offerwallUrl) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600 mb-4">Error generating offerwall URL. Please check your API key.</p>
        {onClose && (
          <button onClick={onClose} className="btn-primary">
            Close
          </button>
        )}
      </div>
    );
  }

  const handleOpenInNewTab = () => {
    try {
      const newWindow = window.open(offerwallUrl, '_blank', 'noopener,noreferrer');
      if (newWindow && !newWindow.closed) {
        offerWindowRef.current = newWindow;
        offerStartTimeRef.current = Date.now();
        console.log('OfferToro offerwall opened in new tab, tracking for completion...');
      }
    } catch (error) {
      console.error('Error opening OfferToro offerwall:', error);
      window.location.href = offerwallUrl;
    }
  };

  return (
    <div ref={containerRef} className="w-full h-full">
      {/* Info Banner */}
      <div className="mb-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-lg">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 text-2xl">💡</div>
          <div className="flex-1">
            <p className="text-sm text-purple-800 mb-2 font-semibold">
              Click on any offer to start earning!
            </p>
            <p className="text-xs text-purple-700 mb-2">
              ✓ If an offer doesn't open, click "Open in New Tab" button below for best experience.
              <br />✓ Make sure popups are allowed in your browser settings.
              <br />✓ Some offers (like Opinion Bureau) work better in a full browser tab.
            </p>
          </div>
        </div>
      </div>

      {/* Button to open in new tab - Alternative if iframe has issues */}
      <div className="mb-4 flex justify-center">
        <button
          onClick={handleOpenInNewTab}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg flex items-center gap-2 font-semibold"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          Open Offerwall in New Tab (Recommended)
        </button>
      </div>

      <iframe
        ref={iframeRef}
        src={offerwallUrl}
        width="100%"
        height="800"
        frameBorder="0"
        scrolling="yes"
        className="border-0 rounded-lg"
        title="OfferToro Offerwall"
        allow="payment; popups; popups-to-escape-sandbox; fullscreen"
        style={{ pointerEvents: 'auto' }}
      />
    </div>
  );
}

