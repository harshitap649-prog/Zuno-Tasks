import { useState, useEffect, useRef } from 'react';
import { X, Clock, Gift } from 'lucide-react';

export default function WatchAdModal({ onClose, onComplete }) {
  const [countdown, setCountdown] = useState(3);
  const [watching, setWatching] = useState(false);
  const [adLoaded, setAdLoaded] = useState(false); // Track if ad is actually visible/loaded
  const [adTimeRemaining, setAdTimeRemaining] = useState(30); // 30 seconds to watch ad
  const [adTriggered, setAdTriggered] = useState(false);
  const adCompletedRef = useRef(false);
  const countdownTimerRef = useRef(null);
  const popunderScriptLoadedRef = useRef(false);

  // Check if popunder script is already loaded (from Dashboard click handler)
  useEffect(() => {
    // Script is already loaded in click handler - just verify and start timer when countdown ends
    const existingScript = document.querySelector('script[data-adsterra-popunder]');
    if (existingScript) {
      console.log('✅ Popunder script already loaded from click handler');
      popunderScriptLoadedRef.current = true;
    } else {
      // Fallback: Load it here if not already loaded
      console.log('⚠️ Popunder script not found, loading now...');
      loadAdsterraPopunderAd();
      popunderScriptLoadedRef.current = true;
    }
  }, []);

  // Countdown before ad starts
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setWatching(true);
      setAdTimeRemaining(30);
      setAdTriggered(true); // Set triggered immediately so ad container shows
      
      // Start timer immediately - Popunder should have opened already (loaded on modal open)
      // Small delay to ensure popunder has time to trigger
      setTimeout(() => {
        setAdLoaded(true);
        console.log('⏱️ Starting 30-second timer for Popunder ad');
      }, 500);
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


  const loadAdsterraPopunderAd = () => {
    try {
      console.log('Loading Adsterra Popunder ad...');
      
      // Check if script already exists to avoid duplicates
      const existingScript = document.querySelector('script[data-adsterra-popunder]');
      if (existingScript) {
        console.log('Popunder script already loaded');
        return;
      }
      
      // Load Adsterra Popunder script
      const scriptElement = document.createElement('script');
      scriptElement.type = 'text/javascript';
      scriptElement.src = 'https://pl27969271.effectivegatecpm.com/0c/83/73/0c837351d7acd986c96bc088d1b7cbc5.js';
      scriptElement.async = true;
      scriptElement.charset = 'utf-8';
      scriptElement.setAttribute('data-adsterra-popunder', 'true');
      
      scriptElement.onload = () => {
        console.log('✅ Adsterra Popunder script loaded successfully');
      };
      
      scriptElement.onerror = () => {
        console.error('❌ Failed to load Adsterra Popunder script');
      };
      
      // Add script to document head
      const head = document.head || document.getElementsByTagName('head')[0];
      if (head) {
        head.appendChild(scriptElement);
      } else {
        document.body.appendChild(scriptElement);
      }
      
      console.log('Adsterra Popunder script added to page');
      
    } catch (error) {
      console.error('❌ Error loading Adsterra Popunder ad:', error);
    }
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" style={{ zIndex: 1000 }}>
      <div className="bg-white rounded-xl max-w-2xl w-full p-6 relative" style={{ zIndex: 1001 }}>
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
                    You will earn <span className="font-bold text-green-600">10 points</span> when the timer ends!
                  </span>
                </div>
              </div>
            )}

            {/* Ad Container - Adsterra Popunder Ad */}
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-6 text-center border-2 border-purple-300 relative" style={{ minHeight: '400px' }}>
              {/* Adsterra Popunder Ad Container */}
              <div id="real-ad-container" className="w-full mb-4" style={{ minHeight: '400px', position: 'relative' }}>
                {adLoaded ? (
                  <>
                    {/* Adsterra Popunder Ad - Opens in new tab/window */}
                    <div className="w-full" style={{ minHeight: '350px' }}>
                      {/* Popunder ad has opened in background - timer is running */}
                    </div>
                    
                    {/* Timer and Status Overlay */}
                    <div className="absolute bottom-4 left-0 right-0 z-10">
                      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg p-3 mx-auto max-w-md shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold">⏱️ Time Remaining:</span>
                          <span className="text-xl font-bold">{adTimeRemaining}s</span>
                      </div>
                        <div className="w-full bg-white bg-opacity-30 rounded-full h-2">
                          <div
                            className="bg-yellow-300 h-2 rounded-full transition-all duration-1000"
                            style={{ width: `${(adTimeRemaining / 30) * 100}%` }}
                          ></div>
                    </div>
                        <p className="text-xs mt-2 opacity-90">
                          Watch the ad completely to earn <strong>10 points</strong>
                      </p>
                    </div>
                  </div>
                    
                    {/* Background Placeholder */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 rounded-xl overflow-hidden" style={{ zIndex: 0 }}>
                      <div className="text-6xl mb-4 animate-bounce">📺</div>
                      <h2 className="text-2xl font-bold mb-2">Adsterra Popunder Ad</h2>
                      <p className="text-sm opacity-75 mb-2">Ad opened in new tab/window</p>
                      <p className="text-xs opacity-60">Please wait for the timer to complete</p>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="mb-6">
                      <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-purple-600 mx-auto"></div>
                    </div>
                    <p className="text-2xl font-bold text-purple-600 mb-2">📺 Loading Adsterra Ad</p>
                    <p className="text-sm text-gray-600">
                      Opening popunder ad in background...
                    </p>
                </div>
              )}
                </div>
            </div>

            {/* Instructions */}
            {adLoaded ? (
              <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-xs text-green-800 text-center">
                  ⏱️ <strong>Popunder Ad Active:</strong> The 30-second countdown has started! The ad opened in a new tab/window. Wait for the timer to complete. You will earn <strong>10 points</strong> when the timer reaches 0. 
                  {adTimeRemaining > 0 && ` Time remaining: ${adTimeRemaining} seconds.`}
                </p>
              </div>
            ) : (
              <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-xs text-yellow-800 text-center mb-3">
                  ⏳ <strong>Please Wait:</strong> The popunder ad is loading. If the ad doesn't open automatically, click the button below.
                </p>
                <button
                  onClick={() => {
                    // Try to manually trigger popunder
                    const script = document.querySelector('script[data-adsterra-popunder]');
                    if (script && script.src) {
                      // Reload script to trigger popunder
                      const newScript = document.createElement('script');
                      newScript.src = script.src;
                      newScript.async = true;
                      document.head.appendChild(newScript);
                    }
                    // Start timer anyway
                    setAdLoaded(true);
                    window.focus();
                  }}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                  Click Here if Ad Didn't Open
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">✅</div>
            <p className="text-xl font-semibold text-green-600">Ad Complete!</p>
            <p className="text-gray-600 mt-2">You earned 10 points</p>
          </div>
        )}
      </div>
    </div>
  );
}

