import { useStaffStore } from '../stores/staff.store';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export const StaffDashboardPage = () => {
  const { staff, clearAuth } = useStaffStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuth();
    navigate('/staff/login');
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="h-16 bg-card border-b border-border flex items-center justify-between px-8 shadow-sm">
        <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-primary">
                POS Terminal
            </h1>
            <span className="bg-muted px-2 py-1 rounded text-xs font-mono text-muted-foreground">
                {staff ? `${staff.name} (${staff.role})` : 'Owner Mode'}
            </span>
        </div>
        <Button onClick={handleLogout} variant="ghost" className="text-muted-foreground hover:text-foreground">
            Logout
        </Button>
      </header>

      <main className="p-8">
         <div className="bg-card border border-border rounded-xl p-12 text-center shadow-sm">
            <h2 className="text-2xl font-bold mb-4 text-foreground">Ready for Sales</h2>
            <p className="text-muted-foreground mb-8">Point of Sale features would be implemented here.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
                <Button variant="outline" className="h-32 bg-primary/10 border-primary/20 hover:bg-primary/20 flex flex-col items-center justify-center text-primary">
                    <span className="text-2xl mb-2 font-bold">New Sale</span>
                </Button>
                <Button variant="outline" className="h-32 bg-muted/50 border-border hover:bg-muted flex flex-col items-center justify-center text-muted-foreground hover:text-foreground">
                     <span className="text-xl mb-2">Orders</span>
                </Button>
                <Button variant="outline" className="h-32 bg-muted/50 border-border hover:bg-muted flex flex-col items-center justify-center text-muted-foreground hover:text-foreground">
                     <span className="text-xl mb-2">Customers</span>
                </Button>
            </div>
         </div>
      </main>
    </div>
  );
};
