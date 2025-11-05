import { useEffect, useRef, useCallback } from 'react';
import { updateUserPoints } from '../firebase/firestore';

/**
 * CPAlead Offerwall Component
 * Integrates CPAlead offerwall for task completions
 */
export default function CPALeadOfferwall({ publisherId, userId, onClose, onComplete }) {
  const iframeRef = useRef(null);
  const containerRef = useRef(null);
  const pointsAwardedRef = useRef(new Set()); // Track awarded offer IDs to prevent duplicates
  const offerWindowRef = useRef(null);
  const offerStartTimeRef = useRef(null);

  // Function to award points for an offer
  const awardPointsForOffer = useCallback(async (offerId, rewardPoints) => {
    // Prevent duplicate awards for the same offer
    if (pointsAwardedRef.current.has(offerId)) {
      console.log(`Points already awarded for offer ${offerId}`);
      return { success: false, error: 'Already awarded' };
    }

    if (rewardPoints > 0 && userId) {
      try {
        console.log(`Awarding ${rewardPoints} points for offer completion: ${offerId}`);
        // Award points immediately
        const result = await updateUserPoints(userId, rewardPoints);
        
        if (result.success) {
          // Mark as awarded
          pointsAwardedRef.current.add(offerId);
          console.log(`✅ Successfully awarded ${rewardPoints} points!`);
          
          // Notify parent component
          if (onComplete) {
            onComplete({
              offerId: offerId,
              reward: rewardPoints,
              userId: userId,
              success: true,
            });
          }
          
          // Show success message
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
    // Listen for messages from iframe
    const handleMessage = async (event) => {
      // Log all messages for debugging
      console.log('Received message from offerwall:', event.origin, event.data);

      // Security: Verify origin (allow CPAlead domains)
      if (!event.origin.includes('cpalead.com') && 
          !event.origin.includes('directcpi.com') &&
          !event.origin.includes('zwidget')) {
        return;
      }

      // Handle completion events from CPAlead - check various formats
      if (event.data) {
        let offerId = null;
        let rewardPoints = 0;
        
        // Try different data formats
        if (typeof event.data === 'object') {
          offerId = event.data.offer_id || event.data.offerId || event.data.id || null;
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
            event.data.type === 'cpalead_complete' ||
            event.data.status === 'complete' ||
            event.data.completed === true
          );
          
          if (isComplete && rewardPoints > 0) {
            await awardPointsForOffer(offerId || `offer_${Date.now()}`, rewardPoints);
          }
        } else if (typeof event.data === 'string') {
          // Check if message contains completion info
          const lowerData = event.data.toLowerCase();
          if (lowerData.includes('complete') || lowerData.includes('success')) {
            // Try to extract reward from URL params or other sources
            // For now, we'll need user to manually specify or use postback
            console.log('Completion detected but reward amount not found in message');
          }
        }
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [userId, onComplete, awardPointsForOffer]);

  if (!publisherId || !userId) {
    console.warn('CPALeadOfferwall: Missing publisherId or userId', { publisherId, userId });
    return (
      <div className="p-8 text-center bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-gray-600 mb-4 font-semibold">
          {!publisherId && '⚠️ CPAlead Publisher ID is not configured. Please add it in Admin Panel.'}
          {!userId && '⚠️ User ID is missing. Please refresh the page.'}
        </p>
        {onClose && (
          <button onClick={onClose} className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
            Close
          </button>
        )}
      </div>
    );
  }
  
  console.log('CPALeadOfferwall: Rendering with', { publisherId, userId });

  // CPAlead offerwall URL format
  // Use the Direct Link URL from CPAlead dashboard
  // Format: https://zwidgetbv3dft.xyz/list/gMez9KHT (or similar)
  // If publisherId contains the full URL, use it directly
  // Otherwise, construct from publisher ID code
  
  const cleanPublisherId = publisherId.trim().replace(/\s+/g, ''); // Remove any spaces
  const cleanUserId = userId.trim();
  
  // Check if publisherId is already a full URL (from CPAlead Direct Link)
  let offerwallUrl;
  if (cleanPublisherId.startsWith('http://') || cleanPublisherId.startsWith('https://')) {
    // Full URL provided - use it directly
    // Optionally append user ID if CPAlead supports it
    offerwallUrl = cleanPublisherId.includes('?') 
      ? `${cleanPublisherId}&sub=${cleanUserId}` 
      : `${cleanPublisherId}?sub=${cleanUserId}`;
  } else {
    // Publisher ID is just a code - construct URL
    // This is the Direct Link format from CPAlead
    offerwallUrl = `https://zwidgetbv3dft.xyz/list/${cleanPublisherId}?sub=${cleanUserId}`;
  }
  
  console.log('CPALeadOfferwall: Generated URL', { cleanPublisherId, offerwallUrl });

  const handleOpenOfferwall = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Open offerwall in new tab
    try {
      const newWindow = window.open(offerwallUrl, '_blank', 'noopener,noreferrer');
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        alert('Please allow popups for this site to open the offerwall. Or copy and open this URL manually:\n\n' + offerwallUrl);
      } else {
        // Track the offerwall window
        offerWindowRef.current = newWindow;
        offerStartTimeRef.current = Date.now();
      }
    } catch (error) {
      console.error('Error opening CPAlead offerwall:', error);
      // Fallback: try direct navigation
      window.location.href = offerwallUrl;
    }
  };

  // Note: CPAlead typically uses postback URLs or postMessage for completion
  // If postMessage isn't working, you may need to configure CPAlead postback URL
  // pointing to your server/function that calls updateUserPoints

  return (
    <div ref={containerRef} className="w-full h-full">
      {/* Important Info */}
      <div className="mb-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-lg">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 text-2xl">🚀</div>
          <div className="flex-1">
            <p className="text-sm text-purple-800 mb-2 font-semibold">
              CPAlead VIP - High-Paying Offers!
            </p>
            <p className="text-xs text-purple-700 mb-2">
              ✓ Complete offers to earn rewards on your account.
              <br />✓ Points are awarded immediately when you complete an offer!
            </p>
          </div>
        </div>
      </div>

      {/* Open Offerwall Button */}
      <div className="flex flex-col items-center mb-6">
        <button
          onClick={handleOpenOfferwall}
          onMouseDown={(e) => e.preventDefault()}
          type="button"
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-5 px-10 rounded-xl text-xl shadow-2xl transition-all duration-200 transform hover:scale-110 active:scale-95 flex items-center gap-3 cursor-pointer z-50 relative"
          style={{ 
            WebkitTapHighlightColor: 'transparent',
            userSelect: 'none',
            pointerEvents: 'auto'
          }}
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          <span>Open CPAlead Offerwall</span>
        </button>
        <p className="text-xs text-gray-500 mt-2">Click to view all available offers</p>
        
        {/* Alternative: Direct URL access */}
        <div className="mt-4 p-3 bg-gray-100 rounded-lg">
          <p className="text-xs text-gray-600 mb-2">Or copy this URL and open in new tab:</p>
          <div className="flex items-center gap-2">
            <code className="text-xs bg-white px-2 py-1 rounded border flex-1 overflow-x-auto">
              {offerwallUrl}
            </code>
            <button
              onClick={() => {
                navigator.clipboard.writeText(offerwallUrl);
                alert('URL copied! Paste it in a new tab.');
              }}
              className="text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
            >
              Copy
            </button>
          </div>
        </div>
      </div>

      {/* Optional: Embed iframe (may have restrictions) */}
      <div className="border rounded-lg overflow-hidden bg-gray-50">
        <div className="bg-gray-100 px-4 py-2 text-sm text-gray-600 border-b flex items-center justify-between">
          <p className="text-xs">Preview (Click button above for best experience)</p>
          <button
            onClick={() => {
              console.log('Refreshing iframe...');
              if (iframeRef.current) {
                iframeRef.current.src = iframeRef.current.src;
              }
            }}
            className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
          >
            Refresh
          </button>
        </div>
        <iframe
          ref={iframeRef}
          src={offerwallUrl}
          width="100%"
          height="600"
          frameBorder="0"
          scrolling="yes"
          className="border-0"
          title="CPAlead Offerwall"
          allow="payment; popups; popups-to-escape-sandbox; fullscreen"
          style={{ pointerEvents: 'auto', minHeight: '600px' }}
          onLoad={() => console.log('CPALead iframe loaded successfully')}
          onError={(e) => console.error('CPALead iframe error:', e)}
        />
      </div>
    </div>
  );
}

