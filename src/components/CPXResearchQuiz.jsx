import { useEffect, useRef, useCallback, useState } from 'react';
import { updateUserPoints, getUserData } from '../firebase/firestore';
import { FileText } from 'lucide-react';

/**
 * CPX Research Survey Component
 * High-paying surveys with instant approval
 * Note: Survey rewards (+0.00) are shown initially but will be awarded after completion
 */
export default function CPXResearchQuiz({ apiKey, userId, offerwallUrl, user, secureHashKey, onClose, onComplete }) {
  const iframeRef = useRef(null);
  const containerRef = useRef(null);
  const pointsAwardedRef = useRef(new Set()); // Track awarded offer IDs to prevent duplicates
  const offerWindowRef = useRef(null);
  const offerStartTimeRef = useRef(null);
  const [userData, setUserData] = useState(null);

  // Load user data for username and email
  useEffect(() => {
    const loadUserData = async () => {
      if (userId) {
        try {
          const result = await getUserData(userId);
          if (result.success) {
            setUserData(result.data);
          }
        } catch (error) {
          console.error('Error loading user data:', error);
        }
      }
    };
    loadUserData();
  }, [userId]);

  // Function to award points for completed quiz
  const awardPointsForQuiz = useCallback(async (quizId, rewardPoints) => {
    // Prevent duplicate awards
    if (pointsAwardedRef.current.has(quizId)) {
      console.log(`Points already awarded for CPX Research quiz ${quizId}`);
      return { success: false, error: 'Already awarded' };
    }

    if (rewardPoints > 0 && userId) {
      try {
        console.log(`Awarding ${rewardPoints} points for CPX Research quiz completion: ${quizId}`);
        const result = await updateUserPoints(userId, rewardPoints, 'quiz');
        
        if (result.success) {
          pointsAwardedRef.current.add(quizId);
          console.log(`✅ Successfully awarded ${rewardPoints} points!`);
          
          if (onComplete) {
            onComplete({
              quizId: quizId,
              reward: rewardPoints,
              userId: userId,
              success: true,
            });
          }
          
          alert(`🎉 Success! You earned ${rewardPoints} points!`);
          return { success: true };
        } else {
          console.error('Failed to award points:', result.error);
          alert(`⚠️ Failed to award points: ${result.error || 'Unknown error'}`);
          return { success: false, error: result.error };
        }
      } catch (error) {
        console.error('Error awarding points:', error);
        alert(`⚠️ Error awarding points: ${error.message}`);
        return { success: false, error: error.message };
      }
    } else {
      console.warn('Invalid reward points or userId:', { rewardPoints, userId });
      return { success: false, error: 'Invalid reward or userId' };
    }
  }, [userId, onComplete]);

  useEffect(() => {
    // Listen for messages from CPX Research iframe
    const handleMessage = async (event) => {
      // Security: Verify origin (adjust based on CPX Research domain)
      if (!event.origin.includes('cpx-research.com') && 
          !event.origin.includes('cpxresearch') &&
          !event.origin.includes('cpx')) {
        console.log('Message from non-CPX Research origin:', event.origin);
        return;
      }

      console.log('Received message from CPX Research:', event.origin, event.data);

      // Handle completion events - check various formats
      if (event.data) {
        let quizId = null;
        let rewardPoints = 0;
        
        if (typeof event.data === 'object') {
          quizId = event.data.quiz_id || 
                   event.data.quizId || 
                   event.data.offer_id ||
                   event.data.id || 
                   `cpx_${Date.now()}`;
          rewardPoints = parseInt(
            event.data.reward || 
            event.data.amount || 
            event.data.payout || 
            event.data.points ||
            event.data.credits ||
            0
          );
          
          // Check for completion events
          const isComplete = (
            event.data.type === 'quiz_complete' || 
            event.data.event === 'quiz_complete' ||
            event.data.type === 'offer_complete' ||
            event.data.event === 'offer_complete' ||
            event.data.status === 'complete' ||
            event.data.completed === true ||
            event.data.quiz_completed === true
          );
          
          if (isComplete && rewardPoints > 0) {
            await awardPointsForQuiz(quizId, rewardPoints);
          }
        } else if (typeof event.data === 'string') {
          const lowerData = event.data.toLowerCase();
          if (lowerData.includes('complete') || lowerData.includes('success') || lowerData.includes('quiz')) {
            console.log('Completion detected but reward amount not found in message');
            // Try default reward or wait for postback
          }
        }
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [userId, onComplete, awardPointsForQuiz]);

  // Generate secure hash (optional but recommended)
  const generateSecureHash = (uniqueUserId, secureHashKey) => {
    if (!secureHashKey) return '';
    // CPX Research format: md5({unique_user_id}-{app_secure_hash})
    // For browser, we'll use a simple hash (CPX Research will verify server-side)
    try {
      // Simple hash function (CPX Research uses MD5 on server)
      const hashString = `${uniqueUserId}-${secureHashKey}`;
      // Note: For production, you might want to generate this server-side
      // For now, we'll pass the hash key and let CPX Research handle it
      return hashString; // Placeholder - actual MD5 should be done server-side
    } catch (error) {
      console.error('Error generating secure hash:', error);
      return '';
    }
  };

  // Build offerwall URL with all CPX Research parameters
  const buildOfferwallUrl = () => {
    if (!userId) return null;

    // Get user info
    const uniqueUserId = userId;
    const userName = userData?.name || user?.displayName || user?.email?.split('@')[0] || 'User';
    const userEmail = userData?.email || user?.email || '';
    
    // Get demographic info from userData (can be added later via profile)
    // For now, we'll use defaults or let CPX Research detect from browser/IP
    const userAge = userData?.age || '';
    const userGender = userData?.gender || '';
    const userCountry = userData?.country || '';
    const userZipcode = userData?.zipcode || '';
    const userCity = userData?.city || '';
    
    if (offerwallUrl) {
      // Replace all placeholders in the URL
      let url = offerwallUrl
        // User ID placeholders
        .replace(/{{\s*USER_ID\s*}}/g, uniqueUserId)
        .replace(/{USER_ID}/g, uniqueUserId)
        .replace(/{unique_user_id}/g, uniqueUserId)
        .replace(/{{\s*unique_user_id\s*}}/g, uniqueUserId)
        .replace(/{ext_user_id}/g, uniqueUserId)
        .replace(/{{\s*ext_user_id\s*}}/g, uniqueUserId)
        // Username placeholders
        .replace(/{{\s*user_name\s*}}/g, encodeURIComponent(userName))
        .replace(/{user_name}/g, encodeURIComponent(userName))
        .replace(/{username}/g, encodeURIComponent(userName))
        // Email placeholders
        .replace(/{{\s*user_email\s*}}/g, encodeURIComponent(userEmail))
        .replace(/{user_email}/g, encodeURIComponent(userEmail))
        .replace(/{email}/g, encodeURIComponent(userEmail))
        // Demographic placeholders
        .replace(/{{\s*age\s*}}/g, userAge)
        .replace(/{age}/g, userAge)
        .replace(/{{\s*gender\s*}}/g, encodeURIComponent(userGender))
        .replace(/{gender}/g, encodeURIComponent(userGender))
        .replace(/{{\s*country\s*}}/g, encodeURIComponent(userCountry))
        .replace(/{country}/g, encodeURIComponent(userCountry))
        .replace(/{{\s*zipcode\s*}}/g, encodeURIComponent(userZipcode))
        .replace(/{zipcode}/g, encodeURIComponent(userZipcode))
        .replace(/{{\s*city\s*}}/g, encodeURIComponent(userCity))
        .replace(/{city}/g, encodeURIComponent(userCity));
      
      // Handle secure_hash (optional)
      if (url.includes('{secure_hash}') || url.includes('{secure_hash}')) {
        if (secureHashKey) {
          const hash = generateSecureHash(uniqueUserId, secureHashKey);
          url = url.replace(/{{\s*secure_hash\s*}}/g, hash).replace(/{secure_hash}/g, hash);
        } else {
          // Remove secure_hash parameter if no key provided
          url = url.replace(/[&?]secure_hash=\{[^}]*\}/g, '');
        }
      }
      
      // Handle subid_1 and subid_2 (optional - can leave empty or remove)
      url = url.replace(/{{\s*subid_1\s*}}/g, '').replace(/{subid_1}/g, '');
      url = url.replace(/{{\s*subid_2\s*}}/g, '').replace(/{subid_2}/g, '');
      
      // Add demographic parameters if not already in URL and we have the data
      // This helps CPX Research match users with relevant surveys
      if (!url.includes('age=') && userAge) {
        const separator = url.includes('?') ? '&' : '?';
        url += `${separator}age=${encodeURIComponent(userAge)}`;
      }
      if (!url.includes('gender=') && userGender) {
        url += `&gender=${encodeURIComponent(userGender)}`;
      }
      if (!url.includes('country=') && userCountry) {
        url += `&country=${encodeURIComponent(userCountry)}`;
      }
      if (!url.includes('zipcode=') && userZipcode) {
        url += `&zipcode=${encodeURIComponent(userZipcode)}`;
      }
      if (!url.includes('city=') && userCity) {
        url += `&city=${encodeURIComponent(userCity)}`;
      }
      
      return url;
    }
    
    // If only API key provided, construct URL with all parameters
    if (apiKey) {
      // CPX Research uses: https://offers.cpx-research.com/index.php?app_id=APP_ID&ext_user_id=USER_ID
      let url = `https://offers.cpx-research.com/index.php?app_id=${apiKey}&ext_user_id=${uniqueUserId}`;
      
      // Add optional parameters
      if (userName) url += `&username=${encodeURIComponent(userName)}`;
      if (userEmail) url += `&email=${encodeURIComponent(userEmail)}`;
      
      // Add demographic parameters to improve qualification rates
      if (userAge) url += `&age=${encodeURIComponent(userAge)}`;
      if (userGender) url += `&gender=${encodeURIComponent(userGender)}`;
      if (userCountry) url += `&country=${encodeURIComponent(userCountry)}`;
      if (userZipcode) url += `&zipcode=${encodeURIComponent(userZipcode)}`;
      if (userCity) url += `&city=${encodeURIComponent(userCity)}`;
      
      if (secureHashKey) {
        const hash = generateSecureHash(uniqueUserId, secureHashKey);
        if (hash) url += `&secure_hash=${hash}`;
      }
      
      return url;
    }
    
    return null;
  };

  const finalOfferwallUrl = buildOfferwallUrl();

  if (!finalOfferwallUrl && !apiKey && !offerwallUrl) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600 mb-4">CPX Research is not configured. Please add your API key or offerwall URL in Admin Panel.</p>
        {onClose && (
          <button onClick={onClose} className="btn-primary">
            Close
          </button>
        )}
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600 mb-4">User ID is required to show quizzes.</p>
        {onClose && (
          <button onClick={onClose} className="btn-primary">
            Close
          </button>
        )}
      </div>
    );
  }

  const handleOpenInNewTab = () => {
    try {
      const newWindow = window.open(finalOfferwallUrl, '_blank', 'noopener,noreferrer');
      if (newWindow && !newWindow.closed) {
        offerWindowRef.current = newWindow;
        offerStartTimeRef.current = Date.now();
        console.log('CPX Research offerwall opened in new tab, tracking for completion...');
      }
    } catch (error) {
      console.error('Error opening CPX Research offerwall:', error);
      window.location.href = finalOfferwallUrl;
    }
  };

  return (
    <div ref={containerRef} className="w-full h-full">
      <div className="mb-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-lg">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 text-2xl">💡</div>
          <div className="flex-1">
            <p className="text-sm text-yellow-800 mb-2 font-semibold">
              Important: How Surveys Work
            </p>
            <ul className="text-xs text-yellow-700 space-y-1 list-disc list-inside">
              <li>You may not qualify for all surveys</li>
              <li>Surveys show "+0.00" until you qualify and complete them</li>
              <li>Keep trying different surveys to find ones you qualify for</li>
              <li>Rewards are only awarded after completing a survey</li>
            </ul>
          </div>
        </div>
      </div>
      {/* Info Banner */}
      <div className="mb-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-lg">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 text-2xl">🧩</div>
          <div className="flex-1">
            <p className="text-sm text-indigo-800 mb-2 font-semibold">
              High-Paying Surveys - Earn More Points!
            </p>
            <p className="text-xs text-indigo-700 mb-2">
              ✓ Complete surveys to earn high rewards.
              <br />✓ Points are automatically added after survey completion.
              <br />✓ If surveys don't open, click "Open in New Tab" button below.
            </p>
          </div>
        </div>
      </div>

      {/* Button to open in new tab - Alternative if iframe has issues */}
      <div className="mb-4 flex justify-center">
        <button
          onClick={handleOpenInNewTab}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-2 px-6 rounded-lg flex items-center gap-2 font-semibold"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          Open Surveys in New Tab (Recommended)
        </button>
      </div>

      <iframe
        ref={iframeRef}
        src={finalOfferwallUrl}
        width="100%"
        height="800"
        frameBorder="0"
        scrolling="yes"
        className="border-0 rounded-lg"
        title="CPX Research Surveys"
        allow="payment; popups; popups-to-escape-sandbox; fullscreen"
        style={{ pointerEvents: 'auto' }}
      />
    </div>
  );
}

