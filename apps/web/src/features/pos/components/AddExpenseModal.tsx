import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { transactionApi } from '../api/transaction.api';
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '@/components/ui/select';
import { useStaffList } from '@/features/staff/hooks/useStaff';
import { useVehicles } from '@/features/vehicle/hooks/useVehicles';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { useStaffStore } from '@/features/staff/stores/staff.store';

interface AddExpenseModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const EXPENSE_CATEGORIES = [
    { label: 'Staff Salary', value: 'salary' },
    { label: 'Vehicle Fuel', value: 'vehicle_fuel' },
    { label: 'Vehicle Repair', value: 'vehicle_repair' },
    { label: 'Shop Rent', value: 'shop_rent' },
    { label: 'Utility Bill', value: 'utility' },
    { label: 'Other', value: 'other' },
];

export const AddExpenseModal = ({ isOpen, onClose }: AddExpenseModalProps) => {
    const { id: storeId } = useParams<{ id: string }>();
    const safeStoreId = storeId || '';
    const { user } = useAuthStore();
    const { staff } = useStaffStore();
    const currentUser = user || staff;

    const { data: staffData } = useStaffList(safeStoreId);
    const { data: vehicles } = useVehicles();

    const [expenseAmount, setExpenseAmount] = useState('');
    const [category, setCategory] = useState<string>('');
    const [customTitle, setCustomTitle] = useState('');
    const [selectedEntityId, setSelectedEntityId] = useState<string>('');
    const [expenseDescription, setExpenseDescription] = useState('');
    const [receiptUrl, setReceiptUrl] = useState('');

    const staffList = staffData?.staff || [];

    useEffect(() => {
        if (isOpen) {
            setExpenseAmount('');
            setCategory('');
            setCustomTitle('');
            setSelectedEntityId('');
            setExpenseDescription('');
            setReceiptUrl('');
        }
    }, [isOpen]);

    const isStaffCategory = category === 'salary';
    const isVehicleCategory = ['vehicle_fuel', 'vehicle_repair'].includes(category);

    const queryClient = useQueryClient();

    const addExpenseMutation = useMutation({
        mutationFn: async () => {
            if (!safeStoreId) return;
            
            let finalName = EXPENSE_CATEGORIES.find(c => c.value === category)?.label || 'General Expense';
            let productId = '000000000000000000000000'; // Dummy ID

            if (category === 'other' && customTitle) {
                finalName = customTitle;
            }

            if (isStaffCategory && selectedEntityId) {
                productId = selectedEntityId;
                const staff = staffList.find((s: any) => s._id === selectedEntityId);
                if (staff) finalName = `Salary - ${staff.name}`;
            }

            if (isVehicleCategory && selectedEntityId) {
                productId = selectedEntityId;
                const vehicle = vehicles?.find((v: any) => v._id === selectedEntityId);
                if (vehicle) {
                    const type = category === 'vehicle_fuel' ? 'Fuel' : 'Repair';
                    finalName = `Vehicle ${type} - ${vehicle.licensePlate}`;
                }
            }

            return transactionApi.create(safeStoreId, {
                type: 'EXPENSE',
                paymentMethod: 'CASH',
                paidAmount: parseFloat(expenseAmount),
                finalAmount: parseFloat(expenseAmount),
                items: [{
                    productId,
                    type: 'EXPENSE',
                    quantity: 1,
                    unitPrice: parseFloat(expenseAmount),
                    name: finalName,
                    description: expenseDescription,
                    category: category // Pass category for backend awareness
                }],
                transactorName: currentUser?.name,
                transactorRole: currentUser?.role,
                receiptUrl: receiptUrl || undefined
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
        if (!category) {
             toast.error('Please select a category');
             return;
        }
        if (category === 'other' && !customTitle.trim()) {
            toast.error('Please enter a title for the expense');
            return;
        }
        if (isStaffCategory && !selectedEntityId) {
            toast.error('Please select a staff member');
            return;
        }
        if (isVehicleCategory && !selectedEntityId) {
            toast.error('Please select a vehicle');
            return;
        }
        addExpenseMutation.mutate();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add New Expense">
            <div className="space-y-4 py-4">
                {/* Category Selection */}
                <div className="space-y-2">
                    <label className="text-sm font-bold uppercase text-slate-500">Expense Category</label>
                    <Select value={category} onValueChange={(val) => {
                        setCategory(val);
                        setSelectedEntityId(''); // Reset entity when category changes
                    }}>
                        <SelectTrigger className="font-black h-12 text-slate-700">
                            <SelectValue placeholder="Select Category" />
                        </SelectTrigger>
                        <SelectContent>
                            {EXPENSE_CATEGORIES.map((cat) => (
                                <SelectItem key={cat.value} value={cat.value} className="font-bold">
                                    {cat.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Conditional Shop Staff Picker */}
                {isStaffCategory && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                        <label className="text-sm font-bold uppercase text-slate-500">Select Staff</label>
                        <Select value={selectedEntityId} onValueChange={setSelectedEntityId}>
                            <SelectTrigger className="font-black h-12 border-blue-200 bg-blue-50/10">
                                <SelectValue placeholder="Select Staff Member" />
                            </SelectTrigger>
                            <SelectContent>
                                {staffList.map((staff: any) => (
                                    <SelectItem key={staff._id} value={staff._id} className="font-bold">
                                        {staff.name} ({staff.role})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                {/* Conditional Vehicle Picker */}
                {isVehicleCategory && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                        <label className="text-sm font-bold uppercase text-slate-500">Select Vehicle</label>
                        <Select value={selectedEntityId} onValueChange={setSelectedEntityId}>
                            <SelectTrigger className="font-black h-12 border-orange-200 bg-orange-50/10">
                                <SelectValue placeholder="Select Vehicle" />
                            </SelectTrigger>
                            <SelectContent>
                                {vehicles?.map((vehicle: any) => (
                                    <SelectItem key={vehicle._id} value={vehicle._id} className="font-bold">
                                        {vehicle.licensePlate} {vehicle.vehicleModel ? `- ${vehicle.vehicleModel}` : ''}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                {/* Custom Title for OTHER */}
                {category === 'other' && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                        <label className="text-sm font-bold uppercase text-slate-500">Expense Title</label>
                        <Input
                            value={customTitle}
                            onChange={(e) => setCustomTitle(e.target.value)}
                            placeholder="Enter expense title..."
                            className="font-black h-12 border-2 border-slate-100"
                        />
                    </div>
                )}

                <div className="space-y-2">
                    <label className="text-sm font-bold uppercase text-slate-500">Amount (৳)</label>
                    <Input
                        type="number"
                        value={expenseAmount}
                        onChange={(e) => setExpenseAmount(e.target.value)}
                        placeholder="0.00"
                        className="font-black text-2xl h-14 text-rose-600 bg-rose-50/20 border-rose-100 rounded-xl"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold uppercase text-slate-500">Description (Optional)</label>
                    <Input
                        value={expenseDescription}
                        onChange={(e) => setExpenseDescription(e.target.value)}
                        placeholder="Additional details..."
                        className="font-bold h-12 text-slate-600"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold uppercase text-slate-500">Receipt / Invoice (Optional)</label>
                    <ImageUpload 
                        value={receiptUrl}
                        onChange={setReceiptUrl}
                        className="bg-slate-50 p-4 rounded-xl border border-dashed border-slate-200"
                    />
                </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <Button variant="outline" onClick={onClose} className="font-bold">Cancel</Button>
                <Button
                    onClick={handleAddExpense}
                    disabled={addExpenseMutation.isPending}
                    className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-black h-14 text-lg transition-all active:scale-95 shadow-xl shadow-rose-200 rounded-2xl uppercase tracking-widest"
                >
                    {addExpenseMutation.isPending ? 'Saving...' : 'Save Expense'}
                </Button>
            </div>
        </Modal>
    );
};
