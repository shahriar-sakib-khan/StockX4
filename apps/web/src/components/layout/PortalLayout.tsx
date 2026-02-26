import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../features/auth/stores/auth.store';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { LogOut } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/button';

interface LayoutProps {
  children: ReactNode;
}

export const PortalLayout = ({ children }: LayoutProps) => {
  const { user } = useAuthStore();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top Navbar */}
      <header className="h-16 bg-sidebar border-b border-sidebar-border flex items-center justify-between px-4 md:px-8 shadow-sm">
        <div className="flex items-center space-x-4">
             <h1 className="text-xl font-bold text-sidebar-foreground">
               Antigravity
             </h1>
             <span className="text-sidebar-foreground/40">/</span>
             <span className="text-sm font-medium text-sidebar-foreground/70">Store Portal</span>
        </div>

        <div className="flex items-center space-x-4">
           {/* Navigation Links */}
           <nav className="hidden md:flex items-center space-x-6 mr-6">
                <Button variant="ghost" onClick={() => navigate('/stores')} className="text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-foreground/10">Stores</Button>
                <Button variant="ghost" onClick={() => navigate('/settings')} className="text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-foreground/10">Settings</Button>
           </nav>

           <div
                className="flex items-center space-x-3 cursor-pointer hover:bg-sidebar-foreground/10 p-2 rounded-lg transition-colors"
                onClick={() => navigate('/profile')}
           >
               <div className="text-right hidden md:block">
                   <p className="text-sm font-medium text-sidebar-foreground">{user?.name}</p>
                   <p className="text-xs text-sidebar-foreground/60">{user?.email}</p>
               </div>
               <Avatar src={user?.avatar} alt={user?.name} size="sm" />
           </div>
           <Button
              onClick={handleLogout}
              variant="ghost"
              size="icon"
              className="text-sidebar-foreground/60 hover:text-destructive hover:bg-sidebar-foreground/10"
              title="Logout"
           >
              <LogOut size={20} />
           </Button>
        </div>
      </header>

      {/* Main Content (Centered) */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  );
};
