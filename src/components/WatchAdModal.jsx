import { useState, useEffect, useRef } from 'react';
import { X, Clock, Gift } from 'lucide-react';

export default function WatchAdModal({ onClose, onComplete }) {
  const [countdown, setCountdown] = useState(3);
  const [watching, setWatching] = useState(false);
  const [adLoaded, setAdLoaded] = useState(false); // Track if ad is actually visible/loaded
  const [adTimeRemaining, setAdTimeRemaining] = useState(30); // 30 seconds to watch ad
  const [adTriggered, setAdTriggered] = useState(false);
  const adCompletedRef = useRef(false);
  const adWindowRef = useRef(null);
  const countdownTimerRef = useRef(null);

  // Countdown before ad starts
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setWatching(true);
      setAdTimeRemaining(30);
      setAdLoaded(false); // Reset ad loaded state
      
      // Trigger ad immediately
      setTimeout(() => {
        triggerAd();
      }, 300);
    }
  }, [countdown]);

  // Ad watching timer - ONLY START when ad is actually loaded/visible
  useEffect(() => {
    // Only start countdown if ad is loaded and watching
    if (!watching || !adLoaded || adCompletedRef.current) {
      // Clear timer if conditions not met
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
        countdownTimerRef.current = null;
      }
      return;
    }

    // Start the countdown timer only when ad is loaded
    countdownTimerRef.current = setInterval(() => {
      setAdTimeRemaining((prev) => {
        if (prev <= 1) {
          // Ad completed - award points
          if (!adCompletedRef.current) {
            adCompletedRef.current = true;
            setWatching(false);
            setAdLoaded(false);
            if (countdownTimerRef.current) {
              clearInterval(countdownTimerRef.current);
              countdownTimerRef.current = null;
            }
            onComplete();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
        countdownTimerRef.current = null;
      }
    };
  }, [watching, adLoaded, onComplete]);

  const triggerAd = () => {
    setAdTriggered(true);
    
    // Method 1: Try to open popup/interstitial ad via service worker
    if ('serviceWorker' in navigator) {
      // Load Monetag Push Notification script
      const pushAdScript = document.createElement('script');
      pushAdScript.src = 'https://3nbf4.com/act/files/tag.min.js?z=10120949';
      pushAdScript.setAttribute('data-cfasync', 'false');
      pushAdScript.async = true;
      
      pushAdScript.onload = () => {
        console.log('Monetag Push Notification ad loaded');
        // Try to trigger the ad
        window.focus();
        
        let adDetected = false;
        
        // Check if ad window opened (popup/interstitial)
        // Monitor for popup window or document visibility change
        const checkAdWindow = setInterval(() => {
          // Check if a new window/tab was opened (ad appeared)
          // Or if document became hidden (user switched to ad tab/window)
          if (document.hidden || adWindowRef.current) {
            adDetected = true;
            setAdLoaded(true);
            clearInterval(checkAdWindow);
          }
        }, 500);
        
        // Fallback: If no ad appears after 5 seconds, use iframe ad
        setTimeout(() => {
          clearInterval(checkAdWindow);
          if (!adDetected) {
            // Ad didn't appear via service worker, use fallback
            loadFallbackAd();
          }
        }, 5000);
      };
      
      pushAdScript.onerror = () => {
        console.error('Failed to load Push Notification ad');
        loadFallbackAd();
      };
      
      document.head.appendChild(pushAdScript);
    } else {
      loadFallbackAd();
    }
  };

  const loadFallbackAd = () => {
    // Create a new window/tab with ad content
    // This is a fallback that actually shows content
    try {
      // Create an ad container that simulates watching an ad
      const adWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes');
      
      if (adWindow) {
        adWindowRef.current = adWindow;
        
        // Ad is now visible - mark as loaded and start countdown
        setTimeout(() => {
          setAdLoaded(true);
        }, 500);
        
        // Write ad content (you can replace this with actual ad URL)
        adWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Watch Ad</title>
            <style>
              body {
                margin: 0;
                padding: 20px;
                font-family: Arial, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
              }
              .ad-container {
                text-align: center;
                max-width: 600px;
              }
              .timer {
                font-size: 48px;
                font-weight: bold;
                margin: 20px 0;
              }
              .message {
                font-size: 24px;
                margin: 20px 0;
              }
              .progress-bar {
                width: 100%;
                height: 10px;
                background: rgba(255,255,255,0.3);
                border-radius: 5px;
                overflow: hidden;
                margin: 20px 0;
              }
              .progress {
                height: 100%;
                background: white;
                transition: width 1s linear;
              }
              iframe {
                width: 100%;
                height: 400px;
                border: none;
                border-radius: 10px;
                margin: 20px 0;
              }
            </style>
          </head>
          <body>
            <div class="ad-container">
              <h1>📺 Advertisement</h1>
              <p class="message">Please watch this ad for <span id="timer">30</span> seconds</p>
              <div class="progress-bar">
                <div class="progress" id="progress" style="width: 100%"></div>
              </div>
              <div style="background: white; border-radius: 10px; padding: 20px; color: #333; margin: 20px 0;">
                <h2 style="color: #667eea;">Sample Ad Content</h2>
                <p>This is a placeholder ad. In production, this would show an actual advertisement.</p>
                <p style="font-size: 14px; color: #666;">Watch this for 30 seconds to earn 20 points!</p>
              </div>
            </div>
            <script>
              let timeLeft = 30;
              const timerEl = document.getElementById('timer');
              const progressEl = document.getElementById('progress');
              
              const countdown = setInterval(() => {
                timeLeft--;
                timerEl.textContent = timeLeft;
                progressEl.style.width = (timeLeft / 30 * 100) + '%';
                
                if (timeLeft <= 0) {
                  clearInterval(countdown);
                  if (window.opener) {
                    window.opener.postMessage({ type: 'AD_COMPLETE' }, '*');
                  }
                  setTimeout(() => window.close(), 1000);
                }
              }, 1000);
            </script>
          </body>
          </html>
        `);
        adWindow.document.close();
      } else {
        // Popup blocked - show inline ad instead
        showInlineAd();
      }
    } catch (error) {
      console.error('Error opening ad window:', error);
      showInlineAd();
    }
  };

  const showInlineAd = () => {
    // If popup is blocked, show ad content inline
    setAdTriggered(true);
  };

  // Listen for ad completion from popup window
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data && event.data.type === 'AD_COMPLETE') {
        if (!adCompletedRef.current) {
          adCompletedRef.current = true;
          setWatching(false);
          setAdTimeRemaining(0);
          if (adWindowRef.current) {
            adWindowRef.current.close();
          }
          onComplete();
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onComplete]);

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
            
            {/* Timer and Progress Display - Only show when ad is loaded */}
            {adLoaded && (
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-6 mb-4 border-2 border-purple-300">
                <div className="flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-purple-600 mr-2" />
                  <span className="text-lg font-semibold text-gray-700">Time Remaining:</span>
                  <span className="text-3xl font-bold text-purple-600 ml-3">{adTimeRemaining}s</span>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-4 mb-4 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-blue-500 h-full rounded-full transition-all duration-1000 ease-linear flex items-center justify-end pr-2"
                    style={{ width: `${(adTimeRemaining / 30) * 100}%` }}
                  >
                    {adTimeRemaining > 0 && (
                      <span className="text-xs font-bold text-white">{Math.round((adTimeRemaining / 30) * 100)}%</span>
                    )}
                  </div>
                </div>

                {/* Points Info */}
                <div className="flex items-center justify-center bg-white rounded-lg p-3">
                  <Gift className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-sm font-medium text-gray-700">
                    You will earn <span className="font-bold text-green-600">20 points</span> when the timer ends!
                  </span>
                </div>
              </div>
            )}

            {/* Ad Container */}
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-6 text-center border-2 border-purple-300 relative" style={{ minHeight: '300px' }}>
              {adTriggered ? (
                adLoaded ? (
                  // Ad is loaded and visible
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="mb-4">
                      <div className="animate-pulse rounded-full h-16 w-16 border-4 border-green-500 mx-auto flex items-center justify-center bg-green-100">
                        <span className="text-2xl">✅</span>
                      </div>
                    </div>
                    <p className="text-xl font-semibold text-green-600 mb-2">📺 Ad is Now Playing!</p>
                    <p className="text-sm text-gray-600 mb-4">
                      The ad is visible. Please watch it completely. The countdown timer is running above.
                    </p>
                    <div className="bg-green-100 rounded-lg p-3 max-w-md mx-auto">
                      <p className="text-xs text-green-800 font-medium">
                        ✅ <strong>Ad Loaded Successfully!</strong> Watch the ad and points will be awarded automatically when the timer reaches 0.
                      </p>
                    </div>
                  </div>
                ) : (
                  // Ad is loading/not visible yet
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="mb-6">
                      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600 mx-auto"></div>
                    </div>
                    <p className="text-xl font-semibold text-gray-800 mb-2">📺 Your Ad Will Load Soon</p>
                    <p className="text-sm text-gray-600 mb-2">
                      Please wait while we load the advertisement for you...
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto mt-4">
                      <p className="text-sm text-blue-800 font-medium mb-1">⏳ Loading Advertisement</p>
                      <p className="text-xs text-blue-600">
                        The ad may open in a new window or tab. Please don't close this page. The 30-second countdown will start automatically once the ad is visible.
                      </p>
                    </div>
                  </div>
                )
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-lg text-gray-600">Preparing ad...</p>
                </div>
              )}
            </div>

            {/* Instructions */}
            {adLoaded ? (
              <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-xs text-green-800 text-center">
                  ⏱️ <strong>Ad is Playing:</strong> The 30-second countdown has started! Watch the ad completely. You will earn <strong>20 points</strong> when the timer reaches 0. 
                  {adTimeRemaining > 0 && ` Time remaining: ${adTimeRemaining} seconds.`}
                </p>
              </div>
            ) : (
              <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-xs text-yellow-800 text-center">
                  ⏳ <strong>Please Wait:</strong> The ad is loading. Once it appears, a 30-second countdown will start automatically. You will earn <strong>20 points</strong> when the timer completes.
                </p>
              </div>
            )}
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

