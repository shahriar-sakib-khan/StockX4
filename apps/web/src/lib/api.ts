import ky from 'ky';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { useStaffStore } from '@/features/staff/stores/staff.store';

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
      async (request, options, response) => {
        if (response.status === 401) {
          // Prevent infinite loop: Don't refresh if the failed request was already a refresh attempt
          if (request.url.includes('auth/refresh')) {
             useAuthStore.getState().clearAuth();
             useStaffStore.getState().clearAuth();
             if (window.location.pathname !== '/login' && window.location.pathname !== '/staff/login') {
                 window.location.href = '/login';
             }
             return; // Stop here
          }

          try {
            // Attempt Silent Refresh
            // We use a separate ky call to avoid hooks loops, and MUST include credentials for the cookie.
            const refreshData = await ky.post(`${API_URL}/auth/refresh`, {
                credentials: 'include',
                retry: 0
            }).json<{ accessToken: string }>();

            const newToken = refreshData.accessToken;
            if (!newToken) throw new Error('No token returned');

            // Update Stores (Try both, or check context)
            const { token: ownerToken } = useAuthStore.getState();
            if (ownerToken) useAuthStore.getState().setToken(newToken);

            const { token: staffToken } = useStaffStore.getState();
            if (staffToken) useStaffStore.getState().setToken(newToken);

            // Retry Original Request with new token
            request.headers.set('Authorization', `Bearer ${newToken}`);
            return ky(request);

          } catch (error) {
             // Refresh failed or Network error -> Logout
             useAuthStore.getState().clearAuth();
             useStaffStore.getState().clearAuth();

             // Redirect based on current path?
             if (window.location.pathname !== '/login' && window.location.pathname !== '/staff/login') {
                window.location.href = '/login';
             }
          }
        }
      }
    ]
  },
});
