import { ReactNode, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../features/auth/stores/auth.store';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { LogOut, Store, Settings, User, Menu, X } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/button';

interface LayoutProps {
  children: ReactNode;
}

export const PortalLayout = ({ children }: LayoutProps) => {
  const { user } = useAuthStore();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { icon: Store, label: 'Stores', path: '/stores' },
    { icon: Settings, label: 'Settings', path: '/settings' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  const NavbarContent = () => (
    <header className="h-16 bg-sidebar border-b border-sidebar-border flex items-center justify-between px-4 md:px-8 shadow-sm shrink-0 sticky top-0 z-50 bg-card/80 backdrop-blur-md">
      <div className="flex items-center space-x-3">
           <div className="lg:hidden mr-2">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-12 w-12 text-sidebar-foreground/60 hover:text-sidebar-foreground"
                    onClick={() => setMobileMenuOpen(true)}
                >
                    <Menu size={24} />
                </Button>
           </div>
           <h1 className="text-xl font-black text-sidebar-foreground tracking-tighter uppercase">
             StockXBD
           </h1>
           <span className="text-sidebar-foreground/20 font-light text-2xl hidden sm:inline">|</span>
           <span className="text-xs font-black uppercase tracking-widest text-sidebar-foreground/60 hidden sm:inline">Store Portal</span>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-4">
         <nav className="hidden lg:flex items-center space-x-2 mr-4">
              {menuItems.map(item => (
                  <Button
                    key={item.path}
                    variant="ghost"
                    onClick={() => navigate(item.path)}
                    className={`text-sm font-black uppercase tracking-widest px-4 h-10 rounded-xl transition-all ${
                        location.pathname === item.path
                            ? 'bg-sidebar-foreground/10 text-sidebar-foreground'
                            : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-foreground/5'
                    }`}
                  >
                      {item.label}
                  </Button>
              ))}
         </nav>

         <div
              className="flex items-center space-x-3 cursor-pointer hover:bg-sidebar-foreground/10 p-2 pr-3 rounded-2xl transition-all active:scale-95 border-2 border-transparent hover:border-sidebar-foreground/10"
              onClick={() => navigate('/profile')}
         >
             <div className="text-right hidden md:block">
                 <p className="text-sm font-black text-sidebar-foreground leading-none">{user?.name}</p>
                 <p className="text-[10px] font-bold text-sidebar-foreground/50 uppercase tracking-widest mt-1 truncate max-w-[120px]">{user?.email}</p>
             </div>
             <Avatar src={user?.avatar} alt={user?.name} size="sm" className="ring-2 ring-transparent group-hover:ring-primary/20 transition-all border-2 border-white shadow-sm" />
         </div>
         <Button
            onClick={handleLogout}
            variant="ghost"
            size="icon"
            className="h-12 w-12 text-sidebar-foreground/40 hover:text-red-500 hover:bg-red-50 rounded-full transition-all active:scale-90"
            title="Logout"
         >
            <LogOut size={20} />
         </Button>
      </div>
    </header>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-foreground flex flex-col h-screen overflow-hidden">
      <NavbarContent />

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-[100] flex">
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
            <div className="relative w-72 max-w-[85vw] bg-white flex flex-col h-full shadow-2xl animate-in slide-in-from-left duration-300 rounded-r-3xl">
              <div className="p-6 pb-2 border-b border-slate-50 flex items-center justify-between">
                <h2 className="text-xl font-black uppercase tracking-tighter">Menu</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-12 w-12 rounded-full hover:bg-slate-100 active:scale-90"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <X size={24} />
                </Button>
              </div>
              <nav className="flex-1 p-4 space-y-2">
                {menuItems.map(item => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-4 p-4 h-14 rounded-2xl transition-all active:scale-95 ${
                      location.pathname === item.path
                        ? 'bg-slate-900 text-white shadow-lg shadow-slate-200'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <item.icon size={22} className={location.pathname === item.path ? 'text-white' : 'text-slate-400'} />
                    <span className="font-black uppercase tracking-widest text-xs">{item.label}</span>
                  </Link>
                ))}
              </nav>
              <div className="p-4 border-t border-slate-50">
                  <Button
                    onClick={handleLogout}
                    variant="ghost"
                    className="w-full h-14 rounded-2xl flex items-center justify-start space-x-4 px-4 text-red-500 hover:bg-red-50 hover:text-red-600 font-black uppercase tracking-widest text-xs transition-all active:scale-95"
                  >
                    <LogOut size={22} />
                    <span>Logout</span>
                  </Button>
              </div>
            </div>
          </div>
      )}

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full max-w-7xl mx-auto pb-24 md:pb-8">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
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
