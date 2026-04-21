import { useState } from 'react';
import { useVehicle } from '@/features/vehicle/hooks/useVehicles';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/Modal';
import { VehicleForm } from '@/features/vehicle/components/VehicleForm';
import { Phone, User, ReceiptText, Edit, Calendar, Fuel, Wrench, Truck, Loader2, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { useTransactions } from '@/features/pos/api/transaction.api';
import { AddVehicleExpenseModal } from './AddVehicleExpenseModal';
import { useParams } from 'react-router-dom';
import { Receipt } from '@/features/pos/components/Receipt';
import { cn } from '@/lib/utils';

interface VehicleDetailsProps {
    vehicleId: string;
    isOpen: boolean;
    onClose: () => void;
}

export const VehicleDetails = ({ vehicleId, isOpen, onClose }: VehicleDetailsProps) => {
    const { id: storeId } = useParams<{ id: string }>();
    const safeStoreId = storeId || '';
    const { data: vehicle, isLoading: isVehicleLoading } = useVehicle(vehicleId);
    const { data: transactionsData, isLoading: isHistoryLoading } = useTransactions(safeStoreId, { customerId: vehicleId });
    
    const rawTransactions = transactionsData?.data || [];
    // Only show EXPENSE transactions
    const transactions = rawTransactions.filter((tx: any) => tx.type === 'EXPENSE');

    const [isEditOpen, setIsEditOpen] = useState(false);
    const [expenseModalOpen, setExpenseModalOpen] = useState(false);
    const [expenseType, setExpenseType] = useState<'FUEL' | 'REPAIR'>('FUEL');
    const [selectedTransaction, setSelectedTransaction] = useState<any>(null);

    const openExpenseModal = (type: 'FUEL' | 'REPAIR') => {
        setExpenseType(type);
        setExpenseModalOpen(true);
    };

    if (!isOpen) return null;

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title="" 
            className="max-w-3xl p-0 overflow-hidden border-none bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full"
        >
            {isVehicleLoading ? (
                <div className="h-64 flex flex-col items-center justify-center border-t-4 border-indigo-500">
                   <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-4" />
                   <p className="text-slate-500 font-bold text-sm tracking-wide">Loading vehicle profile...</p>
                </div>
            ) : vehicle ? (
                <div className="flex flex-col h-full max-h-[85vh] sm:max-h-[80vh]">
                    
                    {/* === PREMIUM CONSISTENT HEADER === */}
                    <div className="relative shrink-0 border-t-4 border-t-indigo-500 bg-gradient-to-b from-indigo-50/40 to-white border-b border-slate-100 px-5 pt-8 pb-6 sm:px-8 sm:pt-10 sm:pb-8">
                        <div className="flex flex-col sm:flex-row gap-5 sm:items-center">
                            
                            {/* Vehicle Avatar */}
                            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-indigo-100 rounded-full border-4 border-white shadow-sm flex items-center justify-center shrink-0 overflow-hidden relative">
                                {vehicle.imageUrl ? (
                                    <img src={vehicle.imageUrl} alt={vehicle.licensePlate} className="w-full h-full object-cover" />
                                ) : (
                                    <Truck className="w-10 h-10 text-indigo-500" />
                                )}
                            </div>
                            
                            {/* Profile Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1.5">
                                    <span className="px-2.5 py-1 rounded-md bg-white text-indigo-700 border border-indigo-100 text-[10px] font-bold uppercase tracking-wider leading-none shadow-sm truncate">
                                        {vehicle.vehicleModel || 'Delivery Vehicle'}
                                    </span>
                                </div>
                                <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight uppercase leading-none mb-3 truncate">
                                    {vehicle.licensePlate}
                                </h2>
                                
                                {/* Driver Badges (Frosted glass look) */}
                                <div className="flex flex-wrap items-center gap-3">
                                     <div className="flex items-center gap-1.5 text-slate-600 bg-white/60 backdrop-blur-sm border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm max-w-full">
                                         <User className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                                         <span className="text-xs font-bold truncate">{vehicle.driverName || 'Unassigned'}</span>
                                     </div>
                                     {vehicle.driverPhone && (
                                         <div className="flex items-center gap-1.5 text-slate-600 bg-white/60 backdrop-blur-sm border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm max-w-full">
                                             <Phone className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                                             <span className="text-xs font-bold truncate">{vehicle.driverPhone}</span>
                                         </div>
                                     )}
                                </div>
                            </div>

                        </div>

                        {/* Action Bar */}
                        <div className="flex flex-col sm:flex-row gap-2.5 mt-6 sm:mt-8">
                            <Button 
                                variant="outline" 
                                className="h-10 sm:h-11 px-4 sm:px-6 rounded-xl font-bold text-xs bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-slate-200 shadow-sm transition-all shrink-0"
                                onClick={() => setIsEditOpen(true)}
                            >
                                <Edit className="w-4 h-4 sm:mr-2" /> 
                                <span className="hidden sm:inline">Edit Profile</span>
                            </Button>
                            <div className="flex-1 grid grid-cols-2 gap-2.5 min-w-0">
                                <Button 
                                    className="w-full h-10 sm:h-11 bg-white text-amber-600 border border-amber-200 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-300 font-bold rounded-xl text-xs shadow-sm transition-all truncate"
                                    onClick={() => openExpenseModal('FUEL')}
                                >
                                    <Fuel className="w-4 h-4 mr-2 shrink-0" /> Fuel
                                </Button>
                                <Button 
                                    className="w-full h-10 sm:h-11 bg-white text-rose-600 border border-rose-200 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 font-bold rounded-xl text-xs shadow-sm transition-all truncate"
                                    onClick={() => openExpenseModal('REPAIR')}
                                >
                                    <Wrench className="w-4 h-4 mr-2 shrink-0" /> Repair
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* === EXPENSE HISTORY === */}
                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-white overflow-x-hidden">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                                <ReceiptText className="w-5 h-5 text-slate-400 shrink-0" />
                                Expense History
                            </h3>
                            {transactions.length > 0 && (
                                <span className="text-[10px] font-bold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100 shrink-0">
                                    {transactions.length} Records
                                </span>
                            )}
                        </div>

                        {isHistoryLoading ? (
                            <div className="flex flex-col items-center justify-center p-12 text-slate-400">
                                <Loader2 className="w-8 h-8 animate-spin mb-3 shrink-0" />
                                <span className="text-xs font-bold">Loading records...</span>
                            </div>
                        ) : transactions.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 px-4 text-center border border-slate-100 rounded-2xl bg-slate-50">
                                <div className="bg-white w-14 h-14 rounded-full border border-slate-100 flex items-center justify-center mb-4 shadow-sm shrink-0">
                                    <ReceiptText className="w-6 h-6 text-slate-300" />
                                </div>
                                <h4 className="text-slate-700 font-bold text-base mb-1">No Expenses Logged</h4>
                                <p className="text-slate-500 text-sm max-w-xs">Use the buttons above to record fuel or maintenance costs.</p>
                            </div>
                        ) : (
                            /* THE FIX: Unified Sleek List View - Strongly contained within boundaries */
                            <div className="space-y-2.5 pr-1 sm:pr-2">
                                {transactions.map((tx: any) => {
                                    const item = tx.items?.[0];
                                    const type = item?.type || 'EXPENSE';
                                    const isFuel = type === 'FUEL';

                                    return (
                                        <div
                                            key={tx._id}
                                            onClick={() => setSelectedTransaction(tx)}
                                            className="group flex items-center justify-between p-3 sm:p-4 rounded-xl border border-slate-100 hover:border-indigo-100 bg-white hover:bg-indigo-50/30 transition-all cursor-pointer shadow-sm active:scale-[0.99] gap-3"
                                        >
                                            {/* LEFT SIDE: Icon + Details. Uses flex-1 min-w-0 to prevent text from pushing the price off screen */}
                                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                                <div className={cn(
                                                    "w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center shrink-0 border shadow-sm transition-colors",
                                                    isFuel ? "bg-amber-50 border-amber-100 text-amber-600 group-hover:bg-amber-100" : "bg-rose-50 border-rose-100 text-rose-600 group-hover:bg-rose-100"
                                                )}>
                                                    {isFuel ? <Fuel className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" /> : <Wrench className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />}
                                                </div>
                                                <div className="flex flex-col min-w-0 flex-1">
                                                    <span className="font-bold text-sm sm:text-base text-slate-900 truncate">
                                                        {isFuel ? 'Fuel Refill' : 'Maintenance'}
                                                    </span>
                                                    <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-slate-500 mt-0.5 min-w-0">
                                                        <Calendar className="w-3 h-3 shrink-0" />
                                                        <span className="truncate">{format(new Date(tx.createdAt), 'MMM dd, yyyy • h:mm a')}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* RIGHT SIDE: Amount. Uses shrink-0 to guarantee it always stays visible */}
                                            <div className="flex items-center gap-3 shrink-0 text-right">
                                                <div className="flex flex-col items-end">
                                                    <span className="font-black text-sm sm:text-base md:text-lg text-slate-900 leading-none">
                                                        ৳{tx.finalAmount?.toLocaleString()}
                                                    </span>
                                                </div>
                                                <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 items-center justify-center group-hover:bg-indigo-100 group-hover:text-indigo-600 group-hover:border-indigo-200 transition-colors text-slate-400 hidden sm:flex shadow-sm shrink-0">
                                                    <ArrowRight className="w-4 h-4" />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="h-64 flex flex-col items-center justify-center p-12 text-center bg-slate-50 border-t-4 border-slate-300">
                    <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mb-4 border border-slate-200 shadow-sm">
                        <Truck className="w-8 h-8 text-slate-300" />
                    </div>
                    <h4 className="text-slate-900 font-bold text-lg">Vehicle Not Found</h4>
                    <p className="text-slate-500 text-sm mt-1 max-w-xs">This vehicle may have been removed.</p>
                </div>
            )}

            {/* Edit Modal */}
            <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Vehicle Profile">
                <VehicleForm initialData={vehicle} onSuccess={() => setIsEditOpen(false)} />
            </Modal>

            {/* Add Expense Modal */}
            <AddVehicleExpenseModal
                vehicleId={vehicleId}
                initialType={expenseType}
                isOpen={expenseModalOpen}
                onClose={() => setExpenseModalOpen(false)}
            />

             {/* Receipt Viewer */}
             <Modal isOpen={!!selectedTransaction} onClose={() => setSelectedTransaction(null)} title="Expense Receipt" className="max-w-md">
                {selectedTransaction && (
                    <div className="flex justify-center p-4 bg-slate-100 rounded-xl overflow-hidden shadow-inner mt-4">
                        <Receipt transaction={selectedTransaction} storeName={'Store'} />
                    </div>
                )}
            </Modal>
        </Modal>
    );
};