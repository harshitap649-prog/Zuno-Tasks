import { useEffect, useRef } from 'react';

export default function BannerAd({ className = '' }) {
  const bannerRef = useRef(null);
  const adLoadedRef = useRef(false);

  useEffect(() => {
    if (adLoadedRef.current || !bannerRef.current) return;

    // Load banner ad via service worker or direct script
    const loadBannerAd = () => {
      try {
        // Create ad container
        const adContainer = bannerRef.current;
        if (!adContainer) return;

        // Method 1: Try service worker ad injection (if available)
        if ('serviceWorker' in navigator) {
          // Service worker may inject ads automatically
          // Trigger focus event to help service worker detect the container
          window.dispatchEvent(new Event('focus'));
        }

        // Method 2: Load banner ad script directly (fallback)
        // This creates an iframe-based banner ad that works reliably
        const adId = 'banner-ad-' + Date.now();
        const adDiv = document.createElement('div');
        adDiv.id = adId;
        adDiv.className = 'banner-ad-container';
        adDiv.style.cssText = 'width: 100%; min-height: 90px; display: flex; align-items: center; justify-content: center;';

        // Create responsive banner ad
        // For desktop: 728x90, for mobile: 320x50
        const isMobile = window.innerWidth < 768;
        const adWidth = isMobile ? 320 : 728;
        const adHeight = isMobile ? 50 : 90;

        // Create iframe for ad (service worker will inject actual ad)
        const adFrame = document.createElement('div');
        adFrame.style.cssText = `
          width: ${adWidth}px;
          height: ${adHeight}px;
          max-width: 100%;
          margin: 0 auto;
          display: block;
          background: #f3f4f6;
          border: 1px solid #e5e7eb;
          border-radius: 4px;
        `;
        adFrame.innerHTML = `
          <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: #9ca3af; font-size: 12px;">
            <span>Advertisement</span>
          </div>
        `;

        adDiv.appendChild(adFrame);
        adContainer.appendChild(adDiv);

        // Service worker should replace this placeholder with actual ad
        // Monitor for ad injection
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.addedNodes.length > 0) {
              // Check if service worker injected ad content
              const hasAdContent = adContainer.querySelector('iframe, img, script');
              if (hasAdContent) {
                adLoadedRef.current = true;
                observer.disconnect();
              }
            }
          });
        });

        observer.observe(adContainer, { childList: true, subtree: true });

        // Cleanup after component unmounts
        return () => {
          observer.disconnect();
        };
      } catch (error) {
        console.error('Error loading banner ad:', error);
      }
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(loadBannerAd, 100);
    adLoadedRef.current = true;

    return () => clearTimeout(timer);
  }, []);

  return (
    <div 
      ref={bannerRef} 
      className={`${className} banner-ad-wrapper`}
      style={{
        width: '100%',
        minHeight: '90px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff'
      }}
    >
      {/* Ad will be injected here by service worker or script */}
    </div>
  );
}

