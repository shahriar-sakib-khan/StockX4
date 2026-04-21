import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useUpdateInventory } from "@/features/cylinder/hooks/useCylinders";
import { toast } from "sonner";
import { Loader2, AlertTriangle, Box, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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

        let newCounts = { ...item.counts };

        if (action === 'mark') {
            newCounts.defected += qty;
        } else {
            newCounts.defected -= qty;
        }

        try {
            await update.mutateAsync({
                storeId,
                data: {
                    productId: item.productId,
                    counts: newCounts
                }
            });
            toast.success(action === 'mark' ? "Marked as defected" : "Restored from defects");
            onClose();
            setQuantity("1");
        } catch (error) {
            toast.error("Failed to update inventory");
        }
    };

    if (!item) return null;

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title="Manage Defected Stock"
            // If your Modal component supports className, this helps it look ultra-premium
            className="max-w-md p-0 overflow-hidden sm:rounded-3xl"
        >
            <div className="p-4 sm:p-6 space-y-6 bg-white">
                
                {/* --- PREMIUM CONTEXT HEADER --- */}
                <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-slate-50 border border-slate-100 rounded-2xl shadow-sm">
                    {/* Logo Box */}
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-xl border border-slate-200 flex items-center justify-center p-1.5 shadow-sm shrink-0">
                        {item.brandId?.logo ? (
                            <img src={item.brandId.logo} alt="Brand" className="w-full h-full object-contain" />
                        ) : (
                            <Box className="w-6 h-6 text-slate-300" />
                        )}
                    </div>

                    {/* Text Details */}
                    <div className="flex-1 min-w-0">
                        <h4 className="font-black text-sm sm:text-base text-slate-900 truncate uppercase tracking-tight mb-1">
                            {item.brandName || 'Cylinder'}
                        </h4>
                        <div className="flex gap-1.5">
                            <Badge variant="secondary" className="text-[8px] sm:text-[9px] px-1.5 py-0 h-4 sm:h-5 font-bold uppercase tracking-wider bg-slate-200/70 text-slate-700 shadow-sm">{item.variant?.size}</Badge>
                            <Badge variant="outline" className="text-[8px] sm:text-[9px] px-1.5 py-0 h-4 sm:h-5 font-bold uppercase tracking-wider border-orange-200 text-orange-700 bg-orange-50 shadow-sm">{item.variant?.regulator}</Badge>
                        </div>
                    </div>

                    {/* Defect Counter */}
                    <div className="flex flex-col items-end shrink-0 pl-3 sm:pl-4 border-l border-slate-200">
                        <span className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Defects</span>
                        <span className="text-2xl sm:text-3xl font-black text-rose-600 leading-none">{currentDefected}</span>
                    </div>
                </div>

                {/* --- INPUT SECTION --- */}
                <div className="space-y-3">
                    <div className="flex justify-between items-end px-1">
                        <label className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-500">Update Quantity</label>
                        <div className="flex items-center gap-2 text-[8px] sm:text-[9px] font-bold uppercase tracking-widest text-slate-400">
                            <span>Full: <span className="text-sky-600">{currentFull}</span></span>
                            <span>•</span>
                            <span>Empty: <span className="text-slate-600">{currentEmpty}</span></span>
                        </div>
                    </div>
                    <Input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        min="1"
                        placeholder="0"
                        className="h-16 sm:h-20 text-center text-3xl sm:text-4xl font-black bg-slate-50 border border-slate-200 rounded-2xl focus:border-rose-500 focus:bg-white transition-all focus:ring-4 focus:ring-rose-50 shadow-inner text-slate-900"
                        autoFocus
                    />
                </div>

                {/* --- ACTION BUTTONS --- */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-2">
                    
                    {/* Secondary Action: Restore */}
                    <Button
                        variant="outline"
                        className="h-14 sm:h-16 flex flex-col gap-0.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all group active:scale-[0.98] order-2 sm:order-1"
                        onClick={() => handleUpdate('unmark')}
                        disabled={update.isPending || currentDefected === 0}
                    >
                        <span className="font-black text-xs uppercase tracking-widest text-slate-700 flex items-center gap-1.5">
                            <RotateCcw className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-colors" /> Restore
                        </span>
                        <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-widest">Remove from defects</span>
                    </Button>

                    {/* Primary Action: Mark Defect */}
                    <Button
                        className="h-14 sm:h-16 flex flex-col gap-0.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-md hover:shadow-lg transition-all active:scale-[0.98] order-1 sm:order-2 disabled:opacity-50"
                        onClick={() => handleUpdate('mark')}
                        disabled={update.isPending || totalStock === 0}
                    >
                        {update.isPending ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                <span className="font-black text-xs uppercase tracking-widest flex items-center gap-1.5">
                                    <AlertTriangle className="w-3.5 h-3.5" /> Mark Defect
                                </span>
                                <span className="text-[8px] sm:text-[9px] font-bold text-rose-200 uppercase tracking-widest">Move to defects</span>
                            </>
                        )}
                    </Button>

                </div>
            </div>
        </Modal>
    );
};