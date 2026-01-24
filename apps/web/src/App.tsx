import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './features/landing/pages/LandingPage';
import { LoginPage } from './features/auth/pages/LoginPage';
import { RegisterPage } from './features/auth/pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { AdminDashboardPage } from './features/admin/pages/AdminDashboardPage';
import { AdminUserDetailPage } from './features/admin/pages/AdminUserDetailPage';
import { PortalLayout } from './components/layout/PortalLayout';
import { AdminLayout } from './components/layout/AdminLayout';
import { StoresPage } from './features/store/pages/StoresPage';
import { StoreStaffPage } from './features/store/pages/StoreStaffPage';
import { StaffLoginPage } from './features/staff/pages/StaffLoginPage';
import { StaffDashboardPage } from './features/staff/pages/StaffDashboardPage';
import { StaffProtectedRoute } from './features/staff/components/StaffProtectedRoute';
import { StoreLayout } from './components/layout/StoreLayout';

import { SettingsPage } from './features/settings/pages/SettingsPage'; // Keeping Settings in pages for now or move to common/settings
import { ProfilePage } from './features/users/pages/ProfilePage';
import { HistoryPage } from './pages/HistoryPage';
import { StoreDashboard } from './features/store/pages/StoreDashboard';
import { ShopPage } from './features/shop/pages/ShopPage';
import { CustomerPage } from './features/customer/pages/CustomerPage';
import { VehiclePage } from './features/vehicle/pages/VehiclePage';
import { InventoryPage } from './features/inventory/pages/InventoryPage';
import { BrandPage } from './features/brand/pages/BrandPage';

import { Toaster } from 'sonner';

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors closeButton />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route path="/dashboard" element={<Navigate to="/stores" replace />} />
        <Route path="/stores" element={<StoresPage />} />

        {/* Store Context (Nested Layout) */}
        <Route path="/stores/:id" element={<StoreLayout />}>
           <Route index element={<Navigate to="dashboard" replace />} />
           <Route path="dashboard" element={<StoreDashboard />} />
           <Route path="shops" element={<ShopPage />} />
           <Route path="customers" element={<CustomerPage />} />
           <Route path="vehicles" element={<VehiclePage />} />
           <Route path="inventory" element={<InventoryPage />} />
           <Route path="staff" element={<StoreStaffPage />} />
           <Route path="settings" element={<div>Store Settings (Coming Soon)</div>} />
        </Route>
        <Route path="/staff/login" element={<StaffLoginPage />} />
        <Route path="/pos" element={
          <StaffProtectedRoute>
            <StaffDashboardPage />
          </StaffProtectedRoute>
        } />

        {/* Admin Routes with Layout */}
        <Route path="/admin" element={<AdminLayout><AdminDashboardPage /></AdminLayout>} />
        <Route path="/admin/users/:id" element={<AdminLayout><AdminUserDetailPage /></AdminLayout>} />
        <Route path="/admin/brands" element={<AdminLayout><BrandPage /></AdminLayout>} />
        <Route path="/admin/profile" element={<AdminLayout><ProfilePage /></AdminLayout>} />
        <Route path="/admin/settings" element={<AdminLayout><SettingsPage /></AdminLayout>} />

        {/* User Routes with Layout */}
        <Route path="/settings" element={<PortalLayout><SettingsPage /></PortalLayout>} />
        <Route path="/profile" element={<PortalLayout><ProfilePage /></PortalLayout>} />
        <Route path="/history" element={<PortalLayout><HistoryPage /></PortalLayout>} />
        {/* Fallback to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
