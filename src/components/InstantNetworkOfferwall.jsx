import { useEffect, useRef } from 'react';

/**
 * Instant Network Offerwall Component
 * Supports Offerwall.me, Offerwall PRO, Bitlabs, AdGate Media
 */
export default function InstantNetworkOfferwall({ network, apiKey, userId, onClose, onComplete }) {
  const iframeRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    // Listen for messages from iframe
    const handleMessage = (event) => {
      // Security: Verify origin based on network
      const allowedOrigins = {
        'offerwallme': ['offerwall.me'],
        'offerwallpro': ['offerwallpro.com'],
        'bitlabs': ['bitlabs.gg'],
        'adgatemedia': ['adgatemedia.com'],
      };

      const origins = allowedOrigins[network] || [];
      if (!origins.some(origin => event.origin.includes(origin))) {
        return;
      }

      // Handle completion events
      if (event.data && (event.data.type === 'offer_complete' || event.data.event === 'offer_complete')) {
        if (onComplete) {
          onComplete({
            offerId: event.data.offer_id || event.data.offerId,
            reward: event.data.reward || event.data.amount,
            userId: userId,
          });
        }
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [network, userId, onComplete]);

  if (!apiKey || !userId || !network) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600 mb-4">Network is not configured. Please add your API key in Admin Panel.</p>
        {onClose && (
          <button onClick={onClose} className="btn-primary">
            Close
          </button>
        )}
      </div>
    );
  }

  // Generate offerwall URL based on network
  const getOfferwallUrl = () => {
    if (network === 'offerwallme') {
      // Offerwall.me standard format: /offerwall/api_key/user_id
      // This is the official format according to their documentation
      return `https://offerwall.me/offerwall/${apiKey}/${userId}`;
    }
    
    const baseUrls = {
      'offerwallpro': `https://offerwallpro.com/offerwall?user=${userId}&key=${apiKey}`,
      'bitlabs': `https://app.bitlabs.gg/offerwall?user_id=${userId}&token=${apiKey}`,
      'adgatemedia': `https://www.adgatemedia.com/offerwall?user_id=${userId}&api_key=${apiKey}`,
    };

    return baseUrls[network] || null;
  };

  const offerwallUrl = getOfferwallUrl();

  if (!offerwallUrl) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600 mb-4">Error generating offerwall URL. Please check your network configuration.</p>
        {onClose && (
          <button onClick={onClose} className="btn-primary">
            Close
          </button>
        )}
      </div>
    );
  }

  const handleOpenOfferwall = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Open offerwall in new tab
    try {
      const newWindow = window.open(offerwallUrl, '_blank', 'noopener,noreferrer');
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        alert('Please allow popups for this site to open the offerwall. Or copy and open this URL manually:\n\n' + offerwallUrl);
      }
    } catch (error) {
      console.error('Error opening offerwall:', error);
      // Fallback: try direct navigation
      window.location.href = offerwallUrl;
    }
  };

  return (
    <div ref={containerRef} className="w-full h-full">
      {/* Important Info */}
      <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-green-50 border-2 border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 text-2xl">📌</div>
          <div className="flex-1">
            <p className="text-sm text-blue-800 mb-2 font-semibold">
              Click the button below to open the offerwall in a new tab.
            </p>
            <p className="text-xs text-blue-700 mb-2">
              ✓ After completing offers, refresh this page to see your updated points.
            </p>
            {network === 'offerwallme' && (
              <>
                <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded mt-2 border border-amber-200">
                  ⚠️ <strong>Important:</strong> If you see a 404 error or "offerwall not found" message:
                  <br />1. Check your Offerwall.me dashboard for the exact integration URL
                  <br />2. Verify your API key is correct: <code className="text-xs">{apiKey.substring(0, 10)}...</code>
                  <br />3. Make sure your offerwall status shows "Approved" in the dashboard
                  <br />4. Contact Offerwall.me support if issues persist
                </p>
                <p className="text-xs text-gray-600 mt-2">
                  💡 <strong>Alternative:</strong> While Offerwall.me activates, use manual tasks from Admin Panel. They work immediately!
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Open Offerwall Button - Made more prominent and clickable */}
      <div className="flex flex-col items-center mb-6">
        <button
          onClick={handleOpenOfferwall}
          onMouseDown={(e) => e.preventDefault()} // Prevent any interference
          type="button"
          className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-5 px-10 rounded-xl text-xl shadow-2xl transition-all duration-200 transform hover:scale-110 active:scale-95 flex items-center gap-3 cursor-pointer z-50 relative"
          style={{ 
            WebkitTapHighlightColor: 'transparent',
            userSelect: 'none',
            pointerEvents: 'auto'
          }}
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          <span>Open Offerwall in New Tab</span>
        </button>
        <p className="text-xs text-gray-500 mt-2">Click this button ↑</p>
        
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
    </div>
  );
}

