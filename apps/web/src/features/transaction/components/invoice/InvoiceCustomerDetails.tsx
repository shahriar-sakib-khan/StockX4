import { format } from 'date-fns';

interface InvoiceCustomerDetailsProps {
    date: Date | string;
    invoiceNumber?: string;
    customerName: string;
    customerType?: string;
}

export const InvoiceCustomerDetails = ({ date, invoiceNumber, customerName, customerType }: InvoiceCustomerDetailsProps) => {
    return (
        <div className="text-xs space-y-1 pb-4 border-b border-dashed">
            <div className="flex justify-between">
                <span className="font-semibold">Date:</span>
                <span>{format(new Date(date), 'dd/MM/yyyy HH:mm')}</span>
            </div>
            {invoiceNumber && (
                <div className="flex justify-between">
                    <span className="font-semibold">Invoice #:</span>
                    <span>{invoiceNumber}</span>
                </div>
            )}
            <div className="flex justify-between">
                <span className="font-semibold">Customer:</span>
                <span className="font-bold">{customerName}</span>
            </div>
            {customerType && (
                <div className="flex justify-between text-muted-foreground">
                    <span>Type:</span>
                    <span>{customerType}</span>
                </div>
            )}
        </div>
    );
};
