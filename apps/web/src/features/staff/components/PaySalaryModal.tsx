import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { transactionApi } from '@/features/transaction/api/transaction.api';
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
                <div className="p-4 bg-muted/30 rounded-lg flex justify-between items-center">
                    <span className="text-sm font-medium">Base Salary</span>
                    <span className="font-bold text-lg">৳{staff.salary || 0}</span>
                </div>

                <div className="flex items-center space-x-2 bg-slate-100 p-3 rounded-md">
                    <input
                        type="checkbox"
                        id="bonus"
                        checked={isBonus}
                        onChange={(e) => setIsBonus(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary accent-primary"
                    />
                    <label htmlFor="bonus" className="text-sm font-medium leading-none cursor-pointer select-none">
                        Bonus Pay <span className="text-xs font-normal text-muted-foreground ml-1">(Does not affect Due Salary)</span>
                    </label>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Payment Amount</label>
                    <Input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                        min="1"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Date</label>
                    <Input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Note (Optional)</label>
                    <Input
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="e.g. Bonus included"
                    />
                </div>

                <Button
                    type="submit"
                    className="w-full mt-4"
                    disabled={paySalaryMutation.isPending}
                >
                    {paySalaryMutation.isPending ? 'Processing...' : 'Confirm Payment'}
                </Button>
            </form>
        </Modal>
    );
};
