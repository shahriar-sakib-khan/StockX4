import { useState } from 'react';
import { useVehicle } from '@/features/vehicle/hooks/useVehicles';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/Modal';
import { VehicleForm } from '@/features/vehicle/components/VehicleForm';
import { CardDescription } from '@/components/ui/card';
import { Phone, User, ReceiptText, Banknote, Edit, Calendar, Fuel, Wrench, Truck } from 'lucide-react';
import { format } from 'date-fns';
import { useTransactions } from '@/features/transaction/api/transaction.api';
import { AddVehicleExpenseModal } from './AddVehicleExpenseModal';
import { useParams } from 'react-router-dom';
import { Receipt } from '@/features/transaction/components/Receipt';

interface VehicleDetailsProps {
    vehicleId: string;
    isOpen: boolean;
    onClose: () => void;
}

export const VehicleDetails = ({ vehicleId, isOpen, onClose }: VehicleDetailsProps) => {
    const { id: storeId } = useParams<{ id: string }>();
    const safeStoreId = storeId || '';
    const { data: vehicle, isLoading: isVehicleLoading } = useVehicle(vehicleId);
    const { data: transactionsData, isLoading: isHistoryLoading } = useTransactions(safeStoreId, { customerId: vehicleId });
    const transactions = transactionsData?.data || [];

    const [isEditOpen, setIsEditOpen] = useState(false);
    const [expenseModalOpen, setExpenseModalOpen] = useState(false);
    const [expenseType, setExpenseType] = useState<'FUEL' | 'REPAIR'>('FUEL');
    const [selectedTransaction, setSelectedTransaction] = useState<any>(null);

    const openExpenseModal = (type: 'FUEL' | 'REPAIR') => {
        setExpenseType(type);
        setExpenseModalOpen(true);
    };

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={vehicle?.licensePlate || 'Vehicle Details'} className="max-w-4xl h-[90vh]">
            {isVehicleLoading ? (
                <div className="p-8 text-center">Loading vehicle details...</div>
            ) : vehicle ? (
                <div className="flex flex-col h-full">
                    {/* Header Section */}
                    <div className="p-6 border-b bg-muted/10 flex justify-between items-start">
                        <div className="flex gap-4">
                            <div className="w-24 h-24 bg-slate-100 rounded-xl overflow-hidden border flex items-center justify-center">
                                {vehicle.imageUrl ? (
                                    <img src={vehicle.imageUrl} alt={vehicle.licensePlate} className="w-full h-full object-cover" />
                                ) : (
                                    <Truck className="w-10 h-10 text-muted-foreground/50" />
                                )}
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold flex items-center gap-2">
                                    {vehicle.licensePlate}
                                    <span className="text-sm font-normal text-muted-foreground bg-slate-100 px-2 py-0.5 rounded-full">
                                        {vehicle.vehicleModel || 'Model N/A'}
                                    </span>
                                </h2>
                                <CardDescription className="mt-2 flex flex-col gap-1">
                                    <div className="flex items-center gap-2">
                                        <User className="w-4 h-4" /> Driver: {vehicle.driverName || 'N/A'}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Phone className="w-4 h-4" /> {vehicle.driverPhone || 'N/A'}
                                    </div>
                                </CardDescription>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => setIsEditOpen(true)}>
                                <Edit className="w-4 h-4 mr-2" /> Edit Details
                            </Button>
                            <Button size="sm" className="bg-yellow-500 hover:bg-yellow-600 text-white" onClick={() => openExpenseModal('FUEL')}>
                                <Fuel className="w-4 h-4 mr-2" /> Fuel
                            </Button>
                            <Button size="sm" className="bg-red-500 hover:bg-red-600 text-white" onClick={() => openExpenseModal('REPAIR')}>
                                <Wrench className="w-4 h-4 mr-2" /> Repair
                            </Button>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="flex-1 overflow-auto p-6 bg-slate-50">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <ReceiptText className="w-5 h-5 text-muted-foreground" />
                            Expense History
                        </h3>

                        {isHistoryLoading ? (
                            <div>Loading history...</div>
                        ) : transactions.length === 0 ? (
                            <div className="text-center py-10 text-muted-foreground bg-white rounded-lg border border-dashed">
                                No expenses recorded.
                            </div>
                        ) : (
                            <div className="bg-white rounded-lg border shadow-sm">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-muted/50 text-muted-foreground font-medium border-b">
                                        <tr>
                                            <th className="p-3">Date</th>
                                            <th className="p-3">Type</th>
                                            <th className="p-3 text-right">Amount</th>
                                            <th className="p-3 text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {transactions.map((tx: any) => {
                                            const item = tx.items?.[0]; // Usually expense tx has 1 items
                                            const type = item?.type || 'EXPENSE';
                                            return (
                                                <tr
                                                    key={tx._id}
                                                    className="hover:bg-slate-50/50 cursor-pointer"
                                                    onClick={() => setSelectedTransaction(tx)}
                                                >
                                                    <td className="p-3">
                                                        <div className="flex items-center gap-2">
                                                            <Calendar className="w-3 h-3 text-muted-foreground" />
                                                            {format(new Date(tx.createdAt), 'dd MMM yyyy, HH:mm')}
                                                        </div>
                                                    </td>
                                                    <td className="p-3">
                                                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold border flex items-center w-fit gap-1 ${
                                                            type === 'FUEL' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                                            type === 'REPAIR' ? 'bg-red-50 text-red-700 border-red-200' :
                                                            'bg-slate-50 text-slate-700 border-slate-200'
                                                        }`}>
                                                            {type === 'FUEL' && <Fuel className="w-3 h-3" />}
                                                            {type === 'REPAIR' && <Wrench className="w-3 h-3" />}
                                                            {type}
                                                        </span>
                                                        {item?.description && (
                                                            <div className="text-[10px] text-muted-foreground mt-0.5 truncate max-w-[150px]">
                                                                {item.description}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="p-3 text-right font-semibold">৳{tx.finalAmount}</td>
                                                    <td className="p-3 text-center">
                                                        <Button variant="ghost" size="sm" onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedTransaction(tx);
                                                        }}>
                                                            View
                                                        </Button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="p-8 text-center text-red-500">Vehicle not found</div>
            )}

            {/* Edit Modal */}
            <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Vehicle">
                <VehicleForm initialData={vehicle} onSuccess={() => setIsEditOpen(false)} />
            </Modal>

            {/* Add Expense Modal */}
            <AddVehicleExpenseModal
                vehicleId={vehicleId}
                initialType={expenseType}
                isOpen={expenseModalOpen}
                onClose={() => setExpenseModalOpen(false)}
            />

             {/* Receipt Viewer */}
             <Modal isOpen={!!selectedTransaction} onClose={() => setSelectedTransaction(null)} title="Expense Receipt" className="max-w-4xl">
                {selectedTransaction && (
                    <div className="flex justify-center p-4 bg-slate-100 rounded-lg overflow-auto">
                        <Receipt transaction={selectedTransaction} storeName={'Store'} />
                    </div>
                )}
            </Modal>
        </Modal>
    );
};
