import { useEffect, useRef } from 'react';

export default function SidebarAd({ adCode, className = '' }) {
  const adRef = useRef(null);

  useEffect(() => {
    if (!adCode || !adRef.current) return;

    adRef.current.innerHTML = '';

    const wrapper = document.createElement('div');
    wrapper.innerHTML = adCode;

    // Extract and execute scripts
    const scripts = wrapper.querySelectorAll('script');
    scripts.forEach((oldScript) => {
      const newScript = document.createElement('script');
      Array.from(oldScript.attributes).forEach((attr) => {
        newScript.setAttribute(attr.name, attr.value);
      });
      newScript.appendChild(document.createTextNode(oldScript.innerHTML));
      oldScript.parentNode.replaceChild(newScript, oldScript);
    });

    // Append all content including divs
    adRef.current.appendChild(wrapper);
  }, [adCode]);

  if (!adCode) {
    return (
      <div className={`bg-gray-50 border border-gray-200 rounded-lg p-8 text-center text-xs text-gray-400 ${className}`} style={{ minHeight: '250px' }}>
        <p>Ad Space</p>
        <p className="mt-2">Add VITE_ADSTERRA_SIDEBAR_CODE</p>
      </div>
    );
  }

  return (
    <div 
      ref={adRef} 
      className={`ad-sidebar ${className}`} 
      style={{ minHeight: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    />
  );
}

