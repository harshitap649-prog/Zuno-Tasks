import { useEffect, useRef, useState } from 'react';

export default function BannerAd({ className = '' }) {
  const bannerRef = useRef(null);
  const [adProvider, setAdProvider] = useState(null); // 'popads', 'propeller', or 'cpalead'
  const [popAdsSiteId, setPopAdsSiteId] = useState('');
  const [propellerZoneId, setPropellerZoneId] = useState('');
  const [cpaleadOfferwallUrl, setCPALeadOfferwallUrl] = useState('');
  const scriptLoadedRef = useRef(false);

  useEffect(() => {
    // Load ad settings from Firebase or localStorage
    const loadAdSettings = async () => {
      try {
        // Try to get from Firebase settings first
        const { getSettings } = await import('../firebase/firestore');
        const settings = await getSettings();
        
        // Priority 1: PopAds (Easiest!)
        if (settings?.popAdsSiteId) {
          setAdProvider('popads');
          setPopAdsSiteId(settings.popAdsSiteId);
          return;
        }
        
        // Priority 2: PropellerAds Banner
        if (settings?.propellerAdsBannerZoneId) {
          setAdProvider('propeller');
          setPropellerZoneId(settings.propellerAdsBannerZoneId);
          return;
        }
        
        // Priority 3: CPALead Offerwall
        if (settings?.cpaleadPublisherId) {
          setAdProvider('cpalead');
          setCPALeadOfferwallUrl(settings.cpaleadPublisherId);
          return;
        }
      } catch (error) {
        console.log('Could not load settings from Firebase:', error);
      }

      // Fallback to localStorage
      const savedPopAds = localStorage.getItem('popads_site_id') || '';
      if (savedPopAds) {
        setAdProvider('popads');
        setPopAdsSiteId(savedPopAds);
        return;
      }
      
      const savedPropellerBanner = localStorage.getItem('propeller_ads_banner_zone_id') || '';
      if (savedPropellerBanner) {
        setAdProvider('propeller');
        setPropellerZoneId(savedPropellerBanner);
        return;
      }
      
      const savedOfferwall = localStorage.getItem('cpalead_publisher_id') || '';
      if (savedOfferwall) {
        setAdProvider('cpalead');
        setCPALeadOfferwallUrl(savedOfferwall);
      }
    };

    loadAdSettings();
  }, []);

  // Load and initialize PopAds
  useEffect(() => {
    if (adProvider === 'popads' && popAdsSiteId && !scriptLoadedRef.current) {
      // PopAds script - loads automatically
      const script = document.createElement('script');
      script.src = `https://popads.net/pop.js?site=${popAdsSiteId}`;
      script.async = true;
      script.onload = () => {
        console.log('✅ PopAds script loaded for site:', popAdsSiteId);
      };
      document.head.appendChild(script);
      scriptLoadedRef.current = true;
    }
  }, [adProvider, popAdsSiteId]);

  // Load and initialize PropellerAds
  useEffect(() => {
    if (adProvider === 'propeller' && propellerZoneId && bannerRef.current && !scriptLoadedRef.current) {
      // Load PropellerAds script
      const script = document.createElement('script');
      script.src = 'https://ad.propellerads.com/script/pub.js';
      script.async = true;
      script.onload = () => {
        console.log('✅ PropellerAds script loaded');
        // Initialize ad after script loads
        setTimeout(() => {
          if (window.propel_ad && bannerRef.current) {
            try {
              const adContainer = bannerRef.current.querySelector(`#propeller-banner-${propellerZoneId}`);
              if (adContainer) {
                // PropellerAds will automatically detect and fill the container
                console.log('✅ PropellerAds banner initialized for zone:', propellerZoneId);
              }
            } catch (error) {
              console.error('Error initializing PropellerAds:', error);
            }
          }
        }, 500);
      };
      document.head.appendChild(script);
      scriptLoadedRef.current = true;
    }
  }, [adProvider, propellerZoneId]);

  if (!adProvider) {
    // No ad provider configured, don't show ad
    return null;
  }

  return (
    <div 
      ref={bannerRef} 
      className={`${className} banner-ad-wrapper`}
      style={{
        width: '100%',
        minHeight: '90px',
        display: 'block',
        backgroundColor: '#f9fafb',
        padding: '8px 0',
        margin: '0 auto',
        position: 'relative',
        zIndex: 50
      }}
      data-ad-container="true"
      data-ad-type="banner"
    >
      {adProvider === 'popads' && popAdsSiteId ? (
        /* PopAds - Script loads automatically, no container needed for banner */
        <div style={{ display: 'none' }} data-popads-site={popAdsSiteId}></div>
      ) : adProvider === 'propeller' && propellerZoneId ? (
        /* PropellerAds Banner */
        <div 
          id={`propeller-banner-${propellerZoneId}`}
          data-zone-id={propellerZoneId}
          data-propeller-zone={propellerZoneId}
          style={{
            width: '100%',
            minHeight: '90px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto',
            maxWidth: '728px'
          }}
        >
          {/* PropellerAds will inject ad here via script */}
        </div>
      ) : adProvider === 'cpalead' && cpaleadOfferwallUrl ? (
        /* CPALead Offerwall Banner Ad */
        <iframe
          src={cpaleadOfferwallUrl}
          title="CPALead Offerwall"
          style={{
            width: '100%',
            height: '90px',
            border: 'none',
            display: 'block',
            margin: '0 auto',
            maxWidth: '728px'
          }}
          scrolling="no"
          frameBorder="0"
        />
      ) : null}
    </div>
  );
}
