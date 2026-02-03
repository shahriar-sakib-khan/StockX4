
interface InvoiceTotalsProps {
    subtotal: number;
    discount?: number;
    netTotal: number;
    paidAmount: number;
    dueAmount: number;
    totalReturns?: number;
}

export const InvoiceTotals = ({ subtotal, discount = 0, netTotal, paidAmount, dueAmount, totalReturns = 0 }: InvoiceTotalsProps) => {
    return (
        <div className="mt-6 space-y-2 border-t border-dashed pt-4 text-right">
            <div className="flex justify-between items-center text-muted-foreground text-sm">
                <span>Subtotal (Sale)</span>
                <span>{subtotal}</span>
            </div>
            {totalReturns > 0 && (
                <div className="flex justify-between items-center text-gray-500 text-xs">
                    <span>Returns (No Charge)</span>
                    <span>{totalReturns}</span>
                </div>
            )}
            {discount > 0 && (
                <div className="flex justify-between items-center text-muted-foreground text-sm">
                    <span>Discount</span>
                    <span>- {discount}</span>
                </div>
            )}

            <div className="flex justify-between items-center font-bold text-2xl pt-2 border-y-2 border-dashed py-2 my-2">
                <span>NET TOTAL</span>
                <span>{netTotal}</span>
            </div>

            <div className="flex justify-between items-center pt-2 text-sm">
                <span>Paid Amount</span>
                <span className="font-semibold">{paidAmount}</span>
            </div>
            <div className={`flex justify-between items-center font-bold text-sm ${dueAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                <span>{dueAmount > 0 ? 'DUE AMOUNT' : 'CHANGE'}</span>
                <span>{Math.abs(dueAmount)}</span>
            </div>
        </div>
    );
};
