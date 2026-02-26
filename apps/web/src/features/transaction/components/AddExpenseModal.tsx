import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { transactionApi } from '@/features/transaction/api/transaction.api';

interface AddExpenseModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const AddExpenseModal = ({ isOpen, onClose }: AddExpenseModalProps) => {
    const { id: storeId } = useParams<{ id: string }>();
    const safeStoreId = storeId || '';

    const [expenseAmount, setExpenseAmount] = useState('');
    const [expenseCategory, setExpenseCategory] = useState('');
    const [expenseDescription, setExpenseDescription] = useState('');

    useEffect(() => {
        if (isOpen) {
            setExpenseAmount('');
            setExpenseCategory('');
            setExpenseDescription('');
        }
    }, [isOpen]);

    const queryClient = useQueryClient();

    const addExpenseMutation = useMutation({
        mutationFn: async () => {
            if (!safeStoreId) return;
            return transactionApi.create(safeStoreId, {
                type: 'EXPENSE',
                paymentMethod: 'CASH',
                paidAmount: parseFloat(expenseAmount),
                finalAmount: parseFloat(expenseAmount),
                items: [{
                    productId: '000000000000000000000000', // Dummy ID for general expense
                    type: 'GENERAL_EXPENSE',
                    quantity: 1,
                    unitPrice: parseFloat(expenseAmount),
                    name: expenseCategory || 'General Expense',
                    description: expenseDescription
                }],
            });
        },
        onSuccess: () => {
            toast.success('Expense recorded successfully');
            queryClient.invalidateQueries({ queryKey: ['history', safeStoreId] });
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
        if (!expenseCategory.trim()) {
             toast.error('Please enter an expense category or title');
             return;
        }
        addExpenseMutation.mutate();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add New Expense">
            <div className="space-y-4 py-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Expense Category / Title</label>
                    <Input
                        value={expenseCategory}
                        onChange={(e) => setExpenseCategory(e.target.value)}
                        placeholder="e.g. Electricity Bill, Shop Rent, Snacks"
                        autoFocus
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Amount (৳)</label>
                    <Input
                        type="number"
                        value={expenseAmount}
                        onChange={(e) => setExpenseAmount(e.target.value)}
                        placeholder="Enter amount..."
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Description (Optional)</label>
                    <Input
                        value={expenseDescription}
                        onChange={(e) => setExpenseDescription(e.target.value)}
                        placeholder="Additional details..."
                    />
                </div>
            </div>
            <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={onClose}>Cancel</Button>
                <Button
                    onClick={handleAddExpense}
                    disabled={addExpenseMutation.isPending}
                    className="bg-expense hover:bg-expense/90 text-white"
                >
                    {addExpenseMutation.isPending ? 'Saving...' : 'Save Expense'}
                </Button>
            </div>
        </Modal>
    );
};
