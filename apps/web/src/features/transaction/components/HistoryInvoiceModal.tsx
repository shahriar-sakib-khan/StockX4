import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface HistoryInvoiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    transaction: any;
}

export const HistoryInvoiceModal = ({ isOpen, onClose, transaction }: HistoryInvoiceModalProps) => {
    if (!transaction) return null;

    const handlePrint = () => {
        window.print();
    };

    const customerName = transaction.customerId?.name || 'Walk-in Customer';
    const staffName = transaction.staffId?.name || 'Unknown Staff';

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Transaction Invoice" className="print:shadow-none print:border-none min-w-[50vw]">
            <div className="space-y-6 print:space-y-4 p-2 bg-white rounded-lg">
                <div className="text-center pb-4 border-b">
                    <h2 className="text-xl font-bold uppercase">{transaction.type === 'SALE' ? 'Sales Invoice' : transaction.type}</h2>
                    <p className="text-muted-foreground text-sm">#{transaction._id.toUpperCase()}</p>
                    <p className="text-muted-foreground text-sm">{format(new Date(transaction.createdAt), 'dd MMM yyyy, hh:mm a')}</p>
                </div>

                <div className="flex justify-between text-sm">
                    <div>
                        <span className="font-bold block text-slate-500 uppercase tracking-wider text-xs mb-1">Bill To / From</span>
                        <span className="font-medium text-lg text-slate-900">{customerName}</span>
                    </div>
                    <div className="text-right">
                        <span className="font-bold block text-slate-500 uppercase tracking-wider text-xs mb-1">Handled By</span>
                        <span className="font-medium text-slate-900">{staffName}</span>
                    </div>
                </div>

                <div className="border rounded-lg overflow-hidden mt-4">
                    <Table>
                        <TableHeader className="bg-slate-50">
                            <TableRow>
                                <TableHead>Item Details</TableHead>
                                <TableHead className="text-center">Qty</TableHead>
                                <TableHead className="text-right">Price</TableHead>
                                <TableHead className="text-right">Subtotal</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {transaction.items?.map((item: any, idx: number) => (
                                <TableRow key={idx}>
                                    <TableCell>
                                        <div className="font-medium">{item.name}</div>
                                        <div className="text-xs text-muted-foreground">{item.description || item.type}</div>
                                    </TableCell>
                                    <TableCell className="text-center">{item.quantity}</TableCell>
                                    <TableCell className="text-right">৳{item.unitPrice}</TableCell>
                                    <TableCell className="text-right font-bold">৳{item.subtotal}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                <div className="flex justify-end pt-4">
                    <div className="w-64 space-y-2">
                        <div className="flex justify-between text-sm text-slate-600">
                            <span>Total Amount</span>
                            <span>৳{transaction.totalAmount}</span>
                        </div>
                        {transaction.totalDiscount > 0 && (
                            <div className="flex justify-between text-sm text-amber-600">
                                <span>Discount</span>
                                <span>-৳{transaction.totalDiscount}</span>
                            </div>
                        )}
                         <div className="flex justify-between text-lg font-black text-slate-900 border-t pt-2">
                            <span>Final Amount</span>
                            <span>৳{transaction.finalAmount}</span>
                        </div>
                        <div className="flex justify-between text-sm text-emerald-600 pt-1">
                            <span>Paid</span>
                            <span>৳{transaction.paidAmount || 0}</span>
                        </div>
                         {transaction.dueAmount > 0 && (
                            <div className="flex justify-between text-sm font-bold text-rose-600">
                                <span>Due</span>
                                <span>৳{transaction.dueAmount}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t print:hidden">
                    <Button variant="outline" onClick={onClose}>Close</Button>
                    <Button onClick={handlePrint} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                        <Printer className="w-4 h-4 mr-2" />
                        Print Invoice
                    </Button>
                </div>
            </div>

            <style>
                {`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    div[role="dialog"] * {
                        visibility: visible;
                    }
                    div[role="dialog"] {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        margin: 0;
                        padding: 0;
                        box-shadow: none;
                        border: none;
                    }
                    button {
                        display: none !important;
                    }
                }
                `}
            </style>
        </Modal>
    );
};
