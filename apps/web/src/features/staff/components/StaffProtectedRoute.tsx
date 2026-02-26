import { Navigate, Outlet } from 'react-router-dom';
import { useStaffStore } from '../stores/staff.store';
import { useAuth } from '@/features/auth/hooks/useAuth';

// Wrapper for POS/Staff Routes
// Allows access if:
// 1. Authenticated as Staff (Staff Token)
// 2. Authenticated as User/Owner (User Token)
export const StaffProtectedRoute = ({ children }: { children?: React.ReactNode }) => {
  const { isAuthenticated: isStaffAuth } = useStaffStore();
  const { isAuthenticated: isUserAuth } = useAuth();

  // "Hybrid" Auth Check
  // isUserAuth is a function, need to call it
  if (!isStaffAuth && !isUserAuth()) {
    // If neither, redirect to Staff Login (User login is separate flow)
    return <Navigate to="/staff/login" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};
