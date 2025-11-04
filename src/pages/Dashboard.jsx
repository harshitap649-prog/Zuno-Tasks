import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserData, getActiveOffers, updateWatchCount, subscribeToOffers, getUserReferralCode, getAdminSettings } from '../firebase/firestore';
import { Coins, PlayCircle, Gift, TrendingUp, Copy, Check, ShieldCheck, FileLock, Link, Smartphone } from 'lucide-react';
import WatchAdModal from '../components/WatchAdModal';
import CPALeadFileLocker from '../components/CPALeadFileLocker';
import CPALeadLinkLocker from '../components/CPALeadLinkLocker';

export default function Dashboard({ user }) {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdModal, setShowAdModal] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [referralLink, setReferralLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [cpaleadFileLockerUrl, setCPALeadFileLockerUrl] = useState('');
  const [cpaleadLinkLockerUrl, setCPALeadLinkLockerUrl] = useState('');
  const [showFileLocker, setShowFileLocker] = useState(false);
  const [showLinkLocker, setShowLinkLocker] = useState(false);

  useEffect(() => {
    loadData();
    
    // Subscribe to real-time updates
    const unsubscribe = subscribeToOffers((updatedOffers) => {
      setOffers(updatedOffers);
    });
    
    // Load referral code
    loadReferralCode();

    // Load CPAlead locker settings
    loadCPALeadSettings();

    return () => unsubscribe();
  }, [user]);

  const loadCPALeadSettings = async () => {
    try {
      const settingsResult = await getAdminSettings();
      if (settingsResult.success && settingsResult.settings) {
        const settings = settingsResult.settings;
        setCPALeadFileLockerUrl(settings.cpaleadFileLockerUrl || '');
        setCPALeadLinkLockerUrl(settings.cpaleadLinkLockerUrl || '');
      } else {
        // Fallback to localStorage
        const savedFileLocker = localStorage.getItem('cpalead_file_locker_url') || '';
        const savedLinkLocker = localStorage.getItem('cpalead_link_locker_url') || '';
        setCPALeadFileLockerUrl(savedFileLocker);
        setCPALeadLinkLockerUrl(savedLinkLocker);
      }
    } catch (error) {
      console.error('Error loading CPAlead settings:', error);
      const savedFileLocker = localStorage.getItem('cpalead_file_locker_url') || '';
      const savedLinkLocker = localStorage.getItem('cpalead_link_locker_url') || '';
      setCPALeadFileLockerUrl(savedFileLocker);
      setCPALeadLinkLockerUrl(savedLinkLocker);
    }
  };
  
  const loadReferralCode = async () => {
    if (user) {
      const result = await getUserReferralCode(user.uid);
      if (result.success) {
        setReferralCode(result.referralCode);
        const baseUrl = window.location.origin;
        setReferralLink(`${baseUrl}/login?ref=${result.referralCode}`);
      }
    }
  };
  
  const handleCopyReferralLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = referralLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const loadData = async (skipLoadingState = false) => {
    if (!skipLoadingState) {
      setLoading(true);
    }
    try {
      // Ensure daily reset before reading
      try { await (await import('../firebase/firestore')).ensureDailyWatchReset?.(user.uid); } catch {}
      const userResult = await getUserData(user.uid);
      const offersResult = await getActiveOffers();

      if (userResult.success) {
        setUserData(userResult.data);
      } else {
        // If user document doesn't exist, create default values
        console.log('User data not found, using defaults:', userResult.error);
        setUserData({
          points: 0,
          watchCount: 0,
          totalEarned: 0,
          totalWithdrawn: 0,
          name: user.displayName || user.email || 'User',
          email: user.email,
        });
      }
      
      if (offersResult.success) {
        setOffers(offersResult.offers);
      } else {
        console.log('Offers error:', offersResult.error);
        setOffers([]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      // Set default values on error
      setUserData({
        points: 0,
        watchCount: 0,
        totalEarned: 0,
        totalWithdrawn: 0,
        name: user.displayName || user.email || 'User',
        email: user.email,
      });
      setOffers([]);
    } finally {
      if (!skipLoadingState) {
        setLoading(false);
      }
    }
  };

  // Enhanced completion handler that immediately refreshes dashboard
  const handleTaskComplete = async (completionData) => {
    console.log('✅ Task completed:', completionData);
    
    // Immediately refresh user data to show updated points
    await loadData(true); // Skip loading state to avoid UI flicker
    
    // Show success notification
    if (completionData && completionData.success !== false) {
      const reward = completionData.reward || completionData.points || 0;
      if (reward > 0) {
        console.log(`✅ Points updated! User earned ${reward} points`);
        // Points are already updated in database, Dashboard will show new balance
      }
    }
  };

  const handleWatchAd = async () => {
    if (!userData) return;

    // Check daily limit
    if (userData.watchCount >= 3) {
      alert('You have reached your daily limit of 3 ads. Please come back tomorrow!');
      return;
    }

    // CRITICAL: Load popunder script IMMEDIATELY on click (while user interaction is valid)
    // This must happen BEFORE any async operations or state updates
    try {
      // Check if script already exists
      let popunderScript = document.querySelector('script[data-adsterra-popunder]');
      
      if (!popunderScript) {
        // Create and load popunder script immediately
        popunderScript = document.createElement('script');
        popunderScript.type = 'text/javascript';
        popunderScript.src = 'https://pl27969271.effectivegatecpm.com/0c/83/73/0c837351d7acd986c96bc088d1b7cbc5.js';
        popunderScript.async = true;
        popunderScript.charset = 'utf-8';
        popunderScript.setAttribute('data-adsterra-popunder', 'true');
        
        // Add to head immediately (while click event is still in context)
        const head = document.head || document.getElementsByTagName('head')[0];
        if (head) {
          head.appendChild(popunderScript);
        } else {
          document.body.appendChild(popunderScript);
        }
        
        console.log('✅ Popunder script loaded immediately on click');
      } else {
        console.log('Popunder script already loaded');
      }
      
      // Ensure window has focus (required for popunders)
      window.focus();
      
    } catch (error) {
      console.error('Error loading popunder script:', error);
    }

    // Now open the modal (after script is loaded)
    setShowAdModal(true);
  };

  const onAdComplete = async () => {
    console.log('📞 onAdComplete called - attempting to award 5 points...');
    try {
      const result = await updateWatchCount(user.uid, 5);
      console.log('📊 updateWatchCount result:', result);
      
      if (result.success) {
        console.log('✅ Points awarded successfully!');
        await loadData();
        setShowAdModal(false);
        alert('🎉 You earned 5 points!');
      } else {
        console.error('❌ Failed to award points:', result.error);
        alert('⚠️ Failed to award points: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('❌ Error in onAdComplete:', error);
      alert('⚠️ Error awarding points. Please refresh and try again.');
    }
  };

  if (loading || !userData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const points = userData.points || 0;
  const rupees = (points / 10).toFixed(2);
  const canWatchAd = userData.watchCount < 3;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div>
        {/* Main Content */}
        <div>
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Points</p>
              <p className="text-3xl font-bold mt-2">{points.toLocaleString()}</p>
            </div>
            <Coins className="w-12 h-12 opacity-80" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Wallet Balance</p>
              <p className="text-3xl font-bold mt-2">₹{rupees}</p>
            </div>
            <TrendingUp className="w-12 h-12 opacity-80" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-pink-500 to-pink-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-pink-100 text-sm font-medium">Ads Watched Today</p>
              <p className="text-3xl font-bold mt-2">{userData.watchCount || 0}/3</p>
            </div>
            <PlayCircle className="w-12 h-12 opacity-80" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <button
          onClick={handleWatchAd}
          disabled={!canWatchAd}
          className={`card text-left hover:shadow-xl transition-all duration-200 ${
            canWatchAd
              ? 'bg-gradient-to-r from-green-500 to-green-600 text-white cursor-pointer transform hover:-translate-y-1'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2">Watch Ad</h3>
              <p className="text-sm opacity-90 mb-1">
                {canWatchAd
                  ? 'Earn 5 points by watching an ad'
                  : 'Daily limit reached (3/3)'}
              </p>
              {canWatchAd && (
                <p className="text-xs opacity-80">⏱️ Watch ad more than 20 seconds to earn 5 points</p>
              )}
            </div>
            <PlayCircle className="w-16 h-16 opacity-50" />
          </div>
        </button>

        <div className="card bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2">Refer & Earn</h3>
              <p className="text-sm opacity-90">Share your link and earn 50 points when your friend earns ₹10!</p>
            </div>
            <Gift className="w-16 h-16 opacity-50 flex-shrink-0" />
          </div>
          
          {referralLink && (
            <div className="mt-4 pt-4 border-t border-yellow-300 border-opacity-30">
              <div className="bg-white bg-opacity-10 rounded-lg p-3 mb-3">
                <p className="text-xs opacity-90 mb-2">Your Referral Link:</p>
                <div className="flex items-center gap-2 bg-white bg-opacity-20 rounded px-2 py-1.5">
                  <code className="text-xs flex-1 overflow-x-auto text-white font-mono">
                    {referralLink}
                  </code>
                  <button
                    onClick={handleCopyReferralLink}
                    className="flex-shrink-0 p-1.5 bg-white bg-opacity-20 hover:bg-opacity-30 rounded transition-colors"
                    title="Copy link"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-200" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
              
              {referralCode && (
                <div className="bg-white bg-opacity-10 rounded-lg p-3">
                  <p className="text-xs opacity-90 mb-2">Or share your code:</p>
                  <div className="flex items-center gap-2 bg-white bg-opacity-20 rounded px-2 py-1.5">
                    <code className="text-sm flex-1 text-center text-white font-bold tracking-wider">
                      {referralCode}
                    </code>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(referralCode);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="flex-shrink-0 p-1.5 bg-white bg-opacity-20 hover:bg-opacity-30 rounded transition-colors"
                      title="Copy code"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-green-200" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tasks Section */}
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center justify-center mb-4">
          <Gift className="w-6 h-6 mr-2 text-purple-600" />
          Available Tasks
        </h2>

        {offers.length === 0 ? (
          <div className="text-center py-8">
            <Gift className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 mb-4">No tasks available at the moment. Check back later!</p>
            <button
              onClick={() => navigate('/tasks')}
              className="btn-primary"
            >
              Check Tasks Page
            </button>
          </div>
        ) : (
          <div className="text-center py-4">
            <button
              onClick={() => navigate('/tasks')}
              className="btn-primary flex items-center mx-auto"
            >
              <Gift className="w-5 h-5 mr-2" />
              View All Tasks
            </button>
          </div>
        )}
      </div>

      {/* CPAlead File Locker Section */}
      {cpaleadFileLockerUrl && (
        <div className="card mt-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-800 mb-1 flex items-center">
                <FileLock className="w-6 h-6 mr-2 text-green-600" />
                File Locker
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                Complete offers to unlock premium file downloads. Earn points for each completed offer!
              </p>
            </div>
            <button
              onClick={() => setShowFileLocker(!showFileLocker)}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-2 px-4 rounded-lg flex items-center ml-4 flex-shrink-0"
            >
              {showFileLocker ? 'Hide' : 'Open File Locker'}
              <FileLock className="w-4 h-4 ml-2" />
            </button>
          </div>

          {showFileLocker && (
            <div className="mt-4">
              <CPALeadFileLocker
                lockerUrl={cpaleadFileLockerUrl}
                userId={user.uid}
                onComplete={handleTaskComplete}
              />
            </div>
          )}
        </div>
      )}

      {/* CPAlead Link Locker Section */}
      {cpaleadLinkLockerUrl && (
        <div className="card mt-6 bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-800 mb-1 flex items-center">
                <Link className="w-6 h-6 mr-2 text-blue-600" />
                Link Locker
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                Complete offers to unlock premium links. Earn points for each completed offer!
              </p>
            </div>
            <button
              onClick={() => setShowLinkLocker(!showLinkLocker)}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white py-2 px-4 rounded-lg flex items-center ml-4 flex-shrink-0"
            >
              {showLinkLocker ? 'Hide' : 'Open Link Locker'}
              <Link className="w-4 h-4 ml-2" />
            </button>
          </div>

          {showLinkLocker && (
            <div className="mt-4">
              <CPALeadLinkLocker
                lockerUrl={cpaleadLinkLockerUrl}
                userId={user.uid}
                onComplete={handleTaskComplete}
              />
            </div>
          )}
        </div>
      )}

      {/* SMS Verification Section - Coming Soon */}
      <div className="card mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold mb-1 flex items-center">
              <Smartphone className="w-6 h-6 mr-2 text-blue-600" />
              SMS Verification
            </h3>
            <p className="text-sm text-gray-600 mb-2">Verify your phone number and earn points! High-paying SMS verification offers available.</p>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
              <span>⏳</span>
              <span>Feature Coming Soon</span>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.preventDefault();
              // Feature coming soon - don't navigate
            }}
            className="bg-gray-300 text-gray-500 cursor-not-allowed flex items-center px-4 py-2 rounded-lg"
            disabled
          >
            <Smartphone className="w-5 h-5 mr-2" />
            Coming Soon
          </button>
        </div>
      </div>

      {/* Solve Captchas quick link */}
      <div className="card mt-6 bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold mb-1">Solve Captchas</h3>
            <p className="text-sm text-gray-600 mb-2">Earn points by solving captchas.</p>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
              <span>⏳</span>
              <span>Feature Coming Soon</span>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.preventDefault();
              // Feature coming soon - don't navigate
            }}
            className="bg-gray-300 text-gray-500 cursor-not-allowed flex items-center px-4 py-2 rounded-lg"
            disabled
          >
            <ShieldCheck className="w-5 h-5 mr-2" />
            Coming Soon
          </button>
        </div>
      </div>

          {showAdModal && (
            <WatchAdModal
              onClose={() => setShowAdModal(false)}
              onComplete={onAdComplete}
            />
          )}
        </div>
      </div>
    </div>
  );
}


