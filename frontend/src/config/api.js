const RAW_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://skindisease-backend-11fq.onrender.com/api';

export const API_BASE_URL = RAW_API_BASE_URL.replace(/\/+$/, '');
export const BACKEND_ORIGIN = API_BASE_URL.endsWith('/api')
  ? API_BASE_URL.slice(0, -4)
  : API_BASE_URL;

export const buildBackendAssetUrl = (assetPath) => {
  if (!assetPath) return '';
  if (assetPath.startsWith('http')) return assetPath;
  return `${BACKEND_ORIGIN}${assetPath.startsWith('/') ? assetPath : `/${assetPath}`}`;
};
