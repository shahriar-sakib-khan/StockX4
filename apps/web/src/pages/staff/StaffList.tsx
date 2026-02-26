import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export const StaffList = () => {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Staff Management</h1>
                    <p className="text-muted-foreground">Manage employees and their access roles.</p>
                </div>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Add Staff
                </Button>
            </div>

            <div className="rounded-md border p-8 text-center text-muted-foreground">
                Staff management features coming soon.
            </div>
        </div>
    );
};
