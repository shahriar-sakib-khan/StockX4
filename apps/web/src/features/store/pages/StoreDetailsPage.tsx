import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../hooks/useStores';
import { StaffList } from '@/features/staff/components/StaffList';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Settings } from 'lucide-react';

export const StoreDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading, error } = useStore(id!);

   if (!id) return null;
  if (isLoading) return <div className="text-muted-foreground">Loading store...</div>;
  if (error) return <div className="text-destructive">Failed to load store</div>;

  const store = data?.store;

  return (
    <>
       <div className="mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 sm:gap-0">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1 sm:mb-2">{store.name}</h1>
                    <p className="text-muted-foreground font-mono text-xs sm:text-sm bg-muted inline-block px-2 py-1 rounded border border-border">
                        Slug: {store.slug}
                    </p>
                </div>
                <Button variant="outline" className="w-full sm:w-auto min-h-[48px] sm:min-h-[40px]">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                </Button>
            </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
                {/* Stats or other widgets can go here */}
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-foreground mb-4">Store Performance</h3>
                    <p className="text-muted-foreground">Sales data integration coming soon.</p>
                </div>
            </div>

            <div className="lg:col-span-1 space-y-6">
                <div className="bg-card border border-border rounded-xl p-4 sm:p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-foreground mb-4">Quick Actions</h3>
                    <Button variant="outline" className="w-full mb-3 justify-start min-h-[48px] sm:min-h-[40px]">
                        Open POS Interface
                    </Button>
                    <Button variant="outline" className="w-full mb-3 justify-start min-h-[48px] sm:min-h-[40px]">
                        View Orders
                    </Button>
                    <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 min-h-[48px] sm:min-h-[40px]">
                        Close Store
                    </Button>
                </div>
            </div>
       </div>
    </>
  );
};
