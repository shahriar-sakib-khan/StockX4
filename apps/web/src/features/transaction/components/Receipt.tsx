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
    const invoiceItems: InvoiceItem[] = (transaction.items || []).map((item: any) => {
        let saleType: any = item.saleType;

        if (!saleType) {
            if (item.type === 'FUEL' || item.type === 'REPAIR') {
                saleType = 'EXPENSE';
            } else if (item.unitPrice === 0 && (item.type === 'CYLINDER' || item.category === 'cylinder')) {
                saleType = 'RETURN';
            } else if (item.type === 'CYLINDER' && item.unitPrice >= 3000) {
                saleType = 'PACKAGED';
            } else if (item.type === 'CYLINDER') {
                saleType = 'REFILL';
            } else {
                saleType = 'ACCESSORY';
            }
        }

        return {
            productId: item.productId?._id || item.productId,
            name: item.name || item.productId?.name || 'Unknown Item',
            description: item.description || item.variant,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: item.subtotal || (item.quantity * item.unitPrice),
            saleType,
            type: item.type,
            category: item.category,
            isReturn: item.unitPrice === 0 && item.type === 'CYLINDER',
            size: item.size,
            regulator: item.regulator
        };
    });

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
                <InvoiceHeader storeName={storeName} />

                <InvoiceCustomerDetails
                    date={new Date(transaction.createdAt)}
                    customerName={transaction.customerName || (transaction.customerId ? 'Customer' : 'Walk-in Customer')}
                    customerType={transaction.customerType}
                    invoiceNumber={transaction._id.slice(-6).toUpperCase()}
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
