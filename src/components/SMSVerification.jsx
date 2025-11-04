import { useEffect, useRef, useCallback, useState } from 'react';
import { updateUserPoints, getUserData, getAdminSettings } from '../firebase/firestore';
import { Smartphone, ExternalLink } from 'lucide-react';

/**
 * SMS Verification Component using CPAlead (Better for Verification)
 * Users verify their phone number for offers
 * Revenue: $0.50-$5 per verification
 */
export default function SMSVerification({ userId, user, onComplete }) {
  const iframeRef = useRef(null);
  const containerRef = useRef(null);
  const pointsAwardedRef = useRef(new Set()); // Track awarded offer IDs to prevent duplicates
  const [showVerification, setShowVerification] = useState(false);
  const [cpaleadPublisherId, setCPALeadPublisherId] = useState('');
  const [cpxResearchApiKey, setCpxResearchApiKey] = useState('');
  const [cpxResearchOfferwallUrl, setCpxResearchOfferwallUrl] = useState('');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [useCPALead, setUseCPALead] = useState(true); // Prefer CPAlead for verification

  // Load settings (CPAlead preferred, CPX Research as fallback)
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settingsResult = await getAdminSettings();
        if (settingsResult.success && settingsResult.settings) {
          const settings = settingsResult.settings;
          setCPALeadPublisherId(settings.cpaleadPublisherId || '');
          setCpxResearchApiKey(settings.cpxResearchApiKey || '');
          setCpxResearchOfferwallUrl(settings.cpxResearchOfferwallUrl || '');
        } else {
          // Fallback to localStorage
          const savedCPALeadId = localStorage.getItem('cpalead_publisher_id') || '';
          const savedApiKey = localStorage.getItem('cpx_research_api_key') || '';
          const savedUrl = localStorage.getItem('cpx_research_offerwall_url') || '';
          setCPALeadPublisherId(savedCPALeadId);
          setCpxResearchApiKey(savedApiKey);
          setCpxResearchOfferwallUrl(savedUrl);
        }
      } catch (error) {
        console.error('Error loading settings:', error);
        const savedCPALeadId = localStorage.getItem('cpalead_publisher_id') || '';
        const savedApiKey = localStorage.getItem('cpx_research_api_key') || '';
        const savedUrl = localStorage.getItem('cpx_research_offerwall_url') || '';
        setCPALeadPublisherId(savedCPALeadId);
        setCpxResearchApiKey(savedApiKey);
        setCpxResearchOfferwallUrl(savedUrl);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  // Load user data for demographic info
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

  // Function to build offerwall URL (CPAlead preferred, CPX Research as fallback)
  const buildOfferwallUrl = useCallback(() => {
    let url = '';
    
    // Prefer CPAlead for SMS verification (has dedicated verification offers)
    if (cpaleadPublisherId && useCPALead) {
      // Build CPAlead offerwall URL for verification
      // Format: https://zwidgetbv3dft.xyz/list/{publisherId}?sub={userId}
      const cleanPublisherId = cpaleadPublisherId.trim();
      const cleanUserId = userId || '';
      
      // Generate unique session ID to prevent duplicate detection
      const sessionId = `${Date.now()}_${Math.random().toString(36).substring(7)}`;
      url = `https://zwidgetbv3dft.xyz/list/${cleanPublisherId}?sub=${cleanUserId}&_s=${sessionId}&_t=${Date.now()}`;
      return url;
    }
    
    // Fallback to CPX Research (but it only has surveys)
    if (cpxResearchOfferwallUrl) {
      url = cpxResearchOfferwallUrl;
    } else if (cpxResearchApiKey) {
      // If only API key is provided, construct URL
      url = `https://offers.cpx-research.com/index.php?app_id=${cpxResearchApiKey}&ext_user_id=${userId}`;
    } else {
      return null;
    }

    // Replace placeholders
    url = url.replace(/{USER_ID}/g, userId);
    url = url.replace(/{unique_user_id}/g, userId);
    url = url.replace(/{ext_user_id}/g, userId);

    // Add user info if available
    if (userData) {
      const username = userData.name || user?.displayName || user?.email?.split('@')[0] || '';
      const email = userData.email || user?.email || '';
      
      url = url.replace(/{USERNAME}/g, encodeURIComponent(username));
      url = url.replace(/{user_name}/g, encodeURIComponent(username));
      url = url.replace(/{username}/g, encodeURIComponent(username));
      
      url = url.replace(/{EMAIL}/g, encodeURIComponent(email));
      url = url.replace(/{user_email}/g, encodeURIComponent(email));
      url = url.replace(/{email}/g, encodeURIComponent(email));
    } else if (user) {
      const username = user.displayName || user.email?.split('@')[0] || '';
      const email = user.email || '';
      
      url = url.replace(/{USERNAME}/g, encodeURIComponent(username));
      url = url.replace(/{user_name}/g, encodeURIComponent(username));
      url = url.replace(/{username}/g, encodeURIComponent(username));
      
      url = url.replace(/{EMAIL}/g, encodeURIComponent(email));
      url = url.replace(/{user_email}/g, encodeURIComponent(email));
      url = url.replace(/{email}/g, encodeURIComponent(email));
    }

    // Remove secure_hash if it's a placeholder
    url = url.replace(/&secure_hash=\{secure_hash\}/g, '');
    url = url.replace(/&secure_hash=/g, '&secure_hash=');

    // Add demographic parameters if available (helps with qualification)
    if (userData) {
      const params = new URLSearchParams();
      
      if (userData.age) params.append('age', userData.age);
      if (userData.gender) params.append('gender', userData.gender);
      if (userData.country) params.append('country', userData.country);
      if (userData.zipcode) params.append('zipcode', userData.zipcode);
      if (userData.city) params.append('city', userData.city);

      if (params.toString()) {
        url += (url.includes('?') ? '&' : '?') + params.toString();
      }
    }

    // Add unique parameters to prevent caching
    url += (url.includes('?') ? '&' : '?') + `_t=${Date.now()}&_r=${Math.random().toString(36).substring(7)}`;

    return url;
  }, [cpxResearchApiKey, cpxResearchOfferwallUrl, userId, user, userData]);

  // Function to award points for completed verification
  const awardPointsForVerification = useCallback(async (offerId, rewardPoints) => {
    // Prevent duplicate awards
    if (pointsAwardedRef.current.has(offerId)) {
      console.log(`Points already awarded for SMS verification ${offerId}`);
      return { success: false, error: 'Already awarded' };
    }

    if (rewardPoints > 0 && userId) {
      try {
        console.log(`Awarding ${rewardPoints} points for SMS verification: ${offerId}`);
        const result = await updateUserPoints(userId, rewardPoints, 'sms_verification');
        
        if (result.success) {
          pointsAwardedRef.current.add(offerId);
          console.log(`✅ Successfully awarded ${rewardPoints} points!`);
          
          if (onComplete) {
            onComplete({
              offerId: offerId,
              reward: rewardPoints,
              userId: userId,
              success: true,
            });
          }
          
          alert(`🎉 Success! You earned ${rewardPoints} points for SMS verification!`);
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
    // Listen for messages from offerwall iframe (CPAlead or CPX Research)
    const handleMessage = async (event) => {
      // Security: Verify origin (allow both CPAlead and CPX Research domains)
      const isCPALead = event.origin.includes('zwidget') || 
                       event.origin.includes('qckclk') ||
                       event.origin.includes('akamaicdn') ||
                       event.origin.includes('directcpi') ||
                       event.origin.includes('cpalead.com');
      
      const isCPXResearch = event.origin.includes('cpx-research.com') || 
                           event.origin.includes('cpxresearch') ||
                           event.origin.includes('cpx');
      
      if (!isCPALead && !isCPXResearch) {
        return;
      }

      console.log('Received message from offerwall:', event.origin, event.data);

      // Handle completion events
      if (event.data) {
        let offerId = null;
        let rewardPoints = 0;
        
        if (typeof event.data === 'object') {
          offerId = event.data.offer_id || 
                   event.data.offerId || 
                   event.data.id ||
                   event.data.verification_id ||
                   `sms_${Date.now()}`;
          
          rewardPoints = event.data.reward || 
                        event.data.reward_points || 
                        event.data.points ||
                        event.data.amount ||
                        0;
        } else if (typeof event.data === 'string') {
          try {
            const parsed = JSON.parse(event.data);
            offerId = parsed.offer_id || parsed.offerId || `sms_${Date.now()}`;
            rewardPoints = parsed.reward || parsed.reward_points || 0;
          } catch (e) {
            // Not JSON, check for completion keywords
            if (event.data.toLowerCase().includes('complete') || 
                event.data.toLowerCase().includes('success') ||
                event.data.toLowerCase().includes('verified')) {
              offerId = `sms_${Date.now()}`;
              rewardPoints = 50; // Default reward
            }
          }
        }

        // Award points if verification completed
        if (offerId && rewardPoints > 0) {
          await awardPointsForVerification(offerId, rewardPoints);
        }
      }
    };

    if (showVerification) {
      window.addEventListener('message', handleMessage);
      return () => {
        window.removeEventListener('message', handleMessage);
      };
    }
  }, [showVerification, awardPointsForVerification]);

  if (loading) {
    return null; // Don't show anything while loading settings
  }

  // Don't show if neither CPAlead nor CPX Research is configured
  if (!cpaleadPublisherId && !cpxResearchApiKey && !cpxResearchOfferwallUrl) {
    return (
      <div className="card mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-800 mb-1 flex items-center">
              <Smartphone className="w-6 h-6 mr-2 text-blue-600" />
              SMS Verification
            </h3>
            <p className="text-sm text-gray-600 mb-2">
              Verify your phone number and earn points! High-paying SMS verification offers available.
            </p>
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg mt-2">
              <p className="text-xs text-yellow-800">
                ⚠️ <strong>CPX Research not configured.</strong> Please configure CPX Research in Admin Panel → Offers tab to enable SMS verification.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const offerwallUrl = buildOfferwallUrl();

  if (!offerwallUrl) {
    return null;
  }

  return (
    <div className="card mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-800 mb-1 flex items-center">
            <Smartphone className="w-6 h-6 mr-2 text-blue-600" />
            SMS Verification
          </h3>
          <p className="text-sm text-gray-600 mb-2">
            Verify your phone number and earn points! High-paying SMS verification offers available.
          </p>
          <div className="flex items-center gap-2 text-xs text-blue-700">
            <span className="font-semibold">💰 Revenue:</span>
            <span>Earn $0.50 - $5 per verification</span>
          </div>
        </div>
        <button
          onClick={() => setShowVerification(!showVerification)}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-2 px-4 rounded-lg flex items-center ml-4 flex-shrink-0"
        >
          {showVerification ? 'Hide' : 'Start Verification'}
          <ExternalLink className="w-4 h-4 ml-2" />
        </button>
      </div>

      {showVerification && (
        <div className="mt-4">
          <div className="mb-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 text-2xl">💡</div>
              <div className="flex-1">
                <p className="text-sm text-yellow-800 mb-2 font-semibold">
                  How SMS Verification Works
                </p>
                <ul className="text-xs text-yellow-700 space-y-1 list-disc list-inside">
                  <li>Enter your phone number in the verification form</li>
                  <li>Receive an SMS code on your phone</li>
                  <li>Enter the code to verify your number</li>
                  <li>Earn points automatically after successful verification</li>
                  <li>You can complete multiple verification offers</li>
                </ul>
              </div>
            </div>
          </div>

          {cpaleadPublisherId && (
            <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 text-2xl">✅</div>
                <div className="flex-1">
                  <p className="text-sm text-green-800 mb-2 font-semibold">
                    Using CPAlead for SMS Verification
                  </p>
                  <p className="text-xs text-green-700 mb-2">
                    <strong>CPAlead has dedicated SMS/Phone verification offers!</strong>
                    <br />• Look for offers labeled "SMS Verification", "Phone Verification", or "Verify Phone"
                    <br />• CPAlead offers various verification types (SMS, Email, ID)
                    <br />• Complete verification offers to unlock content and earn points
                  </p>
                </div>
              </div>
            </div>
          )}

          {!cpaleadPublisherId && (cpxResearchApiKey || cpxResearchOfferwallUrl) && (
            <div className="mb-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 text-2xl">⚠️</div>
                <div className="flex-1">
                  <p className="text-sm text-yellow-800 mb-2 font-semibold">
                    Note: CPX Research is Survey-Focused
                  </p>
                  <p className="text-xs text-yellow-700 mb-2">
                    <strong>CPX Research primarily shows surveys.</strong> For better SMS verification offers, configure CPAlead in Admin Panel.
                    <br /><br />
                    <strong>Current options:</strong>
                    <br />• Complete surveys (available now)
                    <br />• Or configure CPAlead for dedicated SMS verification offers
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="border rounded-lg overflow-hidden bg-white">
            <iframe
              ref={iframeRef}
              src={offerwallUrl}
              width="100%"
              height="600"
              frameBorder="0"
              style={{ minHeight: '600px' }}
              title="SMS Verification Offers"
            />
          </div>

          <div className="mt-3 text-center">
            <button
              onClick={() => window.open(offerwallUrl, '_blank', 'noopener,noreferrer')}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              Open in New Tab
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

