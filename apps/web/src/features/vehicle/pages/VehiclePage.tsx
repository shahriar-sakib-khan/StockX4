import { useState } from 'react';
import { useVehicles, useDeleteVehicle } from '@/features/vehicle/hooks/useVehicles';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Truck, User, Phone, Edit, Fuel, Wrench } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { VehicleForm } from '@/features/vehicle/components/VehicleForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VehicleDetails } from '@/features/vehicle/components/VehicleDetails';
import { AddVehicleExpenseModal } from '@/features/vehicle/components/AddVehicleExpenseModal';

type Vehicle = {
    _id: string;
    licensePlate: string;
    vehicleModel?: string;
    driverName?: string;
    driverPhone?: string;
    imageUrl?: string;
};

export const VehiclePage = () => {
    const { data: vehicles, isLoading } = useVehicles();
    const { mutate: deleteVehicle } = useDeleteVehicle();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
    const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

    // Expense Modal State
    const [expenseModalOpen, setExpenseModalOpen] = useState(false);
    const [expenseVehicleId, setExpenseVehicleId] = useState<string | null>(null);
    const [expenseType, setExpenseType] = useState<'FUEL' | 'REPAIR'>('FUEL');

    const openExpenseModal = (vehicleId: string, type: 'FUEL' | 'REPAIR') => {
        setExpenseVehicleId(vehicleId);
        setExpenseType(type);
        setExpenseModalOpen(true);
    };

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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="animate-pulse">
                            <CardHeader className="h-48 bg-muted/20" />
                            <CardContent className="h-24 bg-muted/10" />
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {vehicles?.map((vehicle: Vehicle) => (
                        <Card
                            key={vehicle._id}
                            className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg border-slate-200 hover:border-primary/50 flex flex-col h-full bg-white"
                            onClick={() => setSelectedVehicleId(vehicle._id)}
                        >
                             {/* Image Section - Reduced Height */}
                             <div className="relative h-32 w-full overflow-hidden bg-slate-100">
                                {vehicle.imageUrl ? (
                                    <img src={vehicle.imageUrl} alt={vehicle.licensePlate} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-slate-50">
                                        <Truck className="w-10 h-10 text-slate-300" />
                                    </div>
                                )}


                                <div className="absolute top-2 right-2 flex gap-1 z-20 translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                                    <Button
                                        variant="secondary"
                                        size="icon"
                                        className="h-7 w-7 bg-white/90 hover:bg-white shadow-sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setEditingVehicle(vehicle);
                                        }}
                                    >
                                        <Edit className="w-3.5 h-3.5 text-slate-700" />
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="icon"
                                        className="h-7 w-7 shadow-sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (confirm('Are you sure you want to delete this vehicle?')) deleteVehicle(vehicle._id);
                                        }}
                                    >
                                        <Trash2 size={14} />
                                    </Button>
                                </div>

                                <div className="absolute bottom-2 left-3 right-3 text-slate-900">
                                    <h3 className="font-black text-3xl leading-none tracking-tight">
                                        {vehicle.licensePlate}
                                    </h3>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black opacity-90">{vehicle.vehicleModel || 'Unknown Model'}</p>
                                </div>
                            </div>

                            <CardContent className="flex-1 p-3 space-y-3">
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-md border border-slate-100">
                                        <div className="flex-shrink-0 p-1 bg-white rounded-full shadow-sm">
                                            <User className="w-3 h-3 text-primary" />
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-[9px] font-bold uppercase text-slate-400 leading-none mb-0.5">Driver</span>
                                            <span className="font-medium text-slate-700 text-xs truncate">{vehicle.driverName || 'N/A'}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-md border border-slate-100">
                                        <div className="flex-shrink-0 p-1 bg-white rounded-full shadow-sm">
                                            <Phone className="w-3 h-3 text-green-600" />
                                        </div>
                                         <div className="flex flex-col min-w-0">
                                            <span className="text-[9px] font-bold uppercase text-slate-400 leading-none mb-0.5">Phone</span>
                                            <span className="font-medium text-slate-700 text-xs truncate">{vehicle.driverPhone || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-1 flex gap-2">
                                    <Button
                                        className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white shadow-sm h-7 text-xs"
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            openExpenseModal(vehicle._id, 'FUEL');
                                        }}
                                    >
                                        <Fuel className="w-3 h-3 mr-1.5" /> Fuel
                                    </Button>
                                    <Button
                                        className="flex-1 bg-red-500 hover:bg-red-600 text-white shadow-sm h-7 text-xs"
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            openExpenseModal(vehicle._id, 'REPAIR');
                                        }}
                                    >
                                        <Wrench className="w-3 h-3 mr-1.5" /> Repair
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {vehicles?.length === 0 && (
                        <div className="col-span-full text-center py-12 text-muted-foreground">
                            <Truck className="w-12 h-12 mx-auto mb-4 opacity-20" />
                            <p>No vehicles found. Add one to get started.</p>
                        </div>
                    )}
                </div>
            )}

            <Modal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                title="Add New Vehicle"
            >
                <VehicleForm onSuccess={() => setIsCreateOpen(false)} />
            </Modal>

            <Modal
                isOpen={!!editingVehicle}
                onClose={() => setEditingVehicle(null)}
                title="Edit Vehicle"
            >
                {editingVehicle && (
                    <VehicleForm
                        initialData={editingVehicle}
                        onSuccess={() => setEditingVehicle(null)}
                    />
                )}
            </Modal>

            <AddVehicleExpenseModal
                vehicleId={expenseVehicleId}
                initialType={expenseType}
                isOpen={expenseModalOpen}
                onClose={() => setExpenseModalOpen(false)}
            />

            {selectedVehicleId && (
                <VehicleDetails
                    vehicleId={selectedVehicleId}
                    isOpen={!!selectedVehicleId}
                    onClose={() => setSelectedVehicleId(null)}
                />
            )}
        </div>
    );
};
