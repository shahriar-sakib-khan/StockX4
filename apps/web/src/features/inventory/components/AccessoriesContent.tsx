import { useState } from "react";
import { Loader2, Box, Search, Flame, Settings, Plus } from "lucide-react";
import { useProducts } from "@/features/product/hooks/useProducts";
import { useStoreBrands } from "@/features/brand/hooks/useBrands";
import { Input } from "@/components/ui/input";
import { AccessoryCard } from "./AccessoryCard";
import { StatsCard } from "@/components/common/StatsCard";
import { Button } from "@/components/ui/button";

import { toast } from "sonner";
import { AddProductModal } from "./AddProductModal";
import React from "react";

interface AccessoriesContentProps {
    storeId: string;
    type: 'stove' | 'regulator';
    title: string;
    onAddToCart: (item: any, quantity: number, purchaseType: 'product', totalAmount: number, unitPrice: number) => void;
}

export const AccessoriesContent = ({ storeId, type, title, onAddToCart }: AccessoriesContentProps) => {
    const { data: products, isLoading } = useProducts();
    const [search, setSearch] = useState("");
    const [variantFilter, setVariantFilter] = useState<string | number | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const handleSell = (item: any) => {
         const price = item.sellingPrice || 0;
         onAddToCart(item, 1, 'product', price, price);
         toast.success("Added to cart");
    };

    const { data: storeBrandsData } = useStoreBrands(storeId);

    const categoryItems = (products || []).filter((item: any) => item.type === type);

    const activeBrandNames = new Set(
        (storeBrandsData?.brands || [])
            .filter((b: any) => b.isActive !== false)
            .map((b: any) => b.name)
    );

    const filteredItems = categoryItems.filter((item: any) => {
        if (item.brand && !activeBrandNames.has(item.brand)) return false;
        if (search && !item.name.toLowerCase().includes(search.toLowerCase())) return false;
        if (type === 'stove' && variantFilter) {
            if (item.burnerCount !== variantFilter) return false;
        }
        if (type === 'regulator' && variantFilter) {
            if (item.size !== variantFilter) return false;
        }
        return true;
    });

    const calculateStats = (items: any[]) => {
        return items.reduce((acc, item) => ({
            stock: acc.stock + (item.stock || 0),
            damaged: acc.damaged + (item.damagedStock || 0)
        }), { stock: 0, damaged: 0 });
    };

    const stats = {
        total: calculateStats(categoryItems),
        variant1: calculateStats(categoryItems.filter((i: any) => type === 'stove' ? i.burnerCount === '1' : i.size === '22mm')),
        variant2: calculateStats(categoryItems.filter((i: any) => type === 'stove' ? i.burnerCount === '2' : i.size === '20mm')),
        variant3: calculateStats(categoryItems.filter((i: any) => type === 'stove' && i.burnerCount === '3')),
        variant4: calculateStats(categoryItems.filter((i: any) => type === 'stove' && i.burnerCount === '4')),
    };

    const renderValue = (s: { stock: number, damaged: number }) => (
        <div className="flex flex-col gap-1 mt-1.5">
            <span className="text-2xl font-black text-foreground tracking-tight leading-none">{s.stock}</span>
            {s.damaged > 0 ? (
                <span className="text-[9px] font-black text-rose-600 bg-rose-500/10 px-1.5 py-0.5 rounded-md w-fit uppercase tracking-widest border border-rose-500/20">
                    {s.damaged} Damaged
                </span>
            ) : (
                <span className="text-[9px] font-black text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded-md w-fit uppercase tracking-widest border border-emerald-500/20">
                    Healthy
                </span>
            )}
        </div>
    );

    if (isLoading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-primary/50" size={32} /></div>;

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-500 font-sans pb-10">
            
             {/* MOBILE OPTIMIZED: Swipeable Stats Carousel */}
             <div className="relative -mx-4 px-4 sm:mx-0 sm:px-0">
                 <div className="flex sm:grid sm:grid-cols-3 lg:grid-cols-5 gap-3 overflow-x-auto hide-scrollbar snap-x snap-mandatory pb-2">
                    <div className="snap-start shrink-0 w-[160px] sm:w-auto">
                        <StatsCard
                            title="Total Units"
                            value={renderValue(stats.total)}
                            subTitle="Overall Inventory"
                            icon={Box}
                            color="primary"
                            isActive={variantFilter === null}
                            onClick={() => setVariantFilter(null)}
                        />
                    </div>
                    <div className="snap-start shrink-0 w-[160px] sm:w-auto">
                        <StatsCard
                            title={type === 'stove' ? '1 Burner' : '22mm Size'}
                            value={renderValue(stats.variant1)}
                            subTitle="Category Stock"
                            icon={type === 'stove' ? Flame : Settings}
                            color="blue"
                            isActive={type === 'stove' ? variantFilter === '1' : variantFilter === '22mm'}
                            onClick={() => {
                                if (type === 'stove') setVariantFilter(variantFilter === '1' ? null : '1');
                                else setVariantFilter(variantFilter === '22mm' ? null : '22mm');
                            }}
                        />
                    </div>
                    <div className="snap-start shrink-0 w-[160px] sm:w-auto">
                        <StatsCard
                            title={type === 'stove' ? '2 Burners' : '20mm Size'}
                            value={renderValue(stats.variant2)}
                            subTitle="Category Stock"
                            icon={type === 'stove' ? Flame : Settings}
                            color="orange"
                            isActive={type === 'stove' ? variantFilter === '2' : variantFilter === '20mm'}
                            onClick={() => {
                                if (type === 'stove') setVariantFilter(variantFilter === '2' ? null : '2');
                                else setVariantFilter(variantFilter === '20mm' ? null : '20mm');
                            }}
                        />
                    </div>
                    {type === 'stove' && (
                        <>
                            <div className="snap-start shrink-0 w-[160px] sm:w-auto">
                                <StatsCard
                                    title="3 Burners"
                                    value={renderValue(stats.variant3)}
                                    subTitle="Category Stock"
                                    icon={Flame}
                                    color="red"
                                    isActive={variantFilter === '3'}
                                    onClick={() => setVariantFilter(variantFilter === '3' ? null : '3')}
                                />
                            </div>
                            <div className="snap-start shrink-0 w-[160px] sm:w-auto">
                                <StatsCard
                                    title="4 Burners"
                                    value={renderValue(stats.variant4)}
                                    subTitle="Category Stock"
                                    icon={Flame}
                                    color="red"
                                    isActive={variantFilter === '4'}
                                    onClick={() => setVariantFilter(variantFilter === '4' ? null : '4')}
                                />
                            </div>
                        </>
                    )}
                 </div>
             </div>

             {/* MOBILE OPTIMIZED: Sticky Frosted Toolbar */}
             <div className="sticky top-[110px] sm:top-[120px] z-10 flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center bg-background/80 backdrop-blur-xl p-3 rounded-2xl border border-border/50 shadow-sm -mx-2 px-2 sm:mx-0 sm:px-3">
                 <div className="relative w-full sm:w-[320px]">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                    <Input
                        placeholder={`Search ${title.toLowerCase()}...`}
                        className="pl-10 bg-muted/40 border-transparent focus-visible:ring-1 focus-visible:ring-primary focus-visible:bg-background rounded-xl h-11 sm:h-10 transition-all text-sm"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Button 
                    onClick={() => setIsAddModalOpen(true)}
                    className="rounded-xl h-11 sm:h-10 px-5 font-bold tracking-wide shadow-[0_4px_14px_rgba(var(--primary),0.25)] hover:shadow-[0_6px_20px_rgba(var(--primary),0.3)] transition-all active:scale-95 w-full sm:w-auto"
                >
                    <Plus className="w-4 h-4 mr-2" strokeWidth={3} /> Add {title}
                </Button>
             </div>

             {/* MOBILE OPTIMIZED: High-Density Grids */}
             {type === 'stove' ? (
                 <div className="space-y-10 mt-2">
                     {['1', '2', '3', '4'].map((burnerCount) => {
                         const burnerItems = filteredItems.filter((i: any) => i.burnerCount === burnerCount);
                         if (burnerItems.length === 0) return null;

                         const images: Record<string, string> = {
                             '1': 'https://res.cloudinary.com/dgmcwmwof/image/upload/v1770668020/stockx/stoves/stove-1.png',
                             '2': 'https://res.cloudinary.com/dgmcwmwof/image/upload/v1770668023/stockx/stoves/stove-2.png',
                             '3': 'https://res.cloudinary.com/dgmcwmwof/image/upload/v1770668025/stockx/stoves/stove-3.png',
                             '4': 'https://res.cloudinary.com/dgmcwmwof/image/upload/v1770668027/stockx/stoves/stove-4.png'
                         };

                         return (
                             <div key={burnerCount} className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <div className="flex items-center gap-3">
                                    <div className="p-1.5 bg-white rounded-lg shadow-sm border border-border/40 shrink-0">
                                        <img src={images[burnerCount]} alt={`${burnerCount} Burner`} className="h-6 w-6 object-contain drop-shadow-sm" />
                                    </div>
                                    <h3 className="text-base font-black text-foreground tracking-tight">{burnerCount} Burner</h3>
                                    <div className="flex-1 h-px bg-gradient-to-r from-border/60 to-transparent ml-2" />
                                </div>

                                {/* CRITICAL MOBILE FIX: grid-cols-2 instead of 1 so it doesn't require endless scrolling */}
                                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                                    {burnerItems.map((item: any) => (
                                        <AccessoryCard
                                            key={item._id}
                                            item={item}
                                            storeId={storeId}
                                            onSell={handleSell}
                                        />
                                    ))}
                                </div>
                             </div>
                         );
                     })}
                 </div>
             ) : (
                 <div className="space-y-10 mt-2">
                     {['22mm', '20mm'].map((size) => {
                         const regulatorItems = filteredItems.filter((i: any) => i.size === size);
                         if (regulatorItems.length === 0) return null;

                         const images: Record<string, string> = {
                             '22mm': 'https://res.cloudinary.com/dgmcwmwof/image/upload/v1770668033/stockx/regulators/regulator-22.png',
                             '20mm': 'https://res.cloudinary.com/dgmcwmwof/image/upload/v1770668031/stockx/regulators/regulator-20.png'
                         };

                         return (
                             <div key={size} className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <div className="flex items-center gap-3">
                                    <div className="p-1.5 bg-white rounded-lg shadow-sm border border-border/40 shrink-0">
                                        <img src={images[size]} alt={`${size} Regulator`} className="h-6 w-6 object-contain drop-shadow-sm" />
                                    </div>
                                    <h3 className="text-base font-black text-foreground tracking-tight">{size} Valve</h3>
                                    <div className="flex-1 h-px bg-gradient-to-r from-border/60 to-transparent ml-2" />
                                </div>

                                {/* CRITICAL MOBILE FIX: grid-cols-2 */}
                                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                                    {regulatorItems.map((item: any) => (
                                        <AccessoryCard
                                            key={item._id}
                                            item={item}
                                            storeId={storeId}
                                            onSell={handleSell}
                                        />
                                    ))}
                                </div>
                             </div>
                         );
                     })}
                 </div>
             )}

            <AddProductModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                type={type}
                storeId={storeId}
            />
        </div>
    );
};