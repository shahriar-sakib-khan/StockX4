import { useState } from 'react';
import { useShops, useDeleteShop } from '@/features/shop/hooks/useShops';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal'; // Assuming generic Modal exists
import { ShopForm } from '@/features/shop/components/ShopForm';

// Define simplified type for display
type Shop = {
    _id: string;
    name: string;
    phone: string;
    address: string;
    district?: string;
};

export const ShopPage = () => {
    const { data: shops, isLoading } = useShops();
    const { mutate: deleteShop } = useDeleteShop();
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const columns: ColumnDef<Shop>[] = [
        {
            accessorKey: 'name',
            header: 'Shop Name',
        },
        {
            accessorKey: 'phone',
            header: 'Phone',
        },
        {
            accessorKey: 'address',
            header: 'Address',
        },
        {
             accessorKey: 'district',
             header: 'District',
             cell: ({ row }) => row.original.district || '-',
        },
        {
            id: 'actions',
            cell: ({ row }) => (
                <div className="flex justify-end">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={(e) => {
                            e.stopPropagation();
                            if(confirm('Are you sure?')) deleteShop(row.original._id);
                        }}
                    >
                        <Trash2 size={16} />
                    </Button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Shops</h1>
                    <p className="text-muted-foreground">Manage your B2B customers and retailers.</p>
                </div>
                <Button onClick={() => setIsCreateOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Add Shop
                </Button>
            </div>

            {isLoading ? (
                <div className="text-center py-10">Loading shops...</div>
            ) : (
                <DataTable columns={columns} data={shops || []} />
            )}

            <Modal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                title="Add New Shop"
            >
                <ShopForm onSuccess={() => setIsCreateOpen(false)} />
            </Modal>
        </div>
    );
};
