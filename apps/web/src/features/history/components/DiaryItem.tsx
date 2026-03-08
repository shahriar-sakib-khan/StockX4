import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Clock, User, UserCheck, Receipt, FileText, ArrowUpRight, ArrowDownLeft, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { ReceiptPreviewModal } from './ReceiptPreviewModal';

interface DiaryItemProps {
    transaction: any;
    isIncome?: boolean;
    onClick?: () => void;
}

export const DiaryItem = ({ transaction, isIncome, onClick }: DiaryItemProps) => {
    const [isReceiptOpen, setIsReceiptOpen] = useState(false);
    const hasDue = transaction.dueAmount > 0;
    const isFullDue = transaction.paidAmount === 0 && transaction.dueAmount > 0;
    
    // Entity Identification
    let entityName = 'Walk-in';
    let subEntity = '';

    if (transaction.type === 'EXPENSE') {
        entityName = transaction.items?.[0]?.category || 'General Expense';
        subEntity = transaction.items?.[0]?.name || transaction.items?.[0]?.description || '';
    } else {
        const customer = transaction.customerId;
        entityName = customer?.name || customer?.licensePlate || 'Walk-In Customer';
        subEntity = customer?.phone || customer?.driverPhone || (customer?.type ? `${customer.type} customer` : '');
    }

    const staffName = transaction.staffId?.name || transaction.transactorName || 'System';
    const staffRole = transaction.staffId?.role || transaction.transactorRole || (transaction.staffId ? 'staff' : 'system');

    // Role colors
    const roleColors: Record<string, string> = {
        owner: "bg-rose-100 text-rose-700 border-rose-200",
        manager: "bg-blue-100 text-blue-700 border-blue-200",
        staff: "bg-emerald-100 text-emerald-700 border-emerald-200",
        driver: "bg-emerald-100 text-emerald-700 border-emerald-200",
    };

    // Item Background Colors
    const getBgColor = () => {
        if (!isIncome) return "bg-rose-50/50 border-rose-100 hover:border-rose-300";
        if (isFullDue) return "bg-orange-50/50 border-orange-100 hover:border-orange-300";
        if (hasDue) return "bg-amber-50/50 border-amber-100 hover:border-amber-300";
        return "bg-emerald-50/50 border-emerald-100 hover:border-emerald-300";
    };

    return (
        <div
            onClick={onClick}
            className={cn(
                "p-3 rounded-2xl border transition-all group hover:shadow-lg cursor-pointer active:scale-[0.99] select-none",
                getBgColor()
            )}
        >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className={cn(
                        "h-10 w-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-110",
                        isIncome 
                            ? (isFullDue ? "bg-orange-500 text-white" : hasDue ? "bg-amber-500 text-white" : "bg-emerald-500 text-white")
                            : "bg-rose-500 text-white"
                    )}>
                        {isIncome ? (
                            isFullDue ? <Clock size={20} /> : <ArrowDownLeft size={20} />
                        ) : (
                            <ArrowUpRight size={20} />
                        )}
                    </div>
                    
                    <div className="min-w-0 flex-1 flex flex-col justify-center">
                        <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                                {format(new Date(transaction.createdAt), 'MMM dd, hh:mm a')}
                            </span>
                        </div>

                        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 mb-1.5">
                            <span className="text-[10px] opacity-50 uppercase font-black tracking-tighter shrink-0">To:</span>
                            <h4 className="text-lg font-black text-slate-900 leading-tight">
                                {entityName}
                            </h4>
                            {subEntity && (
                                <span className="text-[9px] font-bold text-slate-500 opacity-60 uppercase bg-slate-200/50 px-1.5 py-0.5 rounded-md leading-none">
                                    {subEntity}
                                </span>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                             <div className="flex items-center gap-1.5">
                                <span className="opacity-50 uppercase text-[9px] font-black tracking-tighter shrink-0">By:</span>
                                <span className="text-sm font-black text-slate-900 uppercase tracking-tight">{staffName}</span>
                             </div>
                             <Badge variant="outline" className={cn("text-[9px] font-black uppercase px-1.5 h-4 tracking-tighter border-2 shadow-sm rounded-md leading-none", roleColors[staffRole] || "bg-slate-100")}>
                                {staffRole}
                             </Badge>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto shrink-0 mt-2 sm:mt-0">
                    <div className="flex flex-col items-end gap-1.5">
                         <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1.5 bg-white/60 px-2.5 py-1.5 rounded-xl border border-slate-200/50 shadow-sm">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Paid</span>
                                <span className="text-sm font-black text-slate-900">৳{transaction.paidAmount.toLocaleString()}</span>
                            </div>
                            {hasDue && (
                                <div className="flex items-center gap-1.5 bg-orange-100/30 px-2.5 py-1.5 rounded-xl border border-orange-200/50 shadow-sm">
                                    <span className="text-[10px] font-black text-orange-500 uppercase tracking-tighter">Due</span>
                                    <span className="text-sm font-black text-orange-600">৳{transaction.dueAmount.toLocaleString()}</span>
                                </div>
                            )}
                         </div>
                        
                        <div className="text-right">
                            <div className={cn(
                                "text-3xl font-black leading-none tracking-tighter",
                                isIncome 
                                    ? (isFullDue ? "text-orange-600" : hasDue ? "text-amber-600" : "text-emerald-600")
                                    : "text-rose-600"
                            )}>
                                ৳{transaction.finalAmount.toLocaleString()}
                            </div>
                            <div className="text-[11px] font-black text-slate-400 uppercase mt-1 tracking-wider opacity-80">
                                {transaction.type === 'SALE' ? (isFullDue ? 'Full Due' : hasDue ? 'Partial' : 'Paid') : 
                                 transaction.type === 'EXPENSE' ? 'Expense' : transaction.type}
                            </div>
                        </div>
                    </div>

                    <Button 
                        onClick={onClick}
                        variant="outline" 
                        size="sm"
                        className="h-12 px-4 rounded-2xl border-slate-200 hover:bg-slate-900 hover:text-white transition-all flex flex-col items-center justify-center gap-0.5 group/btn"
                    >
                        <FileText size={16} className="group-hover/btn:scale-110 transition-transform" />
                        <span className="text-[8px] font-black opacity-60">{transaction.invoiceNumber}</span>
                    </Button>

                    {transaction.receiptUrl && (
                        <div className="flex flex-col gap-1">
                            <Button 
                                variant="outline"
                                className="h-12 w-12 rounded-2xl border border-rose-200 bg-rose-50 flex flex-col items-center justify-center gap-0.5 hover:bg-rose-100 transition-all group/receipt"
                                title="View Receipt"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsReceiptOpen(true);
                                }}
                            >
                                <Eye size={16} className="text-rose-600 group-hover/receipt:scale-110 transition-transform" />
                                <span className="text-[8px] font-black text-rose-500 opacity-60 uppercase">Doc</span>
                            </Button>
                            
                            <ReceiptPreviewModal 
                                isOpen={isReceiptOpen}
                                onClose={() => setIsReceiptOpen(false)}
                                imageUrl={transaction.receiptUrl}
                                title={`Receipt: ${transaction.invoiceNumber}`}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
