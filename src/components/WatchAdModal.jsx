import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export default function WatchAdModal({ onClose, onComplete }) {
  const [countdown, setCountdown] = useState(5);
  const [watching, setWatching] = useState(false);
  const adContainerRef = useRef(null);
  const adCompletedRef = useRef(false);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setWatching(true);
      
      // Load Adsterra rewarded ad when countdown finishes
      const adCode = import.meta.env.VITE_ADSTERRA_REWARDED_CODE;
      
      if (adCode && adContainerRef.current) {
        adContainerRef.current.innerHTML = '';
        const wrapper = document.createElement('div');
        wrapper.innerHTML = adCode;
        
        // Execute scripts from the ad code
        const scripts = wrapper.querySelectorAll('script');
        scripts.forEach((oldScript) => {
          const newScript = document.createElement('script');
          Array.from(oldScript.attributes).forEach((attr) => {
            newScript.setAttribute(attr.name, attr.value);
          });
          newScript.appendChild(document.createTextNode(oldScript.innerHTML));
          oldScript.parentNode.replaceChild(newScript, oldScript);
        });
        
        adContainerRef.current.appendChild(wrapper);
      }
      
      // Auto-complete after watching time (for Adsterra, ad will handle completion)
      // Fallback timer in case ad doesn't trigger completion
      const fallbackTimer = setTimeout(() => {
        if (!adCompletedRef.current) {
          setWatching(false);
          onComplete();
        }
      }, 30000); // 30 seconds fallback

      return () => clearTimeout(fallbackTimer);
    }
  }, [countdown, onComplete]);

  // Listen for ad completion (Adsterra provides callbacks)
  useEffect(() => {
    if (!watching) return;

    // Adsterra callback handler - adjust based on your Adsterra setup
    const handleAdComplete = () => {
      adCompletedRef.current = true;
      setWatching(false);
      onComplete();
    };

    // Listen for Adsterra completion event
    window.addEventListener('adCompleted', handleAdComplete);
    
    // Also listen for common ad completion patterns
    const checkInterval = setInterval(() => {
      // You can add custom logic here to detect when ad is finished
      // This depends on your Adsterra ad unit type
    }, 1000);

    return () => {
      window.removeEventListener('adCompleted', handleAdComplete);
      clearInterval(checkInterval);
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

        <div className="text-center py-8">
          {countdown > 0 ? (
            <>
              <div className="text-6xl font-bold text-purple-600 mb-4">
                {countdown}
              </div>
              <p className="text-gray-600">Preparing ad...</p>
            </>
          ) : watching ? (
            <>
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg p-8 mb-4 min-h-[300px] flex items-center justify-center">
                <div className="text-white">
                  <div className="text-4xl font-bold mb-4">📺</div>
                  <p className="text-xl">Ad Playing...</p>
                  <p className="text-sm mt-2 opacity-80">Please wait 15 seconds</p>
                </div>
              </div>
              <p className="text-gray-600">Watch the ad to earn points</p>
            </>
          ) : (
            <div className="py-8">
              <div className="text-6xl mb-4">✅</div>
              <p className="text-xl font-semibold text-green-600">Ad Complete!</p>
              <p className="text-gray-600 mt-2">You earned 20 points</p>
            </div>
          )}
        </div>

        {/* Ad container for Adsterra Rewarded Ad */}
        {watching && (
          <div className="bg-gray-50 rounded-lg p-4 text-center border-2 border-purple-300" style={{ minHeight: '400px' }}>
            <div ref={adContainerRef} style={{ width: '100%', height: '100%', minHeight: '400px' }} />
            {!import.meta.env.VITE_ADSTERRA_REWARDED_CODE && (
              <div className="flex items-center justify-center h-full" style={{ minHeight: '400px' }}>
                <div>
                  <p className="text-lg font-semibold mb-2">📺 Rewarded Ad</p>
                  <p className="text-sm text-gray-500">Add VITE_ADSTERRA_REWARDED_CODE in .env</p>
                  <p className="text-xs text-gray-400 mt-4">Ad will appear here once configured</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

