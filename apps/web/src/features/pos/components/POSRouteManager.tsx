import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { usePosStore } from '../stores/pos.store';

export const POSRouteManager = () => {
  const location = useLocation();
  const { clearCart } = usePosStore();

  useEffect(() => {
    // If we are NOT on a POS route, clear the cart.
    // This allows reloads on /pos to persist data (since path doesn't change),
    // but navigating to /dashboard or /history will clear it.
    // If we are NOT on a POS route (either global /pos or store-specific /stores/:id/pos), clear the cart.
    const isPosRoute = location.pathname.startsWith('/pos') || /\/stores\/[^/]+\/pos/.test(location.pathname);

    if (!isPosRoute) {
      clearCart();
    }
  }, [location, clearCart]);

  return null; // This component doesn't render anything
};
