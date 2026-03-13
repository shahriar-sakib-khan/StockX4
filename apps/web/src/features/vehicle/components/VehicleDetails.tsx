import { useState } from 'react';
import { useVehicle } from '@/features/vehicle/hooks/useVehicles';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/Modal';
import { VehicleForm } from '@/features/vehicle/components/VehicleForm';
import { CardDescription } from '@/components/ui/card';
import { Phone, User, ReceiptText, Banknote, Edit, Calendar, Fuel, Wrench, Truck, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { useTransactions } from '@/features/pos/api/transaction.api';
import { AddVehicleExpenseModal } from './AddVehicleExpenseModal';
import { useParams } from 'react-router-dom';
import { Receipt } from '@/features/pos/components/Receipt';

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
    const transactions = transactionsData?.data || [];

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
        <Modal isOpen={isOpen} onClose={onClose} title={""} className="max-w-4xl h-[95vh] sm:h-[90vh] p-0 overflow-hidden border-none bg-slate-50/50 backdrop-blur-xl">
            {isVehicleLoading ? (
                <div className="h-full flex flex-col items-center justify-center p-12">
                   <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mb-4" />
                   <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading vehicle profile...</p>
                </div>
            ) : vehicle ? (
                <div className="flex flex-col h-full sm:h-full bg-white sm:bg-transparent">
                    {/* Premium Header Profile - Scrollable on mobile, shrink-0 on desktop */}
                     <div className="relative shrink-0 sm:shrink-0 overflow-hidden bg-slate-900 px-3 py-4 sm:px-4 sm:py-6 md:p-10 text-white border-b-0">
                         {/* Decorative background element */}
                         <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                         <Truck className="absolute -bottom-8 -right-8 w-32 h-32 md:w-48 md:h-48 text-white/5 rotate-12 pointer-events-none" />

                         <div className="relative flex flex-col sm:flex-row gap-3 sm:gap-6 sm:items-center">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-32 md:h-32 bg-white/10 backdrop-blur-md rounded-[1.25rem] sm:rounded-[1.5rem] md:rounded-[2rem] overflow-hidden border-2 border-white/20 shadow-2xl flex items-center justify-center shrink-0">
                                {vehicle.imageUrl ? (
                                    <img src={vehicle.imageUrl} alt={vehicle.licensePlate} className="w-full h-full object-cover" />
                                ) : (
                                    <Truck className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white/30" />
                                )}
                            </div>
                            
                            <div className="flex-1 space-y-4">
                                <div>
                                     <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2 justify-center sm:justify-start">
                                         <span className="px-2 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 text-[8px] sm:text-[10px] font-black uppercase tracking-widest border border-indigo-500/30">
                                             {vehicle.vehicleModel || 'Logistics'}
                                         </span>
                                         <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            className="h-6 sm:h-7 px-2 rounded-lg text-white/40 hover:text-white hover:bg-white/10 text-[8px] sm:text-[10px] font-black uppercase tracking-widest"
                                            onClick={() => setIsEditOpen(true)}
                                         >
                                             <Edit className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" /> Edit
                                         </Button>
                                     </div>
                                     <h2 className="text-xl sm:text-2xl md:text-5xl font-black tracking-tight uppercase leading-none">{vehicle.licensePlate}</h2>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                                     <div className="flex items-center gap-2 sm:gap-3 bg-white/5 backdrop-blur-sm p-1.5 sm:p-2 md:p-3 rounded-xl sm:rounded-2xl border border-white/10">
                                        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-indigo-500/20 flex items-center justify-center">
                                            <User className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-300" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[8px] sm:text-[10px] font-bold text-white/40 uppercase tracking-widest leading-none mb-0.5 sm:mb-1">Driver Name</span>
                                            <span className="font-black text-[10px] sm:text-xs md:text-sm text-white">{vehicle.driverName || 'N/A'}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 sm:gap-3 bg-white/5 backdrop-blur-sm p-1.5 sm:p-2 md:p-3 rounded-xl sm:rounded-2xl border border-white/10">
                                        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-emerald-500/20 flex items-center justify-center">
                                            <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-300" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[8px] sm:text-[10px] font-bold text-white/40 uppercase tracking-widest leading-none mb-0.5 sm:mb-1">Contact Details</span>
                                            <span className="font-black text-[10px] sm:text-xs md:text-sm text-white">{vehicle.driverPhone || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                         </div>

                         {/* Quick Actions Bar */}
                          <div className="flex gap-2 mt-4 sm:mt-6 md:mt-8">
                              <Button 
                                 className="flex-1 h-12 md:h-14 bg-amber-500 hover:bg-amber-600 text-amber-950 font-black rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] md:text-xs uppercase tracking-widest shadow-xl shadow-amber-900/20 active:scale-[0.98] transition-all"
                                 onClick={() => openExpenseModal('FUEL')}
                              >
                                  <Fuel className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 mr-1.5 sm:mr-2 md:mr-3" /> Pay Fuel
                              </Button>
                              <Button 
                                 className="flex-1 h-12 md:h-14 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] md:text-xs uppercase tracking-widest shadow-xl shadow-rose-900/20 active:scale-[0.98] transition-all"
                                 onClick={() => openExpenseModal('REPAIR')}
                              >
                                  <Wrench className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 mr-1.5 sm:mr-2 md:mr-3" /> Pay Repair
                              </Button>
                          </div>
                    </div>

                    {/* Main Scrollable Area - Content flows naturally on mobile */}
                    <div className="flex-1 overflow-y-auto sm:overflow-y-auto p-3 sm:p-5 md:p-10 sm:bg-white/50">
                        <div className="flex items-center justify-between mb-4 sm:mb-6 md:mb-8">
                            <h3 className="text-sm sm:text-lg md:text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2 sm:gap-3">
                                <ReceiptText className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-indigo-500" />
                                Logistics Expenses
                            </h3>
                            {transactions.length > 0 && (
                                <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-3 py-1.5 rounded-full uppercase border-2 border-slate-50">
                                    {transactions.length} Records
                                </span>
                            )}
                        </div>

                        {isHistoryLoading ? (
                            <div className="flex flex-col items-center justify-center p-20 text-slate-300">
                                <Loader2 className="w-12 h-12 animate-spin mb-4" />
                                <span className="text-xs font-black uppercase tracking-[0.2em]">Synchronizing data...</span>
                            </div>
                        ) : transactions.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-24 px-6 text-center border-4 border-dashed border-slate-100 rounded-[3rem] bg-white">
                                <div className="bg-slate-50 w-24 h-24 rounded-3xl flex items-center justify-center mb-6">
                                    <ReceiptText className="w-12 h-12 text-slate-200" />
                                </div>
                                <h4 className="text-slate-900 font-black text-xl mb-2">Clean Sheet!</h4>
                                <p className="text-slate-400 font-bold text-sm max-w-xs leading-relaxed">No expenses recorded for this vehicle yet. Click a payment button above to start.</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Desktop Table View */}
                                <div className="hidden md:block overflow-hidden bg-white border-2 border-slate-100 rounded-[2rem] shadow-sm">
                                    <table className="w-full text-sm text-left border-collapse">
                                        <thead className="bg-slate-50/80 text-slate-400 font-black uppercase tracking-widest border-b-2 border-slate-100 text-[10px]">
                                            <tr>
                                                <th className="p-5">Transaction Date</th>
                                                <th className="p-5">Expense Type</th>
                                                <th className="p-5 text-right">Amount Paid</th>
                                                <th className="p-5 text-center">Receipt</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y-2 divide-slate-100/50">
                                            {transactions.map((tx: any) => {
                                                const item = tx.items?.[0];
                                                const type = item?.type || 'EXPENSE';
                                                return (
                                                    <tr
                                                        key={tx._id}
                                                        className="hover:bg-slate-50/50 group transition-all"
                                                    >
                                                        <td className="p-5">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center group-hover:bg-white group-hover:shadow-md transition-all">
                                                                    <Calendar className="w-4 h-4 text-slate-400" />
                                                                </div>
                                                                <div className="flex flex-col">
                                                                    <span className="font-black text-slate-900 leading-none">{format(new Date(tx.createdAt), 'dd MMM yyyy')}</span>
                                                                    <span className="text-[10px] font-bold text-slate-400 uppercase mt-1">{format(new Date(tx.createdAt), 'HH:mm')}</span>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="p-5">
                                                            <span className={`px-4 py-2 rounded-xl text-[10px] font-black border-2 flex items-center w-fit gap-2 uppercase tracking-widest shadow-sm ${
                                                                type === 'FUEL' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                                                type === 'REPAIR' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                                                                'bg-indigo-50 text-indigo-700 border-indigo-100'
                                                            }`}>
                                                                {type === 'FUEL' ? <Fuel className="w-3.5 h-3.5" /> : <Wrench className="w-3.5 h-3.5" />}
                                                                {type}
                                                            </span>
                                                        </td>
                                                        <td className="p-5 text-right">
                                                            <span className="font-black text-xl text-slate-900 tabular-nums">৳{tx.finalAmount?.toLocaleString()}</span>
                                                        </td>
                                                        <td className="p-5 text-center">
                                                            <Button 
                                                                variant="ghost" 
                                                                size="sm" 
                                                                className="h-10 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-50 hover:text-indigo-600 border border-transparent hover:border-indigo-100"
                                                                onClick={() => setSelectedTransaction(tx)}
                                                            >
                                                                View Details
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mobile Card List View */}
                                <div className="md:hidden space-y-4">
                                    {transactions.map((tx: any) => {
                                        const item = tx.items?.[0];
                                        const type = item?.type || 'EXPENSE';
                                        return (
                                             <div
                                                key={tx._id}
                                                className="bg-white p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] border-2 border-slate-100 shadow-sm active:scale-[0.98] transition-all group"
                                                onClick={() => setSelectedTransaction(tx)}
                                            >
                                                <div className="flex justify-between items-start mb-5">
                                                    <span className={`px-4 py-2 rounded-xl text-[10px] font-black border-2 flex items-center gap-2 uppercase tracking-widest ${
                                                        type === 'FUEL' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                                        type === 'REPAIR' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                                                        'bg-indigo-50 text-indigo-700 border-indigo-100'
                                                    }`}>
                                                        {type === 'FUEL' ? <Fuel className="w-3.5 h-3.5" /> : <Wrench className="w-3.5 h-3.5" />}
                                                        {type}
                                                    </span>
                                                    <div className="text-right">
                                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Final Amount</span>
                                                        <span className="text-2xl font-black text-slate-900 leading-none">৳{tx.finalAmount?.toLocaleString()}</span>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-center justify-between border-t-2 border-slate-50 pt-4">
                                                    <div className="flex flex-col">
                                                         <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Transaction Ref</span>
                                                         <div className="flex items-center gap-2 text-slate-900 font-black text-xs">
                                                            <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                                                            {format(new Date(tx.createdAt), 'dd MMM, HH:mm')}
                                                         </div>
                                                    </div>
                                                    <div className="p-3 bg-indigo-50 rounded-xl group-active:translate-x-1 transition-transform">
                                                        <ReceiptText className="w-5 h-5 text-indigo-600" />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Bottom Sticky Action Bar for Mobile Close */}
                     <div className="sm:hidden p-2 bg-white border-t border-slate-100 sticky bottom-0">
                          <Button onClick={onClose} variant="secondary" className="w-full h-10 rounded-xl font-black uppercase tracking-widest text-[9px] bg-slate-100 text-slate-600 border-none active:scale-95 leading-none transition-all">
                              Close Profile
                          </Button>
                     </div>
                </div>
            ) : (
                <div className="h-full flex flex-col items-center justify-center p-12 text-center">
                    <div className="bg-rose-50 w-20 h-20 rounded-3xl flex items-center justify-center mb-6 border-2 border-rose-100">
                        <Truck className="w-10 h-10 text-rose-400" />
                    </div>
                    <h4 className="text-slate-900 font-black text-xl">Vehicle Not Found</h4>
                    <p className="text-slate-500 font-bold text-sm mt-2 max-w-xs">The vehicle you are looking for might have been removed or the ID is invalid.</p>
                </div>
            )}

            {/* Edit Modal */}
            <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Vehicle">
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
             <Modal isOpen={!!selectedTransaction} onClose={() => setSelectedTransaction(null)} title="Expense Receipt" className="max-w-4xl">
                {selectedTransaction && (
                    <div className="flex justify-center p-4 bg-slate-100 rounded-lg overflow-auto">
                        <Receipt transaction={selectedTransaction} storeName={'Store'} />
                    </div>
                )}
            </Modal>
        </Modal>
    );
};
