import { useState } from "react";
import { Loader2, Flame, Filter, Plus, ShieldAlert, Package } from "lucide-react";
import { useInventory, useUpdateInventory } from "@/features/cylinder/hooks/useCylinders";
import { useStoreBrands } from "@/features/brand/hooks/useBrands";
import { CreateBrandModal } from "@/features/brand/components/CreateBrandModal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { DefectModal } from "@/features/cylinder/components/DefectModal";
import { RestockSidebar } from "@/features/cylinder/components/RestockSidebar";
import { ProductInventoryCard } from "@/features/cylinder/components/ProductInventoryCard";
import { AddProductModal } from "@/features/cylinder/components/AddProductModal";
import { SelectDefectProductModal } from "@/features/cylinder/components/SelectDefectProductModal";
import { transactionApi, useCreateTransaction } from "@/features/pos/api/transaction.api";
import { HistoryInvoiceModal } from "@/features/history/components/HistoryInvoiceModal";
import { toast } from "sonner";

export const StovesContent = ({ storeId }: { storeId: string }) => {
    const { data: inventoryData, isLoading: isInventoryLoading } = useInventory(storeId);
    const { data: brandsData, isLoading: isBrandsLoading } = useStoreBrands(storeId);
    const updateInventory = useUpdateInventory();

    // Filters
    const [search, setSearch] = useState("");
    const [burnerFilter, setBurnerFilter] = useState<number | null>(null);
    const [viewMode, setViewMode] = useState<'normal' | 'defected'>('normal');

    // Modals
    const [isManageOpen, setManageOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isSelectDefectModalOpen, setIsSelectDefectModalOpen] = useState(false);

    // Restock sidebar
    const [restockOpen, setRestockOpen] = useState(false);
    const [defectModalOpen, setDefectModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [liveItem, setLiveItem] = useState<any>(null);
    const createTransaction = useCreateTransaction();
    const [invoiceTx, setInvoiceTx] = useState<any>(null);
    const isProcessing = createTransaction.isPending;

    const products = inventoryData?.inventory || [];
    // Filter for STOVE brands (Used by AddProductModal)
    const brands = (brandsData?.brands || []).filter((b: any) => b.isActive !== false && b.type === 'stove');

    // Map StoreInventory items
    const displayInventory = products.filter((p: any) => p.product?.category === 'stove').map((p: any) => ({
        _id: p._id,
        productId: p.productId,
        category: 'stove',
        brandName: p.product?.details?.brandName || 'Unknown',
        brandLogo: '/placeholder.png', // Or fallback to brand logo if mapped
        variant: {
             burners: Number(p.product?.details?.burners || 1),
             cylinderImage: p.product?.image || '',
             modelNumber: p.product?.details?.model || ''
        },
        counts: {
             full: p.counts?.full || 0,
             empty: p.counts?.empty || 0,
             defected: p.counts?.defected || 0
        },
        prices: {
             retailPriceFull: p.prices?.retailPriceFull || 0,
             wholesalePriceFull: p.prices?.wholesalePriceFull || 0,
             buyingPriceFull: p.prices?.buyingPriceFull || 0,
             fullCylinder: p.prices?.retailPriceFull || 0, // Fallback for POS
        },
        originalProduct: p
    }));

    // Filter Logic
    const filteredInventory = displayInventory.filter((item: any) => {
        if (search && !item.brandName.toLowerCase().includes(search.toLowerCase())) return false;
        if (burnerFilter && item.variant.burners !== burnerFilter) return false;
        if (viewMode === 'defected' && (item.counts?.defected || 0) <= 0) return false;
        return true;
    });

    // Stats Helper
    const getStats = (items: any[]) => {
        const stock = items.reduce((sum: number, item: any) => sum + (item.counts.full || 0), 0);
        const damaged = items.reduce((sum: number, item: any) => sum + (item.counts.defected || 0), 0);
        return { stock, damaged };
    };

    const stats = {
        total: getStats(displayInventory),
        oneBurner: getStats(displayInventory.filter((i: any) => i.variant.burners === 1)),
        twoBurner: getStats(displayInventory.filter((i: any) => i.variant.burners === 2)),
        threeBurner: getStats(displayInventory.filter((i: any) => i.variant.burners === 3)),
        fourBurner: getStats(displayInventory.filter((i: any) => i.variant.burners === 4)),
    };

    const handleBuy = (item: any) => {
        setSelectedItem(item);
        setLiveItem(item);
        setRestockOpen(true);
    };

    const handleAdjust = (item: any) => {
        setSelectedItem(item);
        setDefectModalOpen(true);
    }

    const handleSavePrices = async (item: any, newPrices: { retailPriceFull: number, wholesalePriceFull: number, buyingPriceFull: number }) => {
         await updateInventory.mutateAsync({
             storeId: storeId,
             data: {
                 productId: item.productId,
                 prices: {
                     ...(item.originalProduct.prices || {}),
                     retailPriceFull: newPrices.retailPriceFull,
                     wholesalePriceFull: newPrices.wholesalePriceFull,
                     buyingPriceFull: newPrices.buyingPriceFull
                 }
             }
         });
    };

    const handleConfirmRestock = async (item: any, quantity: number, purchaseType: string, totalAmount: number, unitPrice: number, wholesalePrice?: number, retailPrice?: number) => {
        try {
            const transactionItem = {
                 productId: item.productId,
                 type: 'ACCESSORY' as const, // For category mapping
                 quantity: quantity,
                 unitPrice: unitPrice,
                 wholesalePrice,
                 retailPrice,
                 name: `${item.brandName} ${item.variant.burners} Burner Stove`,
                 category: 'Restock Inventory'
            };

            const txResult = await createTransaction.mutateAsync({
                storeId,
                data: {
                    type: 'EXPENSE',
                    paymentMethod: 'CASH',
                    items: [transactionItem as any],
                    finalAmount: totalAmount,
                    paidAmount: totalAmount
                }
            });

            if (txResult?.data) {
                setInvoiceTx(txResult.data);
            }

            setRestockOpen(false);
            toast.success("Stock Added & Transaction Recorded.");
        } catch (error: any) {
            // Error is already handled by toast in useCreateTransaction
        }
    };

    const renderSection = (burners: number) => {
        const items = filteredInventory.filter((i: any) => i.variant.burners === burners);
        if (items.length === 0) return null;

        const sectionImage = items[0]?.variant?.cylinderImage || `/stoves/stove-${burners}.png`;

        return (
            <div className="bg-muted/10 rounded-xl p-6 border mb-8 border-dashed">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-white rounded-lg border p-1 shrink-0 flex items-center justify-center shadow-sm">
                        <img src={sectionImage} alt={`${burners} Burner`} className="max-w-full max-h-full object-contain" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black uppercase tracking-tight text-slate-800">{burners} Burner{burners > 1 ? 'S' : ''}</h3>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {items.map((item: any) => (
                        <ProductInventoryCard
                            key={item._id}
                            item={item}
                            type="stove"
                            image={item.variant.cylinderImage}
                            storeId={storeId}
                            onBuy={handleBuy}
                            onSell={() => {}}
                            onAdjust={handleAdjust}
                            viewMode={viewMode}
                            onSavePrices={async (p) => handleSavePrices(item, p)}
                        />
                    ))}
                </div>
            </div>
        );
    };

    if (isInventoryLoading || isBrandsLoading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-300 pb-20">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                 <div
                    className={`border rounded-xl p-4 cursor-pointer transition-all hover:shadow-md ${burnerFilter === null ? 'bg-primary/5 border-primary ring-1 ring-primary' : 'bg-card'}`}
                    onClick={() => setBurnerFilter(null)}
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 text-primary rounded-lg">
                            <Flame className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground font-medium uppercase">Total Units</p>
                            <div className="flex items-baseline gap-1">
                                {viewMode === 'normal' ? (
                                     <span className="text-2xl font-bold">{stats.total.stock}</span>
                                ) : (
                                     <span className="text-2xl font-bold text-destructive">{stats.total.damaged}</span>
                                )}
                            </div>
                            <p className="text-[10px] text-muted-foreground">{viewMode === 'normal' ? 'Stock' : 'Damaged'}</p>
                        </div>
                    </div>
                </div>

                {[1, 2, 3, 4].map(b => {
                    const stat = b === 1 ? stats.oneBurner : b === 2 ? stats.twoBurner : b === 3 ? stats.threeBurner : stats.fourBurner;
                    return (
                    <div
                        key={b}
                        className={`border rounded-xl p-4 cursor-pointer transition-all hover:shadow-md ${burnerFilter === b ? 'bg-orange-50 border-orange-500 ring-1 ring-orange-500' : 'bg-card'}`}
                        onClick={() => setBurnerFilter(burnerFilter === b ? null : b)}
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                                <Flame className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground font-medium uppercase">{b} Burner</p>
                                <div className="flex items-baseline gap-1">
                                    {viewMode === 'normal' ? (
                                         <span className="text-2xl font-bold">{stat.stock}</span>
                                    ) : (
                                         <span className="text-2xl font-bold text-destructive">{stat.damaged}</span>
                                    )}
                                </div>
                                <p className="text-[10px] text-muted-foreground">{viewMode === 'normal' ? 'Stock' : 'Damaged'}</p>
                            </div>
                        </div>
                    </div>
                )})}
            </div>

            {/* Actions Bar */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                 <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-lg border">
                    <Button
                        variant={viewMode === 'normal' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('normal')}
                        className={`min-h-12 ${viewMode === 'normal' ? 'shadow-sm' : ''}`}
                    >
                        <Package className="w-4 h-4 mr-2" />
                        Normal
                    </Button>
                    <Button
                        variant={viewMode === 'defected' ? 'destructive' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('defected')}
                        className={`min-h-12 ${viewMode === 'defected' ? 'shadow-sm' : ''}`}
                    >
                        <ShieldAlert className="w-4 h-4 mr-2" />
                        Defected
                    </Button>
                </div>

                 <div className="relative w-full md:w-[300px] lg:w-[400px]">
                    <Search className="absolute left-3 top-4 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search gas stoves by brand..."
                        className="pl-9 bg-card min-h-12"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                {viewMode === 'normal' ? (
                    <Button onClick={() => setIsAddModalOpen(true)} className="bg-orange-600 hover:bg-orange-700 text-white shrink-0 min-h-12">
                         <Plus className="w-4 h-4 mr-2" /> Add Gas Stoves
                    </Button>
                ) : (
                    <Button onClick={() => setIsSelectDefectModalOpen(true)} variant="destructive" className="shrink-0 min-h-12">
                         <Plus className="w-4 h-4 mr-2" /> Add Defect
                    </Button>
                )}
            </div>

            <CreateBrandModal open={isManageOpen} onClose={() => setManageOpen(false)} storeId={storeId} />

            <AddProductModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                storeId={storeId}
                type="stove"
                existingBrands={brands}
            />

            <SelectDefectProductModal
                 isOpen={isSelectDefectModalOpen}
                 onClose={() => setIsSelectDefectModalOpen(false)}
                 inventory={displayInventory}
                 category="stove"
                 onSelect={(item) => {
                     setIsSelectDefectModalOpen(false);
                     setSelectedItem(item);
                     setDefectModalOpen(true);
                 }}
            />

            {/* Grouped Content */}
            <div className="space-y-8">
                {filteredInventory.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 bg-card border rounded-xl border-dashed">
                        <div className="p-4 bg-muted rounded-full mb-4">
                        <Filter className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <p className="font-medium text-lg">No stoves found</p>
                        <p className="text-muted-foreground text-sm">Try adjusting your filters or adding a new brand.</p>
                    </div>
                ) : (
                    <>
                        {(!burnerFilter || burnerFilter === 1) && renderSection(1)}
                        {(!burnerFilter || burnerFilter === 2) && renderSection(2)}
                        {(!burnerFilter || burnerFilter === 3) && renderSection(3)}
                        {(!burnerFilter || burnerFilter === 4) && renderSection(4)}
                    </>
                )}
            </div>

            {/* RestockSidebar + Focused Card */}
            <RestockSidebar
                isOpen={restockOpen}
                onClose={() => setRestockOpen(false)}
                item={selectedItem}
                storeId={storeId}
                category="stove"
                inventory={displayInventory}
                onConfirm={handleConfirmRestock}
                onVariantChange={(updated) => setLiveItem(updated)}
            />

            {invoiceTx && (
                <HistoryInvoiceModal
                     isOpen={!!invoiceTx}
                     onClose={() => setInvoiceTx(null)}
                     transaction={invoiceTx}
                />
            )}

            <DefectModal
                isOpen={defectModalOpen}
                onClose={() => setDefectModalOpen(false)}
                item={selectedItem}
                storeId={storeId}
            />
        </div>
    );
};
