import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { transactionApi } from '@/features/pos/api/transaction.api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface PaySalaryModalProps {
    storeId: string;
    staff: any;
    onClose: () => void;
}

export const PaySalaryModal = ({ storeId, staff, onClose }: PaySalaryModalProps) => {
    const [amount, setAmount] = useState<string>(
        (staff.salaryDue && staff.salaryDue > 0 ? staff.salaryDue : staff.salary || 0).toString()
    );
    const [date, setDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
    const [note, setNote] = useState('');
    const [isBonus, setIsBonus] = useState(false);

    const queryClient = useQueryClient();

    const paySalaryMutation = useMutation({
        mutationFn: async () => {
            return transactionApi.create(storeId, {
                type: 'EXPENSE',
                items: [{
                    productId: staff._id,
                    type: 'ACCESSORY',
                    quantity: 1,
                    unitPrice: Number(amount),
                    name: isBonus ? `Bonus Payment - ${staff.name}` : `Salary Payment - ${staff.name}`,
                    description: note || (isBonus ? `Bonus payment` : `Salary payment for ${format(new Date(date), 'MMMM yyyy')}`)
                }],
                paymentMethod: 'CASH', // Default to cash for now
                finalAmount: Number(amount),
                paidAmount: Number(amount),
            });
        },
        onSuccess: () => {
            toast.success(`${isBonus ? 'Bonus' : 'Salary'} paid to ${staff.name}`);
            queryClient.invalidateQueries({ queryKey: ['transactions', storeId] });
            onClose();
        },
        onError: (error: any) => {
            toast.error('Failed to pay salary');
            console.error(error);
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        paySalaryMutation.mutate();
    };

    return (
        <Modal isOpen={true} onClose={onClose} title={`Pay Salary: ${staff.name}`}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="p-4 sm:p-5 bg-emerald-50 border-2 border-emerald-100 rounded-2xl flex justify-between items-center shadow-sm">
                    <div className="space-y-0.5">
                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest leading-none">Monthly Salary</span>
                        <p className="text-xs text-emerald-500 font-bold">Standard rate for {staff.name}</p>
                    </div>
                    <span className="font-black text-2xl text-emerald-700">৳{staff.salary || 0}</span>
                </div>

                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border-2 border-slate-100">
                    <input
                        type="checkbox"
                        id="bonus"
                        checked={isBonus}
                        onChange={(e) => setIsBonus(e.target.checked)}
                        className="h-5 w-5 rounded-lg border-2 border-slate-300 text-indigo-600 focus:ring-indigo-500 transition-all cursor-pointer"
                    />
                    <div className="flex-1 cursor-pointer select-none" onClick={() => setIsBonus(!isBonus)}>
                        <label htmlFor="bonus" className="text-sm font-black text-slate-700 block uppercase tracking-tight cursor-pointer">
                            Bonus Payment
                        </label>
                        <p className="text-[10px] text-slate-400 font-bold leading-none mt-0.5">Does not affect salary due records</p>
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none ml-1">Payment Amount (৳)</label>
                    <Input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                        min="1"
                        className="h-12 sm:h-14 rounded-2xl border-2 border-slate-100 focus:border-indigo-500 font-bold text-slate-700 transition-all px-5"
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none ml-1">Payment Date</label>
                    <Input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                        className="h-12 sm:h-14 rounded-2xl border-2 border-slate-100 focus:border-indigo-500 font-bold text-slate-700 transition-all px-5"
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none ml-1">Transaction Note</label>
                    <Input
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="e.g. Salary + Eid Bonus"
                        className="h-12 sm:h-14 rounded-2xl border-2 border-slate-100 focus:border-indigo-500 font-bold text-slate-700 transition-all px-5"
                    />
                </div>

                <Button
                    type="submit"
                    className="w-full h-14 bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 rounded-2xl font-black uppercase tracking-widest text-xs mt-4 active:scale-[0.98]"
                    disabled={paySalaryMutation.isPending}
                >
                    {paySalaryMutation.isPending ? 'Processing Payment...' : 'Confirm Disburse'}
                </Button>
            </form>
        </Modal>
    );
};
