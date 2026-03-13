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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { ArrowLeft, Printer, CheckCircle, PackageMinus, Info } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Receipt } from '../components/Receipt';
import { InvoiceHeader } from '../components/invoice/InvoiceHeader';
import { InvoiceCustomerDetails } from '../components/invoice/InvoiceCustomerDetails';
import { InvoiceItemsTable } from '../components/invoice/InvoiceItemsTable';
import { InvoiceTotals } from '../components/invoice/InvoiceTotals';

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

    useEffect(() => {
        setFinalAmount(totals.netTotal);
        setPaidAmount(totals.netTotal);
    }, [totals.netTotal]);

    const dueAmount = finalAmount - paidAmount;

    const { id } = useParams<{ id: string }>(); // Store ID from URL (Owner mode)
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
            // Transform POS items to API items
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
                // Pass explicit dueCylinders if any were allocated during POS cart mapping
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

    if (completedTransaction) {
        return (
            <div className="min-h-screen flex flex-col items-center pt-4 sm:pt-8 pb-10 sm:pb-20 px-2 sm:px-4 bg-muted/20 overflow-y-auto">
                <Card className="w-full max-w-3xl animate-in fade-in zoom-in duration-300 shadow-xl border-slate-200">
                    <CardHeader className="text-center p-4 sm:p-6">
                        <CheckCircle className="w-10 h-10 sm:w-16 sm:h-16 text-green-500 mx-auto mb-2 sm:mb-4" />
                        <CardTitle className="text-xl sm:text-3xl font-black uppercase tracking-tight">Sale Completed!</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
                        <div className="flex justify-center gap-3 sm:gap-4">
                           <Button onClick={() => window.print()} variant="outline" className="gap-2">
                                <Printer className="w-4 h-4" /> Print Receipt
                            </Button>
                            <Button onClick={() => {
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

                        <div className="border p-4 bg-white rounded shadow-sm">
                            <Receipt transaction={completedTransaction} storeName={typeof staff?.storeId === 'object' ? (staff.storeId as any).name : 'Store'} />
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
         <div className="min-h-screen bg-muted/20 p-1 sm:p-4 md:p-8 flex flex-col items-center">
            <div className="w-full max-w-2xl space-y-2 sm:space-y-6">
                 <Button variant="ghost" onClick={handleBackToPos} className="gap-1.5 sm:gap-2 self-start px-2 h-7 sm:h-10 text-[10px] sm:text-sm font-bold opacity-70 hover:opacity-100">
                    <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" /> Back to POS
                 </Button>

                 <div className="w-full max-w-[99%] sm:max-w-2xl mx-auto pb-6 sm:pb-10">
                    <Card className="shadow-2xl border-slate-200 overflow-hidden rounded-lg sm:rounded-2xl">
                        <CardContent className="p-2 sm:p-6">
                             <div className="font-mono text-[10px] sm:text-sm space-y-2 sm:space-y-4">
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

                                <InvoiceItemsTable
                                        items={[
                                            ...saleItems.map(item => ({
                                                ...item,
                                                saleType: item.saleType as any
                                            })),
                                            ...returnItems.map(item => ({
                                                ...item,
                                                saleType: 'RETURN' as const,
                                                isReturn: true
                                            })),
                                            ...allocatedDueCylinders.filter(b => b.selectedQty > 0).map(b => ({
                                                productId: b.productId,
                                                name: b.brandName,
                                                quantity: b.selectedQty,
                                                unitPrice: 0,
                                                subtotal: 0,
                                                saleType: 'DUE' as const,
                                                isDue: true,
                                                size: b.size,
                                                regulator: b.regulator
                                            })),
                                            ...settledDueCylinders.filter(b => b.selectedQty > 0).map(b => ({
                                                productId: b.productId,
                                                name: b.brandName,
                                                quantity: b.selectedQty,
                                                unitPrice: 0,
                                                subtotal: 0,
                                                saleType: 'RETURN' as const,
                                                isSettled: true,
                                                type: 'CYLINDER' as const,
                                                size: b.size,
                                                regulator: b.regulator
                                            }))
                                        ]}
                                />

                                {/* Editable Totals Section */}
                                <div className="mt-4 sm:mt-6 space-y-1.5 sm:space-y-2 border-t border-dashed pt-4 text-right">
                                    <div className="flex justify-between items-center text-muted-foreground text-[11px] sm:text-sm">
                                        <span>Subtotal (Sale)</span>
                                        <span className="font-bold">{totals.saleTotal}</span>
                                    </div>
                                    {totals.returnTotal > 0 && (
                                        <div className="flex justify-between items-center text-slate-500 text-[10px] sm:text-xs">
                                            <span>Returns (No Charge)</span>
                                            <span className="font-bold">{totals.returnTotal}</span>
                                        </div>
                                    )}

                                    {/* Editable Final Price / Net Total */}
                                    <div className="flex justify-between items-center py-2 sm:py-4 my-2 sm:my-3 border-y border-dashed border-slate-300 bg-slate-50 px-2 sm:px-3 rounded-lg sm:rounded-xl">
                                        <span className="font-black text-base sm:text-2xl uppercase tracking-tighter">Net Total</span>
                                        <div className="w-28 sm:w-40">
                                            <Input
                                                type="number"
                                                value={finalAmount}
                                                onChange={(e) => setFinalAmount(Number(e.target.value))}
                                                className="text-right font-black text-xl sm:text-2xl h-12 border border-slate-300 bg-white focus-visible:ring-1 rounded-lg sm:rounded-xl px-2"
                                            />
                                        </div>
                                    </div>

                                    {/* Editable Paid Amount */}
                                     <div className="flex justify-between items-center pt-1.5 sm:pt-2">
                                        <span className="text-xs sm:text-base font-black text-slate-600 uppercase tracking-widest leading-none">Paid Amount</span>
                                        <div className="w-28 sm:w-40">
                                            <Input
                                                type="number"
                                                value={paidAmount}
                                                onChange={(e) => setPaidAmount(Number(e.target.value))}
                                                className="text-right font-black text-xl sm:text-2xl h-12 bg-green-50/50 border border-green-200 focus-visible:ring-green-600 rounded-lg sm:rounded-xl px-2"
                                            />
                                        </div>
                                    </div>

                                    {/* Calculated Change/Due */}
                                     <div className={`flex justify-between items-center font-black text-xs sm:text-sm pt-2 ${dueAmount > 0 ? 'text-red-600' : 'text-green-600'} uppercase tracking-wider`}>
                                        <span>{dueAmount > 0 ? 'Due Amount' : 'Repayment'}</span>
                                        <span className={dueAmount > 0 ? "text-rose-600" : "text-blue-600"}>{Math.abs(dueAmount)}</span>
                                    </div>

                                    {/* Actions */}
                                     <div className="pt-4 sm:pt-8">
                                         <Button
                                             onClick={handleConfirm}
                                             disabled={isProcessing || !customer}
                                             className={`w-full h-12 sm:h-14 text-sm sm:text-lg font-black uppercase tracking-widest shadow-xl rounded-xl sm:rounded-2xl transition-all active:scale-95 ${!customer ? 'bg-slate-300' : 'bg-orange-600 hover:bg-orange-700'}`}
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
        </div>
    );
};
