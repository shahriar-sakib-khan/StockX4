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

    const staffName = transaction.staffId?.name || transaction.transactorName || (transaction.staffId ? 'Unknown Staff' : 'System');
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
                "p-2 sm:p-3 rounded-xl sm:rounded-2xl border transition-all group hover:shadow-md cursor-pointer active:scale-[0.99] select-none",
                getBgColor()
            )}
        >
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-2 min-w-0 flex-1">
                    <div className={cn(
                        "h-8 w-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-105 mt-1",
                        isIncome 
                            ? (isFullDue ? "bg-orange-500 text-white" : hasDue ? "bg-amber-500 text-white" : "bg-emerald-500 text-white")
                            : "bg-rose-500 text-white"
                    )}>
                        {isIncome ? (
                            isFullDue ? <Clock size={12} /> : <ArrowDownLeft size={12} />
                        ) : (
                            <ArrowUpRight size={12} />
                        )}
                    </div>
                    
                    <div className="min-w-0 flex-1">
                        {/* Line 1: Entity Name & Type Badge */}
                        <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-base sm:text-lg font-black text-slate-900 leading-tight truncate">
                                {entityName}
                            </h4>
                            {transaction.customerType && (
                                <Badge variant="secondary" className="text-[7px] sm:text-[8px] font-black uppercase px-1.5 h-4 bg-slate-200 text-slate-600 border-none">
                                    {transaction.customerType}
                                </Badge>
                            )}
                        </div>

                        {/* Line 2: Transactor (By: ...) */}
                        <div className="flex items-center gap-1.5 mb-1 opacity-90">
                            <span className="text-[10px] sm:text-xs font-black text-slate-600">By: {staffName}</span>
                            <Badge variant="outline" className={cn("text-[7px] sm:text-[8px] font-bold uppercase px-1 h-3.5 sm:h-4 tracking-tighter border-none shadow-none rounded opacity-80", roleColors[staffRole] || "bg-slate-100")}>
                                {staffRole}
                            </Badge>
                        </div>

                        {/* Line 3: Timestamp & Sub-details */}
                        <div className="flex items-center gap-2 opacity-60">
                             <span className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-tight">
                                {format(new Date(transaction.createdAt), 'MMM dd, hh:mm a')}
                            </span>
                            {subEntity && (
                                <span className="text-[8px] sm:text-[9px] font-bold text-slate-500 border-l border-slate-300 pl-2 leading-none truncate">
                                    {subEntity}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                    <div className="flex flex-col items-end">
                        <div className={cn(
                            "text-xl sm:text-3xl font-black leading-none tracking-tighter",
                            isIncome 
                                ? (isFullDue ? "text-orange-600" : hasDue ? "text-amber-600" : "text-emerald-600")
                                : "text-rose-600"
                        )}>
                            ৳{transaction.finalAmount.toLocaleString()}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                            <span className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-wider">
                                {transaction.type === 'SALE' ? (isFullDue ? 'Full Due' : hasDue ? 'Partial' : 'Paid') : 
                                 transaction.type === 'EXPENSE' ? 'Expense' : transaction.type}
                            </span>
                        </div>
                        {(!isIncome || transaction.type === 'EXPENSE') && (transaction.dueAmount !== undefined) && (
                            <div className="flex gap-2 mt-0.5 justify-end w-full">
                                {(transaction.paidAmount > 0 || transaction.dueAmount === 0) && <span className="text-[8px] sm:text-[9px] text-emerald-600 font-bold bg-emerald-50 px-1 rounded">Paid: ৳{transaction.paidAmount.toLocaleString()}</span>}
                                {transaction.dueAmount > 0 && <span className="text-[8px] sm:text-[9px] text-amber-600 font-bold bg-amber-50 px-1 rounded">Due: ৳{transaction.dueAmount.toLocaleString()}</span>}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                         <Button 
                            onClick={(e) => { e.stopPropagation(); onClick?.(); }}
                            variant="outline" 
                            size="sm"
                            className="h-10 px-2 rounded-xl border-slate-200 hover:bg-slate-900 hover:text-white transition-all group/btn active:scale-90 flex flex-col items-center justify-center"
                        >
                            <FileText size={12} />
                            <span className="text-[8px] font-black opacity-50">{transaction.invoiceNumber?.slice(-6) || 'INV'}</span>
                        </Button>

                        {transaction.receiptUrl && (
                            <Button 
                                variant="outline"
                                className="h-10 w-10 rounded-xl border border-rose-200 bg-rose-50 flex items-center justify-center hover:bg-rose-100 transition-all"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsReceiptOpen(true);
                                }}
                            >
                                <Eye size={16} className="text-rose-600" />
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
