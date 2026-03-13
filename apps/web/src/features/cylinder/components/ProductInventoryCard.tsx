import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Flame, Settings, PenLine, Check, X, PackagePlus } from "lucide-react";
import { useState, useEffect } from "react";
import { useUpdateInventory } from "../hooks/useCylinders";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ProductInventoryCardProps {
    item: any;
    storeId: string;
    onBuy: (item: any) => void;
    onSell: (item: any) => void;
    onAdjust: (item: any) => void;
    type: 'stove' | 'regulator';
    image?: string;
    viewMode?: 'normal' | 'defected';
    onSavePrices?: (prices: { retailPriceFull: number, wholesalePriceFull: number, buyingPriceFull: number }) => Promise<void>;
}

export const ProductInventoryCard = ({ item, storeId, onBuy, onSell, onAdjust, type, image, viewMode = 'normal', onSavePrices }: ProductInventoryCardProps) => {
    const isStove = type === 'stove';
    const navigate = useNavigate();
    const variantLabel = isStove ? `${item.variant?.burners} Burner` : `${item.variant?.size}`;
    const modelId = `${item.brandName.substring(0, 3).toUpperCase()}-${isStove ? item.variant?.burners + '01' : item.variant?.size?.replace('mm', '')}`;
    const displayImage = item.originalProduct?.product?.image || item.originalProduct?.image || image || item.variant?.cylinderImage;

    // Price Edit Logic
    const [isPriceMode, setIsPriceMode] = useState(false);
    const [prices, setPrices] = useState({
        retailPriceFull: item.prices?.retailPriceFull || 0,
        wholesalePriceFull: item.prices?.wholesalePriceFull || 0,
        buyingPriceFull: item.prices?.buyingPriceFull || 0
    });
    const update = useUpdateInventory();
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setPrices({
            retailPriceFull: item.prices?.retailPriceFull || 0,
            wholesalePriceFull: item.prices?.wholesalePriceFull || 0,
            buyingPriceFull: item.prices?.buyingPriceFull || 0
        });
    }, [item]);

    const handleSavePrices = async () => {
        if (onSavePrices) {
             setIsSaving(true);
             try {
                await onSavePrices(prices);
                setIsPriceMode(false);
             } catch (e) {
                console.error(e);
             } finally {
                setIsSaving(false);
             }
             return;
        }

        update.mutate({
            storeId,
            data: {
                productId: item.productId,
                prices: {
                    retailPriceFull: prices.retailPriceFull,
                    wholesalePriceFull: prices.wholesalePriceFull,
                    buyingPriceFull: prices.buyingPriceFull
                }
            }
        }, {
            onSuccess: () => {
                toast.success("Price Updated");
                setIsPriceMode(false);
            }
        });
    };

    return (
        <Card className="overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 group bg-white shadow-sm hover:shadow-md h-full flex flex-col">
            <div className="p-4 flex flex-col h-full gap-4">
                {/* 1. Product Image Area */}
                <div className="w-full aspect-square bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center p-4 relative">
                     <Badge variant="secondary" className="absolute top-2 right-2 font-semibold shadow-sm bg-white/80 backdrop-blur-sm">
                        {variantLabel}
                    </Badge>
                    {displayImage ? (
                        <img
                            src={displayImage}
                            alt={item.brandName}
                            className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
                        />
                    ) : (
                        <div className="text-slate-300">
                            {isStove ? <Flame className="w-16 h-16" /> : <Settings className="w-16 h-16" />}
                        </div>
                    )}
                </div>

                {/* 2. Product Details */}
                <div className="flex-1 space-y-3">
                    <div>
                        <h3 className="font-bold text-lg text-slate-800 leading-tight">{item.brandName}</h3>
                        <p className="text-xs text-muted-foreground font-mono mt-1">{modelId}</p>
                    </div>

                    {/* Inventory Counters - Big & Colorful */}
                    <div className={viewMode === 'normal' || viewMode === 'defected' ? 'grid grid-cols-1 gap-2' : 'grid grid-cols-2 gap-2'}>
                        {viewMode === 'normal' && (
                            <div className="bg-income/10 rounded-lg py-2 px-1 flex flex-col items-center justify-center text-center border border-income/20 min-w-0 shadow-sm transition-all hover:shadow-md">
                                <span className="text-[9px] font-black text-income uppercase tracking-wider truncate w-full mb-0.5">Stock</span>
                                <span className="text-3xl lg:text-4xl font-black text-income leading-none">
                                    {item.counts?.full || 0}
                                </span>
                            </div>
                        )}
                        {viewMode === 'defected' && (
                            <div
                                className="bg-expense/10 rounded-lg py-2 px-1 flex flex-col items-center justify-center text-center border border-expense/20 cursor-pointer hover:bg-expense/20 transition-colors group/defect min-w-0 shadow-sm transition-all hover:shadow-md relative"
                                onClick={() => onAdjust(item)}
                                title="Manage Defects"
                            >
                                <div className="absolute top-1 right-1 p-1 bg-white/50 rounded-full hover:bg-white transition-colors">
                                    <PenLine className="w-3 h-3 text-expense" />
                                </div>
                                <span className="text-[9px] font-black text-expense uppercase tracking-wider truncate w-full mb-0.5">Defect</span>
                                <span className="text-3xl lg:text-4xl font-black text-expense leading-none">
                                    {item.counts?.defected || 0}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Price Section */}
                    {viewMode !== 'defected' && (
                        isPriceMode ? (
                             <div className="border-2 border-indigo-100 rounded-lg p-2 bg-indigo-50/50 space-y-2">
                                <div className="grid grid-cols-3 gap-1">
                                    <div className="group">
                                        <label className="text-[10px] font-bold text-rose-500 uppercase tracking-wider block text-center group-focus-within:text-rose-600">Buy</label>
                                        <Input
                                            type="number"
                                            value={prices.buyingPriceFull}
                                            onChange={(e) => setPrices((prev) => ({ ...prev, buyingPriceFull: parseFloat(e.target.value) }))}
                                            className="h-12 text-center font-bold bg-white text-sm text-rose-600 border-rose-200 focus-visible:ring-rose-500 px-1"
                                        />
                                    </div>
                                    <div className="group">
                                        <label className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block text-center group-focus-within:text-blue-700">Whsle</label>
                                        <Input
                                            type="number"
                                            value={prices.wholesalePriceFull}
                                            onChange={(e) => setPrices((prev) => ({ ...prev, wholesalePriceFull: parseFloat(e.target.value) }))}
                                            className="h-12 text-center font-bold bg-white text-sm text-blue-700 border-blue-200 focus-visible:ring-blue-500 px-1"
                                        />
                                    </div>
                                    <div className="group">
                                        <label className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block text-center group-focus-within:text-emerald-700">Retail</label>
                                        <Input
                                            type="number"
                                            value={prices.retailPriceFull}
                                            onChange={(e) => setPrices((prev) => ({ ...prev, retailPriceFull: parseFloat(e.target.value) }))}
                                            className="h-12 text-center font-bold bg-white text-sm text-emerald-700 border-emerald-200 focus-visible:ring-emerald-500 px-1"
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button size="sm" variant="outline" className="flex-1 h-12 text-xs" onClick={() => setIsPriceMode(false)}>
                                        <X className="w-4 h-4 mr-1" /> Cancel
                                    </Button>
                                    <Button size="sm" className="flex-1 h-12 text-xs bg-indigo-600 hover:bg-indigo-700 text-white" onClick={handleSavePrices} disabled={update.isPending || isSaving}>
                                        {(update.isPending || isSaving) ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4 mr-1" /> Save</>}
                                    </Button>
                                </div>
                             </div>
                        ) : (
                            <div className="flex items-stretch gap-2">
                                <div className="flex-1 text-center py-2 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col justify-center h-full overflow-hidden w-full">
                                    <span className="text-[10px] font-black text-slate-500 uppercase block tracking-widest mb-1 border-b border-slate-100 pb-0.5 mx-2">Price Tiers</span>
                                    <div className="flex justify-between items-center w-full px-3">
                                        <span className="text-[10px] font-black text-slate-400">Buy</span>
                                        <span className="text-base font-black text-rose-500">৳{item.prices?.buyingPriceFull || 0}</span>
                                    </div>
                                    <div className="flex justify-between items-center w-full px-3">
                                        <span className="text-[10px] font-black text-slate-400">Whsle</span>
                                        <span className="text-base font-black text-blue-600">৳{item.prices?.wholesalePriceFull || 0}</span>
                                    </div>
                                    <div className="flex justify-between items-center w-full px-3">
                                        <span className="text-[10px] font-black text-slate-400">Retail</span>
                                        <span className="text-base font-black text-emerald-600">৳{item.prices?.retailPriceFull || 0}</span>
                                    </div>
                                </div>
                                 <Button
                                    variant="outline"
                                    size="icon"
                                    className="min-h-12 w-12 flex flex-col items-center justify-center gap-0.5 border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-all shadow-sm group/edit shrink-0 active:scale-95"
                                    onClick={() => setIsPriceMode(true)}
                                    title="Edit Price"
                                >
                                    <PenLine className="w-5 h-5 group-hover/edit:scale-110 transition-transform" />
                                    <span className="text-[8px] font-black uppercase">Edit</span>
                                </Button>
                            </div>
                        )
                    )}
                </div>

                {/* 3. Actions */}
                <div className="flex flex-col sm:flex-row items-stretch gap-2 mt-auto pt-2">
                    {viewMode === 'defected' ? (
                        <Button
                            className="w-full h-12 bg-rose-600 hover:bg-rose-700 text-white font-black shadow-sm transition-all active:scale-95"
                            onClick={() => onAdjust(item)}
                        >
                            <PenLine className="w-5 h-5 mr-2" />
                            Edit Defected
                        </Button>
                    ) : (
                        <Button
                            className="flex-1 h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-black shadow-sm shadow-primary/30 hover:shadow-md transition-all active:scale-95"
                            onClick={() => onBuy(item)}
                        >
                            <PackagePlus className="w-5 h-5 mr-2" />
                            Restock Item
                        </Button>
                    )}
                </div>
            </div>
        </Card>
    );
};
