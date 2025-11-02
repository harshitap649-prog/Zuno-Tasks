import { useEffect, useRef, useState, useCallback } from 'react';
import { updateUserPoints } from '../firebase/firestore';
import { Coins } from 'lucide-react';

/**
 * CPAlead Quiz Component
 * Users complete quizzes to earn rewards
 */
export default function CPALeadQuiz({ quizUrl, userId, onClose, onComplete }) {
  const containerRef = useRef(null);
  const pointsAwardedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  const quizWindowRef = useRef(null);
  const quizStartTimeRef = useRef(null);
  const [showClaimButton, setShowClaimButton] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);

  // Keep onComplete ref updated
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Function to award points
  const awardPoints = useCallback(async (source = 'auto') => {
    // Prevent duplicate awards
    if (pointsAwardedRef.current) {
      console.log('Points already awarded for this quiz');
      return;
    }

    if (!userId) {
      console.warn('No userId provided, cannot award points');
      return;
    }

    console.log(`Quiz completed! Awarding 10 points... (source: ${source})`);
    pointsAwardedRef.current = true;
    setIsClaiming(true);

    try {
      const result = await updateUserPoints(userId, 10);
      if (result.success) {
        console.log('10 points awarded successfully!');
        setShowClaimButton(false);
        if (onCompleteRef.current) {
          onCompleteRef.current({ reward: 10, message: 'Quiz completed! You earned 10 points!' });
        }
        // Show success alert
        alert('🎉 Success! You earned 10 points!');
      } else {
        console.error('Failed to award points:', result.error);
        pointsAwardedRef.current = false; // Allow retry
        if (onCompleteRef.current) {
          onCompleteRef.current({ reward: 10, message: 'Quiz completed! (Points may be pending)' });
        }
        alert('⚠️ Failed to award points. Please try claiming manually.');
      }
    } catch (error) {
      console.error('Error awarding points:', error);
      pointsAwardedRef.current = false; // Allow retry
      if (onCompleteRef.current) {
        onCompleteRef.current({ reward: 10, message: 'Quiz completed! (Error awarding points)' });
      }
      alert('⚠️ Error awarding points. Please try claiming manually.');
    } finally {
      setIsClaiming(false);
    }
  }, [userId]);

  useEffect(() => {
    // Listen for completion events from postMessage
    const handleMessage = async (event) => {
      // Log all messages for debugging
      console.log('Received message:', event.origin, event.data);

      // Check for CPAlead quiz completion events - be more lenient
      if (event.data && (
        event.data.type === 'quiz_complete' || 
        event.data.event === 'quiz_complete' ||
        event.data.type === 'offer_complete' || 
        event.data.event === 'offer_complete' ||
        event.data.type === 'cpalead_complete' ||
        event.data.type === 'quiz_done' ||
        event.data.status === 'complete' ||
        event.data.completed === true ||
        (typeof event.data === 'string' && event.data.toLowerCase().includes('complete'))
      )) {
        console.log('Quiz completion detected via postMessage');
        // Show claim button when completion is detected
        setShowClaimButton(true);
        // Auto-award points
        await awardPoints('postMessage');
      }
    };

    // Listen for window focus (user returns after completing quiz)
    const handleFocus = async () => {
      // If quiz window was opened and user returns, check if enough time passed
      if (quizWindowRef.current && !pointsAwardedRef.current && quizStartTimeRef.current) {
        const timeSinceStart = Date.now() - quizStartTimeRef.current;
        // Only show claim button and award if quiz was open for at least 15 seconds (user likely completed quiz)
        if (timeSinceStart >= 15000) {
          setTimeout(async () => {
            if (!pointsAwardedRef.current && quizWindowRef.current) {
              console.log('User returned from quiz - quiz likely completed');
              setShowClaimButton(true); // Show claim button for completed quiz
              await awardPoints('focus_return');
            }
          }, 1000); // 1 second delay
        } else {
          // Quiz wasn't open long enough - don't show claim button
          console.log('User returned but quiz was open too briefly - quiz likely NOT completed');
          setShowClaimButton(false);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', () => {
      // When window loses focus, check if quiz window is still open
      if (quizWindowRef.current && !quizWindowRef.current.closed) {
        console.log('Window blurred but quiz still open');
      }
    });

    // Check if quiz window was closed - AWARD POINTS IMMEDIATELY (if enough time passed)
    const checkQuizWindow = setInterval(() => {
      if (quizWindowRef.current) {
        try {
            if (quizWindowRef.current.closed) {
            // Quiz window was closed - check if enough time passed (user likely completed quiz)
            if (!pointsAwardedRef.current && quizStartTimeRef.current) {
              const timeSinceStart = Date.now() - quizStartTimeRef.current;
              // Only show claim button and award if quiz was open for at least 15 seconds (indicating completion)
              if (timeSinceStart >= 15000) {
                console.log('✅ Quiz window closed - quiz was open for', Math.round(timeSinceStart/1000), 'seconds - quiz likely completed');
                // Show claim button for manual claim
                setShowClaimButton(true);
                // Also try to auto-award
                awardPoints('window_closed').catch(err => {
                  console.error('❌ Error awarding points on window close:', err);
                  // Claim button already visible for manual claim
                });
              } else {
                console.log('⚠️ Quiz window closed too quickly (', Math.round(timeSinceStart/1000), 'seconds) - quiz likely NOT completed');
                // Don't show claim button if closed too quickly - quiz wasn't completed
                setShowClaimButton(false);
              }
            }
            // Clear window ref but keep claim button visible for manual claim
            if (pointsAwardedRef.current) {
              quizWindowRef.current = null;
              quizStartTimeRef.current = null;
            }
            clearInterval(checkQuizWindow);
          }
        } catch (e) {
          // Cross-origin error, window might be closed
          console.log('⚠️ Cannot check window status (likely closed)');
          if (!pointsAwardedRef.current) {
            // If enough time passed, show claim button and try to award points
            if (quizStartTimeRef.current) {
              const timeSinceStart = Date.now() - quizStartTimeRef.current;
              if (timeSinceStart >= 15000) {
                console.log('✅ Window likely closed after 15+ seconds - quiz likely completed');
                setShowClaimButton(true); // Show claim button for completed quiz
                awardPoints('window_closed_detected').catch(err => {
                  console.error('❌ Error awarding points:', err);
                  // Claim button already visible for manual claim
                });
              } else {
                console.log('⚠️ Window closed too quickly - quiz likely NOT completed');
                setShowClaimButton(false); // Don't show claim button for incomplete quiz
              }
            } else {
              setShowClaimButton(false); // Don't show if we don't have timing info
            }
            quizWindowRef.current = null;
            quizStartTimeRef.current = null;
          }
        }
      }
    }, 500); // Check every 500ms for faster detection

    return () => {
      window.removeEventListener('message', handleMessage);
      window.removeEventListener('focus', handleFocus);
      clearInterval(checkQuizWindow);
    };
  }, [userId, awardPoints]);

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
    
    // Reset states when opening new quiz
    pointsAwardedRef.current = false;
    setShowClaimButton(false); // Don't show claim button until quiz is completed
    quizStartTimeRef.current = null; // Reset timer
    
    try {
      const newWindow = window.open(fullUrl, '_blank', 'noopener,noreferrer');
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        alert('Please allow popups for this site. Or copy and open this URL manually:\n\n' + fullUrl);
      } else {
        quizWindowRef.current = newWindow;
        quizStartTimeRef.current = Date.now(); // Track when quiz was opened
        console.log('Quiz window opened, tracking for completion...');
        // Claim button will show only when quiz is actually completed
      }
    } catch (error) {
      console.error('Error opening quiz:', error);
      window.location.href = fullUrl;
    }
  };

  const handleClaimPoints = async () => {
    await awardPoints('manual');
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
              ✓ Complete offers within quizzes to unlock more earnings.
              <br />✓ Solve one quiz and get <span className="font-bold text-purple-900">10 points</span> automatically!
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
        
        {/* Claim Points Button - Shows immediately after quiz is opened */}
        {showClaimButton && !pointsAwardedRef.current && (
          <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg w-full max-w-md shadow-lg">
            <p className="text-sm text-green-800 font-semibold mb-3 text-center">
              ✓ Completed the quiz? Click below to get your 10 points instantly!
            </p>
            <p className="text-xs text-green-700 mb-3 text-center">
              💡 Points will also be awarded automatically when you close the quiz tab.
            </p>
            <button
              onClick={handleClaimPoints}
              disabled={isClaiming}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:bg-gray-400 text-white font-bold py-4 px-6 rounded-lg flex items-center justify-center gap-2 transition-all transform hover:scale-105 shadow-lg"
            >
              {isClaiming ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  <span>Claiming Points...</span>
                </>
              ) : (
                <>
                  <Coins className="w-6 h-6" />
                  <span className="text-lg">Claim 10 Points Now</span>
                </>
              )}
            </button>
          </div>
        )}
        
        {/* Success message when points are awarded */}
        {pointsAwardedRef.current && (
          <div className="mt-4 p-4 bg-green-100 border-2 border-green-400 rounded-lg w-full max-w-md">
            <p className="text-sm text-green-800 font-bold text-center">
              ✅ Success! 10 points have been added to your account!
            </p>
          </div>
        )}
        
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

