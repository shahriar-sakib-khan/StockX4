
export interface InvoiceTotalsProps {
    subtotal: number;
    discount?: number;
    netTotal: number;
    paidAmount: number;
    dueAmount: number;
    totalReturns?: number;
    isExpense?: boolean;
}

export const InvoiceTotals = ({ subtotal, discount = 0, netTotal, paidAmount, dueAmount, totalReturns = 0, isExpense = false }: InvoiceTotalsProps) => {
    return (
        <div className="mt-4 sm:mt-6 space-y-1 sm:space-y-2 border-t border-dashed border-slate-200 pt-3 sm:pt-4 text-right">
            <div className="flex justify-between items-center text-slate-400 font-bold text-[10px] sm:text-sm uppercase tracking-wider">
                <span>{isExpense ? 'Sub' : 'Subtotal'}</span>
                <span className="text-slate-600">৳{subtotal}</span>
            </div>
            {totalReturns > 0 && !isExpense && (
                <div className="flex justify-between items-center text-slate-400 font-bold text-[9px] sm:text-xs uppercase tracking-wider">
                    <span>Returns</span>
                    <span className="text-slate-500">({totalReturns})</span>
                </div>
            )}
            {discount > 0 && (
                <div className="flex justify-between items-center text-red-400 font-bold text-[10px] sm:text-sm uppercase tracking-wider">
                    <span>Discount</span>
                    <span>- ৳{discount}</span>
                </div>
            )}

            <div className="flex justify-between items-center font-black text-lg sm:text-2xl pt-2 border-y border-dashed border-slate-300 py-2 sm:py-3 my-2 sm:my-3 bg-slate-50/30 px-2 rounded-lg">
                <span className="uppercase tracking-tighter">NET</span>
                <span className="text-indigo-600">৳{netTotal}</span>
            </div>

            <div className="flex justify-between items-center pt-1 text-[11px] sm:text-sm font-black text-slate-500 uppercase tracking-widest">
                <span>Paid</span>
                <span className="text-slate-800">৳{paidAmount}</span>
            </div>
            <div className={`flex justify-between items-center font-black text-[11px] sm:text-sm mt-1 px-2 py-1 rounded ${dueAmount > 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'} uppercase tracking-widest`}>
                <span>{dueAmount > 0 ? 'DUE' : 'REPAYMENT'}</span>
                <span className={dueAmount > 0 ? "text-rose-700" : "text-blue-700"}>৳{Math.abs(dueAmount)}</span>
            </div>
        </div>
    );
};
