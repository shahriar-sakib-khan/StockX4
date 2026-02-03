import { TableBody } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUpdateInventory } from "../hooks/useCylinders";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2, Save, ShoppingCart, Banknote } from "lucide-react";
import { BuyStockModal } from "./BuyStockModal";
import { useNavigate } from "react-router-dom";
import { DefectModal } from "./DefectModal";
import { InventoryBadge, InventoryCell, InventoryCountCell, InventoryHeadCell, InventoryPriceCell, InventoryRow, InventoryTableWrapper, InventoryTableHeader } from "@/components/common/InventoryTableComponents";

interface InventoryRowProps {
    item: any;
    storeId: string;
    onBuy: (item: any) => void;
    onSell: (item: any) => void;
}

const InventoryRowComponent = ({ item, storeId, onBuy, onSell }: InventoryRowProps) => {
    const [defectModalOpen, setDefectModalOpen] = useState(false);

    // Sync only prices for display formatting
    const prices = {
        fullCylinder: Math.round(item.prices?.fullCylinder || 0),
        gasOnly: Math.round(item.prices?.gasOnly || 0)
    };

    const counts = {
        full: item.counts?.full || 0,
        empty: item.counts?.empty || 0,
        defected: item.counts?.defected || 0
    };

    return (
        <>
            <InventoryRow key={item._id}>
                <InventoryCell>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.variant.cylinderColor }} />
                        <span className="font-medium whitespace-nowrap text-base">{item.variant.size}</span>
                    </div>
                </InventoryCell>
                <InventoryCell>
                    <InventoryBadge variant={item.variant.regulator === '22mm' ? 'orange' : 'blue'}>
                        {item.variant.regulator}
                    </InventoryBadge>
                </InventoryCell>

                {/* Counts - Read Only */}
                <InventoryCountCell count={counts.full} />
                <InventoryCountCell count={counts.empty} type="muted" />
                <InventoryCountCell count={counts.defected} type="destructive">
                     <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0 ml-1"
                        onClick={() => setDefectModalOpen(true)}
                    >
                         <div className="text-[10px] border px-1 rounded bg-background hover:bg-destructive/10">Adjust</div>
                    </Button>
                </InventoryCountCell>

                {/* Prices - Read Only */}
                <InventoryPriceCell price={prices.fullCylinder} />
                <InventoryPriceCell price={prices.gasOnly} />

                <InventoryCell>
                    <div className="flex items-center justify-end gap-2">
                        <Button
                            size="sm"
                            className="h-8 px-3 text-xs bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border border-red-200"
                            variant="outline"
                            onClick={() => onBuy(item)}
                        >
                            <ShoppingCart className="w-3 h-3 mr-1" /> Buy
                        </Button>
                        <Button
                            size="sm"
                            className="h-8 px-3 text-xs bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 border border-emerald-200"
                            variant="outline"
                            onClick={() => onSell(item)}
                        >
                            <Banknote className="w-3 h-3 mr-1" /> Sell
                        </Button>
                    </div>
                </InventoryCell>
            </InventoryRow>

            <DefectModal
                isOpen={defectModalOpen}
                onClose={() => setDefectModalOpen(false)}
                item={item}
                storeId={storeId}
            />
        </>
    );
};

// Mobile Card View Component
const InventoryCard = ({ item, storeId, onBuy, onSell }: InventoryRowProps) => {
    const update = useUpdateInventory();
    const [prices, setPrices] = useState({
        fullCylinder: item.prices?.fullCylinder || 0,
        gasOnly: item.prices?.gasOnly || 0
    });
    const [counts, setCounts] = useState({
        full: item.counts?.full || 0,
        empty: item.counts?.empty || 0,
        defected: item.counts?.defected || 0
    });
    const [isDirty, setIsDirty] = useState(false);

    useEffect(() => {
        setPrices({ fullCylinder: item.prices?.fullCylinder || 0, gasOnly: item.prices?.gasOnly || 0 });
        setCounts({ full: item.counts?.full || 0, empty: item.counts?.empty || 0, defected: item.counts?.defected || 0 });
        setIsDirty(false);
    }, [item]);

    const handleSave = () => {
        update.mutate({
            storeId,
            inventoryId: item._id,
            data: {
                prices: { fullCylinder: Number(prices.fullCylinder), gasOnly: Number(prices.gasOnly) },
                counts: { full: Number(counts.full), empty: Number(counts.empty), defected: Number(counts.defected) }
            }
        }, {
            onSuccess: () => {
                toast.success("Updated");
                setIsDirty(false);
            }
        });
    };

    const handlePriceChange = (field: 'fullCylinder' | 'gasOnly', val: string) => {
        setPrices(prev => ({ ...prev, [field]: val }));
        setIsDirty(true);
    };

    const handleCountChange = (field: 'full' | 'empty' | 'defected', val: string) => {
        setCounts(prev => ({ ...prev, [field]: val }));
        setIsDirty(true);
    };

    return (
        <div className="bg-card border rounded-lg p-4 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full border shadow-sm" style={{ backgroundColor: item.variant.cylinderColor }} />
                    <span className="font-bold text-lg">{item.brandName}</span>
                    <span className="text-muted-foreground text-sm">({item.variant.size})</span>
                </div>
                <div className="text-xs font-mono bg-muted px-2 py-1 rounded">{item.variant.regulator}</div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
                <div className="space-y-1">
                    <label className="text-xs text-muted-foreground font-semibold uppercase">Stock</label>
                    <Input
                        type="number"
                        value={counts.full}
                        onChange={e => handleCountChange('full', e.target.value)}
                        className="text-center h-9"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs text-muted-foreground font-semibold uppercase">Empty</label>
                    <Input
                        type="number"
                        value={counts.empty}
                        onChange={e => handleCountChange('empty', e.target.value)}
                        className="text-center h-9 bg-muted/30"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs text-destructive font-semibold uppercase">Defect</label>
                    <Input
                        type="number"
                        value={counts.defected}
                        onChange={e => handleCountChange('defected', e.target.value)}
                        className="text-center h-9 border-destructive/30 text-destructive bg-destructive/5"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-dashed">
                 <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Full Price</label>
                    <div className="relative">
                        <span className="absolute left-2 top-2 text-xs text-muted-foreground">৳</span>
                        <Input
                            type="number"
                            value={prices.fullCylinder}
                            onChange={e => handlePriceChange('fullCylinder', e.target.value)}
                            className="pl-6 h-9"
                        />
                    </div>
                </div>
                <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Gas Only</label>
                    <div className="relative">
                        <span className="absolute left-2 top-2 text-xs text-muted-foreground">৳</span>
                        <Input
                            type="number"
                            value={prices.gasOnly}
                            onChange={e => handlePriceChange('gasOnly', e.target.value)}
                            className="pl-6 h-9"
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" onClick={() => onBuy(item)}>
                    <ShoppingCart className="w-3 h-3 mr-2" /> Buy Stock
                </Button>
                <Button variant="outline" size="sm" onClick={() => onSell(item)}>
                    <Banknote className="w-3 h-3 mr-2" /> Sell (POS)
                </Button>
            </div>

            <Button
                className="w-full"
                onClick={handleSave}
                disabled={!isDirty || update.isPending}
                variant={isDirty ? "default" : "secondary"}
            >
                {update.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                {isDirty ? "Save Changes" : "Synced"}
            </Button>
        </div>
    );
};

export const InventoryTable = ({ storeId, inventory, onAddToCart }: { storeId: string, inventory: any[], onAddToCart: any }) => {
    // Group by Brand
    const grouped = inventory.reduce((acc: any, item: any) => {
        if (!acc[item.brandName]) acc[item.brandName] = [];
        acc[item.brandName].push(item);
        return acc;
    }, {});

    const navigate = useNavigate();
    const [buyModalOpen, setBuyModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>(null);

    const handleBuy = (item: any) => {
        setSelectedItem(item);
        setBuyModalOpen(true);
    };

    const handleSell = (item: any) => {
        // Redirect to POS
        navigate('/pos');
    };

    return (
        <div className="space-y-4">
            <BuyStockModal
                isOpen={buyModalOpen}
                onClose={() => setBuyModalOpen(false)}
                brandName={selectedItem?.brandName || ''}
                variant={`${selectedItem?.variant?.size} ${selectedItem?.variant?.regulator}`}
                logo={selectedItem?.brandId?.logo}
                cylinderImage={selectedItem?.variant?.cylinderImage}
                onAddToCart={onAddToCart}
                item={selectedItem}
            />
            {Object.entries(grouped).map(([brand, items]: [string, any]) => (
                <div key={brand} className="space-y-2">
                    {/* Header */}
                    <div className="flex items-center gap-3 px-1">
                        {items[0].brandId?.logo ? (
                             <img src={items[0].brandId.logo} alt={brand} className="w-12 h-8 object-contain" />
                        ) : (
                            <div className="w-12 h-8 bg-muted rounded flex items-center justify-center text-xs">No Logo</div>
                        )}
                        <h3 className="font-bold text-lg md:text-xl">{brand}</h3>
                    </div>

                    {/* Mobile: Card View */}
                    <div className="grid grid-cols-1 gap-4 md:hidden">
                        {items.map((item: any) => (
                            <InventoryCard key={item._id} item={item} storeId={storeId} onBuy={handleBuy} onSell={handleSell} />
                        ))}
                    </div>

                    {/* Desktop: Table View */}
                    <div className="hidden md:block">
                        <InventoryTableWrapper>
                            <InventoryTableHeader>
                                <InventoryHeadCell width="w-[10%]">Size</InventoryHeadCell>
                                <InventoryHeadCell width="w-[10%]">Regulator</InventoryHeadCell>
                                <InventoryHeadCell width="w-[8%]" align="center">Package (Full)</InventoryHeadCell>
                                <InventoryHeadCell width="w-[8%]" align="center">Refill (Empty)</InventoryHeadCell>
                                <InventoryHeadCell width="w-[8%]" align="center" className="text-destructive">Defected</InventoryHeadCell>
                                <InventoryHeadCell width="w-[12%]" align="right">Full Price</InventoryHeadCell>
                                <InventoryHeadCell width="w-[12%]" align="right">Refill Price</InventoryHeadCell>
                                <InventoryHeadCell width="w-[20%]" align="right">Actions</InventoryHeadCell>
                            </InventoryTableHeader>
                            <TableBody>
                                {items.map((item: any) => (
                                    <InventoryRowComponent key={item._id} item={item} storeId={storeId} onBuy={handleBuy} onSell={handleSell} />
                                ))}
                            </TableBody>
                        </InventoryTableWrapper>
                    </div>
                </div>
            ))}
        </div>
    );
}
