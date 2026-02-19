import { ReactNode, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, useParams, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../features/auth/stores/auth.store';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { useStaffStore } from '../../features/staff/stores/staff.store';
import { LayoutDashboard, Settings, LogOut, ArrowLeft, Package, Users, ShoppingCart, Store, Truck, Menu, X, User, History } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/button';
import { useStore } from '../../features/store/hooks/useStores';

interface LayoutProps {
  children?: ReactNode;
}

export const StoreLayout = ({ children }: LayoutProps) => {
  const { user: owner } = useAuthStore();
  const { staff, clearAuth: logoutStaff } = useStaffStore();
  const { logout: logoutOwner } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Determine active user (Owner or Staff)
  const isOwner = !!owner;
  const isStaff = !!staff;
  const currentUser = isOwner ? owner : staff;

  console.log('StoreLayout Debug:', {
      isOwner,
      isStaff,
      ownerId: owner?.id,
      staffId: staff?._id,
      staffStoreId: staff?.storeId,
      urlId: id
  });


  useEffect(() => {
    if (!isOwner && !isStaff) {
        navigate('/login');
        return;
    }

    // If Staff is Manager, enforce store scope
    if (isStaff && staff) {
        const staffStoreId = typeof staff.storeId === 'object' ? (staff.storeId as any)._id : staff.storeId;
        if (staffStoreId !== id) {
            navigate(`/stores/${staffStoreId}`);
        }
    }
  }, [isOwner, isStaff, staff, id, navigate]);

  if (!isOwner && !isStaff) return null; // Prevent flash

  // Handlers
  const handleLogout = () => {
    if (isStaff) {
        logoutStaff();
        navigate('/staff/login');
    } else {
        logoutOwner();
        navigate('/login');
    }
  };

  // Fetch store details to show name in sidebar
  const { data: storeData } = useStore(id || '');
  const store = storeData?.store;

  const menuItems = [
    { icon: LayoutDashboard, label: 'Overview', path: `/stores/${id}/dashboard` },
    { icon: ShoppingCart, label: 'POS', path: `/stores/${id}/pos` },
    { icon: Store, label: 'Shops (B2B)', path: `/stores/${id}/shops` },
    { icon: User, label: 'Customers (B2C)', path: `/stores/${id}/customers` },
    { icon: Package, label: 'Inventory', path: `/stores/${id}/inventory` },
    { icon: Truck, label: 'Vehicles', path: `/stores/${id}/vehicles` },
    { icon: History, label: 'History', path: `/stores/${id}/history` },
    { icon: Users, label: 'Staff', path: `/stores/${id}/staff` },
  ];

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // ... (existing code)

  const SidebarContent = () => (
    <>
      {/* Store Brand / Switcher */}
      <div className={`p-4 border-b border-border flex flex-col gap-4 ${isSidebarCollapsed ? 'items-center' : ''}`}>
         <div className="flex items-center justify-between w-full">
            {!isSidebarCollapsed && (
                 <Link to="/stores" className="flex items-center text-xs text-muted-foreground hover:text-primary transition-colors">
                    <ArrowLeft size={14} className="mr-1" />
                    Back
                 </Link>
            )}
            <Button
               variant="ghost"
               size="icon"
               className={`text-muted-foreground hover:text-foreground h-6 w-6 ${isSidebarCollapsed ? '' : 'ml-auto'}`}
               onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
               title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
           >
               {isSidebarCollapsed ? <Menu size={16} /> : <div className="flex items-center"><Menu size={16} /></div>}
           </Button>
         </div>

         {store ? (
             !isSidebarCollapsed ? (
                 <div>
                     <h2 className="text-xl font-bold text-foreground truncate">{store.name}</h2>
                     <p className="text-xs text-muted-foreground font-mono truncate">{store.slug}</p>
                 </div>
             ) : (
                 <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-bold text-lg">
                     {store.name.substring(0, 2).toUpperCase()}
                 </div>
             )
         ) : (
             <div className="animate-pulse h-8 bg-muted rounded w-3/4"></div>
         )}
      </div>

      <nav className="flex-1 px-4 space-y-2 py-6 overflow-y-auto">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
              location.pathname === item.path
                ? 'bg-primary/10 text-primary shadow-sm border border-primary/20'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            } ${isSidebarCollapsed ? 'justify-center px-2' : ''}`}
            title={isSidebarCollapsed ? item.label : undefined}
          >
            <item.icon size={20} />
            {!isSidebarCollapsed && <span>{item.label}</span>}
          </Link>
        ))}
      </nav>

      {/* Bottom Section: Settings & Profile */}
      <div className="p-4 border-t border-border space-y-2">

          <Link
            to={`/stores/${id}/settings`}
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
              location.pathname.includes('/settings')
                ? 'bg-muted text-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            } ${isSidebarCollapsed ? 'justify-center px-2' : ''}`}
             title={isSidebarCollapsed ? 'Store Settings' : undefined}
          >
            <Settings size={20} />
            {!isSidebarCollapsed && <span>Store Settings</span>}
          </Link>

    <div className={`pt-2 flex items-center ${isSidebarCollapsed ? 'justify-center flex-col gap-4' : 'justify-between'} px-4 pb-2 text-muted-foreground`}>
        <div className={`flex items-center space-x-2 cursor-pointer hover:text-foreground ${isSidebarCollapsed ? 'justify-center' : ''}`} onClick={() => navigate(isOwner ? '/profile' : '#')}>
            <Avatar
                src={(currentUser as any)?.avatar || (currentUser as any)?.image}
                alt={currentUser?.name}
                size="sm"
            />
            {!isSidebarCollapsed && (
                <div className="text-sm">
                    <p className="font-medium text-foreground">{currentUser?.name}</p>
                    {isStaff && <p className="text-xs capitalize text-primary font-semibold">{staff?.role}</p>}
                </div>
            )}
        </div>
        <Button
            onClick={handleLogout}
            variant="ghost"
            size="icon"
            className="text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10"
            title="Logout"
        >
            <LogOut size={18} />
        </Button>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex ${isSidebarCollapsed ? 'w-20' : 'w-64'} bg-card border-r border-border flex-col fixed inset-y-0 z-50 transition-all duration-300`}>
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col ${isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'} min-w-0 transition-all duration-300`}>
        {/* Topbar (Breadcrumbs / Title) + Mobile Menu Trigger */}
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 md:px-8 shadow-sm">
           <div className="flex items-center">
             <Button
                variant="ghost"
                size="icon"
                className="md:hidden mr-4"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
             >
               <Menu size={24} />
             </Button>
             <h2 className="text-lg font-medium text-card-foreground">
              {menuItems.find(i => i.path === location.pathname)?.label || 'Dashboard'}
            </h2>
           </div>
        </header>

        {/* Mobile Sidebar Overlay */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex">
             <div className="fixed inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
             <div className="relative w-64 bg-card flex flex-col h-full shadow-2xl animate-in slide-in-from-left duration-200">
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-4 right-4"
                    onClick={() => setMobileMenuOpen(false)}
                >
                  <X size={20} />
                </Button>
                <SidebarContent />
             </div>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto bg-background">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};
