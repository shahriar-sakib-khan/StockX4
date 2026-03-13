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
      <div className="p-8 pb-6 text-center lg:text-left">
        <h1 className="text-2xl font-black flex items-center justify-center lg:justify-start text-slate-900 tracking-tighter uppercase ring-offset-4">
          <Shield className="mr-3 text-red-600 w-8 h-8" /> 
          <span className="bg-red-50 text-red-600 px-2 rounded-lg">Admin</span>
        </h1>
      </div>

      <nav className="flex-1 px-4 space-y-3">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center space-x-4 px-4 h-14 rounded-2xl transition-all active:scale-95 group ${
              location.pathname === item.path
                ? 'bg-slate-900 text-white shadow-xl shadow-slate-200'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <item.icon size={22} className={location.pathname === item.path ? 'text-white' : 'text-slate-400 group-hover:text-slate-900 transition-colors'} />
            <span className="font-black uppercase tracking-widest text-xs">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Bottom Section: Settings & Profile */}
      <div className="p-4 border-t border-slate-50 space-y-3 pb-8">
          <Link
            to="/admin/settings"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center space-x-4 px-4 h-14 rounded-2xl transition-all active:scale-95 group ${
              location.pathname === '/admin/settings'
                ? 'bg-slate-100 text-slate-900 shadow-sm'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Settings size={22} className={location.pathname === '/admin/settings' ? 'text-slate-900' : 'text-slate-400 group-hover:text-slate-900'} />
            <span className="font-black uppercase tracking-widest text-xs">Settings</span>
          </Link>

        <div className="pt-4 flex items-center justify-between px-2 bg-slate-50/50 rounded-2xl py-2">
           <div className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-all p-2 rounded-xl active:scale-95" onClick={() => navigate('/admin/profile')}>
               <Avatar src={user?.avatar} alt={user?.name} size="sm" className="border-2 border-white shadow-sm" />
               <div className="text-left overflow-hidden">
                   <p className="font-black text-slate-900 text-sm leading-none truncate">{user?.name}</p>
                   <p className="text-[10px] uppercase font-bold text-red-500 tracking-widest mt-1 truncate">Admin Profile</p>
               </div>
           </div>
           <Button
              onClick={handleLogout}
              variant="ghost"
              size="icon"
              className="h-12 w-12 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all active:scale-90 shrink-0"
              title="Logout"
           >
              <LogOut size={20} />
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
        <header className="h-16 border-b border-slate-100 flex items-center justify-between px-4 lg:px-8 bg-white/80 backdrop-blur-md sticky top-0 z-50 shrink-0">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden mr-2 h-12 w-12 text-slate-500"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu size={24} />
            </Button>
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter truncate">
              {menuItems.find(i => i.path === location.pathname)?.label || 'Admin Portal'}
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
      <nav className="lg:hidden fixed bottom-4 left-4 right-4 bg-white/90 backdrop-blur-xl border border-slate-100 flex justify-around items-center h-20 z-[60] px-2 rounded-3xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.15)] ring-1 ring-slate-900/5">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`relative flex flex-col items-center justify-center w-full h-16 group transition-all duration-300 ${isActive ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
            >
               {isActive && (
                  <span className="absolute -top-1 w-8 h-1 bg-slate-900 rounded-full animate-in fade-in zoom-in duration-300" />
               )}
              <div className={`p-2 rounded-2xl transition-all duration-300 ${isActive ? 'bg-slate-900/5 scale-110' : 'group-hover:bg-slate-50'}`}>
                <item.icon size={22} className={isActive ? 'opacity-100' : 'opacity-70'} />
              </div>
              <span className={`text-[10px] font-black uppercase tracking-widest mt-1 transition-all duration-300 ${isActive ? 'opacity-100 scale-100' : 'opacity-60 scale-95'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="relative flex flex-col items-center justify-center w-full h-16 text-slate-400 hover:text-slate-600 transition-all duration-300 active:scale-90"
        >
          <div className="p-2 rounded-2xl hover:bg-slate-50 transition-all">
            <Menu size={22} className="opacity-70" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest mt-1 opacity-60">More</span>
        </button>
      </nav>
    </div>
  );
};
