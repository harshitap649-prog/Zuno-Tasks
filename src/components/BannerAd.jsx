import { useEffect } from 'react';

export default function BannerAd({ className = '' }) {
  useEffect(() => {
    // Service worker handles ads automatically
    // Banner ads will show via service worker based on zone configuration
    // The service worker is already registered in index.html
    // Ads will appear automatically based on the network's logic
    
    // Trigger service worker if needed for banner ads
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      // Service worker will handle banner ads automatically
      // Some networks require a page load/visibility change to trigger
      window.dispatchEvent(new Event('focus'));
    }
  }, []);

  // Service worker-based ads don't need a specific container
  // They inject ads automatically
  // Return a placeholder or empty div
  return (
    <div className={`${className}`} style={{ minHeight: '90px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="text-xs text-gray-400">
        {/* Service worker will inject banner ads here automatically */}
      </div>
    </div>
  );
}

