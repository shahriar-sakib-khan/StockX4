import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CartItem } from '@/features/inventory/pages/InventoryPage';
import { useUpdateInventory } from '../hooks/useCylinders';
import { useUpdateProduct } from '@/features/product/hooks/useProducts';
import { toast } from 'sonner';
import { Loader2, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface InvoiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    cartItems: CartItem[];
    onClearCart: () => void;
    storeId: string;
}

export const InvoiceModal = ({ isOpen, onClose, cartItems, onClearCart, storeId }: InvoiceModalProps) => {
    const updateInventory = useUpdateInventory();
    const updateProduct = useUpdateProduct();
    const [isProcessing, setIsProcessing] = useState(false);

    const grandTotal = cartItems.reduce((sum, item) => sum + item.totalAmount, 0);

    const handleConfirmPurchase = async () => {
        setIsProcessing(true);
        try {
            // Process purchase for each item
            // sequential for now to avoid race conditions or complexities,
            // ideal would be a single batch transaction API endpoint.
            for (const cartItem of cartItems) {
                if (cartItem.purchaseType === 'product') {
                    // Handle Product Update
                    const newStock = (cartItem.item.stock || 0) + cartItem.quantity;

                    await updateProduct.mutateAsync({
                        productId: cartItem.item._id,
                        data: {
                            stock: newStock,
                            costPrice: cartItem.unitPrice
                        } as any
                    });

                } else {
                    // Handle Cylinder Update
                    const currentCounts = cartItem.item.counts || { full: 0, empty: 0, defected: 0 };
                    const currentPrices = cartItem.item.prices || { fullCylinder: 0, gasOnly: 0 };

                    const newCounts = {
                        ...currentCounts,
                        full: currentCounts.full + cartItem.quantity
                    };

                    const newPrices = {
                        ...currentPrices,
                        ...(cartItem.purchaseType === 'refill'
                            ? {
                                buyingPriceGas: cartItem.unitPrice,
                                ...(cartItem.sellingPrice ? { gasOnly: cartItem.sellingPrice } : {})
                              }
                            : {
                                buyingPriceFull: cartItem.unitPrice,
                                ...(cartItem.sellingPrice ? { fullCylinder: cartItem.sellingPrice } : {})
                              }
                        )
                    };

                    await updateInventory.mutateAsync({
                        storeId,
                        inventoryId: cartItem.item._id,
                        data: {
                            counts: newCounts,
                            prices: newPrices
                        }
                    });
                }
            }

            toast.success("Purchase confirmed & Inventory updated!");
            onClearCart();
            onClose();
        } catch (error: any) {
            console.error(error);
            const msg = error?.response?.data?.error || error?.message || "Failed to process purchase";
            toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Purchase Invoice">
            <div className="space-y-6">
                <div className="border rounded-lg overflow-hidden">
                    <Table>
                        <TableHeader className="bg-muted">
                            <TableRow>
                                <TableHead>Item</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead className="text-center">Qty</TableHead>
                                <TableHead className="text-right">Unit Price</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {cartItems.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>
                                        <div className="font-medium">{item.item.brand || item.item.brandName || item.item.name}</div>
                                        <div className="text-xs text-muted-foreground">
                                            {item.purchaseType === 'product' ? (
                                                <>
                                                    {item.item.name}
                                                    {item.item.model ? ` (${item.item.model})` : ''}
                                                </>
                                            ) : (
                                                `${item.item.variant.size} - ${item.item.variant.regulator}`
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className={`text-xs px-2 py-1 rounded font-medium ${
                                            item.purchaseType === 'refill' ? 'bg-blue-100 text-blue-700' :
                                            item.purchaseType === 'package' ? 'bg-green-100 text-green-700' :
                                            'bg-orange-100 text-orange-700'
                                        }`}>
                                            {item.purchaseType === 'refill' ? 'Refill' : item.purchaseType === 'package' ? 'Package' : 'Product'}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-center font-bold">{item.quantity}</TableCell>
                                    <TableCell className="text-right">৳{item.unitPrice}</TableCell>
                                    <TableCell className="text-right font-bold">৳{item.totalAmount}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between items-center text-lg font-bold">
                        <span>Grand Total</span>
                        <span>৳{grandTotal.toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-muted-foreground text-right">
                        * Confirming will update the inventory stock and last purchase prices.
                    </p>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button variant="outline" onClick={onClose} disabled={isProcessing}>Close</Button>
                    <Button onClick={handleConfirmPurchase} disabled={isProcessing || cartItems.length === 0} className="w-full sm:w-auto">
                        {isProcessing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Confirm Purchase
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
