import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';

export default function WatchAdModal({ onClose, onComplete, userId }) {
  const [watchTime, setWatchTime] = useState(0);
  const [adWindowOpen, setAdWindowOpen] = useState(false);
  const [isAlreadyLoaded, setIsAlreadyLoaded] = useState(false);
  const adCompletedRef = useRef(false);
  const timerRef = useRef(null);
  const loadingTimeoutRef = useRef(null);
  const adCheckIntervalRef = useRef(null);
  const windowCheckIntervalRef = useRef(null);
  const initialWindowCountRef = useRef(0);
  const adWindowRef = useRef(null);

  // Check if ad is already loaded on mount
  useEffect(() => {
    const checkInitialLoad = () => {
      const adLoadedStatus = window.__adLoadedStatus;
      const scriptExists = document.querySelector('script[src*="pl28003582.effectivegatecpm.com"]');
      
      if (adLoadedStatus || scriptExists) {
        console.log('✅ Ad already loaded - skipping loading screen');
        setIsAlreadyLoaded(true);
        // Check for popunder window immediately
        checkForPopunderWindow();
        return true;
      }
      return false;
    };

    // Check immediately
    if (checkInitialLoad()) {
      return;
    }

    // If not already loaded, wait for script to load, then check for popunder window
    const checkAdScriptLoaded = () => {
      const adLoadedStatus = window.__adLoadedStatus;
      const scriptExists = document.querySelector('script[src*="pl28003582.effectivegatecpm.com"]');
      
      if (adLoadedStatus || scriptExists) {
        console.log('✅ Ad script loaded - checking for popunder window...');
        // Start checking for popunder window
        checkForPopunderWindow();
        return true;
      }
      return false;
    };

    // Check periodically for script loading
    let checkCount = 0;
    adCheckIntervalRef.current = setInterval(() => {
      checkCount++;
      if (checkAdScriptLoaded()) {
        if (adCheckIntervalRef.current) {
          clearInterval(adCheckIntervalRef.current);
          adCheckIntervalRef.current = null;
        }
      } else if (checkCount >= 20) {
        // After 10 seconds, stop checking
        if (adCheckIntervalRef.current) {
          clearInterval(adCheckIntervalRef.current);
          adCheckIntervalRef.current = null;
        }
      }
    }, 500);

    return () => {
      if (adCheckIntervalRef.current) {
        clearInterval(adCheckIntervalRef.current);
        adCheckIntervalRef.current = null;
      }
    };
  }, []);

  // Function to check if popunder window opened
  const checkForPopunderWindow = () => {
    // Store initial window count
    if (initialWindowCountRef.current === 0) {
      initialWindowCountRef.current = window.length;
    }

    // Check for new windows/tabs
    windowCheckIntervalRef.current = setInterval(() => {
      const currentWindowCount = window.length;
      
      // If window count increased, popunder likely opened
      if (currentWindowCount > initialWindowCountRef.current && !adWindowOpen) {
        console.log('✅ Popunder window detected!');
        setAdWindowOpen(true);
        
        if (windowCheckIntervalRef.current) {
          clearInterval(windowCheckIntervalRef.current);
          windowCheckIntervalRef.current = null;
        }
      }
      
      // Also check window focus - if main window loses focus, popunder might have opened
      if (!document.hasFocus() && !adWindowOpen) {
        // Wait a moment to confirm
        setTimeout(() => {
          if (!document.hasFocus() && !adWindowOpen) {
            console.log('✅ Window focus lost - popunder likely opened');
            setAdWindowOpen(true);
          }
        }, 500);
      }
    }, 500);

    // Timeout after 15 seconds - assume popunder opened even if we can't detect it
    setTimeout(() => {
      if (!adWindowOpen && windowCheckIntervalRef.current) {
        console.log('⚠️ Could not detect popunder window, but assuming it opened');
        setAdWindowOpen(true);
        if (windowCheckIntervalRef.current) {
          clearInterval(windowCheckIntervalRef.current);
          windowCheckIntervalRef.current = null;
        }
      }
    }, 15000);
  };

  // Monitor if popunder window closes before 20 seconds
  useEffect(() => {
    if (!adWindowOpen) return;

    const checkWindowClosed = setInterval(() => {
      // If main window regains focus and timer hasn't reached 20 seconds, user might have closed popunder
      if (document.hasFocus() && watchTime < 20 && !adCompletedRef.current) {
        // Check if this is a legitimate focus return or if popunder was closed
        // We'll only trigger this if focus returns AND timer is still running
        // This is a heuristic - not perfect but better than nothing
      }
    }, 1000);

    return () => clearInterval(checkWindowClosed);
  }, [adWindowOpen, watchTime]);

  // Start timer ONLY when popunder window is detected
  useEffect(() => {
    if (!adWindowOpen) {
      return;
    }

    // Clear any loading timeouts
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }

    // Start timer only after popunder window is confirmed open
    console.log('✅ Starting timer - popunder window is open');
    startTimer();

    function startTimer() {
      if (!adCompletedRef.current) {
        timerRef.current = setInterval(() => {
          setWatchTime((prev) => {
            const newTime = prev + 1;
            
            // Auto-close and award points after 20 seconds
            if (newTime >= 20 && !adCompletedRef.current) {
              adCompletedRef.current = true;
              
              // Clear timer
              if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
              }
              
              // Award points ONLY if popunder was open for 20+ seconds
              if (adWindowOpen && onComplete) {
                onComplete();
              }
              
              // Close modal
              setTimeout(() => {
                onClose();
              }, 500);
              
              return 20;
            }
            
            return newTime;
          });
        }, 1000);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (windowCheckIntervalRef.current) {
        clearInterval(windowCheckIntervalRef.current);
        windowCheckIntervalRef.current = null;
      }
    };
  }, [adWindowOpen, onComplete, onClose]);

  // Handle manual close
  const handleClose = () => {
    if (watchTime < 20 && !adCompletedRef.current && adWindowOpen) {
      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      alert('You closed the ad before 20 seconds. Please watch the ad for at least 20 seconds to earn points.');
      onClose();
    } else if (!adWindowOpen) {
      // If popunder never opened, just close
      onClose();
    } else {
      // If 20+ seconds, close normally
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" style={{ zIndex: 1000 }}>
      <div className="bg-white rounded-xl max-w-2xl w-full p-6 relative" style={{ zIndex: 1001 }}>
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-6 h-6" />
        </button>

        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Watch Ad to Earn Points</h3>

          {/* Show loading screen until popunder window opens */}
          {!isAlreadyLoaded && !adWindowOpen ? (
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-8 text-center border-2 border-purple-300" style={{ minHeight: '300px' }}>
              <div className="flex flex-col items-center justify-center h-full">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600 mb-6"></div>
                <p className="text-xl font-semibold text-gray-800 mb-2">Ad is loading, please wait...</p>
                <p className="text-sm text-gray-600">Please wait while we load the popunder ad</p>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-8 text-center border-2 border-green-300" style={{ minHeight: '300px' }}>
              <div className="flex flex-col items-center justify-center h-full">
                <div className="bg-green-100 rounded-full p-4 mb-4">
                  <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-lg font-semibold text-gray-800 mb-2">Ad is loading... please wait</p>
                <p className="text-sm text-gray-600 mb-4">
                  The ad should appear in a new window/tab. Please watch it for 20 seconds.
                </p>
                <p className="text-xs text-gray-500">
                  {watchTime > 0 && `Watching: ${watchTime}/20 seconds`}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
