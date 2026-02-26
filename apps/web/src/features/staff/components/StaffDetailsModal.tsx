import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/Modal';
import { CardDescription } from '@/components/ui/card';
import { Phone, User, ReceiptText, Banknote, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { useTransactions } from '@/features/transaction/api/transaction.api';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Receipt } from '@/features/transaction/components/Receipt';
import { PaySalaryModal } from './PaySalaryModal';

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
        <Modal isOpen={true} onClose={onClose} title={staff.name} className="max-w-4xl h-[90vh]">
            <div className="flex flex-col h-full">
                {/* Header Section */}
                <div className="p-6 border-b bg-muted/10 flex justify-between items-start">
                    <div className="flex gap-4">
                        <div className="relative h-24 w-24 rounded-xl overflow-hidden border bg-slate-100 flex-shrink-0">
                            {staff.image ? (
                                <img src={staff.image} alt={staff.name} className="h-full w-full object-cover" />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center bg-slate-200">
                                    <User className="w-10 h-10 text-muted-foreground/30" />
                                </div>
                            )}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                {staff.name}
                                <span className={`text-sm px-2 py-0.5 rounded-full font-normal ${
                                    (staff.salaryDue || 0) > 0 ? 'bg-red-100 text-red-700' :
                                    (staff.salaryDue || 0) < 0 ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
                                }`}>
                                    {(staff.salaryDue || 0) > 0 ? `Due: ৳${staff.salaryDue}` :
                                     (staff.salaryDue || 0) < 0 ? `Overpaid: ৳${Math.abs(staff.salaryDue)}` : 'Settled'}
                                </span>
                            </h2>
                            <CardDescription className="mt-1 flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                    <User className="w-4 h-4" /> {staff.role.toUpperCase()}
                                </div>
                                {staff.phone && (
                                    <div className="flex items-center gap-2">
                                        <Phone className="w-4 h-4" /> {staff.phone}
                                    </div>
                                )}
                                <div className="text-xs text-muted-foreground">
                                    Joined: {format(new Date(staff.createdAt), 'dd MMM yyyy')}
                                </div>
                            </CardDescription>
                        </div>
                    </div>
                    <div className="flex gap-2">
                         <Button size="sm" onClick={() => setIsPaySalaryOpen(true)}>
                            <Banknote className="w-4 h-4 mr-2" /> Pay Salary
                        </Button>
                    </div>
                </div>

                {/* Content Section */}
                <div className="flex-1 overflow-auto p-6 bg-slate-50">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <ReceiptText className="w-5 h-5 text-muted-foreground" />
                        Salary History
                    </h3>

                    {isHistoryLoading ? (
                        <div>Loading history...</div>
                    ) : transactions.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground bg-white rounded-lg border border-dashed">
                            No salary payment history found.
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg border shadow-sm">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-muted/50 text-muted-foreground font-medium border-b">
                                    <tr>
                                        <th className="p-3">Date</th>
                                        <th className="p-3">Description</th>
                                        <th className="p-3 text-right">Amount</th>
                                        <th className="p-3 text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {transactions.map((tx: any) => (
                                        <tr
                                            key={tx._id}
                                            className="hover:bg-slate-50/50 cursor-pointer group"
                                            onClick={() => setSelectedTransaction(tx)}
                                        >
                                            <td className="p-3">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors" />
                                                    {format(new Date(tx.createdAt), 'dd MMM yyyy, HH:mm')}
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                {tx.items[0]?.name || 'Salary Payment'}
                                            </td>
                                            <td className="p-3 text-right font-semibold">৳{tx.finalAmount}</td>
                                            <td className="p-3 text-center">
                                                <Button variant="ghost" size="sm" onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedTransaction(tx);
                                                }}>
                                                    View
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
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
