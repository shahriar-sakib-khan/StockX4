import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useUpdateProduct } from "@/features/product/hooks/useProducts";
import { toast } from "sonner";
import { Loader2, AlertTriangle } from "lucide-react";

interface AccessoryDefectModalProps {
    isOpen: boolean;
    onClose: () => void;
    item: any;
    storeId: string;
}

export const AccessoryDefectModal = ({ isOpen, onClose, item, storeId }: AccessoryDefectModalProps) => {
    const update = useUpdateProduct();
    const [quantity, setQuantity] = useState<string>("1");

    const currentStock = item?.stock || 0;
    const currentDamaged = item?.damagedStock || 0;

    const handleUpdate = async (action: 'mark' | 'unmark') => {
        const qty = parseInt(quantity);
        if (isNaN(qty) || qty <= 0) {
            toast.error("Please enter a valid quantity");
            return;
        }

        if (action === 'mark') {
            if (currentDamaged + qty > currentStock) {
                toast.error(`Cannot mark more than total stock (Total: ${currentStock}, Current Defected: ${currentDamaged})`);
                return;
            }
        } else {
            if (qty > currentDamaged) {
                toast.error(`Not enough defected stock to unmark (Current: ${currentDamaged})`);
                return;
            }
        }

        // Calculate new counts
        // Logic: Stock is Total. Damaged is a subset.
        // Marking defected increases damaged count but Stock (Total) remains same.
        // Unmarking decreases damaged count.
        const newStock = currentStock;
        let newDamaged = currentDamaged;

        if (action === 'mark') {
            newDamaged += qty;
        } else {
            newDamaged -= qty;
        }

        update.mutate({
            productId: item._id,
            data: {
                stock: newStock,
                damagedStock: newDamaged
            }
        }, {
            onSuccess: () => {
                toast.success(action === 'mark' ? "Marked as defected" : "Unmarked (restored to stock)");
                onClose();
                setQuantity("1");
            },
            onError: () => {
                toast.error("Failed to update");
            }
        });
    };

    if (!item) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Manage Defected Items">
            <div className="space-y-6">
                {/* Visual Header */}
                <div className="bg-muted/30 p-4 rounded-xl border flex gap-4 items-center">
                    {item.image ? (
                        <img src={item.image} alt="Product" className="w-16 h-16 object-contain bg-white rounded p-1 border" />
                    ) : (
                        <div className="w-16 h-16 bg-muted flex items-center justify-center text-xs rounded border">No Image</div>
                    )}

                    <div>
                        <p className="text-sm text-muted-foreground">{item.brand}</p>
                        <div className="flex flex-col">
                            <span className="font-bold text-lg">{item.name}</span>
                            <span className="text-xs text-muted-foreground">{item.modelNumber}</span>
                        </div>
                    </div>

                    <div className="ml-auto text-right">
                        <p className="text-xs text-muted-foreground uppercase font-bold">Current Defected</p>
                        <p className="text-3xl font-bold text-destructive">{currentDamaged}</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                         <label className="text-sm font-bold text-muted-foreground uppercase">Quantity to Update</label>
                         <Input
                            type="number"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            min="1"
                            className="text-3xl font-bold h-14 text-center"
                            autoFocus
                        />
                         <div className="flex justify-between text-xs text-muted-foreground px-1">
                            <span>Available Stock: {currentStock}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                         <Button
                            variant="destructive"
                            className="h-auto py-4 flex flex-col gap-1 shadow-lg shadow-destructive/20"
                            onClick={() => handleUpdate('mark')}
                            disabled={update.isPending}
                        >
                            <span className="font-bold flex items-center gap-2 text-lg">
                                <AlertTriangle className="w-5 h-5" /> Mark Defected
                            </span>
                            <span className="text-xs font-normal opacity-90">
                                Moves Stock to Defected
                            </span>
                         </Button>

                         <Button
                            variant="outline"
                            className="h-auto py-4 flex flex-col gap-1 border-destructive/20 hover:bg-destructive/5 text-destructive"
                            onClick={() => handleUpdate('unmark')}
                             disabled={update.isPending}
                        >
                            <span className="font-bold text-lg">Unmark / Restore</span>
                            <span className="text-xs font-normal text-muted-foreground">Move back to Stock</span>
                        </Button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};
