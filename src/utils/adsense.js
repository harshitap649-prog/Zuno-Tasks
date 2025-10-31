let scriptLoading = null;

export function loadAdSense(clientId) {
  if (!clientId) return Promise.reject(new Error('Missing AdSense client id'));
  if (typeof window === 'undefined') return Promise.resolve();

  const existing = document.querySelector('script[data-adsbygoogle]');
  if (existing) return Promise.resolve();

  if (scriptLoading) return scriptLoading;

  scriptLoading = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.setAttribute('data-adsbygoogle', 'true');
    script.async = true;
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + encodeURIComponent(clientId);
    script.crossOrigin = 'anonymous';
    script.onload = () => resolve();
    script.onerror = (e) => reject(e);
    document.head.appendChild(script);
  });

  return scriptLoading;
}

export function pushAds() {
  try {
    (window.adsbygoogle = window.adsbygoogle || []).push({});
  } catch (e) {
    // ignore
  }
}


