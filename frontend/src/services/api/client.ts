import axios from 'axios';

// Detect if running through ngrok tunnel
function getApiBaseURL(): string {
  if (typeof window !== 'undefined') {
    const host = window.location.host;

    // If accessed via ngrok, use absolute URL to the local backend proxy through the same tunnel
    // ngrok forwards requests to localhost:5173, which proxies /api to localhost:8000
    // So we can safely use the relative /api/v1 path and let the proxy handle it
    if (host.includes('ngrok')) {
      return '/api/v1';
    }
  }

  return '/api/v1';
}

const apiClient = axios.create({
  baseURL: getApiBaseURL(),
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
});

// Detect if a token is a demo token (not a real JWT from the backend)
function isDemoToken(token: string): boolean {
  return token.endsWith('.demo-signature');
}

// Clear session and redirect to login
function forceLogout() {
  localStorage.removeItem('pcm_access_token');
  localStorage.removeItem('pcm_user');
  if (!window.location.pathname.includes('/login')) {
    window.location.href = '/login';
  }
}

// Request interceptor: attach JWT token from localStorage
// Demo tokens are not sent to the backend (backend won't accept them)
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('pcm_access_token');
  if (token && !isDemoToken(token)) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: handle 401 (expired/invalid token)
// In demo mode (no backend), do NOT force logout — let callers handle the error gracefully
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const token = localStorage.getItem('pcm_access_token');
    if (error.response?.status === 401 && !isDemoToken(token ?? '')) {
      forceLogout();
    }
    return Promise.reject(error);
  }
);

export default apiClient;
