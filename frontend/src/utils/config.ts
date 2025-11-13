const getBackendUrl = () => {
  console.log('[Config] VITE_BACKEND_URL:', import.meta.env.VITE_BACKEND_URL);
  console.log('[Config] PROD mode:', import.meta.env.PROD);
  console.log('[Config] window.__BACKEND_URL__:', (window as any).__BACKEND_URL__);
  console.log('[Config] window.location.origin:', window.location.origin);
  
  if (import.meta.env.VITE_BACKEND_URL) {
    console.log('[Config] Using VITE_BACKEND_URL:', import.meta.env.VITE_BACKEND_URL);
    return import.meta.env.VITE_BACKEND_URL;
  }
  
  if (import.meta.env.PROD) {
    const backendUrl = (window as any).__BACKEND_URL__ || 'https://deploy-buddy-backend-production.up.railway.app';
    console.log('[Config] Using production fallback:', backendUrl);
    return backendUrl;
  }
  
  console.log('[Config] Using localhost fallback: http://localhost:12345');
  return 'http://localhost:12345';
};

const backendUrl = getBackendUrl();
console.log('[Config] Final BACKEND_URL:', backendUrl);

export const API_CONFIG = {
  BACKEND_URL: backendUrl,
} as const;