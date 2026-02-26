import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useUpdateInventory } from "@/features/cylinder/hooks/useCylinders";
import { toast } from "sonner";
import { Loader2, AlertTriangle, ArrowRight } from "lucide-react";

interface DefectModalProps {
    isOpen: boolean;
    onClose: () => void;
    item: any;
    storeId: string;
}

export const DefectModal = ({ isOpen, onClose, item, storeId }: DefectModalProps) => {
    const update = useUpdateInventory();
    const [quantity, setQuantity] = useState<string>("1");

    const currentDefected = item?.counts?.defected || 0;
    const currentEmpty = item?.counts?.empty || 0;
    const currentFull = item?.counts?.full || 0;
    const totalStock = currentEmpty + currentFull;

    const handleUpdate = async (action: 'mark' | 'unmark') => {
        const qty = parseInt(quantity);
        if (isNaN(qty) || qty <= 0) {
            toast.error("Please enter a valid quantity");
            return;
        }

        // Logic: Defected count is independent of Full/Empty counts but constrained by their sum.
        // Mark: Increase defected count. Check newDefected <= (Full + Empty).
        // Unmark: Decrease defected count. Check newDefected >= 0.

        if (action === 'mark') {
            if (currentDefected + qty > totalStock) {
                toast.error(`Cannot mark more than total stock (Total: ${totalStock}, Current Defected: ${currentDefected})`);
                return;
            }
        } else {
            if (qty > currentDefected) {
                toast.error(`Not enough defected stock to unmark (Current: ${currentDefected})`);
                return;
            }
        }

        // Calculate new counts
        let newCounts = { ...item.counts };

        if (action === 'mark') {
            newCounts.defected += qty;
        } else {
            newCounts.defected -= qty;
        }

        try {
            await update.mutateAsync({
                storeId,
                inventoryId: item._id,
                data: {
                    counts: newCounts
                }
            });
            toast.success("Defect count updated successfully");
            onClose();
            setQuantity("1");
        } catch (error) {
            toast.error("Failed to update");
        }
    };

    if (!item) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Manage Defected Cylinders">
            <div className="space-y-6">
                {/* Visual Header */}
                <div className="bg-muted/30 p-4 rounded-xl border flex gap-4 items-center">
                    {item.brandId?.logo ? (
                        <img src={item.brandId.logo} alt="Brand" className="w-16 h-10 object-contain bg-white rounded p-1 border" />
                    ) : (
                        <div className="w-16 h-10 bg-muted flex items-center justify-center text-xs rounded border">No Logo</div>
                    )}

                    <div>
                        <p className="text-sm text-muted-foreground">Cylinder</p>
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-lg">{item.variant?.size}</span>
                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${item.variant?.regulator === '22mm' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                                {item.variant?.regulator}
                            </span>
                        </div>
                    </div>

                    <div className="ml-auto text-right">
                        <p className="text-xs text-muted-foreground uppercase font-bold">Current Defected</p>
                        <p className="text-3xl font-bold text-destructive">{currentDefected}</p>
                    </div>
                </div>

                {/* Wrapper for side-by-side layout on desktop if needed, for now stack is fine for modal */}

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
                            <span>Available Empty: {currentEmpty}</span>
                            <span>Available Full: {currentFull}</span>
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
                                Updates Defected Count Only
                            </span>
                         </Button>

                         <Button
                            variant="outline"
                            className="h-auto py-4 flex flex-col gap-1 border-destructive/20 hover:bg-destructive/5 text-destructive"
                            onClick={() => handleUpdate('unmark')}
                             disabled={update.isPending}
                        >
                            <span className="font-bold text-lg">Unmark / Restore</span>
                            <span className="text-xs font-normal text-muted-foreground">Decrease Defected Count</span>
                        </Button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};
