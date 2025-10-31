import { useEffect, useRef } from 'react';

export default function SidebarAd({ className = '' }) {
  const adContainerRef = useRef(null);

  useEffect(() => {
    // Service worker handles ads automatically
    // Sidebar ads will show via service worker
    // The service worker is already registered and will inject ads
    // Some networks need a container with specific ID or class
    
    if (adContainerRef.current) {
      // Service worker will inject ads automatically
      // You can add a data attribute or ID if the network requires it
      adContainerRef.current.setAttribute('data-ad-container', 'sidebar');
    }
  }, []);

  // Service worker-based ads - container for automatic injection
  return (
    <div 
      ref={adContainerRef}
      className={`bg-gray-50 border border-gray-200 rounded-lg ${className}`} 
      style={{ minHeight: '250px', width: '100%', maxWidth: '300px' }}
      data-ad-zone="sidebar"
    >
      {/* Service worker will inject sidebar ads here automatically */}
      <div className="text-xs text-gray-400 text-center p-8" style={{ minHeight: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        Ads will appear here automatically
      </div>
    </div>
  );
}

