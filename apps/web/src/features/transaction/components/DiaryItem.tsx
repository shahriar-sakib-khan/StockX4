import { format } from 'date-fns';
import { cn } from '@/lib/utils'; // Assuming utils exists, otherwise I'll use clsx directly

interface DiaryItemProps {
    transaction: any;
    isIncome?: boolean;
    onClick?: () => void;
}

export const DiaryItem = ({ transaction, isIncome, onClick }: DiaryItemProps) => {
    const isDue = transaction.type === 'DUE_PAYMENT';
    const hasDue = transaction.dueAmount > 0;

    // "who did the transaction" -> Staff? "to whom" -> Customer/Supplier
    const staffName = transaction.staffId?.name || 'Unknown Staff';
    const customerName = transaction.customerId?.name || 'Walk-in Customer';

    return (
        <div
            onClick={onClick}
            className={cn(
                "p-4 mb-3 rounded-xl border-2 cursor-pointer transition-all shadow-sm hover:shadow-md hover:scale-[1.01]",
                isIncome
                    ? "bg-emerald-50/50 border-emerald-100 hover:border-emerald-300"
                    : "bg-rose-50/50 border-rose-100 hover:border-rose-300",
                hasDue && isIncome && "bg-yellow-50/50 border-yellow-200 hover:border-yellow-400"
            )}
        >
            <div className="flex justify-between items-start">
                <div className="flex flex-col gap-1">
                     <span className={cn(
                        "font-black text-xl tracking-tight",
                         isIncome ? "text-emerald-900" : "text-rose-900",
                         hasDue && isIncome && "text-yellow-900"
                     )}>
                        {transaction.type === 'DUE_PAYMENT' ? 'Due Collection' :
                         transaction.type === 'EXPENSE' ? 'Expense' :
                         transaction.type === 'SALE' ? 'Sale' : transaction.type}
                     </span>
                     <span className="font-bold text-lg text-slate-700">
                        #{transaction._id.slice(-6).toUpperCase()}
                     </span>
                </div>
                <div className="text-right">
                    <span className={cn(
                        "block text-3xl font-black",
                        isIncome ? "text-emerald-600" : "text-rose-600",
                        hasDue && isIncome && "text-yellow-600"
                    )}>
                        ৳{transaction.finalAmount}
                    </span>
                    {hasDue && (
                        <span className="text-sm font-bold text-red-500 bg-red-100 px-2 py-0.5 rounded-full inline-block mt-1">
                            Due: ৳{transaction.dueAmount}
                        </span>
                    )}
                </div>
            </div>

            <div className="mt-3 flex justify-between items-end border-t pt-2 border-slate-200/60">
                <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">To/From</span>
                    <span className="font-bold text-slate-800 text-lg leading-tight">{customerName}</span>
                </div>
                <div className="flex flex-col text-right">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">By</span>
                    <span className="font-bold text-slate-600">{staffName}</span>
                </div>
            </div>
             <div className="mt-1 text-right">
                <span className="text-xs font-bold text-slate-400">
                    {format(new Date(transaction.createdAt), 'hh:mm a')}
                </span>
            </div>
        </div>
    );
};
