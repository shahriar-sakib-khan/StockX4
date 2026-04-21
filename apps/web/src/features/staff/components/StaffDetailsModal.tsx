import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/Modal';
import { Phone, User, ReceiptText, Banknote, Calendar, BadgeCheck, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { Receipt } from '@/features/pos/components/Receipt';
import { PaySalaryModal } from './PaySalaryModal';
import { useSalaryHistory } from '../salary/hooks/useSalary';
import { cn } from '@/lib/utils';

interface StaffDetailsModalProps {
    storeId: string;
    staff: {
        _id: string;
        name: string;
        role: string;
        contact?: string;
        phone?: string;
        image?: string;
        salary: number;
        salaryDue: number;
        createdAt: string;
    };
    storeName?: string;
    onClose: () => void;
    onEdit?: () => void;
}

export const StaffDetailsModal = ({ storeId, staff, storeName, onClose, onEdit }: StaffDetailsModalProps) => {
    // Server-side salary history
    const { data: historyData, isLoading: isHistoryLoading } = useSalaryHistory(storeId, staff._id);
    const transactions = historyData?.data || [];

    const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
    const [isPaySalaryOpen, setIsPaySalaryOpen] = useState(false);

    return (
        // THE FIX: Enforced standard modal sizing constraints
        <Modal isOpen={true} onClose={onClose} title="Staff Profile" className="max-w-4xl max-h-[90vh] flex flex-col p-0">
            
            <div className="flex flex-col h-full overflow-hidden w-full">
                
                {/* === STICKY HEADER SECTION === */}
                <div className="p-4 sm:p-6 md:p-8 border-b border-slate-200/80 bg-white shrink-0 z-10 shadow-sm relative">
                    
                    {/* PC Layout: Horizontal / Mobile Layout: Stacked */}
                    <div className="flex flex-col md:flex-row gap-5 sm:gap-6 items-center md:items-start text-center md:text-left w-full">
                        
                        {/* Avatar */}
                        <div className="relative group shrink-0">
                            <div className="h-24 w-24 sm:h-28 sm:w-28 md:h-32 md:w-32 rounded-3xl overflow-hidden border-4 border-slate-50 shadow-lg bg-slate-100 transition-transform group-hover:scale-[1.02] duration-300">
                                {staff.image ? (
                                    <img src={staff.image} alt={staff.name} className="h-full w-full object-cover" />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-slate-100">
                                        <User className="w-10 h-10 text-slate-300" />
                                    </div>
                                )}
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-indigo-600 text-white p-1.5 rounded-xl shadow-md border-[3px] border-white">
                                <BadgeCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                            </div>
                        </div>

                        {/* Info Block */}
                        <div className="flex-1 flex flex-col w-full min-w-0">
                            
                            {/* Name & Role */}
                            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 mb-3">
                                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight truncate">
                                    {staff.name}
                                </h2>
                                <span className="inline-flex items-center justify-center px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-500 border border-slate-200/60 w-fit mx-auto md:mx-0">
                                    {staff.role}
                                </span>
                            </div>
                                
                            {/* Meta Info */}
                            <div className="flex flex-wrap justify-center md:justify-start gap-2 sm:gap-3 text-slate-500 font-bold text-[10px] sm:text-[11px] uppercase tracking-widest mb-4">
                                {staff.phone && (
                                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 rounded-lg border border-slate-200/60">
                                        <Phone className="w-3.5 h-3.5 text-indigo-500" /> {staff.phone}
                                    </div>
                                )}
                                <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 rounded-lg border border-slate-200/60">
                                    <Calendar className="w-3.5 h-3.5 text-indigo-500" /> Joined {format(new Date(staff.createdAt), 'MMM yyyy')}
                                </div>
                            </div>

                            {/* Financial Cards (Mobile: Grid / PC: Flex) */}
                            <div className="grid grid-cols-2 md:flex gap-3 sm:gap-4 w-full">
                                
                                <div className={cn(
                                    "p-3 rounded-xl border-2 flex flex-col items-center md:items-start transition-all min-w-[140px]",
                                    (staff.salaryDue || 0) > 0 ? "bg-rose-50 border-rose-100" : (staff.salaryDue || 0) < 0 ? "bg-emerald-50 border-emerald-100" : "bg-slate-50 border-slate-100"
                                )}>
                                    <span className={cn(
                                        "text-[9px] sm:text-[10px] font-black uppercase tracking-widest mb-1 leading-none text-center md:text-left",
                                        (staff.salaryDue || 0) > 0 ? "text-rose-500" : (staff.salaryDue || 0) < 0 ? "text-emerald-500" : "text-slate-400"
                                    )}>
                                        {(staff.salaryDue || 0) > 0 ? 'Salary Due' : (staff.salaryDue || 0) < 0 ? 'Advance Paid' : 'Due Balance'}
                                    </span>
                                    <span className={cn(
                                        "text-lg sm:text-xl font-black leading-none",
                                        (staff.salaryDue || 0) > 0 ? "text-rose-600" : (staff.salaryDue || 0) < 0 ? "text-emerald-600" : "text-slate-700"
                                    )}>
                                        ৳{Math.abs(staff.salaryDue || 0).toLocaleString()}
                                    </span>
                                </div>

                                <div className="p-3 rounded-xl border-2 border-indigo-100 bg-indigo-50/50 flex flex-col items-center md:items-start min-w-[140px]">
                                    <span className="text-[9px] sm:text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1 leading-none">Monthly Salary</span>
                                    <span className="text-lg sm:text-xl font-black text-indigo-600 leading-none">৳{(staff.salary || 0).toLocaleString()}</span>
                                </div>

                            </div>
                        </div>

                        {/* Action Buttons (Mobile: Stacked / PC: Column) */}
                        <div className="w-full md:w-[180px] flex flex-col gap-2 shrink-0 mt-2 md:mt-0">
                             <Button 
                                className="w-full h-11 sm:h-12 bg-slate-900 text-white rounded-xl font-black uppercase tracking-widest text-[10px] sm:text-[11px] shadow-lg shadow-slate-200/50 active:scale-95 transition-all"
                                onClick={() => setIsPaySalaryOpen(true)}
                             >
                                <Banknote className="w-4 h-4 mr-2" /> Pay Salary
                            </Button>
                             {onEdit && (
                                 <Button 
                                    variant="outline"
                                    className="w-full h-11 sm:h-12 border-2 border-slate-200 text-slate-600 bg-white hover:bg-slate-50 hover:text-slate-900 rounded-xl font-black uppercase tracking-widest text-[10px] sm:text-[11px] active:scale-95 transition-all"
                                    onClick={onEdit}
                                 >
                                    Edit Profile
                                 </Button>
                             )}
                        </div>

                    </div>
                </div>

                {/* === SCROLLABLE CONTENT SECTION === */}
                {/* THE FIX: Added flex-1 and overflow-y-auto so the history scrolls independently of the header */}
                <div className="flex-1 bg-slate-50 overflow-y-auto p-4 sm:p-6 md:p-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    
                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                        <h3 className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                            <ReceiptText className="w-4 h-4 text-slate-300" />
                            Disbursement Records
                        </h3>
                    </div>

                    {isHistoryLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent"></div>
                        </div>
                    ) : transactions.length === 0 ? (
                        <div className="text-center py-12 px-4 border-2 border-dashed border-slate-200 rounded-3xl bg-white shadow-sm">
                            <div className="bg-slate-50 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                <ReceiptText className="w-6 h-6 text-slate-300" />
                            </div>
                            <h4 className="text-slate-800 font-black text-base sm:text-lg">No Records Found</h4>
                            <p className="text-slate-400 font-bold text-[10px] sm:text-xs mt-1">Salary payments will appear here.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            
                            {/* Mobile View: Cards */}
                            <div className="grid grid-cols-1 md:hidden gap-3 sm:gap-4 pb-8">
                                {transactions.map((tx: any) => (
                                    <div 
                                        key={tx._id}
                                        className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm active:scale-95 transition-all cursor-pointer"
                                        onClick={() => setSelectedTransaction(tx)}
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="space-y-1.5 flex-1 pr-2 min-w-0">
                                                <div className="flex items-center gap-1.5 text-indigo-500 font-black text-[9px] uppercase tracking-widest">
                                                    <Calendar className="w-3 h-3" />
                                                    {format(new Date(tx.createdAt), 'dd MMM yyyy, hh:mm a')}
                                                </div>
                                                <div className="text-slate-800 font-black text-xs uppercase tracking-tight flex items-center flex-wrap gap-1">
                                                    <span className="truncate">{tx.items[0]?.name || 'Standard Salary'}</span>
                                                    {tx.items.find((item: any) => item.name?.toLowerCase().includes('bonus')) && (
                                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest bg-amber-100 text-amber-700 shrink-0">
                                                            Bonus ৳{tx.items.find((item: any) => item.name?.toLowerCase().includes('bonus')).subtotal}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-emerald-600 font-black text-base shrink-0 mt-0.5">
                                                ৳{tx.finalAmount.toLocaleString()}
                                            </div>
                                        </div>
                                        <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Via {tx.paymentMethod || 'Cash'}</span>
                                            <div className="text-indigo-600 font-black text-[9px] uppercase tracking-widest flex items-center gap-1 bg-indigo-50 px-2 py-1 rounded-md">
                                                <FileText size={10} /> Receipt
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Desktop View: Table */}
                            <div className="hidden md:block bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mb-8">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-slate-50 text-slate-400 font-black text-[10px] uppercase tracking-widest border-b border-slate-100">
                                            <th className="px-6 py-4">Date & Time</th>
                                            <th className="px-6 py-4">Payment Description</th>
                                            <th className="px-6 py-4 text-right">Amount</th>
                                            <th className="px-6 py-4 text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {transactions.map((tx: any) => (
                                            <tr 
                                                key={tx._id}
                                                className="hover:bg-slate-50/50 cursor-pointer group transition-colors"
                                                onClick={() => setSelectedTransaction(tx)}
                                            >
                                                <td className="px-6 py-5">
                                                    <div className="flex flex-col">
                                                        <span className="text-slate-700 font-black text-sm">{format(new Date(tx.createdAt), 'dd MMM yyyy')}</span>
                                                        <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-0.5">{format(new Date(tx.createdAt), 'hh:mm a')}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="text-slate-600 font-bold text-xs uppercase tracking-tight flex items-center flex-wrap gap-2">
                                                        {tx.items[0]?.name || 'Staff Salary Disbursement'}
                                                        {tx.items.find((item: any) => item.name?.toLowerCase().includes('bonus')) && (
                                                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-amber-100 text-amber-700">
                                                                Bonus ৳{tx.items.find((item: any) => item.name?.toLowerCase().includes('bonus')).subtotal}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 text-right font-black text-emerald-600 text-lg">৳{tx.finalAmount.toLocaleString()}</td>
                                                <td className="px-6 py-5 text-center">
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm" 
                                                        className="h-9 px-4 rounded-lg font-black text-[10px] uppercase tracking-widest text-indigo-600 bg-indigo-50 hover:bg-indigo-100 hover:text-indigo-700 transition-all"
                                                    >
                                                        Details
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Pay Salary Modal */}
             {isPaySalaryOpen && (
                <PaySalaryModal
                    storeId={storeId}
                    staff={staff}
                    onClose={() => setIsPaySalaryOpen(false)}
                />
            )}

            {/* Receipt Viewer Modal */}
            <Modal isOpen={!!selectedTransaction} onClose={() => setSelectedTransaction(null)} title="Payment Receipt" className="max-w-xl">
                {selectedTransaction && (
                    <div className="flex justify-center p-2 sm:p-4 bg-slate-50 rounded-xl overflow-hidden">
                        <Receipt transaction={selectedTransaction} storeName={storeName || 'Store'} />
                    </div>
                )}
            </Modal>
        </Modal>
    );
};