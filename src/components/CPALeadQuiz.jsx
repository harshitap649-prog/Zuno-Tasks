import { useEffect, useRef } from 'react';

/**
 * CPAlead Quiz Component
 * Users complete quizzes to earn rewards
 */
export default function CPALeadQuiz({ quizUrl, userId, onClose, onComplete }) {
  const containerRef = useRef(null);

  useEffect(() => {
    // Listen for completion events
    const handleMessage = (event) => {
      if (!event.origin.includes('zwidgetymz56r.xyz') && 
          !event.origin.includes('akamaicdn.org') && 
          !event.origin.includes('qckclk.com')) {
        return;
      }

      if (event.data && (
        event.data.type === 'quiz_complete' || 
        event.data.event === 'quiz_complete' ||
        event.data.type === 'offer_complete' || 
        event.data.event === 'offer_complete'
      )) {
        // Handle completion
        console.log('Quiz completed!');
        if (onComplete) {
          onComplete({ reward: 0, message: 'Quiz completed!' });
        }
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  if (!quizUrl) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600 mb-4">Quiz is not configured. Please add your Direct Link URL in Admin Panel.</p>
        {onClose && (
          <button onClick={onClose} className="btn-primary">
            Close
          </button>
        )}
      </div>
    );
  }

  // Add user ID to URL if provided
  const fullUrl = userId ? `${quizUrl}${quizUrl.includes('?') ? '&' : '?'}subid=${userId}` : quizUrl;

  const handleOpenQuiz = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const newWindow = window.open(fullUrl, '_blank', 'noopener,noreferrer');
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        alert('Please allow popups for this site. Or copy and open this URL manually:\n\n' + fullUrl);
      }
    } catch (error) {
      console.error('Error opening quiz:', error);
      window.location.href = fullUrl;
    }
  };

  return (
    <div ref={containerRef} className="w-full h-full">
      <div className="mb-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 text-2xl">🧩</div>
          <div className="flex-1">
            <p className="text-sm text-purple-800 mb-2 font-semibold">
              Quiz - Test Your Knowledge & Earn
            </p>
            <p className="text-xs text-purple-700 mb-2">
              ✓ Answer quiz questions to earn rewards.
              <br />✓ Complete offers within quizzes to unlock more earnings.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center mb-6">
        <button
          onClick={handleOpenQuiz}
          onMouseDown={(e) => e.preventDefault()}
          type="button"
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-5 px-10 rounded-xl text-xl shadow-2xl transition-all duration-200 transform hover:scale-110 active:scale-95 flex items-center gap-3 cursor-pointer z-50 relative"
          style={{ 
            WebkitTapHighlightColor: 'transparent',
            userSelect: 'none',
            pointerEvents: 'auto'
          }}
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Start Quiz</span>
        </button>
        <p className="text-xs text-gray-500 mt-2">Complete quizzes to earn points</p>
        
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
              className="text-xs bg-purple-500 text-white px-3 py-1 rounded hover:bg-purple-600"
            >
              Copy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

