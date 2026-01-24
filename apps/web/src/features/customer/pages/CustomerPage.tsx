import { useState } from 'react';
import { useCustomers, useDeleteCustomer } from '@/features/customer/hooks/useCustomers';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { CustomerForm } from '@/features/customer/components/CustomerForm';

type Customer = {
    _id: string;
    name: string;
    phone: string;
    address: string;
};

export const CustomerPage = () => {
    const { data: customers, isLoading } = useCustomers();
    const { mutate: deleteCustomer } = useDeleteCustomer();
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const columns: ColumnDef<Customer>[] = [
        {
            accessorKey: 'name',
            header: 'Name',
        },
        {
            accessorKey: 'phone',
            header: 'Phone',
        },
        {
            accessorKey: 'address',
            header: 'Address',
            cell: ({ row }) => row.original.address || '-',
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
                            if(confirm('Are you sure?')) deleteCustomer(row.original._id);
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
                    <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
                    <p className="text-muted-foreground">Manage your retail (B2C) customers.</p>
                </div>
                <Button onClick={() => setIsCreateOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Add Customer
                </Button>
            </div>

            {isLoading ? (
                <div className="text-center py-10">Loading customers...</div>
            ) : (
                <DataTable columns={columns} data={customers || []} />
            )}

            <Modal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                title="Add New Customer"
            >
                <CustomerForm onSuccess={() => setIsCreateOpen(false)} />
            </Modal>
        </div>
    );
};
