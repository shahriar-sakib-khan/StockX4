import { format } from 'date-fns';

interface InvoiceCustomerDetailsProps {
    date: Date | string;
    invoiceNumber?: string;
    customerName: string;
    customerType?: string;
    customerPhone?: string;
    customerAddress?: string;
    transactorName?: string;
    isExpense?: boolean;
}

export const InvoiceCustomerDetails = ({
    date,
    invoiceNumber,
    customerName,
    customerType,
    customerPhone,
    customerAddress,
    transactorName,
    isExpense
}: InvoiceCustomerDetailsProps) => {
    const isWholesale = customerType?.toLowerCase() === 'wholesale';
    const tagLabel = isWholesale ? 'Wholesaler' : 'Retailer';
    const tagColor = isWholesale ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-indigo-100 text-indigo-800 border-indigo-200';

    return (
        <div className="space-y-1.5 sm:space-y-3 pb-2 sm:pb-3 border-b border-dashed">
            {/* Row 1: Invoice # and Date */}
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center bg-slate-50/50 p-1.5 sm:p-2.5 rounded-lg border border-slate-100 gap-1 sm:gap-2">
                <div className="flex items-center sm:items-baseline gap-1.5 sm:gap-2">
                    <span className="font-bold text-muted-foreground uppercase text-[8px] sm:text-[11px] tracking-wider whitespace-nowrap">Inv #:</span>
                    <span className="font-black text-sm sm:text-xl text-slate-900 tracking-tighter truncate">{invoiceNumber || 'PREVIEW'}</span>
                </div>
                <div className="flex flex-col items-end gap-0.5 sm:gap-1 text-slate-700 sm:justify-end">
                    <div className="flex items-center sm:items-baseline gap-1.5 sm:gap-2">
                        <span className="font-bold text-muted-foreground uppercase text-[8px] sm:text-[11px] tracking-wider whitespace-nowrap">Date:</span>
                        <span className="font-black text-[10px] sm:text-base whitespace-nowrap">{format(new Date(date), 'dd/MM/yy HH:mm')}</span>
                    </div>
                    {transactorName && (
                        <div className="flex items-center gap-1.5 sm:gap-2">
                            <span className="font-bold text-muted-foreground uppercase text-[8px] sm:text-[9px] tracking-wider whitespace-nowrap">By:</span>
                            <span className="font-black text-[9px] sm:text-xs bg-slate-900 text-white px-2 py-0.5 rounded uppercase tracking-tighter leading-none">{transactorName}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Row 2: Customer Name and Type */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-3 px-0.5">
                <div className="flex items-center gap-2">
                    {isExpense && (
                        <span className="font-bold text-muted-foreground uppercase text-[8px] sm:text-[10px] tracking-wider whitespace-nowrap">Receiver:</span>
                    )}
                    <span className="font-black text-base sm:text-2xl text-slate-900 leading-tight">{customerName}</span>
                </div>
                {!isExpense && (
                    <span className={`text-[8px] sm:text-[10px] ${tagColor} px-1.5 sm:px-2.5 py-0.5 rounded-md font-black uppercase border shadow-sm shrink-0`}>
                        {tagLabel}
                    </span>
                )}
            </div>

            {/* Row 3 & 4: Contact & transactor info - Compacted for mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-0.5 sm:gap-y-1 px-0.5">
                {customerPhone && (
                    <div className="flex gap-2 items-center">
                         <span className="font-bold text-muted-foreground uppercase text-[8px] sm:text-[10px] tracking-wider w-[60px] sm:w-[80px]">Phone:</span>
                         <span className="font-black text-[11px] sm:text-lg text-slate-800 tracking-tight">{customerPhone}</span>
                    </div>
                )}
                {customerAddress && (
                    <div className="flex gap-2 items-start col-span-full">
                         <span className="font-bold text-muted-foreground uppercase text-[8px] sm:text-[10px] tracking-wider w-[60px] sm:w-[80px] mt-0.5">Addr:</span>
                         <span className="font-black text-[11px] sm:text-lg text-slate-800 line-clamp-1 flex-1">{customerAddress}</span>
                    </div>
                )}
            </div>
        </div>
    );
};
