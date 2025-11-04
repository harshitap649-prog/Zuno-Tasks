import { useEffect, useRef, useCallback } from 'react';
import { updateUserPoints } from '../firebase/firestore';

/**
 * Ayet Studios Offerwall Component
 * Video-focused offerwall for watching videos and earning points
 */
export default function AyetStudiosOfferwall({ apiKey, userId, offerwallUrl, onClose, onComplete }) {
  const iframeRef = useRef(null);
  const containerRef = useRef(null);
  const pointsAwardedRef = useRef(new Set()); // Track awarded offer IDs to prevent duplicates
  const offerWindowRef = useRef(null);
  const offerStartTimeRef = useRef(null);

  // Function to award points for completed video/offer
  const awardPointsForOffer = useCallback(async (offerId, rewardPoints) => {
    // Prevent duplicate awards
    if (pointsAwardedRef.current.has(offerId)) {
      console.log(`Points already awarded for Ayet Studios offer ${offerId}`);
      return { success: false, error: 'Already awarded' };
    }

    if (rewardPoints > 0 && userId) {
      try {
        console.log(`Awarding ${rewardPoints} points for Ayet Studios video completion: ${offerId}`);
        const result = await updateUserPoints(userId, rewardPoints, 'video');
        
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
    // Listen for messages from Ayet Studios iframe
    const handleMessage = async (event) => {
      // Security: Verify origin (adjust based on Ayet Studios domain)
      if (!event.origin.includes('ayetstudios.com') && 
          !event.origin.includes('ayet') &&
          !event.origin.includes('ayetstudios')) {
        console.log('Message from non-Ayet Studios origin:', event.origin);
        return;
      }

      console.log('Received message from Ayet Studios:', event.origin, event.data);

      // Handle completion events - check various formats
      if (event.data) {
        let offerId = null;
        let rewardPoints = 0;
        
        if (typeof event.data === 'object') {
          offerId = event.data.offer_id || 
                    event.data.offerId || 
                    event.data.id || 
                    event.data.video_id ||
                    `ayet_${Date.now()}`;
          rewardPoints = parseInt(
            event.data.reward || 
            event.data.amount || 
            event.data.payout || 
            event.data.points ||
            event.data.credits ||
            0
          );
          
          // Check for completion events
          const isComplete = (
            event.data.type === 'offer_complete' || 
            event.data.event === 'offer_complete' ||
            event.data.type === 'video_complete' ||
            event.data.event === 'video_complete' ||
            event.data.status === 'complete' ||
            event.data.completed === true ||
            event.data.video_completed === true
          );
          
          if (isComplete && rewardPoints > 0) {
            await awardPointsForOffer(offerId, rewardPoints);
          }
        } else if (typeof event.data === 'string') {
          const lowerData = event.data.toLowerCase();
          if (lowerData.includes('complete') || lowerData.includes('success') || lowerData.includes('video')) {
            console.log('Completion detected but reward amount not found in message');
            // Try default reward or wait for postback
          }
        }
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [userId, onComplete, awardPointsForOffer]);

  // Build offerwall URL
  const buildOfferwallUrl = () => {
    if (offerwallUrl) {
      // If full URL provided, append user ID if needed
      if (offerwallUrl.includes('{USER_ID}') || offerwallUrl.includes('{{USER_ID}}')) {
        return offerwallUrl.replace(/{{\s*USER_ID\s*}}/g, userId).replace(/{USER_ID}/g, userId);
      }
      // If URL already has parameters, append user ID
      const separator = offerwallUrl.includes('?') ? '&' : '?';
      return `${offerwallUrl}${separator}user_id=${userId}&subid=${userId}`;
    }
    
    // If only API key provided, construct URL (adjust based on Ayet Studios format)
    if (apiKey) {
      // Ayet Studios typically uses: https://offerwall.ayetstudios.com/?pub=API_KEY&sub=USER_ID
      return `https://offerwall.ayetstudios.com/?pub=${apiKey}&sub=${userId}&user_id=${userId}`;
    }
    
    return null;
  };

  const finalOfferwallUrl = buildOfferwallUrl();

  if (!finalOfferwallUrl && !apiKey && !offerwallUrl) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600 mb-4">Ayet Studios is not configured. Please add your API key or offerwall URL in Admin Panel.</p>
        {onClose && (
          <button onClick={onClose} className="btn-primary">
            Close
          </button>
        )}
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600 mb-4">User ID is required to show videos.</p>
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
      const newWindow = window.open(finalOfferwallUrl, '_blank', 'noopener,noreferrer');
      if (newWindow && !newWindow.closed) {
        offerWindowRef.current = newWindow;
        offerStartTimeRef.current = Date.now();
        console.log('Ayet Studios offerwall opened in new tab, tracking for completion...');
      }
    } catch (error) {
      console.error('Error opening Ayet Studios offerwall:', error);
      window.location.href = finalOfferwallUrl;
    }
  };

  return (
    <div ref={containerRef} className="w-full h-full">
      {/* Info Banner */}
      <div className="mb-4 p-4 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-lg">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 text-2xl">🎥</div>
          <div className="flex-1">
            <p className="text-sm text-red-800 mb-2 font-semibold">
              Watch Videos & Earn Points!
            </p>
            <p className="text-xs text-red-700 mb-2">
              ✓ Click on any video to start watching and earning points.
              <br />✓ Points are automatically added after video completion.
              <br />✓ If videos don't open, click "Open in New Tab" button below.
            </p>
          </div>
        </div>
      </div>

      {/* Button to open in new tab - Alternative if iframe has issues */}
      <div className="mb-4 flex justify-center">
        <button
          onClick={handleOpenInNewTab}
          className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white py-2 px-6 rounded-lg flex items-center gap-2 font-semibold"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          Open Video Offerwall in New Tab (Recommended)
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
        title="Ayet Studios Video Offerwall"
        allow="payment; popups; popups-to-escape-sandbox; fullscreen; autoplay"
        style={{ pointerEvents: 'auto' }}
      />
    </div>
  );
}

