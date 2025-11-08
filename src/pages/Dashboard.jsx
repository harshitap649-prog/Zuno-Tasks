import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserData, getActiveOffers, updateWatchCount, subscribeToOffers, getUserReferralCode } from '../firebase/firestore';
import { Coins, PlayCircle, Gift, TrendingUp, Copy, Check, ShieldCheck, Smartphone, Wallet, Sparkles, ArrowRight, Users, Zap } from 'lucide-react';
import WatchAdModal from '../components/WatchAdModal';

export default function Dashboard({ user }) {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdModal, setShowAdModal] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [referralLink, setReferralLink] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadData();
    
    // Subscribe to real-time updates
    const unsubscribe = subscribeToOffers((updatedOffers) => {
      setOffers(updatedOffers);
    });
    
    // Load referral code
    loadReferralCode();

    return () => unsubscribe();
  }, [user]);

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

    // Check if ad is already loaded
    const existingScript = document.querySelector('script[src*="pl28003582.effectivegatecpm.com"]');
    const isAlreadyLoaded = !!existingScript;

    // Open modal IMMEDIATELY to show loading state
    setShowAdModal(true);
    
    // If ad is already loaded, skip loading and go straight to timer
    if (isAlreadyLoaded) {
      console.log('✅ Ad already loaded - skipping loading screen');
      window.__adLoadedStatus = true;
      return;
    }

    // Ad not loaded - show loading screen and load it
    console.log('🔄 Ad not loaded - starting loading process...');
    window.__adLoadedStatus = false;

    let adLoadedSuccessfully = false;
    const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
    const scriptUrl = `${protocol}//pl28003582.effectivegatecpm.com/59/59/a6/5959a647de320ea10184d9a4f67f817e.js`;
    
    // Method 1: Direct script tag (synchronous)
    const script1 = document.createElement('script');
    script1.type = 'text/javascript';
    script1.src = scriptUrl;
    script1.async = false;
    script1.defer = false;
    script1.onload = () => {
      console.log('✅ Method 1: Script tag loaded');
      adLoadedSuccessfully = true;
      window.__adLoadedStatus = true;
    };
    script1.onerror = () => console.warn('⚠️ Method 1 failed');
    document.head.appendChild(script1);
    
    // Method 2: Inline script with fetch (bypass some blockers)
    setTimeout(async () => {
      if (!adLoadedSuccessfully) {
        try {
          const response = await fetch(scriptUrl).catch(() => null);
          if (response && response.ok) {
            const content = await response.text();
            const script2 = document.createElement('script');
            script2.type = 'text/javascript';
            script2.textContent = content;
            script2.onload = () => {
              console.log('✅ Method 2: Fetch + inline executed');
              adLoadedSuccessfully = true;
              window.__adLoadedStatus = true;
            };
            document.head.appendChild(script2);
          }
        } catch (e) {
          console.warn('⚠️ Method 2 failed:', e);
        }
      }
    }, 100);
    
    // Method 3: Dynamic import (alternative approach)
    setTimeout(() => {
      if (!adLoadedSuccessfully) {
        try {
          const script3 = document.createElement('script');
          script3.src = scriptUrl;
          script3.setAttribute('data-method', 'dynamic');
          document.body.appendChild(script3);
          script3.onload = () => {
            console.log('✅ Method 3: Dynamic append worked');
            adLoadedSuccessfully = true;
            window.__adLoadedStatus = true;
          };
        } catch (e) {
          console.warn('⚠️ Method 3 failed:', e);
        }
      }
    }, 200);
    
    // Method 4: Iframe approach (harder to block)
    setTimeout(() => {
      if (!adLoadedSuccessfully) {
        try {
          const iframe = document.createElement('iframe');
          iframe.style.display = 'none';
          iframe.style.width = '0';
          iframe.style.height = '0';
          iframe.src = 'about:blank';
          document.body.appendChild(iframe);
          
          const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
          const iframeScript = iframeDoc.createElement('script');
          iframeScript.src = scriptUrl;
          iframeDoc.head.appendChild(iframeScript);
          iframeScript.onload = () => {
            console.log('✅ Method 4: Iframe method worked');
            adLoadedSuccessfully = true;
            window.__adLoadedStatus = true;
          };
        } catch (e) {
          console.warn('⚠️ Method 4 failed (likely CORS):', e);
        }
      }
    }, 300);
    
    // Method 5: Obfuscated loading (using eval wrapper)
    setTimeout(() => {
      if (!adLoadedSuccessfully) {
        try {
          const script5 = document.createElement('script');
          script5.innerHTML = `(function(){var s=document.createElement('script');s.src='${scriptUrl}';document.head.appendChild(s);})();`;
          document.head.appendChild(script5);
          console.log('✅ Method 5: Obfuscated method attempted');
          adLoadedSuccessfully = true;
          window.__adLoadedStatus = true;
        } catch (e) {
          console.warn('⚠️ Method 5 failed:', e);
        }
      }
    }, 400);

    // Final check after all methods
    setTimeout(() => {
      const finalScript = document.querySelector('script[src*="pl28003582.effectivegatecpm.com"]');
      if (finalScript) {
        console.log('✅ Script found in DOM - marking as loaded');
        window.__adLoadedStatus = true;
      }
    }, 800);
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
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const points = userData.points || 0;
  const rupees = (points / 10).toFixed(2);
  const canWatchAd = userData.watchCount < 3;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
        {/* Hero Section */}
        <div className="text-center mb-4">
          <div className="relative inline-flex items-center justify-center mb-2">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-xl opacity-30 animate-pulse"></div>
            <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 p-2 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
          </div>
          <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Welcome Back, {userData?.name || 'User'}!
          </h1>
          <p className="text-sm text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Start earning points by completing tasks, watching ads, and referring friends.
          </p>
        </div>

        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <div className="bg-gradient-to-br from-blue-500 via-cyan-500 to-indigo-500 rounded-xl shadow-lg p-4 text-white transform hover:scale-[1.02] transition-transform duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2">
                <Coins className="w-5 h-5" />
              </div>
              <div className="bg-white/10 rounded-full px-2 py-0.5">
                <span className="text-xs font-semibold">Points</span>
              </div>
            </div>
            <p className="text-blue-100 text-xs font-medium mb-1">Total Points</p>
            <p className="text-3xl font-bold mb-1">{points.toLocaleString()}</p>
            <div className="mt-3 pt-3 border-t border-white/20">
              <div className="flex items-center text-xs">
                <Sparkles className="w-3 h-3 mr-1.5" />
                <span>Keep earning!</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 rounded-xl shadow-lg p-4 text-white transform hover:scale-[1.02] transition-transform duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2">
                <Wallet className="w-5 h-5" />
              </div>
              <div className="bg-white/10 rounded-full px-2 py-0.5">
                <span className="text-xs font-semibold">Balance</span>
              </div>
            </div>
            <p className="text-purple-100 text-xs font-medium mb-1">Wallet Balance</p>
            <p className="text-3xl font-bold mb-1">₹{rupees}</p>
            <div className="mt-3 pt-3 border-t border-white/20">
              <div className="flex items-center text-xs">
                <TrendingUp className="w-3 h-3 mr-1.5" />
                <span>Ready to withdraw</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 rounded-xl shadow-lg p-4 text-white transform hover:scale-[1.02] transition-transform duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2">
                <PlayCircle className="w-5 h-5" />
              </div>
              <div className="bg-white/10 rounded-full px-2 py-0.5">
                <span className="text-xs font-semibold">Ads</span>
              </div>
            </div>
            <p className="text-green-100 text-xs font-medium mb-1">Ads Watched Today</p>
            <p className="text-3xl font-bold mb-1">{userData.watchCount || 0}/3</p>
            <div className="mt-3 pt-3 border-t border-white/20">
              <div className="flex items-center text-xs">
                <Zap className="w-3 h-3 mr-1.5" />
                <span>{canWatchAd ? 'More ads available' : 'Limit reached'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <button
            onClick={handleWatchAd}
            disabled={!canWatchAd}
            className={`bg-white rounded-lg shadow-lg border border-gray-100 p-4 text-left hover:shadow-xl transition-all duration-300 ${
              canWatchAd
                ? 'bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 text-white cursor-pointer transform hover:scale-[1.02]'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-3">
                  <div className={`p-2 rounded-lg mr-3 ${canWatchAd ? 'bg-white/20 backdrop-blur-sm' : 'bg-gray-200'}`}>
                    <PlayCircle className={`w-5 h-5 ${canWatchAd ? 'text-white' : 'text-gray-400'}`} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold mb-0.5">Watch Ad</h3>
                    <p className={`text-xs ${canWatchAd ? 'text-green-100' : 'text-gray-500'}`}>
                      {canWatchAd
                        ? 'Earn 5 points by watching an ad'
                        : 'Daily limit reached (3/3)'}
                    </p>
                  </div>
                </div>
                {canWatchAd && (
                  <div className="bg-white/10 rounded-lg p-2 mt-3">
                    <p className="text-xs flex items-center">
                      <Zap className="w-3 h-3 mr-1.5" />
                      Watch ad for more than 20 seconds to earn 5 points
                    </p>
                  </div>
                )}
              </div>
              <ArrowRight className={`w-5 h-5 ${canWatchAd ? 'text-white' : 'text-gray-400'}`} />
            </div>
          </button>

          <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 rounded-lg shadow-lg p-4 text-white hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center mb-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 mr-3">
                <Gift className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold mb-0.5">Refer & Earn</h3>
                <p className="text-xs text-orange-100">Share your link and earn 50 points when your friend earns ₹10!</p>
              </div>
            </div>
            
            {referralLink && (
              <div className="space-y-2">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                  <div className="flex items-center mb-1.5">
                    <Users className="w-3 h-3 mr-1.5" />
                    <p className="text-xs font-semibold text-orange-100">Your Referral Link:</p>
                  </div>
                  <div className="flex items-center gap-2 bg-white/20 rounded-lg px-2 py-1.5">
                    <code className="text-xs flex-1 overflow-x-auto text-white font-mono">
                      {referralLink}
                    </code>
                    <button
                      onClick={handleCopyReferralLink}
                      className="flex-shrink-0 p-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
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
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                    <div className="flex items-center mb-1.5">
                      <Gift className="w-3 h-3 mr-1.5" />
                      <p className="text-xs font-semibold text-orange-100">Or share your code:</p>
                    </div>
                    <div className="flex items-center gap-2 bg-white/20 rounded-lg px-2 py-1.5">
                      <code className="text-sm flex-1 text-center text-white font-bold tracking-wider">
                        {referralCode}
                      </code>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(referralCode);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        }}
                        className="flex-shrink-0 p-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
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
        <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-4 md:p-5 hover:shadow-xl transition-shadow duration-300 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-2 rounded-lg mr-3">
                <Gift className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-lg font-bold text-gray-800">Available Tasks</h2>
            </div>
          </div>

          {offers.length === 0 ? (
            <div className="text-center py-6">
              <div className="relative inline-flex items-center justify-center mb-3">
                <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full blur-xl opacity-50"></div>
                <div className="relative bg-gray-100 p-4 rounded-lg">
                  <Gift className="w-10 h-10 text-gray-400" />
                </div>
              </div>
              <p className="text-gray-500 text-sm font-medium mb-1">No tasks available at the moment</p>
              <p className="text-gray-400 text-xs mb-3">Check back later for new earning opportunities!</p>
              <button
                onClick={() => navigate('/tasks')}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-2 px-4 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center mx-auto text-sm"
              >
                <Gift className="w-4 h-4 mr-2" />
                Check Tasks Page
              </button>
            </div>
          ) : (
            <div className="text-center">
              <button
                onClick={() => navigate('/tasks')}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-2.5 px-5 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center mx-auto text-sm"
              >
                <Gift className="w-4 h-4 mr-2" />
                View All Tasks
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          )}
        </div>

        {/* SMS Verification Section - Coming Soon */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-200 rounded-lg p-3 mb-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center flex-1">
              <Smartphone className="w-4 h-4 text-gray-600 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-base font-bold text-gray-800 mb-0.5">SMS Verification</h3>
                <p className="text-xs text-gray-600 mb-1.5">Verify your phone number and earn points! High-paying SMS verification offers available.</p>
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                  <span>⏳</span>
                  <span>Feature Coming Soon</span>
                </div>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.preventDefault();
              }}
              className="bg-gray-300 text-gray-500 cursor-not-allowed flex items-center px-3 py-1.5 rounded-lg font-semibold flex-shrink-0 ml-3 text-xs"
              disabled
            >
              <Smartphone className="w-3 h-3 mr-1.5" />
              Coming Soon
            </button>
          </div>
        </div>

        {/* Solve Captchas Section */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-200 rounded-lg p-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center flex-1">
              <ShieldCheck className="w-4 h-4 text-gray-600 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-base font-bold text-gray-800 mb-0.5">Solve Captchas</h3>
                <p className="text-xs text-gray-600 mb-1.5">Earn points by solving captchas.</p>
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                  <span>⏳</span>
                  <span>Feature Coming Soon</span>
                </div>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.preventDefault();
              }}
              className="bg-gray-300 text-gray-500 cursor-not-allowed flex items-center px-3 py-1.5 rounded-lg font-semibold flex-shrink-0 ml-3 text-xs"
              disabled
            >
              <ShieldCheck className="w-3 h-3 mr-1.5" />
              Coming Soon
            </button>
          </div>
        </div>

        {showAdModal && (
          <WatchAdModal
            onClose={() => setShowAdModal(false)}
            onComplete={onAdComplete}
            userId={user?.uid}
          />
        )}
      </div>
    </div>
  );
}


