import { useState } from 'react';
import { useVehicles, useDeleteVehicle } from '@/features/vehicle/hooks/useVehicles';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Truck, User, Phone, Edit, Fuel, Wrench } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { VehicleForm } from '@/features/vehicle/components/VehicleForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VehicleDetails } from '@/features/vehicle/components/VehicleDetails';
import { AddVehicleExpenseModal } from '@/features/vehicle/components/AddVehicleExpenseModal';
import { InfoTooltip } from '@/features/store/components/setup/shared/InfoTooltip';

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
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

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
        <div className="space-y-6 sm:space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6">
                <div className="space-y-0.5 sm:space-y-1">
                    <h1 className="text-xl sm:text-3xl md:text-4xl font-black text-slate-800 tracking-tight uppercase">
                        Logistics
                        <InfoTooltip content="Manage your delivery vehicles and track driver assignments and expenses." />
                    </h1>
                    <p className="text-slate-400 font-bold text-[10px] sm:text-xs">Manage delivery fleet and service history.</p>
                </div>
                <Button 
                    onClick={() => setIsCreateOpen(true)} 
                    className="h-10 sm:h-12 md:h-14 w-full sm:w-auto px-6 sm:px-8 bg-slate-900 text-white rounded-xl sm:rounded-2xl font-black uppercase tracking-widest text-[9px] sm:text-xs shadow-xl shadow-slate-200 active:scale-[0.98] transition-all"
                >
                    <Plus className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" /> Add Vehicle
                </Button>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-80 bg-white rounded-3xl border-2 border-slate-100 animate-pulse shadow-sm" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                    {vehicles?.map((vehicle: Vehicle) => (
                        <div
                            key={vehicle._id}
                            className="group relative overflow-hidden bg-white border border-slate-200 rounded-3xl sm:rounded-[2.5rem] hover:shadow-2xl hover:shadow-slate-200 transition-all duration-500 cursor-pointer flex flex-col h-full active:scale-[0.98]"
                            onClick={() => setSelectedVehicleId(vehicle._id)}
                        >
                             {/* Image Section - Premium Canvas */}
                             <div className="relative h-32 sm:h-40 md:h-48 w-full overflow-hidden bg-slate-50">
                                {vehicle.imageUrl ? (
                                    <img src={vehicle.imageUrl} alt={vehicle.licensePlate} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-slate-100">
                                        <Truck className="w-16 h-16 text-slate-200" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />

                                 <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex gap-1.5 sm:gap-2 z-20">
                                     <Button
                                         variant="secondary"
                                         size="icon"
                                         className="h-8 w-8 sm:h-10 sm:w-10 bg-white/95 hover:bg-white shadow-xl border-none rounded-lg sm:rounded-xl active:scale-90 transition-all"
                                         onClick={(e) => {
                                             e.stopPropagation();
                                             setEditingVehicle(vehicle);
                                         }}
                                     >
                                         <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-700" />
                                     </Button>
                                     <Button
                                         variant="destructive"
                                         size="icon"
                                         className="h-8 w-8 sm:h-10 sm:w-10 shadow-xl shadow-rose-100 border-none rounded-lg sm:rounded-xl active:scale-90 transition-all"
                                         onClick={(e) => {
                                             e.stopPropagation();
                                             setDeleteTarget(vehicle._id);
                                         }}
                                     >
                                         <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                     </Button>
                                </div>

                                 <div className="absolute bottom-3 left-4 right-4 sm:bottom-5 sm:left-6 sm:right-6 text-white">
                                     <h3 className="font-black text-lg sm:text-2xl md:text-3xl leading-none tracking-tight drop-shadow-lg uppercase">
                                         {vehicle.licensePlate}
                                     </h3>
                                     <p className="text-[8px] sm:text-[10px] text-white/80 uppercase tracking-widest font-black mt-0.5 sm:mt-1 drop-shadow-md">
                                         {vehicle.vehicleModel || 'Standard Delivery'}
                                     </p>
                                 </div>
                            </div>

                             <div className="p-3.5 sm:p-6 md:p-7 flex-1 flex flex-col space-y-3 sm:space-y-5">
                                 <div className="grid grid-cols-2 gap-2 sm:gap-4">
                                     <div className="flex flex-col p-2 sm:p-3 bg-slate-50 rounded-xl sm:rounded-2xl border border-slate-100 group-hover:bg-white group-hover:border-indigo-100 transition-all">
                                         <span className="text-[7px] sm:text-[9px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1 sm:mb-1.5 flex items-center gap-1">
                                             <User className="w-2 sm:w-2.5 h-2 sm:h-2.5" /> Driver
                                         </span>
                                         <span className="font-black text-slate-700 text-[10px] sm:text-sm truncate">{vehicle.driverName || 'N/A'}</span>
                                     </div>
                                     <div className="flex flex-col p-2 sm:p-3 bg-slate-50 rounded-xl sm:rounded-2xl border border-slate-100 group-hover:bg-white group-hover:border-emerald-100 transition-all">
                                         <span className="text-[7px] sm:text-[9px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1 sm:mb-1.5 flex items-center gap-1">
                                             <Phone className="w-2 sm:w-2.5 h-2 sm:h-2.5" /> Contact
                                         </span>
                                         <span className="font-black text-slate-700 text-[10px] sm:text-sm truncate">{vehicle.driverPhone || 'N/A'}</span>
                                     </div>
                                 </div>

                                 <div className="pt-1.5 sm:pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                                     <Button
                                         className="h-10 sm:h-14 bg-amber-500 hover:bg-amber-600 text-amber-950 font-black shadow-lg shadow-amber-50 rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] uppercase tracking-widest active:scale-[0.98] transition-all"
                                         onClick={(e) => {
                                             e.stopPropagation();
                                             openExpenseModal(vehicle._id, 'FUEL');
                                         }}
                                     >
                                         <Fuel className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" /> Fuel Pay
                                     </Button>
                                     <Button
                                         className="h-10 sm:h-14 bg-rose-600 hover:bg-rose-700 text-white font-black shadow-lg shadow-rose-50 rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] uppercase tracking-widest active:scale-[0.98] transition-all"
                                         onClick={(e) => {
                                             e.stopPropagation();
                                             openExpenseModal(vehicle._id, 'REPAIR');
                                         }}
                                     >
                                         <Wrench className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" /> Repair Pay
                                     </Button>
                                 </div>
                            </div>
                        </div>
                    ))}

                    {vehicles?.length === 0 && (
                        <div className="col-span-full text-center py-20 px-5 border-4 border-dashed border-slate-100 rounded-[3rem] bg-white">
                            <div className="bg-slate-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                <Truck className="w-10 h-10 text-slate-200" />
                            </div>
                            <h4 className="text-slate-900 font-black text-xl">No Vehicles Active</h4>
                            <p className="text-slate-400 font-bold text-sm mt-2">Logistics tracking will appear here once you add a vehicle.</p>
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

            <ConfirmDialog
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={() => { if (deleteTarget) deleteVehicle(deleteTarget); setDeleteTarget(null); }}
                title="Delete Vehicle"
                description="Are you sure you want to delete this vehicle? This action cannot be undone."
                confirmLabel="Delete"
                variant="destructive"
            />
        </div>
    );
};
