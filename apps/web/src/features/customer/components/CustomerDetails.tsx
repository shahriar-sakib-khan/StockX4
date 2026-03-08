import { useState } from 'react';
import { useCustomer } from '@/features/customer/hooks/useCustomers';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/Modal';
import { CustomerForm } from '@/features/customer/components/CustomerForm';
import { CardDescription } from '@/components/ui/card';
import { Phone, MapPin, User, ReceiptText, Banknote, Edit, Calendar, PackageMinus } from 'lucide-react';
import { format } from 'date-fns';
import { useTransactions, transactionApi } from '@/features/pos/api/transaction.api';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Receipt } from '@/features/pos/components/Receipt';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { useProducts } from '@/features/product/hooks/useProducts';
import { useCreateTransaction } from '@/features/pos/api/transaction.api';
import { DueCylinderModal } from '@/features/pos/components/DueCylinderModal';
import { AllocatedDue } from '@/features/pos/stores/pos.types';

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
    const [isDueSettlementOpen, setIsDueSettlementOpen] = useState(false);
    const [payAmount, setPayAmount] = useState('');
    const [selectedTransaction, setSelectedTransaction] = useState<any>(null);

    const { data: products } = useProducts(safeStoreId);
    const settleTransaction = useCreateTransaction();

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

    const handleSettleDue = async (allocated: AllocatedDue[]) => {
        const itemsToSettle = allocated.filter(a => a.selectedQty > 0).map(a => ({
            productId: a.productId,
            name: a.brandName,
            type: 'CYLINDER' as const,
            quantity: a.selectedQty,
            unitPrice: 0,
            variant: a.brandName,
            size: a.size,
            regulator: a.regulator,
            isSettled: true
        }));

        if (itemsToSettle.length === 0) return;

        settleTransaction.mutate({
            storeId: safeStoreId,
            data: {
                customerId,
                customerType: 'Customer',
                type: 'DUE_CYLINDER_SETTLEMENT',
                items: itemsToSettle,
                paidAmount: 0,
                finalAmount: 0,
                paymentMethod: 'CASH'
            }
        }, {
            onSuccess: () => {
                toast.success('Due cylinders returned successfully');
                setIsDueSettlementOpen(false);
                queryClient.invalidateQueries({ queryKey: ['customer', customerId] });
            }
        });
    };

    const dueCylinders = customer?.dueCylinders || [];
    const mappedDueItems: AllocatedDue[] = dueCylinders.map((due: any) => {
        const product = products?.find((p: any) => p._id === due.productId);
        return {
            productId: due.productId,
            brandName: due.brandName,
            quantity: 0,
            maxQty: due.quantity,
            selectedQty: 0,
            image: due.image || product?.image,
            size: due.size || product?.size,
            regulator: due.regulator || product?.regulator
        };
    });

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
                                <h2 className="text-2xl font-bold flex flex-wrap items-center gap-2">
                                    <span className="shrink-0">{customer.name}</span>

                                    <div className="flex items-center gap-2">
                                        {(customer.totalDue || 0) > 0 && (
                                            <span className="text-xs bg-red-100 text-red-700 px-2.5 py-1 rounded-full font-bold border border-red-200 shadow-sm">
                                                Due: ৳{customer.totalDue.toLocaleString()}
                                            </span>
                                        )}

                                        {dueCylinders.length > 0 && (
                                            <span className="text-xs bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full font-bold border border-amber-200 shadow-sm">
                                                Cylinders: {dueCylinders.reduce((sum: number, d: any) => sum + d.quantity, 0)}
                                            </span>
                                        )}
                                    </div>
                                </h2>
                                <div className="text-xs font-bold text-slate-400 mt-0.5 tracking-widest uppercase bg-slate-100/50 px-2 py-0.5 rounded w-fit border border-slate-200/50">
                                    ID: {customer._id.substring(customer._id.length - 6).toUpperCase()}
                                </div>
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

                    {/* Due Cylinders Section */}
                    {dueCylinders.length > 0 && (
                        <div className="p-6 bg-slate-50 border-b">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <PackageMinus className="w-5 h-5 text-orange-500" />
                                    Due Cylinders
                                </h3>
                                <Button size="sm" variant="outline" className="text-orange-600 border-orange-200 hover:bg-orange-50 font-bold" onClick={() => setIsDueSettlementOpen(true)}>
                                    Return Due Cylinders
                                </Button>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {mappedDueItems.map((item: any, idx: number) => (
                                    <div key={idx} className="bg-white border text-center border-orange-100 rounded-xl p-4 shadow-sm flex flex-col items-center justify-center gap-1 group hover:border-orange-300 transition-colors">
                                        {item.image ? (
                                            <img src={item.image} alt="" className="w-12 h-12 object-contain mb-1 mix-blend-multiply" />
                                        ) : (
                                            <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-[10px] text-slate-400 font-bold mb-1">No Img</div>
                                        )}
                                        <span className="text-lg font-black text-orange-600 leading-none">{item.maxQty}x</span>
                                        <span className="font-bold text-xs text-slate-700 leading-tight">{item.brandName}</span>
                                        <div className="flex gap-1 mt-1">
                                            {item.size && <span className="text-[8px] font-black bg-blue-50 text-blue-600 px-1 py-0.5 rounded border border-blue-100">{item.size}</span>}
                                            {item.regulator && <span className="text-[8px] font-black bg-amber-50 text-amber-600 px-1 py-0.5 rounded border border-amber-100">{item.regulator}</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

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

            {/* Due Settlement Modal */}
            <DueCylinderModal
                isOpen={isDueSettlementOpen}
                onClose={() => setIsDueSettlementOpen(false)}
                title="Return Due Cylinders"
                mode="SETTLE"
                items={mappedDueItems}
                onConfirm={handleSettleDue}
            />
        </Modal>
    );
};
