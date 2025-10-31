import { useEffect, useRef } from 'react';

export default function BannerAd({ adCode, className = '' }) {
  const adRef = useRef(null);

  useEffect(() => {
    if (!adCode || !adRef.current) return;

    // Clear previous ad
    adRef.current.innerHTML = '';

    // Create a wrapper div for the ad
    const wrapper = document.createElement('div');
    wrapper.innerHTML = adCode;

    // Extract and execute any scripts
    const scripts = wrapper.querySelectorAll('script');
    scripts.forEach((oldScript) => {
      const newScript = document.createElement('script');
      Array.from(oldScript.attributes).forEach((attr) => {
        newScript.setAttribute(attr.name, attr.value);
      });
      newScript.appendChild(document.createTextNode(oldScript.innerHTML));
      oldScript.parentNode.replaceChild(newScript, oldScript);
    });

    adRef.current.appendChild(wrapper);
  }, [adCode]);

  if (!adCode) {
    return (
      <div className={`bg-gray-100 border border-gray-300 rounded p-4 text-center text-sm text-gray-500 ${className}`}>
        <p>Ad Slot - Add VITE_ADSTERRA_BANNER_CODE in .env</p>
      </div>
    );
  }

  return (
    <div ref={adRef} className={`ad-container ${className}`} style={{ minHeight: '90px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} />
  );
}

