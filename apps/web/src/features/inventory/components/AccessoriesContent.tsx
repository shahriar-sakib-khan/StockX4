import { useState } from "react";
import { Loader2, Box, Search, Flame, Settings, Plus } from "lucide-react";
import { useProducts } from "@/features/product/hooks/useProducts";
import { Input } from "@/components/ui/input";
import { AccessoryTable } from "./AccessoryTable";
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

    // Filter by Type (Stove/Regulator)
    const categoryItems = (products || []).filter((item: any) => item.type === type);

    const filteredItems = categoryItems.filter((item: any) => {
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
        <div className="flex items-end gap-2">
            <span>{s.stock}</span>
            <span className="text-lg text-muted-foreground font-normal">/</span>
            <span className="text-lg text-red-600 font-bold bg-red-50 px-1 rounded">{s.damaged}</span>
        </div>
    );

    if (isLoading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
             {/* Stats Cards */}
             <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <StatsCard
                    title="Total Units"
                    value={renderValue(stats.total)}
                    subTitle="Stock / Damaged"
                    icon={Box}
                    color="primary"
                    isActive={variantFilter === null}
                    onClick={() => setVariantFilter(null)}
                />
                <StatsCard
                    title={type === 'stove' ? '1 Burner' : '22mm Size'}
                    value={renderValue(stats.variant1)}
                    subTitle="Stock / Damaged"
                    icon={type === 'stove' ? Flame : Settings}
                    color="blue"
                    isActive={type === 'stove' ? variantFilter === '1' : variantFilter === '22mm'}
                    onClick={() => {
                        if (type === 'stove') setVariantFilter(variantFilter === '1' ? null : '1');
                        else setVariantFilter(variantFilter === '22mm' ? null : '22mm');
                    }}
                />
                <StatsCard
                    title={type === 'stove' ? '2 Burners' : '20mm Size'}
                    value={renderValue(stats.variant2)}
                    subTitle="Stock / Damaged"
                    icon={type === 'stove' ? Flame : Settings}
                    color="orange"
                    isActive={type === 'stove' ? variantFilter === '2' : variantFilter === '20mm'}
                    onClick={() => {
                        if (type === 'stove') setVariantFilter(variantFilter === '2' ? null : '2');
                        else setVariantFilter(variantFilter === '20mm' ? null : '20mm');
                    }}
                />
                {type === 'stove' && (
                    <>
                        <StatsCard
                            title="3 Burners"
                            value={renderValue(stats.variant3)}
                            subTitle="Stock / Damaged"
                            icon={Flame}
                            color="red"
                            isActive={variantFilter === '3'}
                            onClick={() => setVariantFilter(variantFilter === '3' ? null : '3')}
                        />
                        <StatsCard
                            title="4 Burners"
                            value={renderValue(stats.variant4)}
                            subTitle="Stock / Damaged"
                            icon={Flame}
                            color="red"
                            isActive={variantFilter === '4'}
                            onClick={() => setVariantFilter(variantFilter === '4' ? null : '4')}
                        />
                    </>
                )}
             </div>

             {/* Filter Bar */}
             <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-card p-4 rounded-xl border">
                 <div className="relative w-full sm:w-[300px]">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder={`Search ${title.toLowerCase()}...`}
                        className="pl-9"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Button onClick={() => setIsAddModalOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" /> Add {title}
                </Button>
             </div>

             {/* Content Tables */}
             {type === 'stove' ? (
                 <div className="space-y-8">
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
                             <div key={burnerCount} className="space-y-4">
                                <div className="flex items-center gap-4">
                                     <img src={images[burnerCount]} alt={`${burnerCount} Burner`} className="h-24 w-24 object-contain p-2 border rounded-lg bg-white" />
                                     <div className="px-4 py-2">
                                         <h3 className="text-xl font-bold uppercase tracking-wider text-foreground">{burnerCount} Burner{burnerCount !== '1' && 's'}</h3>
                                     </div>
                                </div>
                                <AccessoryTable
                                    items={burnerItems}
                                    type={type}
                                    storeId={storeId}
                                    onSell={handleSell}
                                />
                             </div>
                         );
                     })}
                 </div>
             ) : (
                 <div className="space-y-8">
                     {['22mm', '20mm'].map((size) => {
                         const regulatorItems = filteredItems.filter((i: any) => i.size === size);
                         if (regulatorItems.length === 0) return null;

                         const images: Record<string, string> = {
                             '22mm': 'https://res.cloudinary.com/dgmcwmwof/image/upload/v1770668033/stockx/regulators/regulator-22.png',
                             '20mm': 'https://res.cloudinary.com/dgmcwmwof/image/upload/v1770668031/stockx/regulators/regulator-20.png'
                         };

                         return (
                             <div key={size} className="space-y-4">
                                <div className="flex items-center gap-4">
                                     <img src={images[size]} alt={`${size} Regulator`} className="h-24 w-24 object-contain p-2 border rounded-lg bg-white" />
                                     <div className="px-4 py-2">
                                         <h3 className="text-xl font-bold uppercase tracking-wider text-foreground">{size}</h3>
                                     </div>
                                </div>
                                <AccessoryTable
                                    items={regulatorItems}
                                    type={type}
                                    storeId={storeId}
                                    onSell={handleSell}
                                />
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
