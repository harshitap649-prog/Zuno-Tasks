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

  return (
    <div ref={containerRef} className="w-full h-full">
      <iframe
        ref={iframeRef}
        src={offerwallUrl}
        width="100%"
        height="800"
        frameBorder="0"
        scrolling="yes"
        className="border-0 rounded-lg"
        title="OfferToro Offerwall"
        allow="payment"
      />
    </div>
  );
}

