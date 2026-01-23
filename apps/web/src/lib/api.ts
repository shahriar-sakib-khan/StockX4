import ky from 'ky';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const api = ky.create({
  prefixUrl: API_URL,
  retry: 0,
  hooks: {
    beforeRequest: [
      (request) => {
        // Determine context based on window location (Frontend Route)
        const isStaffContext = window.location.pathname.startsWith('/pos') || window.location.pathname.startsWith('/staff');

        let token = null;

        if (isStaffContext) {
             const storage = localStorage.getItem('staff-auth-storage');
             if (storage) {
                 token = JSON.parse(storage).state.token;
             }
        }

        // Fallback or Primary Owner Token
        if (!token) {
            const storage = localStorage.getItem('auth-storage');
            if (storage) {
                token = JSON.parse(storage).state.token;
            }
        }

        if (token) {
          request.headers.set('Authorization', `Bearer ${token}`);
        }
      },
    ],
  },
});
