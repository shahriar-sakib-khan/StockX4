import { ReactNode, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, useParams, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../features/auth/stores/auth.store';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { useStaffStore } from '../../features/staff/stores/staff.store';
import { LayoutDashboard, Settings, LogOut, ArrowLeft, Package, Users, ShoppingCart, Truck, Menu, X, User, History } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/button';
import { useStore } from '../../features/store/hooks/useStores';
import { MobileQuickActions } from './MobileQuickActions';

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

  const isOwner = !!owner;
  const isStaff = !!staff;
  const currentUser = isOwner ? owner : staff;

  useEffect(() => {
    if (!isOwner && !isStaff) {
        navigate('/login');
        return;
    }
    if (isStaff && staff) {
        const staffStoreId = typeof staff.storeId === 'object' ? (staff.storeId as any)._id : staff.storeId;
        if (staffStoreId !== id) {
            navigate(`/stores/${staffStoreId}`);
        }
    }
  }, [isOwner, isStaff, staff, id, navigate]);

  if (!isOwner && !isStaff) return null;

  const handleLogout = () => {
    if (isStaff) {
        logoutStaff();
        navigate('/staff/login');
    } else {
        logoutOwner();
        navigate('/login');
    }
  };

  const { data: storeData } = useStore(id || '');
  const store = storeData?.store;

  // THE FIX: Reordered array so Inventory is index 3 (4th item)
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: `/stores/${id}/dashboard` },
    { icon: History, label: 'Diary', path: `/stores/${id}/history` },
    { icon: ShoppingCart, label: 'POS', path: `/stores/${id}/pos` },
    { icon: Package, label: 'Inventory', path: `/stores/${id}/inventory` }, // Moved up
    { icon: User, label: 'Customers', path: `/stores/${id}/customers` }, // Moved down
    { icon: Truck, label: 'Vehicles', path: `/stores/${id}/vehicles` },
    { icon: Users, label: 'Staff', path: `/stores/${id}/staff` },
  ];

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const SidebarContent = () => (
    <>
      {/* Store Brand / Switcher */}
      <div className={`p-6 border-b border-border/50 flex flex-col gap-4 ${isSidebarCollapsed ? 'items-center' : ''}`}>
         <div className="flex items-center justify-between w-full">
            {!isSidebarCollapsed && (
                 <Link to="/stores" className="flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                    <ArrowLeft size={16} className="mr-1.5" />
                    Back to Stores
                 </Link>
            )}
            <Button
               variant="ghost"
               size="icon"
               className={`text-muted-foreground hover:text-foreground h-8 w-8 ${isSidebarCollapsed ? '' : 'ml-auto'}`}
               onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
           >
               <Menu size={18} />
           </Button>
         </div>

         {store ? (
             !isSidebarCollapsed ? (
                 <div className="mt-2">
                     <h2 className="text-xl font-bold text-foreground tracking-tight truncate">{store.name}</h2>
                     <p className="text-xs text-muted-foreground font-medium truncate mt-0.5">{store.slug}</p>
                 </div>
             ) : (
                 <div className="w-10 h-10 bg-indigo-600/10 rounded-xl flex items-center justify-center text-indigo-600 font-bold text-lg mt-2">
                     {store.name.substring(0, 2).toUpperCase()}
                 </div>
             )
         ) : (
             <div className="animate-pulse h-10 bg-slate-100 rounded-lg w-3/4 mt-2"></div>
         )}
      </div>

      <nav className="flex-1 px-4 space-y-1.5 py-6 overflow-y-auto hide-scrollbar">
        {menuItems.map((item) => {
            const isActive = location.pathname.includes(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-sm'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium'
                } ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
                title={isSidebarCollapsed ? item.label : undefined}
              >
                <item.icon size={22} className={`shrink-0 ${isActive ? 'opacity-100' : 'opacity-70'}`} />
                {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
        })}
      </nav>

      {/* Bottom Section: Settings & Profile */}
      <div className="p-4 border-t border-border/50 space-y-2">
          <Link
            to={`/stores/${id}/settings`}
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200 ${
              location.pathname.includes('/settings')
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium'
            } ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
             title={isSidebarCollapsed ? 'Store Settings' : undefined}
          >
            <Settings size={22} className="opacity-70" />
            {!isSidebarCollapsed && <span>Settings</span>}
          </Link>

        <div className={`pt-4 flex items-center ${isSidebarCollapsed ? 'justify-center flex-col gap-4' : 'justify-between'} px-2 pb-2`}>
            <div className={`flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity ${isSidebarCollapsed ? 'justify-center' : ''}`} onClick={() => navigate(isOwner ? '/profile' : '#')}>
                <Avatar
                    src={(currentUser as any)?.avatar || (currentUser as any)?.image}
                    alt={currentUser?.name}
                    size="sm"
                />
                {!isSidebarCollapsed && (
                    <div className="text-sm">
                        <p className="font-semibold text-slate-900 truncate max-w-[120px]">{currentUser?.name}</p>
                        <p className="text-[11px] uppercase tracking-wider text-indigo-600 font-bold">
                            {isOwner ? 'Owner' : staff?.role}
                        </p>
                    </div>
                )}
            </div>
            <Button
                onClick={handleLogout}
                variant="ghost"
                size="icon"
                className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full h-9 w-9"
            >
                <LogOut size={18} />
            </Button>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 flex overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className={`hidden lg:flex ${isSidebarCollapsed ? 'w-24' : 'w-72'} bg-white border-r border-slate-200 flex-col fixed inset-y-0 z-50 transition-all duration-300 shadow-sm`}>
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col ${isSidebarCollapsed ? 'lg:ml-24' : 'lg:ml-72'} min-w-0 transition-all duration-300 h-screen`}>
        {/* Sticky Glass Header */}
        <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 shrink-0">
           <div className="flex items-center">
             <Button
                variant="ghost"
                size="icon"
                className="lg:hidden mr-3 text-slate-700"
                onClick={() => setMobileMenuOpen(true)}
             >
               <Menu size={24} />
             </Button>
             <h2 className="text-xl font-bold tracking-tight text-slate-900 truncate">
              {menuItems.find(i => location.pathname.includes(i.path))?.label || 'Dashboard'}
            </h2>
           </div>
        </header>

        {/* --- SMOOTH MOBILE SIDEBAR OVERLAY --- */}
        <div className={`lg:hidden fixed inset-0 z-50 flex transition-all duration-300 ease-in-out ${mobileMenuOpen ? 'visible' : 'invisible pointer-events-none'}`}>
             <div 
                className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ease-in-out ${mobileMenuOpen ? 'opacity-100' : 'opacity-0'}`} 
                onClick={() => setMobileMenuOpen(false)} 
             />
             
             <div 
                className={`relative w-72 max-w-[80vw] bg-white border-r border-slate-200 flex flex-col h-full shadow-2xl transition-transform duration-300 ease-out ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
             >
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-4 right-4 z-50 bg-slate-100/50 backdrop-blur-md rounded-full"
                    onClick={() => setMobileMenuOpen(false)}
                >
                  <X size={20} />
                </Button>
                <SidebarContent />
             </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto overflow-x-hidden pb-28 lg:pb-8">
          {children || <Outlet />}
        </main>
      </div>

      {/* Elegant Mobile Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/85 backdrop-blur-xl border-t border-slate-200 flex justify-around items-center h-[72px] z-40 px-2 pb-safe shadow-[0_-8px_30px_rgba(0,0,0,0.04)]">
        {menuItems.slice(0, 4).map((item) => {
            const isActive = location.pathname.includes(item.path);
            return (
                <Link
                    key={item.path}
                    to={item.path}
                    className="relative flex flex-col items-center justify-center w-full h-full space-y-1.5 active:scale-95 transition-transform"
                >
                    <item.icon 
                        size={24} 
                        strokeWidth={isActive ? 2.5 : 2}
                        className={isActive ? 'text-indigo-600' : 'text-slate-400'} 
                    />
                    <span className={`text-[10px] truncate w-full text-center px-1 tracking-wide ${isActive ? 'font-bold text-indigo-700' : 'font-medium text-slate-500'}`}>
                        {item.label}
                    </span>
                    {/* Active Indicator Dot */}
                    {isActive && (
                        <span className="absolute -bottom-1 w-1 h-1 rounded-full bg-indigo-600" />
                    )}
                </Link>
            )
        })}
        <button
            onClick={() => setMobileMenuOpen(true)}
            className="flex flex-col items-center justify-center w-full h-full space-y-1.5 active:scale-95 transition-transform group"
        >
            <Menu size={24} className="text-slate-400" />
            <span className="text-[10px] font-medium text-slate-500 truncate w-full text-center px-1 tracking-wide">More</span>
        </button>
      </nav>

      {/* Mobile Quick Actions FAB */}
      <div className="lg:hidden">
        <MobileQuickActions />
      </div>
    </div>
  );
};