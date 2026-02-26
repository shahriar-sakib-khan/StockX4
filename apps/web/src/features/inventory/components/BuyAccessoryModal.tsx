import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';
import { ShoppingCart } from 'lucide-react';
import { useUpdateProduct } from "@/features/product/hooks/useProducts";
import { toast } from "sonner";

interface BuyAccessoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    item: any;
}

export const BuyAccessoryModal = ({ isOpen, onClose, item }: BuyAccessoryModalProps) => {
    const update = useUpdateProduct();

    const [quantity, setQuantity] = useState<string>('');
    const [costPrice, setCostPrice] = useState<string>('');
    const [sellingPrice, setSellingPrice] = useState<string>('');

    // Reset state on open
    useEffect(() => {
        if (isOpen && item) {
            setQuantity('');
            setCostPrice(item.costPrice?.toString() || '');
            setSellingPrice(item.sellingPrice?.toString() || '');
        }
    }, [isOpen, item]);

    const handleIncrement = () => {
        setQuantity(prev => {
            const val = Number(prev || 0);
            return String(val + 1);
        });
    };

    const handleDecrement = () => {
        setQuantity(prev => {
            const val = Number(prev || 0);
            return String(Math.max(0, val - 1));
        });
    };

    const handleRestock = () => {
        if (!quantity || !costPrice || !sellingPrice) {
            toast.error("Please fill all fields");
            return;
        }

        const qty = Number(quantity);
        if (isNaN(qty) || qty <= 0) {
            toast.error("Invalid quantity");
            return;
        }

        // New stock calculation
        const newStock = (item.stock || 0) + qty;

        update.mutate({
            productId: item._id,
            data: {
                stock: newStock,
                costPrice: Number(costPrice),
                sellingPrice: Number(sellingPrice)
            }
        }, {
            onSuccess: () => {
                toast.success("Stock updated successfully");
                onClose();
            },
            onError: () => {
                toast.error("Failed to update stock");
            }
        });
    };

    if (!item) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Restock Product">
            <div className="space-y-6">
                 {/* Product Info */}
                 <div className="bg-muted/30 p-4 rounded-xl border flex gap-4 items-center">
                    {item.image ? (
                        <img src={item.image} alt="Product" className="w-16 h-16 object-contain bg-white rounded p-1 border" />
                    ) : (
                        <div className="w-16 h-16 bg-muted flex items-center justify-center text-xs rounded border">No Image</div>
                    )}
                    <div>
                        <p className="text-sm text-muted-foreground">{item.brand}</p>
                         <h3 className="font-bold text-lg">{item.name}</h3>
                         <p className="text-xs text-muted-foreground">{item.modelNumber}</p>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-bold">Quantity to Add</label>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="icon" onClick={handleDecrement}>-</Button>
                            <Input
                                type="number"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                className="text-center font-bold text-lg"
                                placeholder="0"
                                autoFocus
                            />
                            <Button variant="outline" size="icon" onClick={handleIncrement}>+</Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Cost Price (Buying)</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">৳</span>
                                <Input
                                    type="number"
                                    value={costPrice}
                                    onChange={(e) => setCostPrice(e.target.value)}
                                    className="pl-7"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Selling Price</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">৳</span>
                                <Input
                                    type="number"
                                    value={sellingPrice}
                                    onChange={(e) => setSellingPrice(e.target.value)}
                                    className="pl-7"
                                />
                            </div>
                        </div>
                    </div>

                    <Button className="w-full h-12 text-lg font-bold" onClick={handleRestock} disabled={update.isPending}>
                        <ShoppingCart className="w-5 h-5 mr-2" />
                        Confirm Restock
                    </Button>
                 </div>
            </div>
        </Modal>
    );
};
