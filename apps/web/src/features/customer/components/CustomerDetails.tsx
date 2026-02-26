import { useState } from 'react';
import { useCustomer } from '@/features/customer/hooks/useCustomers';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/Modal';
import { CustomerForm } from '@/features/customer/components/CustomerForm';
import { CardDescription } from '@/components/ui/card';
import { Phone, MapPin, User, ReceiptText, Banknote, Edit, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { useTransactions, transactionApi } from '@/features/transaction/api/transaction.api';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Receipt } from '@/features/transaction/components/Receipt';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';

interface CustomerDetailsProps {
    customerId: string;
    isOpen: boolean;
    onClose: () => void;
}

export const CustomerDetails = ({ customerId, isOpen, onClose }: CustomerDetailsProps) => {
    const { id: storeId } = useParams<{ id: string }>();
    const safeStoreId = storeId || '';
    const { data: customer, isLoading: isCustomerLoading } = useCustomer(customerId);
    const { data: transactionsData, isLoading: isHistoryLoading } = useTransactions(safeStoreId, { customerId });
    const transactions = transactionsData?.data || [];

    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isPayDueOpen, setIsPayDueOpen] = useState(false);
    const [payAmount, setPayAmount] = useState('');
    const [selectedTransaction, setSelectedTransaction] = useState<any>(null);

    const queryClient = useQueryClient();

    const payDueMutation = useMutation({
        mutationFn: async (amount: number) => {
            if (!customer || !safeStoreId) return;
            return transactionApi.create(safeStoreId, {
                customerId,
                customerType: 'Customer',
                items: [{ productId: '000000000000000000000000', type: 'ACCESSORY', quantity: 1, unitPrice: amount, name: 'Due Payment' }], // Dummy item
                paymentMethod: 'CASH',
                type: 'DUE_PAYMENT',
                paidAmount: amount,
                finalAmount: amount
            });
        },
        onSuccess: () => {
            toast.success('Due payment recorded');
            setIsPayDueOpen(false);
            setPayAmount('');
            queryClient.invalidateQueries({ queryKey: ['customer', customerId] });
            queryClient.invalidateQueries({ queryKey: ['transactions', safeStoreId] });
            // Invalidate customers list to update total due if we show it there
             queryClient.invalidateQueries({ queryKey: ['customers', safeStoreId] });
        },
        onError: (err: any) => toast.error('Payment failed: ' + err.message)
    });

    const handlePayDue = () => {
        const amount = parseFloat(payAmount);
        if (isNaN(amount) || amount <= 0) {
            toast.error('Invalid amount');
            return;
        }
        payDueMutation.mutate(amount);
    };

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={customer?.name || 'Customer Details'} className="max-w-4xl h-[90vh]">
            {isCustomerLoading ? (
                <div className="p-8 text-center">Loading customer details...</div>
            ) : customer ? (
                <div className="flex flex-col h-full">
                    {/* Header Section */}
                    <div className="p-6 border-b bg-muted/10 flex justify-between items-start">
                        <div className="flex gap-4">
                            <div className="relative h-24 w-24 rounded-xl overflow-hidden border bg-slate-100 flex-shrink-0">
                                {customer.imageUrl ? (
                                    <img src={customer.imageUrl} alt={customer.name} className="h-full w-full object-cover" />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center">
                                        <User className="w-10 h-10 text-muted-foreground/30" />
                                    </div>
                                )}
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold flex items-center gap-2">
                                    {customer.name}
                                    {/* Assuming customer has totalDue, if not we might need to compute or backend needs to send it */}
                                    {/* For now, let's assume the API returns it or we treat it as 0 if missing */}
                                    {(customer.totalDue || 0) > 0 && <span className="text-sm bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-normal">Due: ৳{customer.totalDue}</span>}
                                </h2>
                                <CardDescription className="mt-1 flex flex-col gap-1">
                                    <div className="flex items-center gap-2">
                                        <Phone className="w-4 h-4" /> {customer.phone}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4" /> {customer.address || 'No Address'}
                                    </div>
                                </CardDescription>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => setIsEditOpen(true)}>
                                <Edit className="w-4 h-4 mr-2" /> Edit Details
                            </Button>
                            {(customer.totalDue || 0) > 0 && (
                                <Button size="sm" onClick={() => setIsPayDueOpen(true)}>
                                    <Banknote className="w-4 h-4 mr-2" /> Pay Due
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="flex-1 overflow-auto p-6 bg-slate-50">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <ReceiptText className="w-5 h-5 text-muted-foreground" />
                            Transaction History
                        </h3>

                        {isHistoryLoading ? (
                            <div>Loading history...</div>
                        ) : transactions.length === 0 ? (
                            <div className="text-center py-10 text-muted-foreground bg-white rounded-lg border border-dashed">
                                No transactions found.
                            </div>
                        ) : (
                            <div className="bg-white rounded-lg border shadow-sm">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-muted/50 text-muted-foreground font-medium border-b">
                                        <tr>
                                            <th className="p-3">Date</th>
                                            <th className="p-3">Type</th>
                                            <th className="p-3 text-right">Amount</th>
                                            <th className="p-3 text-right">Due</th>
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
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                                                        tx.type === 'DUE_PAYMENT' ? 'bg-green-50 text-green-700 border-green-200' :
                                                        tx.type === 'RETURN' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                                        'bg-blue-50 text-blue-700 border-blue-200'
                                                    }`}>
                                                        {tx.type}
                                                    </span>
                                                </td>
                                                <td className="p-3 text-right font-semibold">৳{tx.finalAmount}</td>
                                                <td className="p-3 text-right text-muted-foreground">{tx.dueAmount > 0 ? `৳${tx.dueAmount}` : '-'}</td>
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
            ) : (
                <div className="p-8 text-center text-red-500">Customer not found</div>
            )}

            {/* Edit Modal */}
            <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Customer">
                <CustomerForm initialData={customer} onSuccess={() => setIsEditOpen(false)} />
            </Modal>

            {/* Pay Due Modal */}
             <Modal isOpen={isPayDueOpen} onClose={() => setIsPayDueOpen(false)} title="Clear Due Payment">
                <div className="space-y-4 py-4">
                     <div className="flex justify-between text-sm">
                        <span>Total Due:</span>
                        <span className="font-bold text-red-600">৳{customer?.totalDue}</span>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Payment Amount (৳)</label>
                        <Input
                            type="number"
                            value={payAmount}
                            onChange={(e) => setPayAmount(e.target.value)}
                            placeholder="Enter amount..."
                            autoFocus
                        />
                    </div>
                </div>
                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsPayDueOpen(false)}>Cancel</Button>
                    <Button onClick={handlePayDue} disabled={payDueMutation.isPending}>
                        {payDueMutation.isPending ? 'Processing...' : 'Confirm Payment'}
                    </Button>
                </div>
            </Modal>

            {/* Receipt Viewer */}
            <Modal isOpen={!!selectedTransaction} onClose={() => setSelectedTransaction(null)} title="Transaction Receipt" className="max-w-4xl">
                {selectedTransaction && (
                    <div className="flex justify-center p-4 bg-slate-100 rounded-lg overflow-auto">
                        <Receipt transaction={selectedTransaction} storeName={'Store'} />
                    </div>
                )}
            </Modal>
        </Modal>
    );
};
