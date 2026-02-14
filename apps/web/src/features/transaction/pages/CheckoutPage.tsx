import { useEffect, useState } from 'react';
import { usePosStore } from '../stores/pos.store';
import { useStaffStore } from '@/features/staff/stores/staff.store';
import { transactionApi } from '../api/transaction.api';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '@/features/store/hooks/useStores';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { ArrowLeft, Printer, CheckCircle } from 'lucide-react';
import { Receipt } from '../components/Receipt';
import { InvoiceHeader } from '../components/invoice/InvoiceHeader';
import { InvoiceCustomerDetails } from '../components/invoice/InvoiceCustomerDetails';
import { InvoiceItemsTable } from '../components/invoice/InvoiceItemsTable';
import { InvoiceTotals } from '../components/invoice/InvoiceTotals';

export const CheckoutPage = () => {
    const { saleItems, returnItems, getTotals, customer, clearCart } = usePosStore();
    const { staff } = useStaffStore();
    const navigate = useNavigate();

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
    // Use passed storeId or fallback to staff's storeId (safely handled)
    const storeId = id || (typeof staff?.storeId === 'string' ? staff.storeId : (staff?.storeId as any)?._id);
    const { data: storeData } = useStore(storeId || '');

    // Fetch store details to ensure we have the correct name
    // const { data: storeData } = useStore(storeId || ''); // Already declared above

    // Actually, I can use the existing hook. Let me check imports.

    const handleBackToPos = () => {
        if (id) {
             navigate(`/stores/${id}/pos`);
        } else {
             navigate('/pos');
        }
    };

    const handleConfirm = async () => {
        if (!storeId) return toast.error("Store ID missing");

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
                    description: i.description
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
                    description: i.description
                }))
            ];

            const res = await transactionApi.create(storeId, {
                items: apiItems,
                type: 'SALE',
                paymentMethod: dueAmount > 0 ? 'DUE' : 'CASH',
                finalAmount: Number(finalAmount),
                paidAmount: Number(paidAmount),
                customerId: customer?.id,
                customerType: customer?.type
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
            <div className="h-screen flex flex-col items-center justify-center p-4 bg-muted/20">
                <Card className="w-full max-w-2xl">
                    <CardHeader className="text-center">
                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <CardTitle className="text-3xl">Sale Completed!</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex justify-center gap-4">
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
        <div className="min-h-screen bg-background p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                 <Button variant="ghost" onClick={handleBackToPos} className="gap-2 mb-4">
                    <ArrowLeft className="w-4 h-4" /> Back to POS
                 </Button>

                <div className="max-w-3xl mx-auto">
                    <Card>
                        <CardContent>
                             <div className="font-mono text-sm space-y-4">
                                <InvoiceHeader
                                    storeName={storeData?.store?.name || (typeof staff?.storeId === 'object' ? (staff.storeId as any).name : 'Store')}
                                    showPreviewLabel
                                />

                                <InvoiceCustomerDetails
                                    date={new Date()}
                                    customerName={customer ? customer.name : 'Walk-in Customer'}
                                    customerType={customer?.type}
                                />

                                <InvoiceItemsTable
                                        items={[
                                            ...saleItems.map(item => ({
                                                productId: item.productId,
                                                name: item.name,
                                                description: item.description,
                                                quantity: item.quantity,
                                                unitPrice: item.unitPrice,
                                                subtotal: item.subtotal,
                                                saleType: item.saleType,
                                                category: item.category,
                                                type: item.type,
                                                size: item.size,
                                                regulator: item.regulator
                                            })),
                                            ...returnItems.map(item => ({
                                                productId: item.productId,
                                                name: item.name,
                                                description: item.description,
                                                quantity: item.quantity,
                                                unitPrice: item.unitPrice,
                                                subtotal: item.subtotal,
                                                saleType: 'RETURN' as const,
                                                isReturn: true,
                                                category: item.category,
                                                type: item.type,
                                                size: item.size,
                                                regulator: item.regulator
                                            }))
                                        ]}
                                />

                                {/* Editable Totals Section (Replaces InvoiceTotals for Checkout) */}
                                <div className="mt-6 space-y-2 border-t border-dashed pt-4 text-right">
                                    <div className="flex justify-between items-center text-muted-foreground text-sm">
                                        <span>Subtotal (Sale)</span>
                                        <span>{totals.saleTotal}</span>
                                    </div>
                                    {totals.returnTotal > 0 && (
                                        <div className="flex justify-between items-center text-gray-500 text-xs">
                                            <span>Returns (No Charge)</span>
                                            <span>{totals.returnTotal}</span>
                                        </div>
                                    )}

                                    {/* Editable Final Price / Net Total */}
                                    <div className="flex justify-between items-center py-2 my-2 border-y-2 border-dashed">
                                        <span className="font-bold text-xl">NET TOTAL</span>
                                        <div className="w-32">
                                            <Input
                                                type="number"
                                                value={finalAmount}
                                                onChange={(e) => setFinalAmount(Number(e.target.value))}
                                                className="text-right font-bold text-xl h-10 border-gray-300 focus-visible:ring-1"
                                            />
                                        </div>
                                    </div>

                                    {/* Editable Paid Amount */}
                                    <div className="flex justify-between items-center pt-1">
                                        <span className="text-sm">Paid Amount</span>
                                        <div className="w-32">
                                            <Input
                                                type="number"
                                                value={paidAmount}
                                                onChange={(e) => setPaidAmount(Number(e.target.value))}
                                                className="text-right font-semibold text-lg h-9 bg-green-50 border-green-200 focus-visible:ring-green-500"
                                            />
                                        </div>
                                    </div>

                                    {/* Calculated Change/Due */}
                                    <div className={`flex justify-between items-center font-bold text-sm pt-2 ${dueAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                        <span>{dueAmount > 0 ? 'DUE AMOUNT' : 'CHANGE'}</span>
                                        <span className="text-lg">{Math.abs(dueAmount)}</span>
                                    </div>

                                    {/* Actions */}
                                    <div className="pt-6">
                                        <Button
                                            onClick={handleConfirm}
                                            disabled={isProcessing || !customer}
                                            className="w-full"
                                            title={!customer ? "Please select a customer first" : ""}
                                        >
                                            {isProcessing ? 'Processing...' : (!customer ? 'Select Customer First' : 'Confirm Sale')}
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
