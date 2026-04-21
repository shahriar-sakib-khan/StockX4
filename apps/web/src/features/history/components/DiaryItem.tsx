import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Clock, ArrowUpRight, ArrowDownLeft, Eye, FileText, User } from 'lucide-react';
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

    const staffName = transaction.staffId?.name || transaction.transactorName || (transaction.staffId ? 'Unknown Staff' : 'System');
    const staffRole = transaction.staffId?.role || transaction.transactorRole || (transaction.staffId ? 'staff' : 'system');

    // Role colors
    const roleColors: Record<string, string> = {
        owner: "bg-rose-100 text-rose-700 border-rose-200",
        manager: "bg-blue-100 text-blue-700 border-blue-200",
        staff: "bg-emerald-100 text-emerald-700 border-emerald-200",
        driver: "bg-amber-100 text-amber-700 border-amber-200",
    };

    // Item Background Colors - Made slightly cleaner and softer
    const getBgColor = () => {
        if (!isIncome) return "bg-rose-50/40 border-rose-100 hover:border-rose-300 hover:bg-rose-50/70";
        if (isFullDue) return "bg-orange-50/40 border-orange-100 hover:border-orange-300 hover:bg-orange-50/70";
        if (hasDue) return "bg-amber-50/40 border-amber-100 hover:border-amber-300 hover:bg-amber-50/70";
        return "bg-emerald-50/40 border-emerald-100 hover:border-emerald-300 hover:bg-emerald-50/70";
    };

    return (
        <div
            onClick={onClick}
            className={cn(
                "p-3 sm:p-4 rounded-2xl border transition-all duration-300 group hover:shadow-sm cursor-pointer active:scale-[0.98] select-none relative overflow-hidden",
                getBgColor()
            )}
        >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                
                {/* LEFT SIDE: Icon & Primary Info */}
                <div className="flex items-start gap-3 min-w-0 w-full sm:w-auto">
                    
                    {/* Status Icon */}
                    <div className={cn(
                        "h-10 w-10 rounded-xl flex items-center justify-center shrink-0 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.1)] transition-transform duration-500 group-hover:scale-110",
                        isIncome 
                            ? (isFullDue ? "bg-orange-500 text-white shadow-orange-500/30" : hasDue ? "bg-amber-500 text-white shadow-amber-500/30" : "bg-emerald-500 text-white shadow-emerald-500/30")
                            : "bg-rose-500 text-white shadow-rose-500/30"
                    )}>
                        {isIncome ? (
                            isFullDue ? <Clock size={16} strokeWidth={2.5} /> : <ArrowDownLeft size={18} strokeWidth={2.5} />
                        ) : (
                            <ArrowUpRight size={18} strokeWidth={2.5} />
                        )}
                    </div>
                    
                    <div className="min-w-0 flex-1 pt-0.5">
                        
                        {/* Title & Customer Type Badge */}
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-0.5 leading-none">
                            <h4 className="text-[13px] sm:text-[15px] font-black text-slate-900 truncate max-w-[150px] sm:max-w-[200px]">
                                {entityName}
                            </h4>
                            {transaction.customerType && (
                                <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-slate-200 text-slate-600 tracking-wider">
                                    {transaction.customerType}
                                </span>
                            )}
                        </div>

                        {/* Transactor Info */}
                        <div className="flex items-center gap-1.5 mb-1.5 opacity-80">
                            <User size={10} className="text-slate-400" />
                            <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 truncate max-w-[120px]">{staffName}</span>
                            <span className={cn("text-[7px] font-black uppercase px-1 py-0.5 rounded tracking-widest", roleColors[staffRole] || "bg-slate-200 text-slate-600")}>
                                {staffRole}
                            </span>
                        </div>

                        {/* Date & Sub Entity */}
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                             <span>{format(new Date(transaction.createdAt), 'MMM dd, hh:mm a')}</span>
                             {subEntity && (
                                <>
                                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                                    <span className="truncate max-w-[100px]">{subEntity}</span>
                                </>
                             )}
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDE: Price, Status Badges & Actions */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center w-full sm:w-auto border-t sm:border-none border-slate-200/50 pt-2 sm:pt-0 mt-1 sm:mt-0">
                    
                    {/* Price & Badges */}
                    <div className="flex flex-col items-start sm:items-end">
                        <div className={cn(
                            "text-xl sm:text-2xl font-black leading-none tracking-tighter mb-1",
                            isIncome 
                                ? (isFullDue ? "text-orange-600" : hasDue ? "text-amber-600" : "text-emerald-600")
                                : "text-rose-600"
                        )}>
                            ৳{transaction.finalAmount.toLocaleString()}
                        </div>
                        
                        {/* Unified Status Badges */}
                        <div className="flex items-center gap-1 flex-wrap">
                            <span className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                {transaction.type === 'SALE' ? (isFullDue ? 'Full Due' : hasDue ? 'Partial' : 'Paid') : 
                                 transaction.type === 'EXPENSE' ? 'Expense' : transaction.type}
                            </span>

                            {(!isIncome || transaction.type === 'EXPENSE') && (transaction.dueAmount !== undefined) && (
                                <div className="flex gap-1 items-center ml-1 border-l border-slate-200 pl-1">
                                    {(transaction.paidAmount > 0 || transaction.dueAmount === 0) && (
                                        <span className="text-[8px] text-emerald-600 font-bold bg-emerald-100 px-1 py-0.5 rounded">Paid: ৳{transaction.paidAmount.toLocaleString()}</span>
                                    )}
                                    {transaction.dueAmount > 0 && (
                                        <span className="text-[8px] text-amber-600 font-bold bg-amber-100 px-1 py-0.5 rounded">Due: ৳{transaction.dueAmount.toLocaleString()}</span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons (Moved to far right on mobile via justify-between on parent) */}
                    <div className="flex items-center gap-1.5 sm:mt-2">
                        <Button 
                            onClick={(e) => { e.stopPropagation(); onClick?.(); }}
                            variant="outline" 
                            size="icon"
                            className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg border-slate-200 bg-white hover:bg-slate-900 hover:border-slate-900 hover:text-white transition-all shadow-sm"
                            title="View Details"
                        >
                            <FileText size={14} />
                        </Button>

                        {transaction.receiptUrl && (
                            <Button 
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg border-rose-200 bg-rose-50 flex items-center justify-center hover:bg-rose-100 transition-all shadow-sm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsReceiptOpen(true);
                                }}
                                title="View Receipt"
                            >
                                <Eye size={14} className="text-rose-600" />
                            </Button>
                        )}
                    </div>
                </div>

                <ReceiptPreviewModal 
                    isOpen={isReceiptOpen}
                    onClose={() => setIsReceiptOpen(false)}
                    imageUrl={transaction.receiptUrl}
                    title={`Receipt: ${transaction.invoiceNumber}`}
                />
            </div>
        </div>
    );
};