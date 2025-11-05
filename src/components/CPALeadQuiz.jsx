import { useEffect, useRef, useState, useCallback } from 'react';
import { updateUserPoints } from '../firebase/firestore';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
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
  const [quizCounter, setQuizCounter] = useState(0); // Counter to force new quiz each time
  const [quizId, setQuizId] = useState(null); // Track current quiz ID
  const [sessionId, setSessionId] = useState(() => {
    // Generate unique session ID for this quiz session (not tied to user ID)
    // This prevents CPAlead from detecting duplicate users
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 12)}`;
  });

  // Keep onComplete ref updated
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Function to award points
  const awardPoints = useCallback(async (source = 'auto') => {
    // Prevent duplicate awards
    if (pointsAwardedRef.current) {
      console.log('⚠️ Points already awarded for this quiz, skipping...');
      return;
    }

    if (!userId) {
      console.warn('❌ No userId provided, cannot award points');
      alert('Error: User ID not found. Please refresh the page and try again.');
      return;
    }

    const currentQuizId = quizId || `quiz_${Date.now()}`;
    console.log(`🎯 Quiz completed! Awarding 5 points... (source: ${source}, quizId: ${currentQuizId})`);
    
    pointsAwardedRef.current = true;
    setIsClaiming(true);

    try {
      console.log('📤 Calling updateUserPoints with userId:', userId, 'points: 5, type: quiz');
      const result = await updateUserPoints(userId, 5, 'quiz');
      console.log('📥 updateUserPoints result:', JSON.stringify(result));
      
      if (result.success) {
        console.log('✅ 5 points awarded successfully!');
        setShowClaimButton(false);
        
        // Track quiz completion for developer revenue
        // Store mapping: sessionId -> userId so we can track revenue even with randomized subids
        try {
          await addDoc(collection(db, 'quizCompletions'), {
            userId: userId,
            sessionId: sessionId,
            quizType: 'cpalead',
            quizId: currentQuizId,
            points: 5,
            timestamp: serverTimestamp(),
          });
          console.log('✅ Quiz completion tracked for revenue (sessionId:', sessionId, ')');
        } catch (trackError) {
          console.error('❌ Error tracking quiz completion:', trackError);
        }
        
        if (onCompleteRef.current) {
          onCompleteRef.current({ reward: 5, message: 'Quiz completed! You earned 5 points!' });
        }
        // Show success alert
        alert('🎉 Success! You earned 5 points!');
      } else {
        console.error('❌ Failed to award points. Error:', result.error);
        console.error('Full result object:', result);
        pointsAwardedRef.current = false; // Allow retry
        setIsClaiming(false);
        setShowClaimButton(true); // Show claim button for manual retry
        if (onCompleteRef.current) {
          onCompleteRef.current({ reward: 5, message: 'Quiz completed! (Points may be pending)' });
        }
        alert(`⚠️ Failed to award points: ${result.error || 'Unknown error'}\n\nPlease click "Claim 5 Points Now" button to try again.`);
      }
    } catch (error) {
      console.error('❌ Error awarding points:', error);
      console.error('Error stack:', error.stack);
      pointsAwardedRef.current = false; // Allow retry
      setIsClaiming(false);
      setShowClaimButton(true); // Show claim button for manual retry
      if (onCompleteRef.current) {
        onCompleteRef.current({ reward: 5, message: 'Quiz completed! (Error awarding points)' });
      }
      alert(`⚠️ Error awarding points: ${error.message || 'Unknown error'}\n\nPlease click "Claim 5 Points Now" button to try again.`);
    }
  }, [userId, quizId]);

  // Debug: Log when component mounts/updates
  useEffect(() => {
    console.log('🔄 CPALeadQuiz component mounted/updated, quizCounter:', quizCounter, 'quizId:', quizId);
  }, [quizCounter, quizId]);

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
        (typeof event.data === 'string' && event.data.toLowerCase().includes('complete')) ||
        // Also check for common completion patterns
        (typeof event.data === 'object' && event.data.message && event.data.message.toLowerCase().includes('complete')) ||
        (typeof event.data === 'object' && event.data.action === 'complete')
      )) {
        console.log('✅ Quiz completion detected via postMessage:', event.data);
        // Show claim button when completion is detected
        setShowClaimButton(true);
        // Try to auto-award points, but don't fail silently
        try {
          await awardPoints('postMessage');
        } catch (err) {
          console.log('Auto-award via postMessage failed, user can claim manually:', err);
          // Button is already visible for manual claim
        }
      }
    };

    // Listen for window focus (user returns after completing quiz)
    const handleFocus = async () => {
      // If quiz window was opened and user returns, check if enough time passed
      if (quizWindowRef.current && !pointsAwardedRef.current && quizStartTimeRef.current) {
        const timeSinceStart = Date.now() - quizStartTimeRef.current;
        // Auto-award if quiz was open for at least 13 seconds
        if (timeSinceStart >= 13000) {
          setTimeout(async () => {
            if (!pointsAwardedRef.current) {
              console.log('✅ User returned from quiz after 13+ seconds - auto-awarding points');
              setShowClaimButton(true);
              // Auto-award points
              try {
                await awardPoints('focus_return');
              } catch (err) {
                console.log('Auto-award failed, showing claim button for manual claim:', err);
                // Claim button already visible for manual claim
              }
            }
          }, 500);
        } else {
          // Quiz wasn't open long enough yet - wait until 13 seconds total
          const remainingTime = 13000 - timeSinceStart;
          if (remainingTime > 0) {
            setTimeout(async () => {
              if (!pointsAwardedRef.current && quizStartTimeRef.current) {
                const totalTime = Date.now() - quizStartTimeRef.current;
                if (totalTime >= 13000) {
                  console.log('✅ 13 seconds elapsed while user returned - auto-awarding points');
                  setShowClaimButton(true);
                  try {
                    await awardPoints('focus_return_delayed');
                  } catch (err) {
                    console.log('Auto-award failed, showing claim button:', err);
                  }
                }
              }
            }, remainingTime);
          } else {
            console.log('User returned but quiz was open too briefly - quiz likely NOT completed');
            setShowClaimButton(false);
          }
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
              // Show claim button and try to award if quiz was open for at least 13 seconds
              if (timeSinceStart >= 13000) {
                console.log('✅ Quiz window closed - quiz was open for', Math.round(timeSinceStart/1000), 'seconds - awarding points');
                // Show claim button for manual claim
                setShowClaimButton(true);
                // Try to auto-award points
                awardPoints('window_closed').catch(err => {
                  console.log('Auto-award failed, user can claim manually:', err);
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
            // If time passed, show claim button and try to award points
            if (quizStartTimeRef.current) {
              const timeSinceStart = Date.now() - quizStartTimeRef.current;
              if (timeSinceStart >= 13000) {
                console.log('✅ Window likely closed after 13+ seconds - awarding points');
                setShowClaimButton(true); // Show claim button for completed quiz
                awardPoints('window_closed_detected').catch(err => {
                  console.log('Auto-award failed, user can claim manually:', err);
                });
              } else {
                console.log('⚠️ Window closed too quickly - quiz likely NOT completed');
                setShowClaimButton(false); // Don't show claim button for incomplete quiz
              }
            } else {
              // No timing info - don't show button
              setShowClaimButton(false);
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

  // Generate unique URL for each quiz to prevent CPAlead duplicate detection
  // CRITICAL: Don't use userId as subid - CPAlead limits to one quiz per subid
  // Instead, use randomized session IDs so each quiz appears as a new user
  const getQuizUrl = useCallback((counter = quizCounter, newSessionId = null) => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 12);
    const random2 = Math.random().toString(36).substr(2, 12);
    
    // Use session ID instead of userId to prevent CPAlead duplicate detection
    // Each quiz gets a fresh session ID so CPAlead treats it as a new user
    const currentSessionId = newSessionId || sessionId;
    const uniqueSubId = `${currentSessionId}_${counter}_${timestamp}_${random}`;
    
    // Build URL with proper query parameter handling
    let url = quizUrl;
    const separator = url.includes('?') ? '&' : '?';
    
    // IMPORTANT: Use randomized subid, NOT userId
    // This prevents CPAlead from limiting to one quiz per user
    url = `${url}${separator}subid=${uniqueSubId}`;
    
    // Add multiple unique parameters to force new quiz load each time
    // Also add rotation parameter to help get different quizzes
    url = `${url}&_t=${timestamp}&_r=${random}&_q=${counter}&_s=${random2}&_rotate=${counter}&nocache=${timestamp}&fresh=${Date.now()}`;
    
    return url;
  }, [quizUrl, sessionId, quizCounter]);
  
  const [fullUrl, setFullUrl] = useState(() => getQuizUrl(0));

  const handleOpenQuiz = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Increment quiz counter to get a new quiz
    const newCounter = quizCounter + 1;
    setQuizCounter(newCounter);
    
    // Generate NEW session ID for each quiz to prevent CPAlead duplicate detection
    // This makes each quiz appear as a completely new user to CPAlead
    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 15)}`;
    setSessionId(newSessionId);
    
    // Generate NEW URL with fresh session ID, counter and timestamp
    const newUrl = getQuizUrl(newCounter, newSessionId);
    setFullUrl(newUrl);
    
    // Generate unique quiz ID for this attempt
    const newQuizId = `quiz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setQuizId(newQuizId);
    
    // Reset states when opening new quiz
    pointsAwardedRef.current = false;
    setShowClaimButton(false); // Don't show claim button until quiz is opened
    quizStartTimeRef.current = null; // Reset timer
    quizWindowRef.current = null; // Clear previous window reference
    
    console.log('🔄 Starting new quiz #' + newCounter);
    console.log('🆔 New session ID:', newSessionId);
    console.log('🔗 URL:', newUrl);
    
    try {
      const newWindow = window.open(newUrl, '_blank', 'noopener,noreferrer');
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        alert('Please allow popups for this site. Or copy and open this URL manually:\n\n' + newUrl);
      } else {
        quizWindowRef.current = newWindow;
        quizStartTimeRef.current = Date.now(); // Track when quiz was opened
        console.log('Quiz window opened, tracking for completion...');
        
        // Show claim button and auto-award points after 13 seconds
        // This ensures users get points automatically after completing quiz
        const autoAwardTimer = setTimeout(async () => {
          if (!pointsAwardedRef.current && quizStartTimeRef.current) {
            const timeSinceStart = Date.now() - quizStartTimeRef.current;
            if (timeSinceStart >= 13000) {
              console.log('✅ Quiz opened 13+ seconds ago - auto-awarding 5 points');
              setShowClaimButton(true);
              // Auto-award points after 13 seconds
              try {
                await awardPoints('auto_13_seconds');
              } catch (err) {
                console.error('❌ Auto-award failed:', err);
                setShowClaimButton(true); // Ensure button is visible for manual claim
                alert('Points not awarded automatically. Please click "Claim 5 Points Now" button.');
              }
            } else {
              console.log(`⏳ Quiz open for ${Math.round(timeSinceStart/1000)}s, waiting until 13 seconds...`);
            }
          }
        }, 13000); // Auto-award after 13 seconds
      }
    } catch (error) {
      console.error('Error opening quiz:', error);
      // Use newUrl instead of fullUrl (which might be stale)
      const fallbackUrl = getQuizUrl(quizCounter + 1, `session_${Date.now()}_${Math.random().toString(36).substr(2, 15)}`);
      window.location.href = fallbackUrl;
    }
  };

  const handleClaimPoints = async () => {
    // Always allow manual claim - reset the flag temporarily if needed
    if (pointsAwardedRef.current) {
      console.log('Points already awarded, but allowing manual claim attempt');
    }
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
              <br />✓ Solve one quiz and get <span className="font-bold text-purple-900">5 points</span> automatically!
              <br />✓ Don't solve repeated quizzes again and again - it will not grant points.
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
              ✅ Quiz completed! Claim your 5 points now!
            </p>
            <p className="text-xs text-green-700 mb-3 text-center">
              💡 Points are awarded automatically after 13 seconds.
              <br />✅ If points weren't added automatically, click below to claim manually.
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
                  <span className="text-lg">Claim 5 Points Now</span>
                </>
              )}
            </button>
          </div>
        )}
        
        {/* Success message when points are awarded */}
        {pointsAwardedRef.current && (
          <div className="mt-4 p-4 bg-green-100 border-2 border-green-400 rounded-lg w-full max-w-md">
            <p className="text-sm text-green-800 font-bold text-center mb-2">
              ✅ Success! 5 points have been added to your account!
            </p>
            <button
              onClick={() => {
                console.log('🔄 Resetting for new quiz...');
                // Reset everything for a new quiz
                pointsAwardedRef.current = false;
                setShowClaimButton(false);
                quizWindowRef.current = null;
                quizStartTimeRef.current = null;
                setQuizId(null);
                
                // Generate NEW session ID for next quiz (critical for avoiding CPAlead limits)
                const nextCounter = quizCounter + 1;
                const nextSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 15)}`;
                setQuizCounter(nextCounter);
                setSessionId(nextSessionId);
                
                // Generate new URL with fresh session ID
                const newUrl = getQuizUrl(nextCounter, nextSessionId);
                setFullUrl(newUrl);
                console.log('✅ Ready for new quiz #' + nextCounter);
                console.log('🆔 New session ID:', nextSessionId);
                if (onCompleteRef.current) {
                  onCompleteRef.current({ reward: 5, message: 'Ready for next quiz!' });
                }
              }}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg mt-2"
            >
              Start New Quiz
            </button>
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

