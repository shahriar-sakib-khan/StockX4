import { useUpdateInventory } from "../hooks/useCylinders";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { DefectModal } from "./DefectModal";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Box, Package, Pencil, Loader2, AlertTriangle } from "lucide-react";
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
    const [isPriceMode, setIsPriceMode] = useState(false);
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

    useEffect(() => {
        setPrices({
            retailPriceFull: item.prices?.retailPriceFull || item.prices?.fullCylinder || 0,
            retailPriceGas: item.prices?.retailPriceGas || item.prices?.gasOnly || 0,
            wholesalePriceFull: item.prices?.wholesalePriceFull || 0,
            wholesalePriceGas: item.prices?.wholesalePriceGas || 0,
            buyingPriceFull: item.prices?.buyingPriceFull || 0,
            buyingPriceGas: item.prices?.buyingPriceGas || 0
        });
    }, [item]);

    const handlePriceChange = (field: string, value: string) => {
        setPrices(prev => ({ ...prev, [field]: Number(value) }));
    };

    const handleSavePrices = () => {
        update.mutate({
            storeId,
            data: { productId: item.productId, prices }
        }, {
            onSuccess: () => {
                toast.success("Prices Updated");
                setIsPriceMode(false);
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
                
                {/* --- 1. TWO-LINE COLORFUL HEADER --- */}
                <div className="flex items-start justify-between p-3 border-b border-indigo-100 bg-indigo-50/40 shrink-0">
                    <div className="flex items-start gap-2.5 min-w-0 flex-1">
                        {/* Logo Box */}
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-white border border-indigo-200 flex items-center justify-center shrink-0 p-1 shadow-sm">
                            {item.brandId?.logo ? (
                                <img src={item.brandId.logo} alt="brand" className="w-full h-full object-contain" />
                            ) : (
                                <Box className="w-4 h-4 text-indigo-300" />
                            )}
                        </div>
                        
                        {/* 2-Line Text & Badges */}
                        <div className="flex flex-col min-w-0 flex-1">
                            {/* Line 1: Full Brand Name */}
                            <h3 className="font-black text-xs sm:text-sm text-slate-950 leading-tight uppercase tracking-tight mb-1.5 break-words">
                                {item.brandName}
                            </h3>
                            {/* Line 2: Badges */}
                            <div className="flex flex-wrap gap-1.5">
                                <Badge variant="secondary" className="text-[8px] px-1.5 py-0 h-4 font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700 shadow-sm">{item.variant?.size}</Badge>
                                <Badge variant="outline" className="text-[8px] px-1.5 py-0 h-4 font-bold uppercase tracking-wider border-orange-200 text-orange-700 bg-orange-50 shadow-sm">{item.variant?.regulator}</Badge>
                            </div>
                        </div>
                    </div>
                    {/* Status Badge */}
                    <Badge variant="outline" className={cn("shrink-0 text-[8px] px-2 py-0.5 h-5 uppercase tracking-widest font-black shadow-sm ml-2", statusConfig.color)}>
                        {statusConfig.label}
                    </Badge>
                </div>

                {/* --- 2. SIDE-BY-SIDE BODY --- */}
                <div className="flex p-3 gap-3 shrink-0 bg-white">
                    {/* Strict CSS Container Lock for Image */}
                    <div className="min-w-[80px] max-w-[100px] h-28 bg-slate-50/50 rounded-lg flex items-center justify-center relative shrink-0 border border-slate-100 p-2 overflow-hidden [&>div]:w-full [&>div]:h-full [&_img]:max-w-full [&_img]:max-h-full [&_img]:w-full [&_img]:h-full [&_img]:object-contain [&_img]:mix-blend-multiply">
                        <InventoryCardImage item={item} fallbackImage={fallbackImage} />
                    </div>

                    {/* Right: 2x2 Stock Grid */}
                    <div className="flex-1 grid grid-cols-2 gap-2 h-28">
                        <div className="bg-emerald-50/60 border border-emerald-100/70 rounded-md flex flex-col items-center justify-center text-center">
                            <span className="text-[8px] font-black uppercase tracking-widest text-emerald-600/80 mb-0.5">Pkg</span>
                            <span className="text-sm sm:text-base font-black text-emerald-700 leading-none">{counts.packaged}</span>
                        </div>
                        <div className="bg-sky-50/60 border border-sky-100/70 rounded-md flex flex-col items-center justify-center text-center">
                            <span className="text-[8px] font-black uppercase tracking-widest text-sky-600/80 mb-0.5">Refill</span>
                            <span className="text-sm sm:text-base font-black text-sky-700 leading-none">{counts.full}</span>
                        </div>
                        <div className="bg-slate-50 border border-slate-200/60 rounded-md flex flex-col items-center justify-center text-center">
                            <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Empty</span>
                            <span className="text-sm sm:text-base font-black text-slate-700 leading-none">{counts.empty}</span>
                        </div>
                        <button 
                            onClick={() => setDefectModalOpen(true)} 
                            className="bg-rose-50/60 border border-rose-100 rounded-md flex flex-col items-center justify-center text-center hover:bg-rose-100 transition-colors active:scale-95 group"
                        >
                            <span className="text-[8px] font-black uppercase tracking-widest text-rose-500/80 mb-0.5 flex items-center gap-1">
                                Defect <AlertTriangle className="w-2.5 h-2.5" />
                            </span>
                            <span className="text-sm sm:text-base font-black text-rose-600 leading-none">{counts.defected}</span>
                        </button>
                    </div>
                </div>

                {/* --- 3. MERGED FOOTER (Smart Pricing Button + Restock) --- */}
                <div className="flex items-center justify-between p-3 border-t border-slate-100 bg-slate-50/50 mt-auto">
                    
                    {/* Privacy Toggle Section */}
                    <div className="flex items-center gap-1.5">
                        {!isPriceMode ? (
                            <>
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className={cn(
                                        "h-7 px-3 rounded-md font-black uppercase tracking-widest text-[9px] transition-colors shadow-sm",
                                        isPriceVisible 
                                            ? "bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100" 
                                            : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                    )}
                                    onClick={() => setIsPriceVisible(!isPriceVisible)}
                                >
                                    {isPriceVisible ? 'Hide Prices' : 'View Prices'}
                                </Button>
                                {isPriceVisible && (
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors" onClick={() => setIsPriceMode(true)}>
                                        <Pencil className="w-3.5 h-3.5" />
                                    </Button>
                                )}
                            </>
                        ) : (
                            <div className="flex items-center gap-1.5">
                                <button className="text-[9px] font-bold text-slate-400 hover:text-slate-600 px-1.5 uppercase tracking-widest" onClick={() => setIsPriceMode(false)}>Cancel</button>
                                <Button size="sm" className="h-7 text-[9px] px-3 rounded-md shadow-sm bg-indigo-600 text-white hover:bg-indigo-700" onClick={handleSavePrices} disabled={update.isPending}>
                                    {update.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Save'}
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Restock Action */}
                    {!isLivePreview && (
                        <Button 
                            onClick={() => onRestock(item)} 
                            className="h-7 px-3.5 rounded-md font-black uppercase tracking-widest shadow-sm active:scale-[0.98] text-[9px] bg-indigo-600 hover:bg-indigo-700 text-white transition-all"
                        >
                            <Package className="w-3 h-3 mr-1" strokeWidth={2.5} /> Restock
                        </Button>
                    )}
                </div>

                {/* --- 4. EXPANDING PRICE MATRIX (Hidden by Default) --- */}
                {isPriceVisible && (
                    <div className="grid grid-cols-2 divide-x divide-slate-200 p-2.5 sm:p-3 gap-x-2 bg-indigo-50/20 border-t border-slate-100 animate-in slide-in-from-top-2 duration-200 shrink-0">
                        {/* Package Pricing */}
                        <div className="flex flex-col gap-1.5 pr-1.5">
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Package</span>
                            {!isPriceMode ? (
                                <>
                                    <div className="flex justify-between items-center"><span className="text-[9px] font-bold text-slate-400">BUY</span><span className="text-[10px] font-black">{formatCurrency(prices.buyingPriceFull)}</span></div>
                                    <div className="flex justify-between items-center"><span className="text-[9px] font-bold text-slate-400">WHL</span><span className="text-[10px] font-black">{formatCurrency(prices.wholesalePriceFull)}</span></div>
                                    <div className="flex justify-between items-center pt-1 mt-0.5 border-t border-slate-200/60"><span className="text-[9px] font-black text-indigo-500">RTL</span><span className="text-[11px] font-black text-indigo-600">{formatCurrency(prices.retailPriceFull)}</span></div>
                                </>
                            ) : (
                                <div className="space-y-1.5">
                                    <Input type="number" placeholder="Buy" value={prices.buyingPriceFull} onChange={(e) => handlePriceChange('buyingPriceFull', e.target.value)} className="h-6 text-[10px] px-1.5 text-right font-bold bg-white border-slate-200" />
                                    <Input type="number" placeholder="Whsl" value={prices.wholesalePriceFull} onChange={(e) => handlePriceChange('wholesalePriceFull', e.target.value)} className="h-6 text-[10px] px-1.5 text-right font-bold bg-white border-slate-200" />
                                    <Input type="number" placeholder="Rtl" value={prices.retailPriceFull} onChange={(e) => handlePriceChange('retailPriceFull', e.target.value)} className="h-6 text-[10px] px-1.5 text-right font-black border-indigo-300 focus:ring-indigo-500" />
                                </div>
                            )}
                        </div>

                        {/* Refill Pricing */}
                        <div className="flex flex-col gap-1.5 pl-1.5">
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Refill</span>
                            {!isPriceMode ? (
                                <>
                                    <div className="flex justify-between items-center"><span className="text-[9px] font-bold text-slate-400">BUY</span><span className="text-[10px] font-black">{formatCurrency(prices.buyingPriceGas)}</span></div>
                                    <div className="flex justify-between items-center"><span className="text-[9px] font-bold text-slate-400">WHL</span><span className="text-[10px] font-black">{formatCurrency(prices.wholesalePriceGas)}</span></div>
                                    <div className="flex justify-between items-center pt-1 mt-0.5 border-t border-slate-200/60"><span className="text-[9px] font-black text-indigo-500">RTL</span><span className="text-[11px] font-black text-indigo-600">{formatCurrency(prices.retailPriceGas)}</span></div>
                                </>
                            ) : (
                                <div className="space-y-1.5">
                                    <Input type="number" placeholder="Buy" value={prices.buyingPriceGas} onChange={(e) => handlePriceChange('buyingPriceGas', e.target.value)} className="h-6 text-[10px] px-1.5 text-right font-bold bg-white border-slate-200" />
                                    <Input type="number" placeholder="Whsl" value={prices.wholesalePriceGas} onChange={(e) => handlePriceChange('wholesalePriceGas', e.target.value)} className="h-6 text-[10px] px-1.5 text-right font-bold bg-white border-slate-200" />
                                    <Input type="number" placeholder="Rtl" value={prices.retailPriceGas} onChange={(e) => handlePriceChange('retailPriceGas', e.target.value)} className="h-6 text-[10px] px-1.5 text-right font-black border-indigo-300 focus:ring-indigo-500" />
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </Card>

            <DefectModal
                isOpen={defectModalOpen}
                onClose={() => setDefectModalOpen(false)}
                item={item}
                storeId={storeId}
            />
        </>
    );
};