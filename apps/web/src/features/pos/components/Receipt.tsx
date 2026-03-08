import { InvoiceHeader } from './invoice/InvoiceHeader';
import { InvoiceCustomerDetails } from './invoice/InvoiceCustomerDetails';
import { InvoiceItemsTable, InvoiceItem } from './invoice/InvoiceItemsTable';
import { InvoiceTotals } from './invoice/InvoiceTotals';

interface ReceptorProps {
    transaction: any;
    storeName: string;
}

export const Receipt = ({ transaction, storeName }: ReceptorProps) => {

    // Map transaction items to InvoiceItem[]
    const items: InvoiceItem[] = (transaction.items || []).map((item: any) => {
        return {
            productId: item.productId?._id || item.productId,
            name: item.name || item.productId?.name || 'Unknown Item',
            description: item.description || item.variant,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: item.subtotal || (item.quantity * item.unitPrice),
            saleType: item.saleType,
            type: item.type,
            category: item.category,
            isReturn: item.isReturn || (item.unitPrice === 0 && (item.type === 'CYLINDER' || item.category === 'cylinder')),
            isSettled: item.isSettled || item.description?.startsWith('DUE SETTLEMENT'),
            size: item.size,
            regulator: item.regulator,
            burners: item.burners
        };
    });

    // Handle due cylinders stored separately
    const dueItems: InvoiceItem[] = (transaction.dueCylinders || []).map((due: any) => ({
        productId: due.productId,
        name: due.brandName,
        quantity: due.quantity,
        unitPrice: 0,
        subtotal: 0,
        saleType: 'DUE',
        isDue: true,
        size: due.size, // may not be available if not populated
        regulator: due.regulator
    }));

    const invoiceItems = [...items, ...dueItems];

    // Adjust saleType logic specifically for mapping (double check)
    const processedItems = invoiceItems.map(item => {
        if (item.type === 'CYLINDER' && item.unitPrice === 0) {
             return { ...item, saleType: 'RETURN' as const, isReturn: true };
        }
        return item;
    });

    return (
        <div id="receipt-print" className="bg-white p-6 w-full max-w-[210mm] mx-auto text-sm leading-tight shadow-none print:shadow-none print:w-full print:max-w-none">
             {/*
                Refactored to match Invoice Design EXACTLY by reusing components.
             */}

            <div className="space-y-6">
                <InvoiceHeader storeName={transaction.storeId?.name || storeName} />

                <InvoiceCustomerDetails
                    date={new Date(transaction.createdAt)}
                    customerName={transaction.customerId?.name || transaction.customerName || (transaction.customerId ? 'Customer' : 'Walk-in Customer')}
                    customerType={transaction.customerId?.type || transaction.customerType}
                    customerPhone={transaction.customerId?.phone}
                    customerAddress={transaction.customerId?.address}
                    transactorName={transaction.transactorName || transaction.staffId?.name}
                    invoiceNumber={transaction.invoiceNumber || transaction._id.slice(-6).toUpperCase()}
                />

                <InvoiceItemsTable items={processedItems} />

                <InvoiceTotals
                    subtotal={transaction.totalAmount}
                    netTotal={transaction.finalAmount}
                    paidAmount={transaction.paidAmount}
                    dueAmount={transaction.dueAmount}
                    discount={transaction.totalAmount - transaction.finalAmount}
                    totalReturns={0}
                />
            </div>

            {/* Footer */}
            <div className="mt-12 text-center text-xs text-gray-500">
                <p className="mb-1">Thank you for your business!</p>
                <p>Powered by StockX POS</p>
            </div>

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
                            padding: 20px; /* Add padding for print */
                        }
                        @page {
                            size: auto;
                            margin: 5mm;
                        }
                    }
                `}
            </style>
        </div>
    );
};
