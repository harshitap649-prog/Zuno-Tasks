import { useEffect, useRef } from 'react';

export default function BannerAd({ className = '' }) {
  const bannerRef = useRef(null);
  const adLoadedRef = useRef(false);
  const adContainerId = useRef(`banner-ad-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    if (adLoadedRef.current || !bannerRef.current) return;

    const loadBannerAd = () => {
      try {
        const adContainer = bannerRef.current;
        if (!adContainer) return;

        // Clear any existing content
        adContainer.innerHTML = '';

        // Create container for Adsterra banner ad
        const adWrapper = document.createElement('div');
        adWrapper.id = adContainerId.current;
        adWrapper.className = 'banner-ad-container';
        adWrapper.style.cssText = `
          width: 100%;
          min-height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          margin: 0 auto;
        `;

        // Adsterra Banner Ad Configuration - Exact format from Adsterra
        const adKey = '92f35e106485494ea7ef96a502ccaa7a';
        
        // Create container div where ad will be injected
        const adDiv = document.createElement('div');
        adDiv.id = `${adContainerId.current}-ad`;
        adDiv.style.cssText = `
          width: 320px;
          height: 50px;
          max-width: 100%;
          margin: 0 auto;
          display: block;
        `;
        
        adWrapper.appendChild(adDiv);
        adContainer.appendChild(adWrapper);

        // Set atOptions globally (must be set before invoke.js loads)
        // Using exact format from Adsterra
        if (typeof window !== 'undefined') {
          window.atOptions = {
            'key': adKey,
            'format': 'iframe',
            'height': 50,
            'width': 320,
            'params': {}
          };
        }
        
        // Create first script - atOptions config (inline script)
        const configScript = document.createElement('script');
        configScript.type = 'text/javascript';
        configScript.text = `atOptions = { 'key': '${adKey}', 'format': 'iframe', 'height': 50, 'width': 320, 'params': {} };`;
        
        // Create second script - Adsterra invoke.js (external script)
        const invokeScript = document.createElement('script');
        invokeScript.type = 'text/javascript';
        invokeScript.src = `//www.highperformanceformat.com/${adKey}/invoke.js`; // Protocol-relative URL
        invokeScript.async = true;
        invokeScript.charset = 'utf-8';
        
        // Append both scripts in order (config first, then invoke)
        adDiv.appendChild(configScript);
        adDiv.appendChild(invokeScript);

        // Monitor for ad loading
        const checkAdLoaded = setInterval(() => {
          const hasAd = adWrapper.querySelector('iframe, img, a[href]');
          if (hasAd) {
            clearInterval(checkAdLoaded);
            adLoadedRef.current = true;
          }
        }, 500);

        // Cleanup after 10 seconds
        setTimeout(() => {
          clearInterval(checkAdLoaded);
          adLoadedRef.current = true;
        }, 10000);

        // Handle script load
        script.onload = () => {
          console.log('Adsterra banner ad script loaded');
        };

        script.onerror = () => {
          console.error('Error loading Adsterra banner ad script');
          clearInterval(checkAdLoaded);
        };

      } catch (error) {
        console.error('Error loading banner ad:', error);
      }
    };

    // Load ad after component mounts
    const timer = setTimeout(loadBannerAd, 200);
    return () => {
      clearTimeout(timer);
    };
  }, []);

  return (
    <div 
      ref={bannerRef} 
      className={`${className} banner-ad-wrapper`}
      style={{
        width: '100%',
        minHeight: '50px',
        display: 'block',
        backgroundColor: '#f9fafb',
        padding: '12px 0',
        margin: '0 auto',
        position: 'relative',
        zIndex: 50
      }}
      data-ad-container="true"
      data-ad-type="banner"
    >
      {/* Adsterra Banner Ad will be injected here */}
    </div>
  );
}
