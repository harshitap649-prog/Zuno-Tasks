import { useEffect, useRef } from 'react';
import { getOfferwallUrl } from '../utils/offertoro';

/**
 * OfferToro Offerwall Component
 * Embeds the OfferToro offerwall as an iframe
 */
export default function OfferToroOfferwall({ apiKey, userId, onClose, onComplete }) {
  const iframeRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    // Listen for messages from iframe (if OfferToro supports postMessage)
    const handleMessage = (event) => {
      // Security: Verify origin
      if (!event.origin.includes('offertoro.com')) {
        return;
      }

      // Handle completion events
      if (event.data && event.data.type === 'offer_complete') {
        if (onComplete) {
          onComplete({
            offerId: event.data.offer_id,
            reward: event.data.reward,
            userId: userId,
          });
        }
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [userId, onComplete]);

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
    window.open(offerwallUrl, '_blank', 'noopener,noreferrer');
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

