const getBackendUrl = () => {
  if (import.meta.env.VITE_BACKEND_URL) {
    return import.meta.env.VITE_BACKEND_URL;
  }
  
  if (import.meta.env.PROD) {
    const backendUrl = (window as any).__BACKEND_URL__ || 'https://deploy-buddy-backend-production.up.railway.app';
    return backendUrl;
  }
  
  return 'http://localhost:12345';
};

export const API_CONFIG = {
  BACKEND_URL: getBackendUrl(),
} as const;