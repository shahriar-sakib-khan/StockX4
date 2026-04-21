import { useEffect, useState } from 'react';
import { usePosStore } from '../stores/pos.store';
import { useStaffStore } from '@/features/staff/stores/staff.store';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { transactionApi } from '../api/transaction.api';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '@/features/store/hooks/useStores';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { ArrowLeft, Printer, CheckCircle, PlusCircle, X } from 'lucide-react';
import { Receipt } from '../components/Receipt';
import { InvoiceHeader } from '../components/invoice/InvoiceHeader';
import { InvoiceCustomerDetails } from '../components/invoice/InvoiceCustomerDetails';
import { InvoiceItemsTable, ExtraExpense } from '../components/invoice/InvoiceItemsTable';
import { cn } from '@/lib/utils';

export const CheckoutPage = () => {
    const { saleItems, returnItems, getTotals, customer, clearCart, allocatedDueCylinders, settledDueCylinders } = usePosStore();
    const { staff } = useStaffStore();
    const { user: authUser } = useAuthStore();
    const navigate = useNavigate();

    const transactorName = staff?.name || authUser?.name || 'Owner';

    const totals = getTotals();
    const [finalAmount, setFinalAmount] = useState(totals.netTotal);
    const [paidAmount, setPaidAmount] = useState(0);

    const [isProcessing, setIsProcessing] = useState(false);
    const [completedTransaction, setCompletedTransaction] = useState<any>(null);

    // Extra Expenses — draft-first pattern
    const [extraExpenses, setExtraExpenses] = useState<ExtraExpense[]>([]);
    const [draft, setDraft] = useState<{ amount: number; note: string } | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editDraft, setEditDraft] = useState<{ amount: number; note: string }>({ amount: 0, note: '' });

    const openDraft = () => setDraft({ amount: 200, note: 'cylinder change' });

    const confirmDraft = () => {
        if (!draft) return;
        if (!draft.amount) { toast.error('Enter an amount'); return; }
        setExtraExpenses(prev => [
            ...prev,
            { id: crypto.randomUUID(), amount: draft.amount, note: draft.note || 'cylinder change' }
        ]);
        setDraft(null);
    };

    const cancelDraft = () => setDraft(null);

    const startEdit = (id: string) => {
        const exp = extraExpenses.find(e => e.id === id);
        if (!exp) return;
        setEditingId(id);
        setEditDraft({ amount: exp.amount, note: exp.note });
    };

    const confirmEdit = () => {
        if (!editingId) return;
        setExtraExpenses(prev => prev.map(e => e.id === editingId ? { ...e, ...editDraft } : e));
        setEditingId(null);
    };

    const cancelEdit = () => setEditingId(null);

    const deleteExpense = (id: string) => {
        setExtraExpenses(prev => prev.filter(e => e.id !== id));
        if (editingId === id) setEditingId(null);
    };

    const extraTotal = extraExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);

    useEffect(() => {
        const base = totals.netTotal + extraTotal;
        setFinalAmount(base);
        setPaidAmount(base);
    }, [totals.netTotal, extraTotal]);

    const dueAmount = finalAmount - paidAmount;

    const { id } = useParams<{ id: string }>(); 
    const storeId = id || (typeof staff?.storeId === 'string' ? staff.storeId : (staff?.storeId as any)?._id);
    const { data: storeData } = useStore(storeId || '');

    const handleBackToPos = () => {
        if (id) {
             navigate(`/stores/${id}/pos`);
        } else {
             navigate('/pos');
        }
    };

    const handleConfirm = async () => {
        if (!storeId) return toast.error("Store ID missing");
        executeCheckout();
    };

    const executeCheckout = async () => {
        setIsProcessing(true);
        try {
            const apiItems = [
                ...saleItems.map(i => ({
                    productId: i.productId,
                    type: i.type,
                    quantity: i.quantity,
                    unitPrice: i.unitPrice,
                    variant: i.description,
                    name: i.name,
                    size: i.size,
                    regulator: i.regulator,
                    description: i.description,
                    saleType: i.saleType,
                    burners: i.burners,
                    category: i.category
                })),
                ...returnItems.map(i => ({
                    productId: i.productId,
                    type: i.type,
                    quantity: i.quantity,
                    unitPrice: i.unitPrice,
                    variant: i.description,
                    name: i.name,
                    size: i.size,
                    regulator: i.regulator,
                    description: i.description,
                    isReturn: true,
                    saleType: 'RETURN' as const
                })),
                ...settledDueCylinders.filter(b => b.selectedQty > 0).map(b => ({
                    productId: b.productId,
                    type: 'CYLINDER' as const,
                    quantity: b.selectedQty,
                    unitPrice: 0,
                    variant: b.brandName,
                    name: b.brandName,
                    size: b.size,
                    regulator: b.regulator,
                    description: `DUE SETTLEMENT`,
                    isSettled: true,
                    isReturn: true,
                    saleType: 'RETURN' as const
                })),
                ...extraExpenses.map(e => ({
                    productId: '000000000000000000000000', 
                    type: 'EXPENSE' as const,
                    category: 'EXTRA_EXPENSE',
                    name: e.note || 'Extra Expense',
                    quantity: 1,
                    unitPrice: e.amount,
                    subtotal: e.amount
                }))
            ];

            const res = await transactionApi.create(storeId, {
                items: apiItems,
                type: 'SALE',
                paymentMethod: dueAmount > 0 ? 'DUE' : 'CASH',
                finalAmount: Number(finalAmount),
                paidAmount: Number(paidAmount),
                customerId: customer?.id,
                customerType: customer?.type,
                dueCylinders: (allocatedDueCylinders && allocatedDueCylinders.length > 0)
                     ? allocatedDueCylinders
                          .filter(b => b.selectedQty > 0)
                          .map(b => ({
                           productId: b.productId,
                           brandName: b.brandName,
                           quantity: b.selectedQty,
                           size: b.size,
                           regulator: b.regulator,
                           image: b.image
                      }))
                     : undefined
            });

            setCompletedTransaction(res);
            toast.success("Transaction Completed!");
            clearCart();
        } catch (error: any) {
             console.error(error);
             toast.error("Transaction Failed");
        } finally {
            setIsProcessing(false);
        }
    };

    // --- SUCCESS SCREEN ---
    if (completedTransaction) {
        return (
            <div className="min-h-screen flex flex-col items-center pt-8 sm:pt-12 pb-10 sm:pb-20 px-4 bg-slate-50/50 overflow-y-auto">
                <Card className="w-full max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-slate-200/60 rounded-[1.5rem]">
                    <CardHeader className="text-center p-6 sm:p-8">
                        <div className="mx-auto bg-green-100 w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mb-4 shadow-inner">
                            <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-green-600" strokeWidth={2.5} />
                        </div>
                        <CardTitle className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-slate-900">Sale Completed!</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 sm:space-y-8 p-4 sm:p-8 pt-0">
                        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
                            <Button onClick={() => window.print()} variant="outline" className="gap-2 h-12 rounded-xl font-bold border-slate-200 hover:bg-slate-100">
                                <Printer className="w-4 h-4" /> Print Receipt
                            </Button>
                            <Button className="h-12 rounded-xl font-black uppercase tracking-wider bg-slate-900 hover:bg-slate-800 text-white shadow-md" onClick={() => {
                                setCompletedTransaction(null);
                                if(id || storeId) {
                                     navigate(id ? `/stores/${id}/pos` : `/stores/${storeId}/pos`);
                                } else {
                                     navigate('/pos');
                                }
                            }}>
                                New Sale
                            </Button>
                        </div>
                        <div className="border border-slate-200/60 p-4 bg-white rounded-2xl shadow-sm">
                            <Receipt transaction={completedTransaction} storeName={typeof staff?.storeId === 'object' ? (staff.storeId as any).name : 'Store'} />
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // --- CHECKOUT SCREEN ---
    return (
         <div className="min-h-screen bg-slate-50/50 flex flex-col items-center pb-24">
            
            {/* Header Area */}
            <div className="w-full max-w-3xl px-3 sm:px-6 pt-3 sm:pt-6 pb-2">
                 <Button variant="ghost" onClick={handleBackToPos} className="gap-2 px-3 h-9 rounded-xl text-xs sm:text-sm font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-200/50 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to POS
                 </Button>
            </div>

            {/* Main Invoice Card */}
            <div className="w-full max-w-3xl px-3 sm:px-6">
                <Card className="shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-slate-200/60 overflow-hidden rounded-[1.25rem] sm:rounded-[1.5rem] bg-white">
                    <CardContent className="p-3 sm:p-8">
                         <div className="font-mono text-[10px] sm:text-sm space-y-4 sm:space-y-6">
                            
                            <InvoiceHeader
                                storeName={storeData?.store?.name || (typeof staff?.storeId === 'object' ? (staff.storeId as any).name : 'Store')}
                                showPreviewLabel
                            />

                            <InvoiceCustomerDetails
                                date={new Date()}
                                customerName={customer ? customer.name : 'Walk-in Customer'}
                                customerType={customer?.type}
                                customerPhone={customer?.phone}
                                customerAddress={customer?.address}
                                transactorName={transactorName}
                                invoiceNumber="PREVIEW"
                            />

                            {/* Ensure InvoiceItemsTable doesn't break layout if it has wide tables */}
                            <div className="w-full overflow-x-auto no-scrollbar">
                                <InvoiceItemsTable
                                        items={[
                                            ...saleItems.map(item => ({ ...item, saleType: item.saleType as any })),
                                            ...returnItems.map(item => ({ ...item, saleType: 'RETURN' as const, isReturn: true })),
                                            ...allocatedDueCylinders.filter(b => b.selectedQty > 0).map(b => ({
                                                productId: b.productId, name: b.brandName, quantity: b.selectedQty,
                                                unitPrice: 0, subtotal: 0, saleType: 'DUE' as const, isDue: true,
                                                size: b.size, regulator: b.regulator
                                            })),
                                            ...settledDueCylinders.filter(b => b.selectedQty > 0).map(b => ({
                                                productId: b.productId, name: b.brandName, quantity: b.selectedQty,
                                                unitPrice: 0, subtotal: 0, saleType: 'RETURN' as const, isSettled: true,
                                                type: 'CYLINDER' as const, size: b.size, regulator: b.regulator
                                            }))
                                        ]}
                                        extraExpenses={extraExpenses}
                                        onEditExpense={startEdit}
                                        onDeleteExpense={deleteExpense}
                                />
                            </div>

                            {/* THE FIX: Highly flexible flex-wrap for Draft/Edit rows so they never overflow */}
                            {editingId && (() => {
                                const exp = extraExpenses.find(e => e.id === editingId);
                                if (!exp) return null;
                                return (
                                    <div className="no-print mt-2 flex flex-wrap sm:flex-nowrap items-center gap-2 bg-amber-50/50 border border-amber-200/60 rounded-xl p-2 animate-in fade-in slide-in-from-top-1 duration-200">
                                        <div className="flex items-center gap-1.5 flex-1 min-w-[140px]">
                                            <span className="text-[10px] font-black text-amber-700 shrink-0 px-1">৳</span>
                                            <Input
                                                type="number"
                                                min={0}
                                                value={editDraft.amount || ''}
                                                onChange={e => setEditDraft(d => ({ ...d, amount: Number(e.target.value) }))}
                                                className="w-16 sm:w-24 text-center font-black text-xs sm:text-sm h-8 sm:h-9 border-amber-300 focus-visible:ring-amber-500 rounded-lg px-1 shrink-0 bg-white"
                                                autoFocus
                                            />
                                            <Input
                                                type="text"
                                                value={editDraft.note}
                                                onChange={e => setEditDraft(d => ({ ...d, note: e.target.value }))}
                                                placeholder="cylinder change"
                                                className="flex-1 min-w-0 font-bold text-xs h-8 sm:h-9 border-amber-300 focus-visible:ring-amber-500 rounded-lg px-2 bg-white"
                                            />
                                        </div>
                                        <div className="flex items-center gap-1.5 justify-end w-full sm:w-auto shrink-0">
                                            <Button size="sm" onClick={confirmEdit} className="h-8 sm:h-9 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[10px] uppercase tracking-wide">
                                                Save
                                            </Button>
                                            <Button size="icon" variant="ghost" onClick={cancelEdit} className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg text-slate-500 hover:bg-slate-200">
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* Draft row for new expense */}
                            {draft && (
                                <div className="no-print mt-2 flex flex-wrap sm:flex-nowrap items-center gap-2 bg-amber-50/50 border border-amber-200/60 rounded-xl p-2 animate-in fade-in slide-in-from-top-1 duration-200">
                                    <div className="flex items-center gap-1.5 flex-1 min-w-[140px]">
                                        <span className="text-[10px] font-black text-amber-700 shrink-0 px-1">৳</span>
                                        <Input
                                            type="number"
                                            min={0}
                                            value={draft.amount || ''}
                                            onChange={e => setDraft(d => d ? { ...d, amount: Number(e.target.value) } : d)}
                                            className="w-16 sm:w-24 text-center font-black text-xs sm:text-sm h-8 sm:h-9 border-amber-300 focus-visible:ring-amber-500 rounded-lg px-1 shrink-0 bg-white"
                                            autoFocus
                                        />
                                        <Input
                                            type="text"
                                            value={draft.note}
                                            onChange={e => setDraft(d => d ? { ...d, note: e.target.value } : d)}
                                            placeholder="cylinder change"
                                            className="flex-1 min-w-0 font-bold text-xs h-8 sm:h-9 border-amber-300 focus-visible:ring-amber-500 rounded-lg px-2 bg-white"
                                        />
                                    </div>
                                    <div className="flex items-center gap-1.5 justify-end w-full sm:w-auto shrink-0">
                                        <Button size="sm" onClick={confirmDraft} className="h-8 sm:h-9 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[10px] uppercase tracking-wide">
                                            Add
                                        </Button>
                                        <Button size="icon" variant="ghost" onClick={cancelDraft} className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg text-slate-500 hover:bg-slate-200">
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Add Extra Expense trigger */}
                            {!draft && (
                                <div className="no-print mt-2">
                                    <button
                                        type="button"
                                        onClick={openDraft}
                                        className="flex items-center justify-center gap-2 text-[10px] sm:text-xs font-black text-amber-600 uppercase tracking-widest border border-dashed border-amber-300/80 rounded-xl px-3 py-2.5 hover:bg-amber-50 hover:border-amber-400 transition-all w-full"
                                    >
                                        <PlusCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                        Add Extra Expense
                                    </button>
                                </div>
                            )}

                            {/* Editable Totals Section */}
                            <div className="mt-4 sm:mt-6 space-y-1.5 sm:space-y-2 border-t border-dashed border-slate-200 pt-4 text-right">
                                <div className="flex justify-between items-center text-slate-500 text-[11px] sm:text-sm">
                                    <span>Subtotal (Sale)</span>
                                    <span className="font-bold text-slate-700">৳{totals.saleTotal.toLocaleString()}</span>
                                </div>
                                {totals.returnTotal > 0 && (
                                    <div className="flex justify-between items-center text-slate-500 text-[10px] sm:text-xs">
                                        <span>Returns (No Charge)</span>
                                        <span className="font-bold">৳{totals.returnTotal.toLocaleString()}</span>
                                    </div>
                                )}
                                {extraTotal > 0 && (
                                    <div className="flex justify-between items-center text-amber-600 text-[10px] sm:text-xs font-bold">
                                        <span className="uppercase tracking-wide">+ Extra Expenses</span>
                                        <span>+৳{extraTotal.toLocaleString()}</span>
                                    </div>
                                )}

                                {/* Premium Rounded Net Total Input */}
                                <div className="flex justify-between items-center py-2.5 sm:py-4 my-2 sm:my-3 bg-slate-50 border border-slate-100 px-3 sm:px-4 rounded-[1rem] sm:rounded-[1.25rem]">
                                    <span className="font-black text-sm sm:text-lg uppercase tracking-tighter text-slate-800">Net Total</span>
                                    <div className="w-[110px] sm:w-40 shrink-0">
                                        <Input
                                            type="number"
                                            value={finalAmount}
                                            onChange={(e) => setFinalAmount(Number(e.target.value))}
                                            className="text-right font-black text-lg sm:text-2xl h-10 sm:h-12 border-slate-300 bg-white focus-visible:ring-slate-900 rounded-lg sm:rounded-xl px-2.5 shadow-sm"
                                        />
                                    </div>
                                </div>

                                {/* Premium Rounded Paid Amount Input */}
                                 <div className="flex justify-between items-center pt-1.5 sm:pt-2 px-1">
                                    <span className="text-[11px] sm:text-sm font-black text-slate-500 uppercase tracking-widest leading-none">Paid Amount</span>
                                    <div className="w-[110px] sm:w-40 shrink-0">
                                        <Input
                                            type="number"
                                            value={paidAmount}
                                            onChange={(e) => setPaidAmount(Number(e.target.value))}
                                            className="text-right font-black text-lg sm:text-2xl h-10 sm:h-12 bg-emerald-50/50 border border-emerald-200 text-emerald-700 focus-visible:ring-emerald-500 rounded-lg sm:rounded-xl px-2.5 shadow-sm transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Calculated Change/Due */}
                                 <div className={cn(
                                     "flex justify-between items-center font-black text-[11px] sm:text-sm pt-2 px-1 uppercase tracking-wider",
                                     dueAmount > 0 ? 'text-red-500' : 'text-blue-500'
                                 )}>
                                    <span>{dueAmount > 0 ? 'Due Amount' : 'Repayment'}</span>
                                    <span className="text-sm sm:text-base">৳{Math.abs(dueAmount).toLocaleString()}</span>
                                </div>

                                {/* Main Action */}
                                 <div className="pt-5 sm:pt-8">
                                     <Button
                                         onClick={handleConfirm}
                                         disabled={isProcessing || !customer}
                                         className={cn(
                                             "w-full h-12 sm:h-14 text-xs sm:text-base font-black uppercase tracking-widest shadow-[0_4px_15px_-3px_rgba(234,88,12,0.4)] rounded-xl sm:rounded-2xl transition-all active:scale-[0.98]",
                                             !customer ? 'bg-slate-200 text-slate-400 shadow-none' : 'bg-orange-500 hover:bg-orange-600 text-white'
                                         )}
                                         title={!customer ? "Please select a customer first" : ""}
                                     >
                                         {isProcessing ? 'Processing...' : (!customer ? 'Select Customer info' : 'Confirm Invoice')}
                                     </Button>
                                 </div>
                            </div>
                         </div>
                    </CardContent>
                </Card>
             </div>
        </div>
    );
};