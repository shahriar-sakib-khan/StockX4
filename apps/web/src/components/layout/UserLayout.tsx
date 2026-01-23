import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../features/auth/stores/auth.store';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { LayoutDashboard, History, Settings, User, LogOut, Store as StoreIcon } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/button';

interface LayoutProps {
  children: ReactNode;
}

export const UserLayout = ({ children }: LayoutProps) => {
  const { user } = useAuthStore();
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: StoreIcon, label: 'My Stores', path: '/stores' },
    { icon: History, label: 'History', path: '/history' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-400">
            Antigravity
          </h1>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                location.pathname === item.path
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-foreground/10 hover:text-sidebar-foreground'
              }`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Bottom Section: Settings & Profile */}
        <div className="p-4 border-t border-sidebar-border space-y-2">
            <Link
              to="/settings"
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                location.pathname === '/settings'
                  ? 'bg-sidebar-foreground/10 text-sidebar-foreground'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-foreground/10 hover:text-sidebar-foreground'
              }`}
            >
              <Settings size={20} />
              <span>Settings</span>
            </Link>

          <div className="pt-2 flex items-center justify-between px-4 pb-2 text-sidebar-foreground/70">
             <div className="flex items-center space-x-2 cursor-pointer hover:text-sidebar-foreground" onClick={() => navigate('/profile')}>
                 <Avatar src={user?.avatar} alt={user?.name} size="sm" />
                 <div className="text-sm">
                     <p className="font-medium text-sidebar-foreground">{user?.name}</p>
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
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Topbar (Simplified for User) */}
        <header className="h-16 bg-card border-b border-border flex items-center px-8 shadow-sm">
          <h2 className="text-lg font-medium text-card-foreground">
            {location.pathname.replace('/', '').replace(/-/g, ' ').toUpperCase()}
          </h2>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-8 overflow-y-auto bg-background">
          {children}
        </main>
      </div>
    </div>
  );
};
