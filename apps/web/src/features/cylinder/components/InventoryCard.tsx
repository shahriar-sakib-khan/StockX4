import { useUpdateInventory } from "../hooks/useCylinders";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { DefectModal } from "./DefectModal";
import { Modal } from "@/components/ui/Modal";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Box, Package, Pencil, Loader2, AlertTriangle, Save } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { InventoryCardImage } from "./inventory-card/InventoryCardImage";
import { cn } from "@/lib/utils";

interface InventoryCardProps {
    item: any;
    storeId: string;
    onRestock: (item: any) => void;
    fallbackImage?: string;
    highlightStats?: boolean;
    pendingQuantity?: number;
    pendingType?: 'refill' | 'package';
    isLivePreview?: boolean;
}

export const InventoryCard = ({ item, storeId, onRestock, fallbackImage, highlightStats, pendingQuantity, pendingType, isLivePreview }: InventoryCardProps) => {
    const [defectModalOpen, setDefectModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isPriceVisible, setIsPriceVisible] = useState(false); 
    const update = useUpdateInventory();

    const counts = {
        packaged: item.counts?.packaged || 0,
        full: item.counts?.full || 0,
        empty: item.counts?.empty || 0,
        defected: item.counts?.defected || 0
    };

    const [prices, setPrices] = useState({
        retailPriceFull: item.prices?.retailPriceFull || item.prices?.fullCylinder || 0,
        retailPriceGas: item.prices?.retailPriceGas || item.prices?.gasOnly || 0,
        wholesalePriceFull: item.prices?.wholesalePriceFull || 0,
        wholesalePriceGas: item.prices?.wholesalePriceGas || 0,
        buyingPriceFull: item.prices?.buyingPriceFull || 0,
        buyingPriceGas: item.prices?.buyingPriceGas || 0
    });

    const [editPrices, setEditPrices] = useState({ ...prices });

    useEffect(() => {
        const initialPrices = {
            retailPriceFull: item.prices?.retailPriceFull || item.prices?.fullCylinder || 0,
            retailPriceGas: item.prices?.retailPriceGas || item.prices?.gasOnly || 0,
            wholesalePriceFull: item.prices?.wholesalePriceFull || 0,
            wholesalePriceGas: item.prices?.wholesalePriceGas || 0,
            buyingPriceFull: item.prices?.buyingPriceFull || 0,
            buyingPriceGas: item.prices?.buyingPriceGas || 0
        };
        setPrices(initialPrices);
        setEditPrices(initialPrices);
    }, [item]);

    const handlePriceChange = (field: string, value: string) => {
        setEditPrices(prev => ({ ...prev, [field]: Number(value) }));
    };

    const handleSavePrices = () => {
        update.mutate({
            storeId,
            data: { productId: item.productId, prices: editPrices }
        }, {
            onSuccess: () => {
                toast.success("Prices Updated Successfully");
                setPrices(editPrices);
                setIsEditModalOpen(false);
            },
            onError: () => toast.error("Failed to update prices")
        });
    };

    const totalStock = counts.packaged + counts.full;
    let statusConfig = { label: "In Stock", color: "bg-emerald-50 text-emerald-600 border-emerald-200" };

    if (totalStock === 0) {
        statusConfig = { label: "Out of Stock", color: "bg-rose-500 text-white border-none" };
    } else if (totalStock < 50) {
        statusConfig = { label: "Low Stock", color: "bg-amber-50 text-amber-600 border-amber-200" };
    }

    return (
        <>
            <Card className={cn(
                "group relative border border-slate-200 rounded-xl overflow-hidden bg-white hover:shadow-md hover:border-indigo-200 transition-all duration-200 flex flex-col h-full active:scale-[0.99]",
                isLivePreview && "shadow-none border-none max-h-[85vh] overflow-y-auto"
            )}>
                
                {/* --- 1. HEADER (Large Typography) --- */}
                <div className="flex items-start justify-between p-2.5 sm:p-3.5 border-b border-indigo-100 bg-indigo-50/40 shrink-0">
                    <div className="flex items-start gap-2.5 min-w-0 flex-1">
                        <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-lg bg-white border border-indigo-200 flex items-center justify-center shrink-0 p-1 shadow-sm">
                            {item.brandId?.logo ? (
                                <img src={item.brandId.logo} alt="brand" className="w-full h-full object-contain" />
                            ) : (
                                <Box className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-300" />
                            )}
                        </div>
                        
                        <div className="flex flex-col min-w-0 flex-1 justify-center">
                            <h3 className="font-black text-sm sm:text-base text-slate-950 leading-tight uppercase tracking-tight mb-1 break-words">
                                {item.brandName}
                            </h3>
                            <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                <Badge variant="secondary" className="text-[9px] sm:text-[10px] px-2 py-0.5 h-4.5 sm:h-5 font-bold uppercase tracking-widest bg-indigo-100 text-indigo-800 shadow-sm">{item.variant?.size}</Badge>
                                <Badge variant="outline" className="text-[9px] sm:text-[10px] px-2 py-0.5 h-4.5 sm:h-5 font-bold uppercase tracking-widest border-orange-200 text-orange-700 bg-orange-50 shadow-sm">{item.variant?.regulator}</Badge>
                            </div>
                        </div>
                    </div>
                    <Badge variant="outline" className={cn("shrink-0 text-[9px] sm:text-[10px] px-2 py-0.5 h-5 sm:h-5.5 uppercase tracking-widest font-black shadow-sm ml-2", statusConfig.color)}>
                        {statusConfig.label}
                    </Badge>
                </div>

                {/* --- 2. MAIN BODY --- */}
                <div className="flex p-2.5 sm:p-3.5 gap-2.5 sm:gap-3 shrink-0 bg-white">
                    <div className="min-w-[70px] sm:min-w-[90px] max-w-[90px] sm:max-w-[110px] h-[100px] sm:h-[120px] bg-slate-50/50 rounded-lg flex items-center justify-center relative shrink-0 border border-slate-100 p-1.5 sm:p-2 overflow-hidden [&>div]:w-full [&>div]:h-full [&_img]:max-w-full [&_img]:max-h-full [&_img]:w-full [&_img]:h-full [&_img]:object-contain [&_img]:mix-blend-multiply">
                        <InventoryCardImage item={item} fallbackImage={fallbackImage} />
                    </div>

                    <div className="flex-1 relative h-[100px] sm:h-[120px] rounded-lg overflow-hidden border border-slate-100 bg-slate-50/30">
                        
                        {/* STATS VIEW - Always visible on mobile, swaps out on desktop */}
                        <div className={cn(
                            "h-full grid-cols-2 gap-1 sm:gap-1.5 p-1 sm:p-1.5",
                            isPriceVisible ? "grid sm:hidden" : "grid"
                        )}>
                            <div className="bg-emerald-50/60 border border-emerald-100/70 rounded-md flex flex-col items-center justify-center text-center">
                                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-emerald-600/80 mb-0.5">Pkg</span>
                                <span className="text-base sm:text-xl font-black text-emerald-700 leading-none">{counts.packaged}</span>
                            </div>
                            <div className="bg-sky-50/60 border border-sky-100/70 rounded-md flex flex-col items-center justify-center text-center">
                                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-sky-600/80 mb-0.5">Refill</span>
                                <span className="text-base sm:text-xl font-black text-sky-700 leading-none">{counts.full}</span>
                            </div>
                            <div className="bg-slate-50 border border-slate-200/60 rounded-md flex flex-col items-center justify-center text-center">
                                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Empty</span>
                                <span className="text-base sm:text-xl font-black text-slate-700 leading-none">{counts.empty}</span>
                            </div>
                            <button 
                                onClick={() => setDefectModalOpen(true)} 
                                className="bg-rose-50/60 border border-rose-100 rounded-md flex flex-col items-center justify-center text-center hover:bg-rose-100 transition-colors active:scale-95 group"
                            >
                                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-rose-500/80 mb-0.5 flex items-center gap-1">
                                    Def <AlertTriangle className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                </span>
                                <span className="text-base sm:text-xl font-black text-rose-600 leading-none">{counts.defected}</span>
                            </button>
                        </div>

                        {/* PRICING MATRIX VIEW (DESKTOP ONLY) - Swaps in place on desktop */}
                        <div className={cn(
                            "absolute inset-0 flex-col bg-indigo-50/40 p-1 sm:p-1.5 animate-in fade-in duration-200",
                            isPriceVisible ? "hidden sm:flex" : "hidden"
                        )}>
                            <div className="grid grid-cols-[40px_1fr_1fr] border-b border-indigo-100/50 pb-1 mb-1">
                                <span className="text-[10px] font-black text-indigo-400/60 uppercase tracking-widest text-left">Type</span>
                                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest text-center border-l border-indigo-100/50">Pkg</span>
                                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest text-center border-l border-indigo-100/50">Refill</span>
                            </div>
                            <div className="flex-1 flex flex-col justify-evenly">
                                <div className="grid grid-cols-[40px_1fr_1fr] items-center">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Buy</span>
                                    <span className="text-[12px] font-black text-slate-700 text-center leading-none">{formatCurrency(prices.buyingPriceFull)}</span>
                                    <span className="text-[12px] font-black text-slate-700 text-center leading-none">{formatCurrency(prices.buyingPriceGas)}</span>
                                </div>
                                <div className="grid grid-cols-[40px_1fr_1fr] items-center">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Whl</span>
                                    <span className="text-[12px] font-black text-slate-700 text-center leading-none">{formatCurrency(prices.wholesalePriceFull)}</span>
                                    <span className="text-[12px] font-black text-slate-700 text-center leading-none">{formatCurrency(prices.wholesalePriceGas)}</span>
                                </div>
                                <div className="grid grid-cols-[40px_1fr_1fr] items-center pt-0.5 mt-0.5 border-t border-indigo-100/50 bg-indigo-100/40 rounded-sm">
                                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-wide pl-1">Rtl</span>
                                    <span className="text-[13px] font-black text-indigo-700 text-center leading-none">{formatCurrency(prices.retailPriceFull)}</span>
                                    <span className="text-[13px] font-black text-indigo-700 text-center leading-none">{formatCurrency(prices.retailPriceGas)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- 2.5 MOBILE EXPANDING PRICING MATRIX --- */}
                {/* Physically pushes the footer down on mobile screens for massive breathing room */}
                {isPriceVisible && (
                    <div className="sm:hidden border-t border-slate-100 bg-indigo-50/30 p-3 animate-in slide-in-from-top-2 fade-in duration-200">
                        <div className="flex flex-col gap-1.5">
                            <div className="grid grid-cols-[40px_1fr_1fr] border-b border-indigo-200/50 pb-1.5 mb-1">
                                <span className="text-[10px] font-black text-indigo-400/80 uppercase tracking-widest text-left">Type</span>
                                <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest text-center border-l border-indigo-200/50">Package</span>
                                <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest text-center border-l border-indigo-200/50">Refill</span>
                            </div>
                            <div className="grid grid-cols-[40px_1fr_1fr] items-center py-1">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Buy</span>
                                <span className="text-[13px] font-black text-slate-700 text-center leading-none">{formatCurrency(prices.buyingPriceFull)}</span>
                                <span className="text-[13px] font-black text-slate-700 text-center leading-none">{formatCurrency(prices.buyingPriceGas)}</span>
                            </div>
                            <div className="grid grid-cols-[40px_1fr_1fr] items-center py-1">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Whl</span>
                                <span className="text-[13px] font-black text-slate-700 text-center leading-none">{formatCurrency(prices.wholesalePriceFull)}</span>
                                <span className="text-[13px] font-black text-slate-700 text-center leading-none">{formatCurrency(prices.wholesalePriceGas)}</span>
                            </div>
                            <div className="grid grid-cols-[40px_1fr_1fr] items-center py-2 mt-1 border-t border-indigo-200/50 bg-indigo-100/50 rounded-md">
                                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-wide pl-2">Rtl</span>
                                <span className="text-[14px] font-black text-indigo-700 text-center leading-none">{formatCurrency(prices.retailPriceFull)}</span>
                                <span className="text-[14px] font-black text-indigo-700 text-center leading-none">{formatCurrency(prices.retailPriceGas)}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- 3. RESPONSIVE WRAPPING FOOTER --- */}
                <div className="flex flex-wrap items-center justify-between p-2.5 sm:p-3.5 gap-2 border-t border-slate-100 bg-slate-50/50 mt-auto">
                    
                    <div className="flex items-center gap-1.5 sm:gap-2">
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className={cn(
                                "h-8 sm:h-9 px-3 sm:px-4 rounded-md font-black uppercase tracking-widest text-[9px] sm:text-[11px] transition-colors shadow-sm",
                                isPriceVisible 
                                    ? "bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100" 
                                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                            )}
                            onClick={() => setIsPriceVisible(!isPriceVisible)}
                        >
                            {isPriceVisible ? 'Hide' : 'Prices'}
                        </Button>

                        {isPriceVisible && (
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 sm:h-9 sm:w-9 text-indigo-500 bg-indigo-50 border border-indigo-100 hover:text-white hover:bg-indigo-600 rounded-md transition-all shadow-sm" 
                                onClick={() => {
                                    setEditPrices({ ...prices });
                                    setIsEditModalOpen(true);
                                }}
                            >
                                <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </Button>
                        )}
                    </div>

                    {!isLivePreview && (
                        <Button 
                            onClick={() => onRestock(item)} 
                            className="h-8 sm:h-9 px-4 sm:px-5 rounded-md font-black uppercase tracking-widest shadow-sm active:scale-[0.98] text-[9px] sm:text-[11px] bg-indigo-600 hover:bg-indigo-700 text-white transition-all ml-auto"
                        >
                            <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5" strokeWidth={2.5} /> Restock
                        </Button>
                    )}
                </div>
            </Card>

            {/* --- MODALS --- */}
            <DefectModal isOpen={defectModalOpen} onClose={() => setDefectModalOpen(false)} item={item} storeId={storeId} />

            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title={`Update Pricing: ${item.brandName}`}
                className="max-w-md"
                footer={
                    <div className="flex justify-end gap-2 w-full">
                        <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={handleSavePrices} disabled={update.isPending}>
                            {update.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                            Save Prices
                        </Button>
                    </div>
                }
            >
                <div className="grid grid-cols-2 gap-4 sm:gap-6 py-2">
                    <div className="space-y-4">
                        <h4 className="text-sm font-black uppercase tracking-widest text-indigo-900 border-b border-indigo-100 pb-2">Package</h4>
                        <div className="space-y-3">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Buying Price</label>
                                <Input type="number" value={editPrices.buyingPriceFull} onChange={(e) => handlePriceChange('buyingPriceFull', e.target.value)} className="h-9 font-bold bg-slate-50 focus-visible:ring-indigo-500" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Wholesale Price</label>
                                <Input type="number" value={editPrices.wholesalePriceFull} onChange={(e) => handlePriceChange('wholesalePriceFull', e.target.value)} className="h-9 font-bold bg-slate-50 focus-visible:ring-indigo-500" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Retail Price</label>
                                <Input type="number" value={editPrices.retailPriceFull} onChange={(e) => handlePriceChange('retailPriceFull', e.target.value)} className="h-9 font-black text-indigo-700 border-indigo-300 bg-indigo-50/50 focus-visible:ring-indigo-500" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-sm font-black uppercase tracking-widest text-indigo-900 border-b border-indigo-100 pb-2">Refill</h4>
                        <div className="space-y-3">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Buying Price</label>
                                <Input type="number" value={editPrices.buyingPriceGas} onChange={(e) => handlePriceChange('buyingPriceGas', e.target.value)} className="h-9 font-bold bg-slate-50 focus-visible:ring-indigo-500" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Wholesale Price</label>
                                <Input type="number" value={editPrices.wholesalePriceGas} onChange={(e) => handlePriceChange('wholesalePriceGas', e.target.value)} className="h-9 font-bold bg-slate-50 focus-visible:ring-indigo-500" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Retail Price</label>
                                <Input type="number" value={editPrices.retailPriceGas} onChange={(e) => handlePriceChange('retailPriceGas', e.target.value)} className="h-9 font-black text-indigo-700 border-indigo-300 bg-indigo-50/50 focus-visible:ring-indigo-500" />
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>
        </>
    );
};