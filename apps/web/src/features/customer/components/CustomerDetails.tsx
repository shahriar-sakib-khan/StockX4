import { useState } from 'react';
import { useCustomer } from '@/features/customer/hooks/useCustomers';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/Modal';
import { CustomerForm } from '@/features/customer/components/CustomerForm';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Phone, MapPin, User, ReceiptText, Banknote, Edit, Calendar, PackageMinus, Store, ArrowUpRight, ArrowDownLeft, History, Building2, Receipt as ReceiptIcon } from 'lucide-react';
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
        <Modal isOpen={isOpen} onClose={onClose} title={customer?.name || 'Customer Details'} className="max-w-4xl h-full sm:h-auto md:max-h-[85vh]">
            {isCustomerLoading ? (
                <div className="p-8 text-center">Loading customer details...</div>
            ) : customer ? (
                <div className="flex flex-col h-full sm:h-auto">
                    {/* Header Section - Entity info scrolls with content on mobile */}
                    <div className="bg-white border-b-2 border-slate-100/50 p-3 sm:p-5 md:p-8 z-10 shrink-0 sm:shrink-0 relative">
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div className="flex items-center gap-4 w-full sm:w-auto">
                                 <div className="relative h-14 w-14 sm:h-20 sm:w-20 rounded-xl sm:rounded-2xl overflow-hidden border-2 border-slate-100 shadow-sm bg-white flex-shrink-0">
                                     {customer.imageUrl ? (
                                         <img src={customer.imageUrl} alt={customer.name} className="h-full w-full object-cover" />
                                     ) : (
                                         <div className="flex h-full w-full items-center justify-center">
                                             {customer.type === 'wholesale' ? <Store className="w-6 h-6 sm:w-8 sm:h-8 text-sky-400" /> : <User className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-400" />}
                                         </div>
                                     )}
                                 </div>
                                <div className="space-y-0.5">
                                     <div className="flex items-center gap-1.5 sm:gap-2">
                                         <span className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                                             ID: {customer._id.substring(customer._id.length - 4).toUpperCase()}
                                         </span>
                                         <span className={`text-[8px] sm:text-[10px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border ${customer.type === 'wholesale' ? 'bg-sky-50 text-sky-600 border-sky-100' : 'bg-indigo-50 text-indigo-600 border-indigo-100'}`}>
                                             {customer.type}
                                         </span>
                                     </div>
                                    <div className="flex flex-col gap-0.5">
                                        <a href={`tel:${customer.phone}`} className="flex items-center gap-1.5 text-indigo-600 font-black text-sm hover:underline">
                                            <Phone size={14} strokeWidth={3} className="text-indigo-400" /> {customer.phone}
                                        </a>
                                        <div className="flex items-center gap-1.5 text-slate-500 font-bold text-xs italic">
                                            <MapPin size={14} strokeWidth={2} className="text-rose-400 shrink-0" /> {customer.address || 'No location details'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-row gap-2 w-full sm:w-auto justify-end">
                                 <Button 
                                     variant="secondary" 
                                     size="sm" 
                                     onClick={() => setIsEditOpen(true)}
                                     className="h-9 sm:h-12 px-3 sm:px-4 rounded-lg sm:rounded-xl border border-slate-200 font-black uppercase tracking-widest shadow-sm text-[9px] sm:text-[10px]"
                                 >
                                    <Edit className="w-3.5 h-3.5 mr-1.5" /> Edit
                                </Button>
                                {(customer.totalDue || 0) > 0 && (
                                     <Button 
                                         size="sm" 
                                         onClick={() => setIsPayDueOpen(true)}
                                         className="h-9 sm:h-12 px-3 sm:px-4 rounded-lg sm:rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase tracking-widest shadow-lg shadow-emerald-100 text-[9px] sm:text-[10px]"
                                     >
                                        <Banknote className="w-4 h-4 mr-1.5" /> Pay Due
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Scrollable Body */}
                    <div className="flex-1 overflow-y-auto bg-slate-100/30">
                        {/* Due Cylinders Section */}
                        {dueCylinders.length > 0 && (
                            <div className="px-3 sm:px-4 py-2 sm:py-3 bg-amber-50/50 border-b border-amber-100">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                                    <PackageMinus className="w-4 h-4 text-amber-500" />
                                    Cylinder Loan Status
                                </h3>
                                <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="h-8 rounded-xl text-amber-600 border border-amber-200 bg-white hover:bg-amber-50 font-black uppercase tracking-widest text-[10px] px-3 active:scale-95 transition-all" 
                                    onClick={() => setIsDueSettlementOpen(true)}
                                >
                                    Return All Due
                                </Button>
                            </div>
                             <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                                 {mappedDueItems.map((item: any, idx: number) => (
                                     <div key={idx} className="bg-white border border-stone-100 text-center rounded-xl p-2 shadow-sm flex flex-col items-center justify-center gap-0.5 hover:border-amber-200 transition-all">
                                         {item.image ? (
                                             <div className="relative w-8 h-8 mb-1">
                                                 <img src={item.image} alt="" className="w-full h-full object-contain mix-blend-multiply" />
                                             </div>
                                         ) : (
                                             <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-[8px] text-slate-400 font-extrabold border border-slate-100 uppercase">Empty</div>
                                         )}
                                         <span className="text-lg font-black text-slate-900 leading-none">{item.maxQty}</span>
                                         <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Qty</span>
                                         <span className="font-black text-[9px] text-slate-600 truncate w-full text-center">{item.brandName}</span>
                                         <div className="flex justify-center gap-0.5">
                                             {item.size && <span className="text-[7px] font-black bg-indigo-50 text-indigo-600 px-1 py-0.5 rounded border border-indigo-100">{item.size}</span>}
                                             {item.regulator && <span className="text-[7px] font-black bg-sky-50 text-sky-600 px-1 py-0.5 rounded border border-sky-100">{item.regulator}</span>}
                                         </div>
                                     </div>
                                 ))}
                             </div>
                        </div>
                    )}

                        {/* Content Section */}
                        <div className="p-3 sm:p-6">
                            <div className="flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-4 mb-3 sm:mb-6">
                                <h3 className="text-base sm:text-lg font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                                    <ReceiptText className="w-5 h-5 text-slate-400" />
                                    Transaction Diary
                                </h3>
                             <div className="w-full sm:w-auto py-1.5 px-3 sm:px-6 bg-white border border-slate-200 rounded-xl shadow-sm flex items-center justify-between sm:flex-col sm:text-center gap-2 sm:gap-0">
                                 <span className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Net Balance</span>
                                 <span className="text-base sm:text-2xl font-black text-expense tracking-tight">৳{customer.totalDue?.toLocaleString() || 0}</span>
                             </div>
                         </div>
                        {isHistoryLoading ? (
                            <div className="flex flex-col items-center justify-center py-6 sm:py-12 gap-2 sm:gap-4">
                                <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 border-b-2 sm:border-b-4 border-primary"></div>
                                <p className="text-slate-400 font-black uppercase tracking-widest text-[8px] sm:text-[10px]">Loading History...</p>
                            </div>
                        ) : transactions.length === 0 ? (
                            <div className="text-center py-8 sm:py-16 text-slate-300 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                                <History size={48} className="mx-auto mb-2 sm:mb-4 opacity-10" />
                                <p className="font-black uppercase tracking-[0.2em] text-xs sm:text-sm">No History Recorded</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {/* Desktop History Table */}
                                <div className="hidden sm:block bg-white rounded-3xl border-2 border-slate-100 shadow-xl overflow-hidden">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-slate-900 text-slate-400 font-black uppercase tracking-widest text-[10px] border-b-0">
                                            <tr>
                                                <th className="px-4 py-4">Date</th>
                                                <th className="px-4 py-4">Activity</th>
                                                <th className="px-4 py-4 text-right">Total</th>
                                                <th className="px-4 py-4 text-right">Due / Repayment</th>
                                                <th className="px-4 py-4 text-right">Paid</th>
                                                <th className="px-4 py-4 text-center">Receipt</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50 italic font-medium">
                                            {transactions.map((tx: any) => (
                                                <tr
                                                    key={tx._id}
                                                    className="hover:bg-slate-50 transition-all cursor-pointer group"
                                                    onClick={() => setSelectedTransaction(tx)}
                                                >
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <Calendar className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors" />
                                                            <div className="flex flex-col">
                                                                <span className="font-black text-slate-900 text-xs">{format(new Date(tx.createdAt), 'dd MMM yyyy')}</span>
                                                                <span className="text-[9px] text-slate-400 uppercase tracking-widest">{format(new Date(tx.createdAt), 'hh:mm a')}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <div className={`p-1.5 rounded-lg border ${
                                                                tx.type === 'DUE_PAYMENT' ? 'bg-emerald-50 text-income border-emerald-100' :
                                                                tx.type === 'RETURN' ? 'bg-amber-50 text-amber-500 border-amber-100' :
                                                                'bg-indigo-50 text-indigo-500 border-indigo-100'
                                                            }`}>
                                                                {tx.type === 'DUE_PAYMENT' ? <ArrowDownLeft size={14} strokeWidth={3} /> : 
                                                                 tx.type === 'RETURN' ? <PackageMinus size={14} strokeWidth={3} /> : 
                                                                 <ArrowUpRight size={14} strokeWidth={3} />}
                                                            </div>
                                                            <span className="font-black text-slate-700 capitalize text-xs tracking-tight">{tx.type.replace(/_/g, ' ')}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-right font-black text-slate-800 text-sm">
                                                        {tx.finalAmount > 0 ? `৳${tx.finalAmount.toLocaleString()}` : '-'}
                                                    </td>
                                                    <td className="px-4 py-3 text-right font-black text-sm">
                                                        {tx.dueAmount > 0 ? (
                                                            <span className="text-amber-500">৳{tx.dueAmount.toLocaleString()}</span>
                                                        ) : tx.dueAmount < 0 ? (
                                                            <span className="text-blue-500">৳{Math.abs(tx.dueAmount).toLocaleString()}</span>
                                                        ) : '-'}
                                                    </td>
                                                    <td className="px-4 py-3 text-right font-black text-emerald-600 text-sm">
                                                        {tx.paidAmount > 0 ? `৳${tx.paidAmount.toLocaleString()}` : '-'}
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <Button variant="outline" size="sm" className="h-8 rounded-xl border-2 border-slate-100 font-extrabold text-[10px] uppercase tracking-widest hover:border-primary hover:text-primary transition-all shadow-sm">
                                                            View
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mobile History Card List */}
                                 <div className="sm:hidden space-y-2">
                                     {transactions.map((tx: any) => (
                                         <Card 
                                             key={tx._id} 
                                             className="border border-slate-200 shadow-sm rounded-xl overflow-hidden bg-white active:scale-[0.98] transition-all"
                                             onClick={() => setSelectedTransaction(tx)}
                                         >
                                             <div className="flex items-center justify-between px-3 py-2 bg-slate-50/50 border-b border-slate-100">
                                                 <div className="flex items-center gap-1.5">
                                                     <Calendar size={11} className="text-slate-400" />
                                                     <span className="text-[9px] font-black text-slate-800 uppercase tracking-tight">{format(new Date(tx.createdAt), 'dd MMM yyyy')}</span>
                                                 </div>
                                                 <span className="text-[9px] font-black text-slate-400">{format(new Date(tx.createdAt), 'hh:mm a')}</span>
                                             </div>
                                             <CardContent className="p-3 space-y-2">
                                                 <div className="flex justify-between items-center">
                                                     <div className="flex items-center gap-2">
                                                         <div className={`p-1.5 rounded-lg border ${
                                                             tx.type === 'DUE_PAYMENT' ? 'bg-emerald-50 text-income border-emerald-100' :
                                                             tx.type === 'RETURN' ? 'bg-amber-50 text-amber-500 border-amber-100' :
                                                             'bg-indigo-50 text-indigo-500 border-indigo-100'
                                                         }`}>
                                                             {tx.type === 'DUE_PAYMENT' ? <ArrowDownLeft size={14} strokeWidth={3} /> : 
                                                              tx.type === 'RETURN' ? <PackageMinus size={14} strokeWidth={3} /> : 
                                                              <ArrowUpRight size={14} strokeWidth={3} />}
                                                         </div>
                                                         <div className="font-black text-slate-900 uppercase tracking-tight text-xs">{tx.type.replace(/_/g, ' ')}</div>
                                                     </div>
                                                     <div className="flex items-center gap-1.5">
                                                         {tx.finalAmount > 0 && (
                                                             <div className="bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200 flex items-center gap-1">
                                                                 <span className="text-[8px] font-black text-slate-500 uppercase">Total</span>
                                                                 <span className="font-black text-slate-800 text-xs">৳{tx.finalAmount.toLocaleString()}</span>
                                                             </div>
                                                         )}
                                                         {tx.paidAmount > 0 && (
                                                             <div className="bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100 flex items-center gap-1">
                                                                 <span className="text-[8px] font-black text-emerald-600 uppercase">Paid</span>
                                                                 <span className="font-black text-emerald-600 text-xs">৳{tx.paidAmount.toLocaleString()}</span>
                                                             </div>
                                                         )}
                                                         {tx.dueAmount > 0 ? (
                                                             <div className="bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-100 flex items-center gap-1">
                                                                 <span className="text-[8px] font-black text-amber-600 uppercase">Due</span>
                                                                 <span className="font-black text-amber-600 text-xs">৳{tx.dueAmount.toLocaleString()}</span>
                                                             </div>
                                                         ) : tx.dueAmount < 0 && (
                                                             <div className="bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100 flex items-center gap-1">
                                                                 <span className="text-[8px] font-black text-blue-600 uppercase">Repay</span>
                                                                 <span className="font-black text-blue-600 text-xs">৳{Math.abs(tx.dueAmount).toLocaleString()}</span>
                                                             </div>
                                                         )}
                                                     </div>
                                                 </div>
                                                 <div className="flex justify-between items-center pt-1.5 border-t border-slate-50">
                                                     <div className="text-[8px] text-slate-300 font-black uppercase tracking-tighter">REF: #{tx._id.substring(tx._id.length - 6).toUpperCase()}</div>
                                                     <Button variant="secondary" size="sm" className="h-7 px-3 rounded-lg font-black uppercase text-[8px] tracking-widest border border-slate-200 bg-white shadow-sm">View Details</Button>
                                                 </div>
                                             </CardContent>
                                         </Card>
                                     ))}
                                 </div>
                            </div>
                        )}
                    </div>
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
