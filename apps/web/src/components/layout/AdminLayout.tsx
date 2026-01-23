import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../features/auth/stores/auth.store';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { LayoutDashboard, Settings, LogOut, Shield } from 'lucide-react';
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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Admin Dashboard', path: '/admin' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex flex-col">
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
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-background">
        {/* Topbar */}
        <header className="h-16 border-b border-border flex items-center px-8 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <h2 className="text-lg font-medium text-foreground">
            {location.pathname.replace('/', '').replace(/-/g, ' ').toUpperCase()}
          </h2>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
