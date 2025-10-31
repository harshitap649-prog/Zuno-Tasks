import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export default function WatchAdModal({ onClose, onComplete }) {
  const [countdown, setCountdown] = useState(3);
  const [watching, setWatching] = useState(false);
  const [adTriggered, setAdTriggered] = useState(false);
  const adCompletedRef = useRef(false);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setWatching(true);
      
      // Trigger ad via service worker
      setTimeout(() => {
        triggerServiceWorkerAd();
      }, 500);
      
      // Auto-complete after watching time (service worker ads typically auto-close)
      // Fallback timer in case ad doesn't trigger completion
      const fallbackTimer = setTimeout(() => {
        if (!adCompletedRef.current) {
          adCompletedRef.current = true;
          setWatching(false);
          onComplete();
        }
      }, 35000); // 35 seconds fallback (ads typically last 30-40 seconds)

      return () => clearTimeout(fallbackTimer);
    }
  }, [countdown, onComplete]);

  const triggerServiceWorkerAd = () => {
    // Service worker-based ads work via push notifications or interstitials
    // The ad will automatically show when service worker detects user interaction
    setAdTriggered(true);
    
    // Try to trigger ad via service worker message
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'TRIGGER_AD',
        zoneId: 10120815
      });
    }
    
    // Alternative: Some networks trigger ads on page navigation or window focus
    // This ensures the ad network detects user engagement
    window.focus();
    
    // Simulate ad showing - service worker will handle actual ad display
    // Most service worker ads show automatically after user interaction
  };

  // Listen for ad completion events from service worker
  useEffect(() => {
    if (!watching) return;

    const handleMessage = (event) => {
      // Listen for completion messages from service worker
      if (event.data && event.data.type === 'AD_COMPLETE') {
        adCompletedRef.current = true;
        setWatching(false);
        onComplete();
      }
    };

    // Listen for messages from service worker
    if ('serviceWorker' in navigator) {
      navigator.addEventListener('message', handleMessage);
    }

    // Also listen for page visibility changes (ad might have opened in new tab)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Ad might have opened - wait a bit then complete
        setTimeout(() => {
          if (!adCompletedRef.current && watching) {
            adCompletedRef.current = true;
            setWatching(false);
            onComplete();
          }
        }, 5000);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      navigator.removeEventListener('message', handleMessage);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [watching, onComplete]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-6 h-6" />
        </button>

        {countdown > 0 ? (
          <div className="text-center py-8">
            <div className="text-6xl font-bold text-purple-600 mb-4">
              {countdown}
            </div>
            <p className="text-gray-600">Preparing ad...</p>
          </div>
        ) : watching ? (
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Watch Ad to Earn Points</h3>
            
            {/* Service Worker Ad - Shows automatically via push/interstitial */}
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-8 text-center border-2 border-purple-300 relative" style={{ minHeight: '400px', width: '100%' }}>
              {adTriggered ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="mb-6">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600 mx-auto"></div>
                  </div>
                  <p className="text-xl font-semibold text-gray-800 mb-2">📺 Ad is Loading...</p>
                  <p className="text-sm text-gray-600 mb-4">
                    The ad will appear automatically via service worker
                  </p>
                  <div className="bg-purple-100 rounded-lg p-4 max-w-md mx-auto">
                    <p className="text-sm text-gray-700 font-medium mb-2">What to Expect:</p>
                    <ul className="text-xs text-gray-600 text-left space-y-1">
                      <li>• Ad may open in a new tab or as a popup</li>
                      <li>• Please watch the ad completely</li>
                      <li>• Close the ad when finished</li>
                      <li>• You'll earn 20 points automatically</li>
                    </ul>
                  </div>
                  <p className="text-xs text-gray-500 mt-6">
                    If ad doesn't appear, try clicking outside this modal
                  </p>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-lg text-gray-600">Preparing ad...</p>
                </div>
              )}
            </div>
            
            <p className="text-center text-gray-600 mt-4 text-sm">
              Watch the ad completely to earn 20 points. Ad loads automatically!
            </p>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">✅</div>
            <p className="text-xl font-semibold text-green-600">Ad Complete!</p>
            <p className="text-gray-600 mt-2">You earned 20 points</p>
          </div>
        )}
      </div>
    </div>
  );
}

