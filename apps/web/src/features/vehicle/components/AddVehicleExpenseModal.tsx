import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { Loader2, Fuel, Wrench, Receipt } from 'lucide-react';
import { transactionApi } from '@/features/pos/api/transaction.api';
import { cn } from '@/lib/utils';

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
                    name: `${expenseType === 'FUEL' ? 'Fuel' : 'Repair'} Expense`,
                    description: expenseDescription
                }],
                paymentMethod: 'CASH',
                type: 'EXPENSE',
                paidAmount: parseFloat(expenseAmount),
                finalAmount: parseFloat(expenseAmount)
            });
        },
        onSuccess: () => {
            toast.success('Expense recorded successfully');
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
            toast.error('Please enter a valid amount');
            return;
        }
        addExpenseMutation.mutate();
    };

    const isFuel = expenseType === 'FUEL';

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title="" 
            className="max-w-md p-0 overflow-hidden border-none rounded-2xl sm:rounded-3xl bg-white shadow-2xl"
        >
            {/* === DYNAMIC PREMIUM HEADER === */}
            <div className={cn(
                "px-6 pt-6 pb-4 sm:px-8 sm:pt-8 sm:pb-5 border-b flex flex-col items-center text-center transition-colors duration-300",
                isFuel ? "bg-amber-50/50 border-amber-100" : "bg-rose-50/50 border-rose-100"
            )}>
                <div className={cn(
                    "w-14 h-14 rounded-2xl border-4 border-white shadow-sm flex items-center justify-center mb-4 transition-colors duration-300",
                    isFuel ? "bg-amber-100 text-amber-600" : "bg-rose-100 text-rose-600"
                )}>
                    {isFuel ? <Fuel className="w-6 h-6" /> : <Wrench className="w-6 h-6" />}
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-none mb-1.5">
                    Record Vehicle Expense
                </h2>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                    Log a new payment entry
                </p>
            </div>

            {/* === FORM SECTION === */}
            <div className="p-6 sm:p-8 space-y-5">
                
                {/* Category Select */}
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 ml-1">Expense Category</label>
                    <Select value={expenseType} onValueChange={(v: any) => setExpenseType(v)}>
                        <SelectTrigger className="h-12 bg-white border border-slate-200 rounded-xl font-bold text-sm text-slate-700 hover:border-slate-300 transition-all focus:ring-4 focus:ring-slate-100 shadow-sm">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border border-slate-200 shadow-xl">
                            <SelectItem value="FUEL" className="font-bold text-sm text-slate-700 focus:bg-amber-50 focus:text-amber-700 h-11 rounded-lg cursor-pointer">
                                <div className="flex items-center gap-2"><Fuel className="w-4 h-4" /> Fuel Refill</div>
                            </SelectItem>
                            <SelectItem value="REPAIR" className="font-bold text-sm text-slate-700 focus:bg-rose-50 focus:text-rose-700 h-11 rounded-lg cursor-pointer">
                                <div className="flex items-center gap-2"><Wrench className="w-4 h-4" /> Maintenance / Repair</div>
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Amount Input */}
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 ml-1">Paid Amount (৳)</label>
                    <div className="relative group">
                         <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-400 group-focus-within:text-slate-900 transition-colors">৳</span>
                         <Input
                            type="number"
                            value={expenseAmount}
                            onChange={(e) => setExpenseAmount(e.target.value)}
                            placeholder="0.00"
                            className="h-14 pl-9 bg-white border border-slate-200 rounded-xl font-black text-xl text-slate-900 hover:border-slate-300 focus:border-slate-900 transition-all focus:ring-4 focus:ring-slate-100 shadow-sm placeholder:text-slate-300 placeholder:font-medium"
                            autoFocus
                        />
                    </div>
                </div>

                {/* Description Input */}
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 ml-1">Notes (Optional)</label>
                    <div className="relative group">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                            <Receipt className="w-4 h-4" />
                        </span>
                        <Input
                            value={expenseDescription}
                            onChange={(e) => setExpenseDescription(e.target.value)}
                            placeholder="e.g. 20 Liters Diesel"
                            className="h-12 pl-10 bg-white border border-slate-200 rounded-xl font-medium text-sm text-slate-700 hover:border-slate-300 focus:border-indigo-500 transition-all focus:ring-4 focus:ring-indigo-50 shadow-sm placeholder:text-slate-400"
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="pt-4 flex flex-col gap-2.5">
                    <Button 
                        onClick={handleAddExpense} 
                        disabled={addExpenseMutation.isPending}
                        className={cn(
                            "h-12 sm:h-14 text-white rounded-xl font-bold tracking-wide shadow-md active:scale-[0.98] transition-all disabled:opacity-50 text-sm",
                            isFuel ? "bg-amber-500 hover:bg-amber-600 shadow-amber-200" : "bg-rose-600 hover:bg-rose-700 shadow-rose-200"
                        )}
                    >
                        {addExpenseMutation.isPending ? (
                            <div className="flex items-center gap-2">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Recording...</span>
                            </div>
                        ) : (
                            `Confirm ${isFuel ? 'Fuel' : 'Repair'} Payment`
                        )}
                    </Button>
                    <Button 
                        variant="ghost" 
                        onClick={onClose}
                        className="h-11 text-xs font-bold text-slate-500 hover:bg-slate-50 hover:text-slate-700 rounded-xl"
                    >
                        Cancel
                    </Button>
                </div>
            </div>
        </Modal>
    );
};