import { useState } from 'react';
import { useVehicles, useDeleteVehicle } from '@/features/vehicle/hooks/useVehicles';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { VehicleForm } from '@/features/vehicle/components/VehicleForm';

type Vehicle = {
    _id: string;
    licensePlate: string;
    vehicleModel?: string;
    driverName?: string;
    driverPhone?: string;
};

export const VehiclePage = () => {
    const { data: vehicles, isLoading } = useVehicles();
    const { mutate: deleteVehicle } = useDeleteVehicle();
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const columns: ColumnDef<Vehicle>[] = [
        {
            accessorKey: 'licensePlate',
            header: 'License Plate',
        },
        {
            accessorKey: 'vehicleModel',
            header: 'Model',
            cell: ({ row }) => row.original.vehicleModel || '-',
        },
        {
            accessorKey: 'driverName',
            header: 'Driver',
            cell: ({ row }) => (
                <div>
                    <div>{row.original.driverName || 'N/A'}</div>
                    <div className="text-xs text-muted-foreground">{row.original.driverPhone}</div>
                </div>
            )
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
                            if(confirm('Are you sure?')) deleteVehicle(row.original._id);
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
                    <h1 className="text-2xl font-bold tracking-tight">Vehicles</h1>
                    <p className="text-muted-foreground">Manage logistics and delivery vehicles.</p>
                </div>
                <Button onClick={() => setIsCreateOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Add Vehicle
                </Button>
            </div>

            {isLoading ? (
                <div className="text-center py-10">Loading vehicles...</div>
            ) : (
                <DataTable columns={columns} data={vehicles || []} />
            )}

            <Modal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                title="Add New Vehicle"
            >
                <VehicleForm onSuccess={() => setIsCreateOpen(false)} />
            </Modal>
        </div>
    );
};
