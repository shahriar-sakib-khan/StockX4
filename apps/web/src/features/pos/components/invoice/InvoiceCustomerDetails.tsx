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
        <div className="space-y-1 sm:space-y-3 pb-1.5 sm:pb-3 border-b border-dashed border-slate-200">
            {/* Row 1: Invoice # and Date */}
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center bg-slate-50/30 p-1 sm:p-2.5 rounded-lg border border-slate-100 gap-1 sm:gap-2">
                <div className="flex items-center sm:items-baseline gap-1 sm:gap-2">
                    <span className="font-black text-slate-400 uppercase text-[7px] sm:text-[11px] tracking-wider whitespace-nowrap">INV #:</span>
                    <span className="font-black text-[11px] sm:text-xl text-slate-900 tracking-tighter truncate leading-none mb-0.5">{invoiceNumber || 'PREVIEW'}</span>
                </div>
                <div className="flex flex-col items-end gap-0.5 text-slate-700 sm:justify-end">
                    <div className="flex items-center sm:items-baseline gap-1 sm:gap-2">
                        <span className="font-black text-slate-400 uppercase text-[7px] sm:text-[11px] tracking-wider whitespace-nowrap">Date:</span>
                        <span className="font-black text-[9px] sm:text-base whitespace-nowrap leading-none">{format(new Date(date), 'dd/MM/yy HH:mm')}</span>
                    </div>
                    {transactorName && (
                        <div className="flex items-center gap-1 sm:gap-2 mt-0.5">
                            <span className="font-black text-slate-400 uppercase text-[7px] tracking-wider whitespace-nowrap">BY:</span>
                            <span className="font-black text-[7px] sm:text-[10px] bg-slate-800 text-white px-1 sm:px-2 py-0.5 rounded uppercase tracking-tighter leading-none">{transactorName}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Row 2: Customer Name and Type */}
            <div className="flex flex-wrap items-center gap-1 sm:gap-3 px-0.5">
                <div className="flex items-center gap-1.5">
                    {isExpense && (
                        <span className="font-black text-slate-400 uppercase text-[7px] sm:text-[10px] tracking-wider whitespace-nowrap">Recv:</span>
                    )}
                    <span className="font-black text-sm sm:text-2xl text-slate-900 leading-tight">{customerName}</span>
                </div>
                {!isExpense && (
                    <span className={`text-[7px] sm:text-[10px] ${tagColor} px-1 sm:px-2.5 py-0.5 rounded-md font-black uppercase border shadow-sm shrink-0`}>
                        {tagLabel}
                    </span>
                )}
            </div>

            {/* Row 3 & 4: Contact & transactor info - Compacted for mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-0.5 sm:gap-y-1 px-0.5">
                {customerPhone && (
                    <div className="flex gap-1.5 sm:gap-2 items-center">
                         <span className="font-black text-slate-400 uppercase text-[7px] sm:text-[10px] tracking-wider w-[40px] sm:w-[80px]">PH:</span>
                         <span className="font-black text-[10px] sm:text-lg text-slate-800 tracking-tight">{customerPhone}</span>
                    </div>
                )}
                {customerAddress && (
                    <div className="flex gap-1.5 sm:gap-2 items-start col-span-full">
                         <span className="font-black text-slate-400 uppercase text-[7px] sm:text-[10px] tracking-wider w-[40px] sm:w-[80px] mt-0.5">AD:</span>
                         <span className="font-black text-[10px] sm:text-lg text-slate-800 line-clamp-1 flex-1 leading-tight">{customerAddress}</span>
                    </div>
                )}
            </div>
       </div>
    );
};
