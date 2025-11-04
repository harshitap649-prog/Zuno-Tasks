import { useState, useEffect, useRef } from 'react';
import { X, Clock, Gift } from 'lucide-react';

export default function WatchAdModal({ onClose, onComplete }) {
  const [countdown, setCountdown] = useState(3);
  const [watching, setWatching] = useState(false);
  const [adLoaded, setAdLoaded] = useState(false); // Track if ad is actually visible/loaded
  const [adWatchTime, setAdWatchTime] = useState(0); // Track how long user watched (20 seconds needed)
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

  // Countdown before ad starts - then trigger popunder directly
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      // Countdown ended - trigger popunder ad immediately
      setWatching(true);
      setAdWatchTime(0);
      
      // CRITICAL: Trigger popunder immediately after countdown
      // The script should already be loaded from Dashboard click, but we need to ensure it triggers
      const existingScript = document.querySelector('script[data-adsterra-popunder]');
      
      if (!existingScript) {
        // Load script if not already loaded
        loadAdsterraPopunderAd();
      } else {
        // Script exists - need to trigger popunder
        // Adsterra popunders need user interaction, so we simulate it by reloading script or triggering
        console.log('✅ Script found, attempting to trigger popunder...');
        
        // Try multiple methods to trigger popunder
        window.focus();
        
        // Create a temporary click event to trigger popunder (required for some ad networks)
        try {
          const clickEvent = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
          });
          document.body.dispatchEvent(clickEvent);
        } catch (e) {
          console.log('Could not dispatch click event:', e);
        }
        
        // Try reloading script as fallback
        setTimeout(() => {
          const scriptClone = existingScript.cloneNode(true);
          existingScript.parentNode?.replaceChild(scriptClone, existingScript);
        }, 100);
      }
      
      // Start watching timer immediately (popunder should open in background)
      setTimeout(() => {
        setAdLoaded(true);
        console.log('⏱️ Starting 20-second watch timer');
      }, 300);
    }
  }, [countdown]);

  // Store onComplete in ref to avoid dependency issues
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Ad watching timer - Track time watched (need 20 seconds)
  useEffect(() => {
    // Only start timer if ad is loaded and watching
    if (!watching || !adLoaded || adCompletedRef.current) {
      // Clear timer if conditions not met
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
        countdownTimerRef.current = null;
      }
      return;
    }

    console.log('✅ Starting watch timer - will award points at 20 seconds');

    // Start the watch timer - count up to 20 seconds
    countdownTimerRef.current = setInterval(() => {
      setAdWatchTime((prev) => {
        const newTime = prev + 1;
        console.log(`⏱️ Watch time: ${newTime}/20 seconds`);
        
        // If user watched for 20 or more seconds, award points
        if (newTime >= 20 && !adCompletedRef.current) {
          console.log('🎉 20+ seconds reached! Awarding points...');
          adCompletedRef.current = true;
          
          // Clear timer first
          if (countdownTimerRef.current) {
            clearInterval(countdownTimerRef.current);
            countdownTimerRef.current = null;
          }
          
          // Update state
          setWatching(false);
          setAdLoaded(false);
          
          // Award points immediately using ref to ensure latest callback
          try {
            console.log('✅ Calling onComplete callback...');
            onCompleteRef.current();
            console.log('✅ onComplete callback executed');
          } catch (error) {
            console.error('❌ Error in onComplete callback:', error);
            alert('⚠️ Error awarding points. Please try again.');
          }
          
          return 20; // Cap at 20
        }
        return newTime;
      });
    }, 1000);

    return () => {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
        countdownTimerRef.current = null;
      }
    };
  }, [watching, adLoaded]);


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
            <p className="text-xs text-gray-500 mt-3">⏱️ Watch ad more than 20 seconds to earn 5 points</p>
          </div>
        ) : watching ? (
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Watch Ad to Earn Points</h3>
            <p className="text-xs text-gray-600 mb-4 text-center">⏱️ Watch ad more than 20 seconds to earn 5 points</p>
            
            {/* Simplified Progress Display - No countdown timer, just progress */}
            {adLoaded && (
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-6 mb-4 border-2 border-purple-300">
                {/* Progress Bar - Main Display */}
                <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden relative">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-blue-500 h-full rounded-full transition-all duration-1000 ease-linear flex items-center justify-center"
                    style={{ width: `${Math.min((adWatchTime / 20) * 100, 100)}%` }}
                  >
                    <span className="text-sm font-bold text-white">
                      {adWatchTime < 20 ? `${adWatchTime}/20 seconds` : 'Complete!'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Ad Container - Adsterra Popunder Ad */}
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-6 text-center border-2 border-purple-300 relative" style={{ minHeight: '400px' }}>
              {/* Adsterra Popunder Ad Container */}
              <div id="real-ad-container" className="w-full mb-4" style={{ minHeight: '400px', position: 'relative' }}>
                {adLoaded ? (
                  <div>
                    {/* Adsterra Popunder Ad - Opens in new tab/window */}
                    <div className="w-full" style={{ minHeight: '350px' }}>
                      {/* Popunder ad has opened in background - timer is running */}
                    </div>
                    
                    {/* Simplified Status Overlay - No timer countdown */}
                    <div className="absolute bottom-4 left-0 right-0 z-10">
                      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg p-3 mx-auto max-w-md shadow-lg">
                        <div className="w-full bg-white bg-opacity-30 rounded-full h-3 mb-2">
                          <div
                            className="bg-yellow-300 h-3 rounded-full transition-all duration-1000"
                            style={{ width: `${Math.min((adWatchTime / 20) * 100, 100)}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-center opacity-90">
                          {adWatchTime < 20 ? (
                            <span>Watch more than <strong>20 seconds</strong> to earn <strong>5 points</strong></span>
                          ) : (
                            <span>✅ Complete! You've earned <strong>5 points</strong>!</span>
                          )}
                        </p>
                      </div>
                    </div>
                    
                    {/* Background Placeholder */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 rounded-xl overflow-hidden" style={{ zIndex: 0 }}>
                      <div className="text-6xl mb-4 animate-bounce">📺</div>
                      <h2 className="text-2xl font-bold mb-2">Adsterra Popunder Ad</h2>
                      <p className="text-sm opacity-75 mb-2">Ad opened in new tab/window</p>
                      <p className="text-xs opacity-60">Watch for 20 seconds to earn points</p>
                    </div>
                  </div>
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
                  ⏱️ <strong>Popunder Ad Active:</strong> The ad opened in a new tab/window. Watch for more than <strong>20 seconds</strong> to earn <strong>5 points</strong>. 
                  {adWatchTime < 20 && ` Current: ${adWatchTime}/20 seconds.`}
                  {adWatchTime >= 20 && ` ✅ You've completed the requirement!`}
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

