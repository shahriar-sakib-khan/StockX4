import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { transactionApi } from '@/features/pos/api/transaction.api';

interface AddVehicleExpenseModalProps {
    vehicleId: string | null;
    initialType?: 'FUEL' | 'REPAIR';
    isOpen: boolean;
    onClose: () => void;
}

export const AddVehicleExpenseModal = ({ vehicleId, initialType = 'FUEL', isOpen, onClose }: AddVehicleExpenseModalProps) => {
    const { id: storeId } = useParams<{ id: string }>();
    const safeStoreId = storeId || '';

    const [expenseAmount, setExpenseAmount] = useState('');
    const [expenseType, setExpenseType] = useState<'FUEL' | 'REPAIR'>(initialType);
    const [expenseDescription, setExpenseDescription] = useState('');

    useEffect(() => {
        if (isOpen) {
            setExpenseType(initialType);
            setExpenseAmount('');
            setExpenseDescription('');
        }
    }, [isOpen, initialType]);

    const queryClient = useQueryClient();

    const addExpenseMutation = useMutation({
        mutationFn: async () => {
            if (!vehicleId || !safeStoreId) return;
            return transactionApi.create(safeStoreId, {
                customerId: vehicleId,
                customerType: 'Vehicle',
                items: [{
                    productId: '000000000000000000000000',
                    type: expenseType,
                    quantity: 1,
                    unitPrice: parseFloat(expenseAmount),
                    name: `${expenseType} Expense`,
                    description: expenseDescription
                }],
                paymentMethod: 'CASH',
                type: 'EXPENSE',
                paidAmount: parseFloat(expenseAmount),
                finalAmount: parseFloat(expenseAmount)
            });
        },
        onSuccess: () => {
            toast.success('Expense recorded');
            setExpenseAmount('');
            setExpenseDescription('');
            queryClient.invalidateQueries({ queryKey: ['transactions', safeStoreId] });
            onClose();
        },
        onError: (err: any) => toast.error('Failed to record expense: ' + err.message)
    });

    const handleAddExpense = () => {
        const amount = parseFloat(expenseAmount);
        if (isNaN(amount) || amount <= 0) {
            toast.error('Invalid amount');
            return;
        }
        addExpenseMutation.mutate();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="" className="max-w-md p-0 overflow-hidden border-none rounded-[2rem] bg-white shadow-2xl">
            <div className="bg-slate-900 p-6 sm:p-8 text-white relative h-24 sm:h-32 flex items-center overflow-hidden">
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-48 h-48 bg-indigo-500/20 rounded-full blur-2xl" />
                <div className="relative z-10 w-full">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300 mb-1 block">Expense Entry</span>
                    <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight leading-none">Record Vehicle Cost</h2>
                </div>
            </div>

            <div className="p-6 sm:p-8 space-y-4 sm:space-y-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Expense Category</label>
                    <Select value={expenseType} onValueChange={(v: any) => setExpenseType(v)}>
                        <SelectTrigger className="h-12 sm:h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-slate-700 hover:border-indigo-200 transition-all focus:ring-indigo-500/20">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-2 border-slate-100 shadow-xl">
                            <SelectItem value="FUEL" className="font-black text-slate-700 focus:bg-indigo-50 focus:text-indigo-700 h-12 rounded-xl cursor-pointer">Fuel Refill</SelectItem>
                            <SelectItem value="REPAIR" className="font-black text-slate-700 focus:bg-rose-50 focus:text-rose-700 h-12 rounded-xl cursor-pointer">Maintenance / Repair</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Paid Amount (৳)</label>
                    <div className="relative group">
                         <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-black text-slate-400 group-focus-within:text-emerald-500 transition-colors">৳</span>
                         <Input
                            type="number"
                            value={expenseAmount}
                            onChange={(e) => setExpenseAmount(e.target.value)}
                            placeholder="0.00"
                            className="h-12 sm:h-14 pl-10 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-lg sm:text-xl text-slate-900 hover:border-emerald-200 focus:border-emerald-500 focus:bg-white transition-all focus:ring-4 focus:ring-emerald-500/10 placeholder:text-slate-300"
                            autoFocus
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Notes / Description (Optional)</label>
                     <Input
                        value={expenseDescription}
                        onChange={(e) => setExpenseDescription(e.target.value)}
                        placeholder="e.g. 20 Liters Diesel or Engine Oil Change"
                        className="h-12 sm:h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-slate-700 hover:border-slate-200 focus:border-indigo-500 focus:bg-white transition-all focus:ring-4 focus:ring-indigo-500/10 placeholder:text-slate-300"
                    />
                </div>

                <div className="pt-2 sm:pt-4 flex flex-col gap-3">
                    <Button 
                        onClick={handleAddExpense} 
                        disabled={addExpenseMutation.isPending}
                        className="h-14 sm:h-16 bg-slate-900 hover:bg-black text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-slate-200 active:scale-[0.98] transition-all disabled:opacity-50 text-xs"
                    >
                        {addExpenseMutation.isPending ? (
                            <div className="flex items-center gap-2">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Recording...</span>
                            </div>
                        ) : 'Confirm Payment'}
                    </Button>
                    <Button 
                        variant="ghost" 
                        onClick={onClose}
                        className="h-10 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 hover:text-slate-600 rounded-xl"
                    >
                        Cancel Entry
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
