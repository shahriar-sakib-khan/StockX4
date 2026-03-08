import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/button';
import { Printer, Eye } from 'lucide-react';
import { InvoiceHeader } from '@/features/pos/components/invoice/InvoiceHeader';
import { InvoiceCustomerDetails } from '@/features/pos/components/invoice/InvoiceCustomerDetails';
import { InvoiceItemsTable, InvoiceItem } from '@/features/pos/components/invoice/InvoiceItemsTable';
import { InvoiceTotals } from '@/features/pos/components/invoice/InvoiceTotals';
import { useState } from 'react';
import { ReceiptPreviewModal } from './ReceiptPreviewModal';

interface HistoryInvoiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    transaction: any;
}

export const HistoryInvoiceModal = ({ isOpen, onClose, transaction }: HistoryInvoiceModalProps) => {
    const [isReceiptOpen, setIsReceiptOpen] = useState(false);
    if (!transaction) return null;

    const handlePrint = () => {
        window.print();
    };

    const storeName = transaction.storeId?.name || "Sakib's Gas Corner";
    
    const isExpense = transaction.type === 'EXPENSE';
    
    // Map transaction items to InvoiceItem[]
    const items: InvoiceItem[] = [
        ...(transaction.items || []).map((item: any) => ({
            productId: item.productId?._id || item.productId,
            name: item.name || item.productId?.name || 'Unknown Item',
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: item.subtotal || (item.quantity * item.unitPrice),
            saleType: item.saleType,
            type: item.type,
            category: item.category,
            isReturn: item.isReturn,
            isSettled: item.isSettled,
            size: item.size,
            regulator: item.regulator,
            burners: item.burners
        })),
        ...(transaction.dueCylinders || []).map((due: any) => ({
            productId: due.productId,
            name: due.brandName,
            quantity: due.quantity,
            unitPrice: 0,
            subtotal: 0,
            saleType: 'DUE' as const,
            isDue: true,
            size: due.size,
            regulator: due.regulator
        }))
    ];

    const processedItems = items.map(item => {
        if ((item.type === 'CYLINDER' || item.category === 'cylinder') && item.unitPrice === 0) {
             return { ...item, saleType: 'RETURN' as const, isReturn: true };
        }
        return item;
    });

    const displayCustomerName = isExpense 
        ? (transaction.customerId?.name || transaction.items?.[0]?.name || transaction.transactorName || 'Service Provider')
        : (transaction.customerId?.name || transaction.transactorName || 'Walk-in Customer');

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title={isExpense ? "Expense Receipt" : "Transaction Invoice"} 
            className="print:shadow-none print:border-none max-w-2xl bg-slate-50/50"
        >
            <div id="receipt-print" className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-100 space-y-6">
                <InvoiceHeader storeName={storeName} />

                <InvoiceCustomerDetails
                    date={new Date(transaction.createdAt)}
                    invoiceNumber={transaction.invoiceNumber}
                    customerName={displayCustomerName}
                    customerType={transaction.customerId?.type || transaction.customerType}
                    customerPhone={transaction.customerId?.phone}
                    customerAddress={transaction.customerId?.address}
                    transactorName={transaction.transactorName || transaction.staffId?.name}
                    isExpense={isExpense}
                />

                <InvoiceItemsTable items={processedItems} isExpense={isExpense} />

                <InvoiceTotals
                    subtotal={transaction.totalAmount}
                    netTotal={transaction.finalAmount}
                    paidAmount={transaction.paidAmount}
                    dueAmount={transaction.dueAmount}
                    discount={transaction.totalAmount - transaction.finalAmount}
                    totalReturns={0}
                    isExpense={isExpense}
                />

                <div className="flex justify-end gap-3 pt-6 border-t print:hidden">
                    <Button variant="outline" onClick={onClose} className="rounded-xl px-6">Close</Button>
                    
                    {transaction.receiptUrl && (
                        <Button 
                            onClick={() => setIsReceiptOpen(true)}
                            variant="outline"
                            className="border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl px-6"
                        >
                            <Eye className="w-4 h-4 mr-2" />
                            View Document
                        </Button>
                    )}

                    <Button onClick={handlePrint} className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-6 shadow-lg shadow-slate-200 transition-all active:scale-95">
                        <Printer className="w-4 h-4 mr-2" />
                        Print Invoice
                    </Button>
                </div>
            </div>

            <ReceiptPreviewModal 
                isOpen={isReceiptOpen}
                onClose={() => setIsReceiptOpen(false)}
                imageUrl={transaction.receiptUrl}
                title={`Receipt: ${transaction.invoiceNumber}`}
            />

            {/* Print Styles */}
            <style>
                {`
                    @media print {
                        body * {
                            visibility: hidden;
                        }
                        #receipt-print, #receipt-print * {
                            visibility: visible;
                        }
                        #receipt-print {
                            position: absolute;
                            left: 0;
                            top: 0;
                            width: 100% !important;
                            max-width: none !important;
                            padding: 20px;
                            border: none !important;
                            box-shadow: none !important;
                        }
                        @page {
                            size: auto;
                            margin: 10mm;
                        }
                    }
                `}
            </style>
        </Modal>
    );
};
