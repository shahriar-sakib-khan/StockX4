import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { usePaySalary } from '../salary/hooks/useSalary';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Gift } from 'lucide-react';

interface PaySalaryModalProps {
    storeId: string;
    staff: {
        _id: string;
        name: string;
        salary: number;
        salaryDue: number;
    };
    onClose: () => void;
}

export const PaySalaryModal = ({ storeId, staff, onClose }: PaySalaryModalProps) => {
    const salaryAmount = staff.salaryDue > 0 ? staff.salaryDue : staff.salary || 0;
    const [payAmount, setPayAmount] = useState<string>(salaryAmount.toString());
    const [includeBonus, setIncludeBonus] = useState(false);
    const [bonusAmount, setBonusAmount] = useState('');
    const [bonusNote, setBonusNote] = useState('');

    const paySalary = usePaySalary();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        paySalary.mutate(
            {
                storeId,
                staffId: staff._id,
                data: {
                    amount: Number(payAmount),
                    bonusAmount: includeBonus && bonusAmount ? Number(bonusAmount) : undefined,
                    bonusNote: includeBonus && bonusNote ? bonusNote : undefined,
                    paymentMethod: 'CASH',
                },
            },
            { onSuccess: onClose }
        );
    };

    const totalPayout = Number(payAmount) + (includeBonus && bonusAmount ? Number(bonusAmount) : 0);

    return (
        <Modal 
            isOpen={true} 
            onClose={onClose} 
            title={`Pay Salary: ${staff.name}`}
            footer={
                <Button
                    form="pay-salary-form"
                    type="submit"
                    className="w-full h-12 sm:h-14 bg-emerald-500 hover:bg-emerald-600 text-white transition-all shadow-[0_4px_14px_-4px_rgba(16,185,129,0.4)] rounded-xl sm:rounded-2xl font-black uppercase tracking-widest text-[11px] sm:text-xs active:scale-[0.98]"
                    disabled={paySalary.isPending}
                >
                    {paySalary.isPending ? 'Processing...' : `PAY ৳${totalPayout.toLocaleString()}`}
                </Button>
            }
        >
            {/* THE FIX: Added max-h-[70vh] and overflow-y-auto to protect against mobile keyboard crush */}
            <form id="pay-salary-form" onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 max-h-[70vh] sm:max-h-[80vh] overflow-y-auto px-1 pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                
                {/* Monthly Salary Info */}
                <div className="p-3 sm:p-4 bg-indigo-50/80 border border-indigo-100/80 rounded-xl sm:rounded-2xl flex justify-between items-center shadow-sm">
                    <div className="space-y-0.5">
                        <span className="text-[9px] sm:text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-none">Monthly Salary</span>
                        <p className="text-[10px] sm:text-[11px] text-indigo-600 font-bold uppercase tracking-tight truncate max-w-[120px] sm:max-w-none">{staff.name}</p>
                    </div>
                    <span className="font-black text-lg sm:text-xl text-indigo-600">৳{(staff.salary || 0).toLocaleString()}</span>
                </div>

                {/* Salary Due / Advance Info */}
                {(staff.salaryDue || 0) !== 0 && (
                    <div className={cn(
                        "p-3 sm:p-4 rounded-xl sm:rounded-2xl border flex justify-between items-center shadow-sm",
                        staff.salaryDue > 0
                            ? "bg-rose-50/80 border-rose-100"
                            : "bg-emerald-50/80 border-emerald-100"
                    )}>
                        <span className={cn(
                            "text-[9px] sm:text-[10px] font-black uppercase tracking-widest",
                            staff.salaryDue > 0 ? "text-rose-500" : "text-emerald-500"
                        )}>
                            {staff.salaryDue > 0 ? 'Salary Due' : 'Paid in Advance'}
                        </span>
                        <span className={cn(
                            "font-black text-lg sm:text-xl",
                            staff.salaryDue > 0 ? "text-rose-600" : "text-emerald-600"
                        )}>
                            ৳{Math.abs(staff.salaryDue).toLocaleString()}
                        </span>
                    </div>
                )}

                {/* Salary Payment Amount (Editable) */}
                <div className="space-y-1 sm:space-y-1.5 pt-1">
                    <label className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none ml-1">
                        Salary Payment (৳)
                    </label>
                    <Input
                        type="number"
                        value={payAmount}
                        onChange={(e) => setPayAmount(e.target.value)}
                        min="0"
                        className="h-11 sm:h-14 rounded-xl sm:rounded-2xl border-2 border-slate-200 focus:border-indigo-500 font-bold text-slate-800 transition-all px-4 sm:px-5 text-base sm:text-lg bg-white shadow-sm"
                    />
                    <p className="text-[9px] sm:text-[10px] text-slate-400 font-bold ml-1 pt-0.5">
                        Paying this amount reduces the salary due.
                    </p>
                </div>

                {/* Payment Date (read-only) */}
                <div className="space-y-1 sm:space-y-1.5 pt-1">
                    <label className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none ml-1">Payment Date</label>
                    <div className="h-11 sm:h-14 rounded-xl sm:rounded-2xl border-2 border-slate-100 bg-slate-50 font-black uppercase tracking-widest text-slate-500 px-4 sm:px-5 flex items-center text-[10px] sm:text-[11px]">
                        {format(new Date(), 'dd MMMM yyyy')}
                    </div>
                </div>

                {/* Bonus Toggle */}
                <div
                    className={cn(
                        "flex items-center gap-3 p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 cursor-pointer select-none transition-all mt-2 shadow-sm",
                        includeBonus
                            ? "bg-amber-50 border-amber-200"
                            : "bg-slate-50 border-slate-100 hover:border-slate-200"
                    )}
                    onClick={() => setIncludeBonus(!includeBonus)}
                >
                    <input
                        type="checkbox"
                        id="bonus"
                        checked={includeBonus}
                        onChange={(e) => setIncludeBonus(e.target.checked)}
                        className="h-4 w-4 sm:h-5 sm:w-5 rounded border-2 border-slate-300 text-amber-500 focus:ring-amber-500 transition-all cursor-pointer"
                        onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex-1">
                        <label htmlFor="bonus" className="text-[11px] sm:text-sm font-black text-slate-700 block uppercase tracking-tight cursor-pointer flex items-center gap-1.5 sm:gap-2">
                            <Gift className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500" />
                            Include Bonus
                        </label>
                        <p className="text-[8px] sm:text-[9px] text-slate-400 font-bold leading-none mt-1 sm:mt-0.5">
                            Additional bonus — does not affect salary due
                        </p>
                    </div>
                </div>

                {/* Bonus Fields (appear only when toggled) */}
                {includeBonus && (
                    <div className="space-y-3 sm:space-y-4 animate-in fade-in slide-in-from-top-2 duration-200 p-3 sm:p-4 bg-amber-50/50 rounded-xl sm:rounded-2xl border-2 border-amber-100 shadow-sm">
                        <div className="space-y-1 sm:space-y-1.5">
                            <label className="text-[9px] sm:text-[10px] font-black text-amber-600 uppercase tracking-widest leading-none ml-1">
                                Bonus Amount (৳)
                            </label>
                            <Input
                                type="number"
                                value={bonusAmount}
                                onChange={(e) => setBonusAmount(e.target.value)}
                                placeholder="e.g. 5000"
                                min="1"
                                className="h-11 sm:h-14 rounded-xl sm:rounded-2xl border-2 border-amber-200 focus:border-amber-400 font-bold text-slate-800 transition-all px-4 sm:px-5 bg-white text-sm sm:text-base"
                            />
                        </div>
                        <div className="space-y-1 sm:space-y-1.5">
                            <label className="text-[9px] sm:text-[10px] font-black text-amber-600 uppercase tracking-widest leading-none ml-1">
                                Bonus Note (Optional)
                            </label>
                            <Input
                                value={bonusNote}
                                onChange={(e) => setBonusNote(e.target.value)}
                                placeholder="e.g. Eid Bonus, Performance Reward"
                                className="h-11 sm:h-14 rounded-xl sm:rounded-2xl border-2 border-amber-200 focus:border-amber-400 font-bold text-slate-800 transition-all px-4 sm:px-5 bg-white text-xs sm:text-sm"
                            />
                        </div>
                    </div>
                )}

                {/* Total Payout Summary */}
                {includeBonus && bonusAmount && Number(bonusAmount) > 0 && (
                    <div className="p-4 sm:p-5 bg-slate-900 rounded-xl sm:rounded-2xl flex justify-between items-center shadow-lg animate-in fade-in slide-in-from-bottom-2 mt-2">
                        <span className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest">Total Payout</span>
                        <span className="font-black text-xl sm:text-2xl text-emerald-400">৳{totalPayout.toLocaleString()}</span>
                    </div>
                )}
            </form>
        </Modal>
    );
};