import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../features/auth/stores/auth.store';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { LayoutDashboard, Settings, LogOut, Shield, Tags, Menu, X } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/button';

interface LayoutProps {
  children: ReactNode;
}

export const AdminLayout = ({ children }: LayoutProps) => {
  const { user } = useAuthStore();
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Admin Dashboard', path: '/admin' },
    { icon: Tags, label: 'Global Brands', path: '/admin/brands' },
  ];

  const SidebarContent = () => (
    <>
      <div className="p-6">
        <h1 className="text-2xl font-bold flex items-center text-foreground">
          <Shield className="mr-2 text-primary" /> Admin
        </h1>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
              location.pathname === item.path
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            }`}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Bottom Section: Settings & Profile */}
      <div className="p-4 border-t border-border space-y-2">
          <Link
            to="/admin/settings"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
              location.pathname === '/admin/settings'
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            }`}
          >
            <Settings size={20} />
            <span>Settings</span>
          </Link>

        <div className="pt-2 flex items-center justify-between px-4 pb-2">
           <div className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate('/admin/profile')}>
               <Avatar src={user?.avatar} alt={user?.name} size="sm" />
               <div className="text-sm overflow-hidden">
                   <p className="font-medium text-foreground truncate">{user?.name}</p>
                   <p className="text-xs text-muted-foreground truncate">Administrator</p>
               </div>
           </div>
           <Button
              onClick={handleLogout}
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              title="Logout"
           >
              <LogOut size={18} />
           </Button>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-card border-r border-border flex-col fixed inset-y-0 z-50">
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-64 min-w-0 h-screen">
        {/* Topbar + Mobile Menu Trigger */}
        <header className="h-16 border-b border-border flex items-center justify-between px-4 lg:px-8 bg-card/50 backdrop-blur-sm sticky top-0 z-10 shrink-0">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden mr-4"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu size={24} />
            </Button>
            <h2 className="text-lg font-medium text-foreground truncate">
              {menuItems.find(i => i.path === location.pathname)?.label || 'Admin'}
            </h2>
          </div>
        </header>

        {/* Mobile Sidebar Overlay */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
            <div className="relative w-64 max-w-[80vw] bg-card flex flex-col h-full shadow-2xl animate-in slide-in-from-left duration-200">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 z-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X size={20} />
              </Button>
              <SidebarContent />
            </div>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto overflow-x-hidden bg-background pb-24 lg:pb-8">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border flex justify-around items-center h-16 z-40 px-1 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <item.icon size={20} className={isActive ? 'opacity-100' : 'opacity-70'} />
              <span className="text-[10px] font-bold truncate w-full text-center px-1 tracking-tight">{item.label}</span>
            </Link>
          );
        })}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="flex flex-col items-center justify-center w-full h-full space-y-1 text-muted-foreground hover:text-foreground"
        >
          <Menu size={20} className="opacity-70" />
          <span className="text-[10px] font-bold truncate w-full text-center px-1 tracking-tight">More</span>
        </button>
      </nav>
    </div>
  );
};
