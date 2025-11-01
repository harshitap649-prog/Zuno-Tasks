import { useEffect, useRef } from 'react';

/**
 * CPAlead Link Locker Component
 * Locks links - users must complete offers to unlock
 */
export default function CPALeadLinkLocker({ lockerUrl, userId, onClose }) {
  const containerRef = useRef(null);

  useEffect(() => {
    // Listen for completion events
    const handleMessage = (event) => {
      if (!event.origin.includes('zwidgetymz56r.xyz') && !event.origin.includes('qckclk.com')) {
        return;
      }

      if (event.data && (
        event.data.type === 'offer_complete' || 
        event.data.event === 'offer_complete'
      )) {
        // Handle completion
        console.log('Link unlocked!');
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  if (!lockerUrl) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600 mb-4">Link Locker is not configured. Please add your Direct Link URL in Admin Panel.</p>
        {onClose && (
          <button onClick={onClose} className="btn-primary">
            Close
          </button>
        )}
      </div>
    );
  }

  // Add user ID to URL if provided
  const fullUrl = userId ? `${lockerUrl}${lockerUrl.includes('?') ? '&' : '?'}subid=${userId}` : lockerUrl;

  const handleOpenLocker = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const newWindow = window.open(fullUrl, '_blank', 'noopener,noreferrer');
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        alert('Please allow popups for this site. Or copy and open this URL manually:\n\n' + fullUrl);
      }
    } catch (error) {
      console.error('Error opening link locker:', error);
      window.location.href = fullUrl;
    }
  };

  return (
    <div ref={containerRef} className="w-full h-full">
      <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 text-2xl">🔗</div>
          <div className="flex-1">
            <p className="text-sm text-blue-800 mb-2 font-semibold">
              Link Locker - Unlock Premium Links
            </p>
            <p className="text-xs text-blue-700 mb-2">
              ✓ Complete offers to unlock special links.
              <br />✓ Access exclusive content after completing offers.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center mb-6">
        <button
          onClick={handleOpenLocker}
          onMouseDown={(e) => e.preventDefault()}
          type="button"
          className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold py-5 px-10 rounded-xl text-xl shadow-2xl transition-all duration-200 transform hover:scale-110 active:scale-95 flex items-center gap-3 cursor-pointer z-50 relative"
          style={{ 
            WebkitTapHighlightColor: 'transparent',
            userSelect: 'none',
            pointerEvents: 'auto'
          }}
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          <span>Open Link Locker</span>
        </button>
        <p className="text-xs text-gray-500 mt-2">Complete offers to unlock links</p>
        
        <div className="mt-4 p-3 bg-gray-100 rounded-lg">
          <p className="text-xs text-gray-600 mb-2">Or copy this URL:</p>
          <div className="flex items-center gap-2">
            <code className="text-xs bg-white px-2 py-1 rounded border flex-1 overflow-x-auto">
              {fullUrl}
            </code>
            <button
              onClick={() => {
                navigator.clipboard.writeText(fullUrl);
                alert('URL copied!');
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

