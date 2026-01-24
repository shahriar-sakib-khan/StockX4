import ky from 'ky';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const api = ky.create({
  prefixUrl: API_URL,
  retry: 0,
  hooks: {
    beforeRequest: [
      (request) => {
        const ownerStorage = localStorage.getItem('auth-storage');
        const staffStorage = localStorage.getItem('staff-auth-storage');

        const ownerToken = ownerStorage ? JSON.parse(ownerStorage).state?.token : null;
        const staffToken = staffStorage ? JSON.parse(staffStorage).state?.token : null;

        let token: string | null = null;

        // Context-aware token selection
        // If in POS or Staff pages, prefer Staff token.
        // Otherwise (Dashboard, Store views), prefer Owner token but fallback to Staff token (for Managers).
        if (window.location.pathname.startsWith('/pos') || window.location.pathname.startsWith('/staff')) {
             token = staffToken || ownerToken;
        } else {
             token = ownerToken || staffToken;
        }

        if (token) {
          request.headers.set('Authorization', `Bearer ${token}`);
        }
      },
    ],
    afterResponse: [
      (_request, _options, response) => {
        if (response.status === 401) {
          // Check which context we are in to know which login to redirect to?
          // For now, default to main login.
          // Optional: Clear storage to prevent loops if app tries to auto-refresh
          localStorage.removeItem('auth-storage');
          localStorage.removeItem('staff-auth-storage');

          if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
             window.location.href = '/login';
          }
        }
      }
    ]
  },
});
