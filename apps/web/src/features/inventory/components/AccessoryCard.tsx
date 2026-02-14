import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit2, ShoppingCart, Trash2, Box, AlertTriangle, IndianRupee, Banknote, Save, X, Loader2, Pencil } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useState } from "react";
import { AccessoryDefectModal } from "./AccessoryDefectModal";
import { BuyAccessoryModal } from "./BuyAccessoryModal";
import { useUpdateProduct } from "@/features/product/hooks/useProducts";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface AccessoryCardProps {
    item: any;
    storeId: string;
    onSell: (item: any) => void;
    onEdit?: (item: any) => void;
    onDelete?: (item: any) => void;
}

export const AccessoryCard = ({ item, storeId, onSell, onEdit, onDelete }: AccessoryCardProps) => {
    const [defectModalOpen, setDefectModalOpen] = useState(false);
    const [buyModalOpen, setBuyModalOpen] = useState(false);

    // Edit Mode State
    const [isEditingPrice, setIsEditingPrice] = useState(false);
    const [editPrices, setEditPrices] = useState({
        sellingPrice: item.sellingPrice,
        buyingPrice: item.buyingPrice || 0
    });

    const updateProduct = useUpdateProduct();

    const handleSavePrice = () => {
        updateProduct.mutate({
            productId: item._id,
            data: {
                sellingPrice: Number(editPrices.sellingPrice),
                costPrice: Number(editPrices.buyingPrice)
            }
        }, {
            onSuccess: () => {
                setIsEditingPrice(false);
                toast.success("Prices updated");
            }
        });
    };

    return (
        <>
            <div className="group relative border rounded-xl overflow-hidden bg-card shadow-sm hover:shadow-md transition-all flex flex-col h-full ring-1 ring-border/50">
                {/* Actions Overlay */}
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    {!isEditingPrice && (
                        <>
                            {onEdit && (
                                <Button
                                    variant="secondary"
                                    size="icon"
                                    className="h-7 w-7 bg-white/90 hover:bg-white shadow-sm"
                                    onClick={() => onEdit(item)}
                                >
                                    <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
                                </Button>
                            )}
                            {onDelete && (
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    className="h-7 w-7 shadow-sm"
                                    onClick={() => onDelete(item)}
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                            )}
                        </>
                    )}
                </div>

                {/* 1. Product Image */}
                <div className="h-40 bg-gradient-to-b from-muted/50 to-muted/10 p-4 flex items-center justify-center border-b relative">
                    {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-contain filter drop-shadow-sm transition-transform group-hover:scale-105 duration-300" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-muted/20 rounded-lg">
                            <Box className="w-10 h-10 opacity-20" />
                        </div>
                    )}
                </div>

                {/* Content Container */}
                <div className="p-3 flex flex-col gap-3 flex-1">

                    {/* 2. Product Name & Model */}
                    <div className="flex gap-2">
                        <div className="flex-1 border rounded px-2 py-1.5 bg-muted/5 flex items-center justify-center text-center">
                            <span className="font-semibold text-sm line-clamp-1" title={item.name}>{item.name}</span>
                        </div>
                        <div className="flex-1 border rounded px-2 py-1.5 bg-muted/5 flex items-center justify-center text-center">
                            <span className="font-medium text-xs text-muted-foreground line-clamp-1" title={item.modelNumber || item.model}>{item.modelNumber || item.model || 'N/A'}</span>
                        </div>
                    </div>

                    {/* 3. Inventory Counter & Defected Counter (Big Numbers) */}
                    <div className="grid grid-cols-2 gap-2">
                         <div className="border rounded-lg py-2 flex flex-col items-center justify-center bg-emerald-50/50 border-emerald-100/50">
                            <span className="text-[10px] text-emerald-600/70 font-bold uppercase tracking-widest mb-1">Stock</span>
                            <div className="flex items-center gap-1 text-emerald-600">
                                <Box className="w-4 h-4" />
                                <span className="font-bold text-3xl tracking-tight">{item.stock}</span>
                            </div>
                        </div>
                        <div
                            className="border rounded-lg py-2 flex flex-col items-center justify-center cursor-pointer hover:bg-red-50 transition-colors bg-red-50/30 border-red-100/50 group/defect"
                            onClick={() => setDefectModalOpen(true)}
                        >
                            <div className="flex items-center gap-1">
                                <span className="text-[10px] text-red-600/70 font-bold uppercase tracking-widest mb-1">Defect</span>
                                <Edit2 className="w-3 h-3 text-red-400 opacity-0 group-hover/defect:opacity-100 transition-opacity mb-1" />
                            </div>
                            <div className="flex items-center gap-1 text-red-600">
                                <AlertTriangle className="w-4 h-4" />
                                <span className="font-bold text-3xl tracking-tight">{item.damagedStock || 0}</span>
                            </div>
                        </div>
                    </div>

                    {/* 4. Price (View Mode vs Edit Mode) */}
                    {isEditingPrice ? (
                        <div className="border rounded-lg p-3 bg-muted/10 animate-in fade-in zoom-in-95 space-y-3 shadow-inner">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase text-muted-foreground font-bold pl-0.5">Buy Price</label>
                                    <Input
                                        type="number"
                                        className="h-8 text-sm bg-white"
                                        value={editPrices.buyingPrice}
                                        onChange={(e) => setEditPrices({...editPrices, buyingPrice: Number(e.target.value)})}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase text-muted-foreground font-bold pl-0.5">Sell Price</label>
                                    <Input
                                        type="number"
                                        className="h-8 text-sm font-semibold bg-white"
                                        value={editPrices.sellingPrice}
                                        onChange={(e) => setEditPrices({...editPrices, sellingPrice: Number(e.target.value)})}
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 flex-1 text-xs"
                                    onClick={() => setIsEditingPrice(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    size="sm"
                                    className="h-8 flex-1 text-xs bg-primary text-white shadow-sm"
                                    onClick={handleSavePrice}
                                    disabled={updateProduct.isPending}
                                >
                                    {updateProduct.isPending ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Save className="w-3 h-3 mr-1" />}
                                    Save
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="border rounded-lg px-3 py-3 flex items-center justify-between bg-white shadow-sm hover:shadow-md transition-shadow group/price relative overflow-hidden">
                             <div className="flex flex-col items-start gap-0.5">
                                 <span className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">Price</span>
                                 <div className="flex items-baseline gap-1">
                                     <span className="font-bold text-xl text-primary">{formatCurrency(item.sellingPrice)}</span>
                                 </div>
                             </div>

                             <div className="flex items-center gap-3">
                                 {item.buyingPrice > 0 && (
                                     <div className="flex flex-col items-end gap-0.5 opacity-60">
                                         <span className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">Buy</span>
                                         <span className="text-xs font-medium text-muted-foreground">{formatCurrency(item.buyingPrice)}</span>
                                     </div>
                                 )}
                                 <Button
                                     variant="ghost"
                                     size="icon"
                                     className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/5"
                                     onClick={() => setIsEditingPrice(true)}
                                 >
                                     <Pencil className="w-4 h-4" />
                                 </Button>
                             </div>
                        </div>
                    )}

                    {/* 5. Buy & Sell Buttons */}
                    <div className="grid grid-cols-2 gap-2 mt-auto pt-1">
                         <Button
                            variant="outline"
                            className="w-full border-red-100 bg-red-50/50 hover:bg-red-50 text-red-600 hover:text-red-700 shadow-sm"
                            onClick={() => setBuyModalOpen(true)}
                        >
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            Buy
                        </Button>
                        <Button
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                            onClick={() => onSell(item)}
                            disabled={item.stock <= 0}
                        >
                            <Banknote className="w-4 h-4 mr-2" />
                            Sell
                        </Button>
                    </div>
                </div>
            </div>

            <AccessoryDefectModal
                isOpen={defectModalOpen}
                onClose={() => setDefectModalOpen(false)}
                item={item}
                storeId={storeId}
            />

            <BuyAccessoryModal
                isOpen={buyModalOpen}
                onClose={() => setBuyModalOpen(false)}
                item={item}
            />
        </>
    );
};
