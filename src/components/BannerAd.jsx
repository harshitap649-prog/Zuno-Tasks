import { useEffect, useRef } from 'react';

export default function BannerAd({ className = '' }) {
  const adContainerRef = useRef(null);
  const scriptLoadedRef = useRef(false);

  useEffect(() => {
    // Wait for container to be ready
    const timer = setTimeout(() => {
      const container = adContainerRef.current;
      if (container && !scriptLoadedRef.current) {
        // Check if scripts already exist
        const existingScript = document.querySelector('script[src*="8bd927cea0982a2766d512ab1f427450"]');
        if (existingScript) {
          console.log('✅ Adsterra banner ad script already loaded');
          scriptLoadedRef.current = true;
          return;
        }

        // Clear container
        container.innerHTML = '';

        // Override document.write to write directly to our container
        const originalWrite = document.write;
        const originalWriteln = document.writeln;
        
        document.write = function(content) {
          if (container) {
            container.innerHTML += content;
          }
        };
        
        document.writeln = function(content) {
          if (container) {
            container.innerHTML += content + '\n';
          }
        };

        // Set atOptions globally (required before script loads)
        window.atOptions = {
          'key': '8bd927cea0982a2766d512ab1f427450',
          'format': 'iframe',
          'height': 50,
          'width': 320,
          'params': {}
        };

        // Create and inject first script (atOptions)
        const script1 = document.createElement('script');
        script1.type = 'text/javascript';
        script1.textContent = `
          atOptions = {
            'key' : '8bd927cea0982a2766d512ab1f427450',
            'format' : 'iframe',
            'height' : 50,
            'width' : 320,
            'params' : {}
          };
        `;
        container.appendChild(script1);

        // Create and inject second script (invoke.js)
        const script2 = document.createElement('script');
        script2.type = 'text/javascript';
        script2.src = '//www.highperformanceformat.com/8bd927cea0982a2766d512ab1f427450/invoke.js';
        script2.async = true;
        script2.onload = () => {
          console.log('✅ Adsterra banner ad script loaded successfully');
          // Restore document.write after script loads
          setTimeout(() => {
            document.write = originalWrite;
            document.writeln = originalWriteln;
          }, 1000);
        };
        script2.onerror = (e) => {
          console.error('❌ Failed to load Adsterra banner ad script:', e);
          // Restore on error
          document.write = originalWrite;
          document.writeln = originalWriteln;
        };
        container.appendChild(script2);

        scriptLoadedRef.current = true;
      }
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div 
      ref={adContainerRef}
      className={className}
      style={{
        width: '100%',
        minHeight: '50px',
        display: 'block',
        margin: '0 auto',
        maxWidth: '320px',
        textAlign: 'center'
      }}
      id="adsterra-banner-container"
    />
  );
}
