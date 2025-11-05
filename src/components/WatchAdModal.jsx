import { useState, useEffect, useRef } from 'react';
import { X, PlayCircle, Volume2 } from 'lucide-react';

export default function WatchAdModal({ onClose, onComplete, userId }) {
  const [countdown, setCountdown] = useState(3);
  const [watching, setWatching] = useState(false);
  const [adLoaded, setAdLoaded] = useState(false);
  const [adWatchTime, setAdWatchTime] = useState(0);
  const [adProvider, setAdProvider] = useState(null); // 'popads', 'propeller', or 'cpalead'
  const [popAdsBannerId, setPopAdsBannerId] = useState('');
  const [propellerZoneId, setPropellerZoneId] = useState('');
  const [cpaleadAdUrl, setCPALeadAdUrl] = useState('');
  const adCompletedRef = useRef(false);
  const countdownTimerRef = useRef(null);
  const iframeRef = useRef(null);
  const propellerScriptLoadedRef = useRef(false);
  const popAdsScriptLoadedRef = useRef(false);

  // Load ad settings (PropellerAds priority, then CPALead)
  useEffect(() => {
    const loadAdSettings = async () => {
      try {
        const { getSettings } = await import('../firebase/firestore');
        const settings = await getSettings();
        
        // Priority 1: PopAds (Easiest!)
        if (settings?.popAdsBannerId) {
          setAdProvider('popads');
          setPopAdsBannerId(settings.popAdsBannerId);
          console.log('✅ Using PopAds for popunder/interstitial ads');
          return;
        }
        
        // Priority 2: PropellerAds Interstitial
        if (settings?.propellerAdsInterstitialZoneId) {
          setAdProvider('propeller');
          setPropellerZoneId(settings.propellerAdsInterstitialZoneId);
          console.log('✅ Using PropellerAds Interstitial for video/interstitial ads');
          return;
        }
        
        // Priority 3: CPALead Custom Ad URL
        if (settings?.cpaleadCustomAdUrl) {
          setAdProvider('cpalead');
          const customAdUrl = settings.cpaleadCustomAdUrl;
          const cleanUserId = userId || '';
          const adUrl = customAdUrl.includes('?') 
            ? `${customAdUrl}&sub=${cleanUserId}` 
            : `${customAdUrl}?sub=${cleanUserId}`;
          setCPALeadAdUrl(adUrl);
          console.log('✅ Using CPAlead Custom Ad URL for video/interstitial ads');
          return;
        }
        
        // Priority 4: CPALead Offerwall URL
        if (settings?.cpaleadPublisherId) {
          setAdProvider('cpalead');
          const offerwallUrl = settings.cpaleadPublisherId;
          const cleanUserId = userId || '';
          const adUrl = offerwallUrl.includes('?') 
            ? `${offerwallUrl}&sub=${cleanUserId}` 
            : `${offerwallUrl}?sub=${cleanUserId}`;
          setCPALeadAdUrl(adUrl);
          console.log('⚠️ Using CPAlead Offerwall URL (configure Custom Ad URL in admin for better revenue)');
          return;
        }
      } catch (error) {
        console.log('Could not load settings from Firebase:', error);
      }

      // Fallback to localStorage
      const savedPopAdsBanner = localStorage.getItem('popads_banner_id') || '';
      if (savedPopAdsBanner) {
        setAdProvider('popads');
        setPopAdsBannerId(savedPopAdsBanner);
        console.log('✅ Using PopAds from localStorage');
        return;
      }
      
      const savedPropellerInterstitial = localStorage.getItem('propeller_ads_interstitial_zone_id') || '';
      if (savedPropellerInterstitial) {
        setAdProvider('propeller');
        setPropellerZoneId(savedPropellerInterstitial);
        console.log('✅ Using PropellerAds Interstitial from localStorage');
        return;
      }
      
      const savedCustomAd = localStorage.getItem('cpalead_custom_ad_url') || '';
      if (savedCustomAd) {
        setAdProvider('cpalead');
        const cleanUserId = userId || '';
        const adUrl = savedCustomAd.includes('?') 
          ? `${savedCustomAd}&sub=${cleanUserId}` 
          : `${savedCustomAd}?sub=${cleanUserId}`;
        setCPALeadAdUrl(adUrl);
        console.log('✅ Using CPAlead Custom Ad URL from localStorage');
        return;
      }
      
      // Last fallback: offerwall URL
      const savedOfferwall = localStorage.getItem('cpalead_publisher_id') || '';
      if (savedOfferwall) {
        setAdProvider('cpalead');
        const cleanUserId = userId || '';
        const adUrl = savedOfferwall.includes('?') 
          ? `${savedOfferwall}&sub=${cleanUserId}` 
          : `${savedOfferwall}?sub=${cleanUserId}`;
        setCPALeadAdUrl(adUrl);
        console.log('⚠️ Using CPAlead Offerwall URL from localStorage');
      }
    };

    loadAdSettings();
  }, [userId]);

  // Load PopAds script and show popunder/interstitial ad
  useEffect(() => {
    if (adProvider === 'popads' && popAdsBannerId && watching && !popAdsScriptLoadedRef.current) {
      // PopAds script for popunder/interstitial
      const script = document.createElement('script');
      script.src = `https://popads.net/pop.js?site=${popAdsBannerId}`;
      script.async = true;
      script.onload = () => {
        console.log('✅ PopAds script loaded for banner ID:', popAdsBannerId);
        setAdLoaded(true);
        // PopAds will automatically show popunder when script loads
      };
      document.head.appendChild(script);
      popAdsScriptLoadedRef.current = true;
    } else if (adProvider === 'cpalead' && cpaleadAdUrl) {
      // CPALead ads are loaded via iframe, which is handled in the render
      setAdLoaded(true);
    }
  }, [adProvider, popAdsBannerId, watching]);

  // Load PropellerAds script and show interstitial ad
  useEffect(() => {
    if (adProvider === 'propeller' && propellerZoneId && watching && !propellerScriptLoadedRef.current) {
      // Load PropellerAds script
      if (!window.propel_ad) {
        const script = document.createElement('script');
        script.src = 'https://ad.propellerads.com/script/pub.js';
        script.async = true;
        script.onload = () => {
          console.log('✅ PropellerAds script loaded');
          // Show interstitial ad after script loads
          setTimeout(() => {
            if (window.propel_ad && window.propel_ad.showInterstitial) {
              try {
                window.propel_ad.showInterstitial(propellerZoneId);
                console.log('✅ PropellerAds interstitial ad triggered for zone:', propellerZoneId);
                setAdLoaded(true);
              } catch (error) {
                console.error('Error showing PropellerAds interstitial:', error);
                setAdLoaded(true); // Still mark as loaded to start timer
              }
            } else {
              console.warn('PropellerAds showInterstitial not available');
              setAdLoaded(true); // Still mark as loaded to start timer
            }
          }, 500);
        };
        document.head.appendChild(script);
        propellerScriptLoadedRef.current = true;
    } else {
        // Script already loaded, show ad immediately
        try {
          if (window.propel_ad && window.propel_ad.showInterstitial) {
            window.propel_ad.showInterstitial(propellerZoneId);
            console.log('✅ PropellerAds interstitial ad triggered for zone:', propellerZoneId);
            setAdLoaded(true);
          }
        } catch (error) {
          console.error('Error showing PropellerAds interstitial:', error);
          setAdLoaded(true);
        }
      }
    }
  }, [adProvider, propellerZoneId, watching]);

  // Countdown before ad starts
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      // Countdown ended - start watching
      setWatching(true);
      setAdWatchTime(0);
        setAdLoaded(true);
        console.log('⏱️ Starting 20-second watch timer');
    }
  }, [countdown]);

  // Store onComplete in ref to avoid dependency issues
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Ad watching timer - Track time watched (need 20 seconds)
  useEffect(() => {
    // Only start timer if ad is loaded and watching
    if (!watching || !adLoaded || adCompletedRef.current) {
      // Clear timer if conditions not met
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
        countdownTimerRef.current = null;
      }
      return;
    }

    console.log('✅ Starting watch timer - will award points at 20 seconds');

    // Start the watch timer - count up to 20 seconds
    countdownTimerRef.current = setInterval(() => {
      setAdWatchTime((prev) => {
        const newTime = prev + 1;
        console.log(`⏱️ Watch time: ${newTime}/20 seconds`);
        
        // If user watched for 20 or more seconds, award points
        if (newTime >= 20 && !adCompletedRef.current) {
          console.log('🎉 20+ seconds reached! Awarding points...');
          adCompletedRef.current = true;
          
          // Clear timer first
          if (countdownTimerRef.current) {
            clearInterval(countdownTimerRef.current);
            countdownTimerRef.current = null;
          }
          
          // Update state
          setWatching(false);
          setAdLoaded(false);
          
          // Award points immediately using ref to ensure latest callback
          try {
            console.log('✅ Calling onComplete callback...');
            onCompleteRef.current();
            console.log('✅ onComplete callback executed');
          } catch (error) {
            console.error('❌ Error in onComplete callback:', error);
            alert('⚠️ Error awarding points. Please try again.');
          }
          
          return 20; // Cap at 20
        }
        return newTime;
      });
    }, 1000);

    return () => {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
        countdownTimerRef.current = null;
      }
    };
  }, [watching, adLoaded]);


  // Auto-complete when watch time reaches 20 seconds
  useEffect(() => {
    if (adWatchTime >= 20 && !adCompletedRef.current && adLoaded) {
      adCompletedRef.current = true;
      // Award points after watching for 20 seconds
      setTimeout(() => {
        if (onComplete) {
          onComplete();
        }
      }, 500);
    }
  }, [adWatchTime, adLoaded, onComplete]);


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" style={{ zIndex: 1000 }}>
      <div className="bg-white rounded-xl max-w-2xl w-full p-6 relative" style={{ zIndex: 1001 }}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-6 h-6" />
        </button>

        {countdown > 0 ? (
          <div className="text-center py-8">
            <div className="text-6xl font-bold text-purple-600 mb-4">
              {countdown}
            </div>
            <p className="text-gray-600">Preparing ad...</p>
            <p className="text-xs text-gray-500 mt-3">⏱️ Watch ad more than 20 seconds to earn 5 points</p>
          </div>
        ) : watching ? (
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Watch Ad to Earn Points</h3>
            <p className="text-xs text-gray-600 mb-4 text-center">⏱️ Watch ad more than 20 seconds to earn 5 points</p>
            
            {/* Simplified Progress Display - No countdown timer, just progress */}
            {adLoaded && (
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-6 mb-4 border-2 border-purple-300">
                {/* Progress Bar - Main Display */}
                <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden relative">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-blue-500 h-full rounded-full transition-all duration-1000 ease-linear flex items-center justify-center"
                    style={{ width: `${Math.min((adWatchTime / 20) * 100, 100)}%` }}
                  >
                    <span className="text-sm font-bold text-white">
                      {adWatchTime < 20 ? `${adWatchTime}/20 seconds` : 'Complete!'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Ad Container */}
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-4 text-center border-2 border-purple-300 relative" style={{ minHeight: '500px', maxHeight: '600px' }}>
              {adProvider === 'popads' && popAdsBannerId ? (
                /* PopAds Popunder/Interstitial */
                <div className="w-full h-full relative flex flex-col items-center justify-center" style={{ minHeight: '500px' }}>
                  <div className="mb-4">
                    <PlayCircle className="w-16 h-16 text-green-600 mx-auto mb-2" />
                    <p className="text-lg font-bold text-gray-800 mb-2">PopAds Popunder Ad</p>
                    <p className="text-sm text-gray-600">The ad should appear automatically in a new window</p>
                    {adLoaded && (
                      <p className="text-xs text-green-600 mt-2">✅ Ad loaded - Watch for 20 seconds to earn points</p>
                    )}
                  </div>
                  {/* PopAds will show popunder ad automatically */}
                  <div className="bg-white rounded-lg p-6 shadow-lg border-2 border-green-300">
                    <p className="text-sm text-gray-700">
                      If the ad didn't appear, please check your popup blocker settings.
                    </p>
                  </div>
                </div>
              ) : adProvider === 'propeller' && propellerZoneId ? (
                /* PropellerAds Interstitial */
                <div className="w-full h-full relative flex flex-col items-center justify-center" style={{ minHeight: '500px' }}>
                  <div className="mb-4">
                    <PlayCircle className="w-16 h-16 text-orange-600 mx-auto mb-2" />
                    <p className="text-lg font-bold text-gray-800 mb-2">PropellerAds Interstitial Ad</p>
                    <p className="text-sm text-gray-600">The ad should appear automatically in a new window</p>
                    {adLoaded && (
                      <p className="text-xs text-green-600 mt-2">✅ Ad loaded - Watch for 20 seconds to earn points</p>
                    )}
                  </div>
                  {/* PropellerAds will show interstitial ad in a popup/new window */}
                  <div className="bg-white rounded-lg p-6 shadow-lg border-2 border-orange-300">
                    <p className="text-sm text-gray-700">
                      If the ad didn't appear, please check your popup blocker settings.
                    </p>
                  </div>
                    </div>
              ) : adProvider === 'cpalead' && cpaleadAdUrl ? (
                /* CPALead Ads iframe */
                <div className="w-full h-full relative" style={{ minHeight: '500px' }}>
                  <iframe
                    ref={iframeRef}
                    src={cpaleadAdUrl}
                    title="CPALead Ads"
                    style={{
                      width: '100%',
                      height: '100%',
                      minHeight: '500px',
                      border: 'none',
                      borderRadius: '8px',
                      display: 'block'
                    }}
                    scrolling="auto"
                    frameBorder="0"
                    allow="autoplay; encrypted-media"
                    onLoad={() => {
                      setAdLoaded(true);
                      console.log('✅ CPALead ads loaded');
                    }}
                  />
                  
                  {/* Progress Overlay - Fixed at bottom */}
                  {adLoaded && (
                    <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/80 via-black/60 to-transparent p-4">
                      <div className="bg-white/95 rounded-lg p-3 mx-auto max-w-md shadow-xl">
                        <div className="w-full bg-gray-200 rounded-full h-3 mb-2 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-1000 flex items-center justify-center"
                            style={{ width: `${Math.min((adWatchTime / 20) * 100, 100)}%` }}
                          >
                            {adWatchTime >= 20 && (
                              <span className="text-xs font-bold text-white">✓</span>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-center font-semibold text-gray-800">
                          {adWatchTime < 20 ? (
                            <span>⏱️ Watch for <strong>{20 - adWatchTime}</strong> more seconds to earn <strong>5 points</strong></span>
                          ) : (
                            <span className="text-green-600">✅ Complete! You've earned <strong>5 points</strong>!</span>
                          )}
                        </p>
                      </div>
                    </div>
                  )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="mb-6">
                      <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-purple-600 mx-auto"></div>
                    </div>
                  <p className="text-xl font-bold text-purple-600 mb-2">📺 Loading Ads</p>
                    <p className="text-sm text-gray-600">
                    Please configure PropellerAds or CPALead in admin settings
                    </p>
                </div>
              )}
            </div>

            {/* Instructions */}
            {adLoaded && (
              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-800 text-center">
                  📺 <strong>{adProvider === 'popads' ? 'PopAds' : adProvider === 'propeller' ? 'PropellerAds' : 'CPALead'} Ads Active:</strong> Watch the ads for <strong>20 seconds</strong> to earn <strong>5 points</strong>. 
                  {adWatchTime < 20 && ` Progress: ${adWatchTime}/20 seconds`}
                  {adWatchTime >= 20 && ` ✅ Points will be awarded automatically!`}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">✅</div>
            <p className="text-xl font-semibold text-green-600">Ad Complete!</p>
            <p className="text-gray-600 mt-2">You earned 10 points</p>
          </div>
        )}
      </div>
    </div>
  );
}

