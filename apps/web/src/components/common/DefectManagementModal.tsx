import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";

interface DefectManagementModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    currentStock: number;
    currentDamaged: number;
    itemName: string;
    onUpdate: (action: 'mark' | 'unmark', quantity: number) => Promise<void>;
    isPending?: boolean;
}

export const DefectManagementModal = ({
    isOpen,
    onClose,
    title = "Manage Damaged Items",
    currentStock,
    currentDamaged,
    itemName,
    onUpdate,
    isPending
}: DefectManagementModalProps) => {
    const [quantity, setQuantity] = useState<string>("1");

    const handleUpdate = async (action: 'mark' | 'unmark') => {
        const qty = parseInt(quantity);
        if (isNaN(qty) || qty <= 0) {
            toast.error("Please enter a valid quantity");
            return;
        }

        if (action === 'mark' && qty > currentStock) {
            toast.error(`Not enough stock (Current: ${currentStock})`);
            return;
        }
        if (action === 'unmark' && qty > currentDamaged) {
            toast.error(`Not enough damaged units (Current: ${currentDamaged})`);
            return;
        }

        await onUpdate(action, qty);
        setQuantity("1");
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <div className="space-y-6">
                <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                    <div className="flex-1 text-center border-r">
                         <p className="text-xs text-muted-foreground uppercase font-bold">Current Stock</p>
                         <p className="text-3xl font-bold text-primary">{currentStock}</p>
                    </div>
                    <div className="flex-1 text-center">
                         <p className="text-xs text-muted-foreground uppercase font-bold">Damaged</p>
                         <p className="text-3xl font-bold text-destructive">{currentDamaged}</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                         <label className="text-sm font-medium">Quantity ({itemName})</label>
                         <Input
                            type="number"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            min="1"
                            className="text-lg"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                         <Button
                            variant="destructive"
                            className="h-auto py-4 flex flex-col gap-1"
                            onClick={() => handleUpdate('mark')}
                            disabled={isPending}
                        >
                            <span className="font-bold flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4" /> Mark Damaged
                            </span>
                            <span className="text-xs font-normal opacity-90">
                                Move Stock &rarr; Damaged
                            </span>
                         </Button>

                         <Button
                            variant="outline"
                            className="h-auto py-4 flex flex-col gap-1 border-destructive/20 hover:bg-destructive/5 text-destructive"
                            onClick={() => handleUpdate('unmark')}
                             disabled={isPending}
                        >
                            <span className="font-bold">Unmark / Restore</span>
                            <span className="text-xs font-normal text-muted-foreground">Move Damaged &rarr; Stock</span>
                         </Button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};
