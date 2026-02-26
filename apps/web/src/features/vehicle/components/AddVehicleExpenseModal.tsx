import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { transactionApi } from '@/features/transaction/api/transaction.api';

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
        <Modal isOpen={isOpen} onClose={onClose} title="Add Vehicle Expense">
            <div className="space-y-4 py-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Expense Type</label>
                    <Select value={expenseType} onValueChange={(v: any) => setExpenseType(v)}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="FUEL">Fuel</SelectItem>
                            <SelectItem value="REPAIR">Repair</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Amount (৳)</label>
                    <Input
                        type="number"
                        value={expenseAmount}
                        onChange={(e) => setExpenseAmount(e.target.value)}
                        placeholder="Enter amount..."
                        autoFocus
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Description (Optional)</label>
                    <Input
                        value={expenseDescription}
                        onChange={(e) => setExpenseDescription(e.target.value)}
                        placeholder="e.g. 20L Diesel or Tire Change"
                    />
                </div>
            </div>
            <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={onClose}>Cancel</Button>
                <Button onClick={handleAddExpense} disabled={addExpenseMutation.isPending}>
                    {addExpenseMutation.isPending ? 'Saving...' : 'Save Expense'}
                </Button>
            </div>
        </Modal>
    );
};
