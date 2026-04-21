import { useState } from 'react';
import { useVehicles, useDeleteVehicle } from '@/features/vehicle/hooks/useVehicles';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Truck, User, Phone, Edit, Fuel, Wrench } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { VehicleForm } from '@/features/vehicle/components/VehicleForm';
import { VehicleDetails } from '@/features/vehicle/components/VehicleDetails';
import { AddVehicleExpenseModal } from '@/features/vehicle/components/AddVehicleExpenseModal';
import { InfoTooltip } from '@/features/store/components/setup/shared/InfoTooltip';
import { cn } from '@/lib/utils';

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

    // Safe array extraction
    const vehicleList: Vehicle[] = Array.isArray(vehicles) 
        ? vehicles 
        : (vehicles as any)?.data 
        || (vehicles as any)?.vehicles 
        || [];

    return (
        <div className="w-full pb-12 animate-in fade-in duration-300">
            
            {/* === HEADER === */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8 gap-4 px-1">
                <div className="flex flex-col gap-1">
                    <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight uppercase flex items-center gap-2">
                        Logistics
                        <InfoTooltip content="Manage your delivery vehicles and track driver assignments and expenses." />
                    </h3>
                    <p className="text-[11px] sm:text-xs font-bold text-slate-500">
                        Manage delivery fleet, drivers, and service history.
                    </p>
                </div>
                <Button 
                    onClick={() => setIsCreateOpen(true)} 
                    className="w-full sm:w-auto h-11 sm:h-12 px-5 sm:px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest text-[10px] sm:text-[11px] shadow-md transition-all active:scale-95"
                >
                    <Plus className="w-4 h-4 mr-1.5 sm:mr-2" /> Add Vehicle
                </Button>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-5">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-48 bg-white rounded-2xl border border-slate-200 animate-pulse shadow-sm" />
                    ))}
                </div>
            ) : vehicleList.length === 0 ? (
                
                <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white rounded-3xl border border-slate-200 shadow-sm">
                    {/* === EMPTY STATE === */}
                    <div className="bg-slate-50 p-4 rounded-full mb-4 border border-slate-100">
                        <Truck className="w-8 h-8 text-slate-300" />
                    </div>
                    <h3 className="font-bold text-lg text-slate-800 tracking-tight">No vehicles found</h3>
                    <p className="text-sm text-slate-500 mt-1">Get started by adding your first delivery vehicle.</p>
                </div>

            ) : (
                
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-5">
                    {/* === VEHICLE CARDS (Colored Premium UI) === */}
                    {vehicleList.map((vehicle: Vehicle) => (
                        <div
                            key={vehicle._id}
                            onClick={() => setSelectedVehicleId(vehicle._id)}
                            className="group relative flex flex-col bg-white border border-t-4 border-slate-200 border-t-indigo-500 hover:border-indigo-300 hover:shadow-lg bg-gradient-to-b from-indigo-50/40 to-white rounded-2xl p-5 transition-all duration-300 cursor-pointer active:scale-[0.99] min-h-[220px] overflow-hidden"
                        >
                            {/* Top Row: Icon/Image & Actions */}
                            <div className="flex items-start justify-between mb-3">
                                {/* Image or Colored Placeholder */}
                                <div className="relative shrink-0">
                                    <div className="w-12 h-12 rounded-xl bg-indigo-100 border-2 border-white flex items-center justify-center overflow-hidden shadow-sm">
                                        {vehicle.imageUrl ? (
                                            <img src={vehicle.imageUrl} alt={vehicle.licensePlate} className="w-full h-full object-cover" />
                                        ) : (
                                            <Truck className="w-6 h-6 text-indigo-500" />
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                                     <button 
                                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-white hover:shadow-sm rounded-md transition-all"
                                        onClick={(e) => { e.stopPropagation(); setEditingVehicle(vehicle); }}
                                     >
                                         <Edit className="w-3.5 h-3.5" />
                                     </button>
                                     <button 
                                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white hover:shadow-sm rounded-md transition-all"
                                        onClick={(e) => { e.stopPropagation(); setDeleteTarget(vehicle._id); }}
                                     >
                                         <Trash2 className="w-3.5 h-3.5" />
                                     </button>
                                </div>
                            </div>

                            {/* Middle Row: Vehicle Identity */}
                            <div className="flex flex-col mb-4 min-w-0">
                                <h4 className="font-black text-xl sm:text-2xl text-slate-900 tracking-tight leading-none truncate w-full uppercase">
                                    {vehicle.licensePlate}
                                </h4>
                                <span className="inline-flex w-fit px-2.5 py-1 mt-2 rounded-md text-[9px] font-bold uppercase tracking-wider bg-white text-indigo-700 border border-indigo-100 shadow-sm truncate">
                                    {vehicle.vehicleModel || 'Standard Vehicle'}
                                </span>
                            </div>

                            {/* Driver Info Block (Slightly frosted for contrast) */}
                            <div className="flex flex-col gap-1.5 p-3 bg-white/60 backdrop-blur-sm rounded-lg border border-slate-100 mb-auto shadow-sm">
                                <div className="flex items-center gap-2 text-slate-600">
                                    <User className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                                    <span className="text-xs font-bold truncate">{vehicle.driverName || 'Unassigned'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-600">
                                    <Phone className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                                    <span className="text-xs font-bold truncate">{vehicle.driverPhone || 'N/A'}</span>
                                </div>
                            </div>

                            {/* Bottom Row: Expense Actions */}
                            <div className="mt-4 pt-4 border-t border-slate-100/60 grid grid-cols-2 gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-9 px-0 rounded-md font-bold text-[10px] uppercase tracking-wider bg-white text-amber-600 border-amber-200 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-300 shadow-sm transition-all"
                                    onClick={(e) => { e.stopPropagation(); openExpenseModal(vehicle._id, 'FUEL'); }}
                                >
                                    <Fuel className="w-3 h-3 mr-1.5" /> Fuel
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-9 px-0 rounded-md font-bold text-[10px] uppercase tracking-wider bg-white text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 shadow-sm transition-all"
                                    onClick={(e) => { e.stopPropagation(); openExpenseModal(vehicle._id, 'REPAIR'); }}
                                >
                                    <Wrench className="w-3 h-3 mr-1.5" /> Repair
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* === MODALS === */}
            <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Add New Vehicle">
                <VehicleForm onSuccess={() => setIsCreateOpen(false)} />
            </Modal>

            <Modal isOpen={!!editingVehicle} onClose={() => setEditingVehicle(null)} title="Edit Vehicle">
                {editingVehicle && (
                    <VehicleForm initialData={editingVehicle} onSuccess={() => setEditingVehicle(null)} />
                )}
            </Modal>

            <AddVehicleExpenseModal
                vehicleId={expenseVehicleId as string}
                initialType={expenseType}
                isOpen={expenseModalOpen}
                onClose={() => setExpenseModalOpen(false)}
            />

            {selectedVehicleId && (
                <VehicleDetails
                    vehicleId={selectedVehicleId as string}
                    isOpen={!!selectedVehicleId}
                    onClose={() => setSelectedVehicleId(null)}
                />
            )}

            <ConfirmDialog
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={() => { if (deleteTarget) deleteVehicle(deleteTarget as string); setDeleteTarget(null); }}
                title="Delete Vehicle"
                description="Are you sure you want to remove this vehicle from the fleet? This action cannot be undone."
                confirmLabel="Delete Vehicle"
                variant="destructive"
            />
        </div>
    );
};