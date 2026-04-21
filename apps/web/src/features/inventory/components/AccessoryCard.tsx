import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
    Edit2, ShoppingCart, Trash2, Box, 
    Banknote, Pencil, Loader2, Plus
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useState, useEffect } from "react";
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
    const [isEditingPrice, setIsEditingPrice] = useState(false);
    
    const [editPrices, setEditPrices] = useState({
        sellingPrice: item.sellingPrice || 0,
        costPrice: item.costPrice || 0
    });

    useEffect(() => {
        setEditPrices({
            sellingPrice: item.sellingPrice || 0,
            costPrice: item.costPrice || 0
        });
    }, [item.sellingPrice, item.costPrice]);

    const updateProduct = useUpdateProduct();

    const handleSavePrice = () => {
        if (editPrices.sellingPrice < 0 || editPrices.costPrice < 0) {
            return toast.error("Price cannot be negative");
        }

        updateProduct.mutate({
            productId: item._id,
            data: {
                sellingPrice: Number(editPrices.sellingPrice),
                costPrice: Number(editPrices.costPrice) 
            }
        }, {
            onSuccess: () => {
                setIsEditingPrice(false);
                toast.success("Prices updated successfully");
            },
            onError: () => {
                toast.error("Failed to update prices");
            }
        });
    };

    return (
        <>
            <div className="group relative border border-border/50 rounded-2xl overflow-hidden bg-card hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
                
                {/* 1. Mobile-Optimized Status Badges */}
                <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
                    {item.stock <= 5 && item.stock > 0 && (
                        <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[9px] px-1.5 py-0 h-4">
                            Low Stock
                        </Badge>
                    )}
                    {item.stock === 0 && (
                        <Badge variant="destructive" className="text-[9px] px-1.5 py-0 h-4">Out of Stock</Badge>
                    )}
                </div>

                {/* 2. Frosted Hover Actions Overlay (Desktop) */}
                <div className="absolute top-2 right-2 flex gap-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    {!isEditingPrice && (
                        <>
                            {onEdit && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 bg-white/60 backdrop-blur-md hover:bg-white border border-black/5 shadow-sm rounded-full"
                                    onClick={() => onEdit(item)}
                                >
                                    <Edit2 className="w-3 h-3 text-foreground" />
                                </Button>
                            )}
                            {onDelete && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 bg-white/60 backdrop-blur-md hover:bg-red-50 hover:text-red-600 border border-black/5 shadow-sm rounded-full"
                                    onClick={() => onDelete(item)}
                                >
                                    <Trash2 className="w-3 h-3 text-red-600" />
                                </Button>
                            )}
                        </>
                    )}
                </div>

                {/* --- THE FIX: Absolute Glass Overlay for Editing --- */}
                {isEditingPrice && (
                    <div className="absolute inset-0 z-50 bg-background/95 backdrop-blur-xl flex flex-col justify-center p-4 animate-in zoom-in-95 fade-in duration-200">
                        <h4 className="text-center text-[10px] font-black uppercase tracking-widest text-foreground mb-4">Update Pricing</h4>
                        <div className="space-y-3">
                            <div className="space-y-1.5">
                                <label className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Cost Price</label>
                                <Input 
                                    type="number" 
                                    value={editPrices.costPrice}
                                    onChange={(e) => setEditPrices(prev => ({...prev, costPrice: Number(e.target.value)}))}
                                    className="h-8 text-xs px-3 bg-muted/50 border-transparent shadow-inner focus-visible:ring-1 focus-visible:ring-primary focus-visible:bg-background transition-all"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Sell Price</label>
                                <Input 
                                    type="number" 
                                    value={editPrices.sellingPrice}
                                    onChange={(e) => setEditPrices(prev => ({...prev, sellingPrice: Number(e.target.value)}))}
                                    className="h-8 text-xs px-3 bg-muted/50 border-transparent shadow-inner focus-visible:ring-1 focus-visible:ring-primary focus-visible:bg-background font-bold text-primary transition-all"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2 mt-5">
                            <Button size="sm" variant="ghost" className="h-8 flex-1 text-[10px] font-bold border border-border/50 bg-muted/50 hover:bg-muted" onClick={() => setIsEditingPrice(false)}>Cancel</Button>
                            <Button size="sm" className="h-8 flex-1 text-[10px] font-bold shadow-[0_4px_14px_rgba(var(--primary),0.25)]" onClick={handleSavePrice} disabled={updateProduct.isPending}>
                                {updateProduct.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Save"}
                            </Button>
                        </div>
                    </div>
                )}

                {/* 3. Refined Image Area */}
                <div className="h-28 sm:h-32 bg-gradient-to-b from-muted/30 to-transparent p-3 flex items-center justify-center relative border-b border-border/50">
                    {item.image ? (
                        <img 
                            src={item.image} 
                            alt={item.name} 
                            className="w-full h-full object-contain mix-blend-multiply transition-transform group-hover:scale-110 duration-500" 
                        />
                    ) : (
                        <Box className="w-10 h-10 text-muted-foreground/20" />
                    )}
                </div>

                {/* 4. High-Density Content Area */}
                <div className="p-3 flex flex-col gap-3 flex-1">
                    
                    {/* Title Block */}
                    <div className="min-h-[36px]">
                        <h3 className="font-bold text-[13px] leading-tight line-clamp-2 text-foreground group-hover:text-primary transition-colors">{item.name}</h3>
                        <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">{item.modelNumber || item.model || 'Universal'}</p>
                    </div>

                    {/* Stock & Damage Counters - Compact Grid */}
                    <div className="grid grid-cols-2 gap-2">
                         <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-1.5 flex flex-col items-center justify-center">
                            <span className="text-[8px] uppercase font-bold text-emerald-600/80 tracking-widest leading-none">Stock</span>
                            <span className="text-sm font-black text-emerald-700 leading-none mt-1">{item.stock}</span>
                        </div>
                        <button 
                            onClick={() => setDefectModalOpen(true)}
                            className="bg-rose-500/10 border border-rose-500/20 rounded-lg p-1.5 flex flex-col items-center justify-center hover:bg-rose-500/20 transition-colors active:scale-95"
                        >
                            <span className="text-[8px] uppercase font-bold text-rose-600/80 tracking-widest leading-none">Damaged</span>
                            <span className="text-sm font-black text-rose-700 leading-none mt-1">{item.damagedStock || 0}</span>
                        </button>
                    </div>

                    {/* Compact Pricing Section */}
                    <div className="flex items-end justify-between group/price pt-1">
                        <div>
                            <span className="text-[8px] uppercase font-bold tracking-widest text-muted-foreground block mb-0.5">Price</span>
                            <span className="text-base font-black text-foreground leading-none">{formatCurrency(item.sellingPrice)}</span>
                        </div>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 transition-colors bg-muted/40 hover:bg-muted text-foreground/70" 
                            onClick={() => setIsEditingPrice(true)}
                        >
                            <Pencil className="h-3.5 w-3.5" />
                        </Button>
                    </div>

                    {/* Mobile-Optimized Action Buttons */}
                    <div className="flex gap-2 mt-auto pt-2">
                        <Button
                            variant="secondary"
                            className="flex-1 h-8 px-0 text-[10px] font-bold bg-muted/60 hover:bg-muted border border-border/50 text-foreground shadow-sm"
                            onClick={() => setBuyModalOpen(true)}
                        >
                            <Plus className="w-3.5 h-3.5 mr-1" strokeWidth={2.5} /> Restock
                        </Button>
                        <Button
                            className="flex-1 h-8 px-0 text-[10px] font-bold shadow-[0_4px_14px_rgba(var(--primary),0.25)]"
                            onClick={() => onSell(item)}
                            disabled={item.stock <= 0}
                        >
                            <ShoppingCart className="w-3.5 h-3.5 mr-1" strokeWidth={2.5} /> Sell
                        </Button>
                    </div>
                </div>
            </div>

            <AccessoryDefectModal isOpen={defectModalOpen} onClose={() => setDefectModalOpen(false)} item={item} storeId={storeId} />
            <BuyAccessoryModal isOpen={buyModalOpen} onClose={() => setBuyModalOpen(false)} item={item} />
        </>
    );
};