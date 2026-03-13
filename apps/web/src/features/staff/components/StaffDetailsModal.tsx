import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/Modal';
import { CardDescription } from '@/components/ui/card';
import { Phone, User, ReceiptText, Banknote, Calendar, BadgeCheck } from 'lucide-react';
import { format } from 'date-fns';
import { useTransactions } from '@/features/pos/api/transaction.api';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Receipt } from '@/features/pos/components/Receipt';
import { PaySalaryModal } from './PaySalaryModal';
import { cn } from '@/lib/utils';

interface StaffDetailsModalProps {
    storeId: string;
    staff: any;
    onClose: () => void;
}

export const StaffDetailsModal = ({ storeId, staff, onClose }: StaffDetailsModalProps) => {
    // We use transaction API but filter by productId (Staff ID) for SALARY payments
    // Actually, our API might not support filtering by productId easily in `getHistory` directly unless we added it on backend.
    // The previous implementation of `transactionApi.getHistory` filters by `customerId`.
    // For Staff Salary history, we need to fetch transactions where type=EXPENSE and items.productId = staffId.
    // OR we can just fetch ALL expenses and filter client side for now, or add a new filter backend.
    // Let's assume for now we might need to update backend filters to support `productId` search or just `search` param.
    // BUT, `PaySalaryModal` creates transaction with `type: EXPENSE`.
    // Let's update `transactionApi` to support searching/filtering.
    // For now, let's try to fetch all transactions and filter client side if list is small, OR
    // better: Use `search` param with Staff Name if backend supports it.
    // Backend `getHistory` in `transaction.service.ts` supports `search` strictly? No, i commented it out.

    // WORKAROUND: We will fetch all transactions for store with type=EXPENSE and filter client side.
    // This is not scalable but works for MVP.
    const { data: transactionsData, isLoading: isHistoryLoading } = useTransactions(storeId, { type: 'EXPENSE', limit: 1000 });

    const transactions = transactionsData?.data?.filter((tx: any) =>
        tx.items?.some((item: any) => item.productId === staff._id)
    ) || [];

    const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
    const [isPaySalaryOpen, setIsPaySalaryOpen] = useState(false);

    return (
        <Modal isOpen={true} onClose={onClose} title={staff.name} className="max-w-4xl h-full sm:h-auto md:max-h-[90vh]">
            <div className="flex flex-col h-full sm:h-auto">
                {/* Header Section - Entity info scrolls with content on mobile */}
                <div className="p-3 sm:p-5 md:p-8 border-b bg-white relative shrink-0 sm:shrink-0">
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 items-center sm:items-start text-center sm:text-left">
                        <div className="relative group shrink-0">
                            <div className="h-20 w-20 sm:h-28 sm:w-28 md:h-36 md:w-36 rounded-2xl sm:rounded-3xl md:rounded-[2rem] overflow-hidden border-4 border-slate-50 shadow-2xl shadow-slate-200 bg-slate-100 transition-transform group-hover:scale-105 duration-500">
                                {staff.image ? (
                                    <img src={staff.image} alt={staff.name} className="h-full w-full object-cover" />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-slate-200">
                                        <User className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-slate-400" />
                                    </div>
                                )}
                            </div>
                            <div className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 bg-indigo-600 text-white p-1 sm:p-2 rounded-lg sm:rounded-xl shadow-lg border-2 border-white">
                                <BadgeCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                            </div>
                        </div>

                        <div className="flex-1 space-y-3 sm:space-y-4 w-full">
                            <div>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 justify-center sm:justify-start">
                                    <h2 className="text-xl sm:text-2xl md:text-4xl font-black text-slate-900 tracking-tight">
                                        {staff.name}
                                    </h2>
                                    <span className="inline-flex items-center px-2 py-0.5 sm:px-3 sm:py-1 rounded-lg sm:rounded-xl text-[8px] sm:text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-600 border border-slate-200 w-fit mx-auto sm:mx-0">
                                        {staff.role}
                                    </span>
                                </div>
                                
                                <div className="flex flex-wrap justify-center sm:justify-start gap-2 sm:gap-4 mt-2 sm:mt-3 text-slate-500 font-bold text-[10px] sm:text-xs uppercase tracking-tight">
                                    {staff.phone && (
                                        <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 rounded-lg border border-slate-100">
                                            <Phone className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-indigo-500" /> {staff.phone}
                                        </div>
                                    )}
                                    <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 rounded-lg border border-slate-100">
                                        <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-indigo-500" /> {format(new Date(staff.createdAt), 'MMM yyyy')}
                                    </div>
                                </div>
                            </div>

                              <div className="grid grid-cols-2 gap-2 pt-1 sm:pt-2 sm:max-w-md">
                                <div className={cn(
                                    "p-1.5 sm:p-2 md:p-3 rounded-xl sm:rounded-2xl border-2 flex flex-col items-center sm:items-start transition-all",
                                    (staff.salaryDue || 0) > 0 ? "bg-rose-50 border-rose-100" : "bg-emerald-50 border-emerald-100"
                                )}>
                                    <span className={cn(
                                        "text-[8px] sm:text-[9px] md:text-[10px] font-black uppercase tracking-widest mb-0.5 sm:mb-1",
                                        (staff.salaryDue || 0) > 0 ? "text-rose-400" : "text-emerald-400"
                                    )}>Due Balance</span>
                                    <span className={cn(
                                        "text-base sm:text-lg md:text-xl font-black",
                                        (staff.salaryDue || 0) > 0 ? "text-rose-600" : "text-emerald-600"
                                    )}>৳{Math.abs(staff.salaryDue || 0)}</span>
                                </div>
                                <div className="p-1.5 sm:p-2 md:p-3 rounded-xl sm:rounded-2xl border-2 border-indigo-100 bg-indigo-50 flex flex-col items-center sm:items-start">
                                    <span className="text-[8px] sm:text-[9px] md:text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-0.5 sm:mb-1">Monthly</span>
                                    <span className="text-base sm:text-lg md:text-xl font-black text-indigo-600">৳{staff.salary || 0}</span>
                                </div>
                            </div>
                        </div>

                        <div className="w-full sm:w-auto pt-1 sm:pt-0">
                             <Button 
                                className="w-full sm:w-auto h-12 md:h-14 px-6 sm:px-8 bg-slate-900 text-white rounded-xl sm:rounded-2xl font-black uppercase tracking-widest text-[9px] sm:text-[10px] md:text-xs shadow-xl shadow-slate-200 active:scale-[0.98] transition-all"
                                onClick={() => setIsPaySalaryOpen(true)}
                             >
                                <Banknote className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" /> Pay Salary
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Content Section - Natural flow on mobile */}
                <div className="flex-1 bg-slate-50/50 p-3 sm:p-5 md:p-8">
                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                        <h3 className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                            <ReceiptText className="w-4 h-4 text-slate-300" />
                            Salary Disbursement Records
                        </h3>
                    </div>

                    {isHistoryLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent"></div>
                        </div>
                    ) : transactions.length === 0 ? (
                        <div className="text-center py-16 px-5 border-4 border-dashed border-slate-100 rounded-[2.5rem] bg-white">
                            <div className="bg-slate-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <ReceiptText className="w-8 h-8 text-slate-300" />
                            </div>
                            <h4 className="text-slate-900 font-black text-lg">No Records Yet</h4>
                            <p className="text-slate-400 font-bold text-sm mt-1">Disbursements will appear here once processed.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Mobile View: Cards */}
                            <div className="grid grid-cols-1 md:hidden gap-4">
                                {transactions.map((tx: any) => (
                                    <div 
                                        key={tx._id}
                                        className="bg-white p-4 rounded-3xl border-2 border-slate-100 shadow-sm active:scale-[0.98] transition-all"
                                        onClick={() => setSelectedTransaction(tx)}
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-1.5 text-indigo-500 font-black text-[10px] uppercase tracking-tighter">
                                                    <Calendar className="w-3 h-3" />
                                                    {format(new Date(tx.createdAt), 'dd MMM yyyy')}
                                                </div>
                                                <div className="text-slate-800 font-black text-sm uppercase tracking-tight">
                                                    {tx.items[0]?.name || 'Standard Salary'}
                                                </div>
                                            </div>
                                            <div className="text-emerald-600 font-black text-lg">
                                                ৳{tx.finalAmount}
                                            </div>
                                        </div>
                                        <div className="pt-3 border-t border-slate-50 flex justify-between items-center">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase">Paid via Cash</span>
                                            <Button variant="link" size="sm" className="h-8 px-0 text-indigo-600 font-black text-[10px] uppercase tracking-widest">
                                                Receipt →
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Desktop View: Table */}
                            <div className="hidden md:block bg-white rounded-[2rem] border-2 border-slate-100 shadow-sm overflow-hidden">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-slate-50 text-slate-400 font-black text-[10px] uppercase tracking-widest">
                                            <th className="p-6">Date & Time</th>
                                            <th className="p-6">Payment Description</th>
                                            <th className="p-6 text-right">Amount</th>
                                            <th className="p-6 text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {transactions.map((tx: any) => (
                                            <tr 
                                                key={tx._id}
                                                className="hover:bg-slate-50/50 cursor-pointer group transition-colors"
                                                onClick={() => setSelectedTransaction(tx)}
                                            >
                                                <td className="p-6">
                                                    <div className="flex flex-col">
                                                        <span className="text-slate-700 font-black text-sm">{format(new Date(tx.createdAt), 'dd MMM yyyy')}</span>
                                                        <span className="text-slate-400 text-[10px] font-bold uppercase">{format(new Date(tx.createdAt), 'hh:mm a')}</span>
                                                    </div>
                                                </td>
                                                <td className="p-6">
                                                    <div className="text-slate-600 font-bold text-sm">
                                                        {tx.items[0]?.name || 'Staff Salary Disbursement'}
                                                    </div>
                                                </td>
                                                <td className="p-6 text-right font-black text-emerald-600 text-lg">৳{tx.finalAmount}</td>
                                                <td className="p-6 text-center">
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm" 
                                                        className="h-10 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest text-indigo-600 bg-indigo-50 hover:bg-indigo-100 opacity-0 group-hover:opacity-100 transition-all"
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

            {/* Receipt Viewer */}
            <Modal isOpen={!!selectedTransaction} onClose={() => setSelectedTransaction(null)} title="Payment Receipt" className="max-w-4xl">
                {selectedTransaction && (
                    <div className="flex justify-center p-4 bg-slate-100 rounded-lg overflow-auto">
                        <Receipt transaction={selectedTransaction} storeName={'Store'} />
                    </div>
                )}
            </Modal>
        </Modal>
    );
};
