import { useState, useEffect, useMemo } from 'react';
import { X, RefreshCw, Package, ShoppingCart, PackagePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { REGULATOR_TYPES } from "@/constants/inventory";
import { useStoreSizes } from "@/features/store/hooks/useStoreSizes";
import { useStoreBrands } from "@/features/brand/hooks/useBrands";

interface RestockSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    item: any;
    storeId: string;
    category?: 'cylinder' | 'stove' | 'regulator';
    onConfirm: (item: any, quantity: number, purchaseType: 'refill' | 'package', totalAmount: number, unitPrice: number) => void;
    // Callback to sync changes back so center card can update
    onVariantChange?: (updatedItem: any) => void;
    // Callback to reflect typed quantity into the card's pending badge
    onQuantityChange?: (qty: number) => void;
}

export const RestockSidebar = ({ isOpen, onClose, item, storeId, category = 'cylinder', onConfirm, onVariantChange, onQuantityChange }: RestockSidebarProps) => {
    const { data: brandData } = useStoreBrands(storeId);
    const { sizes: cylinderSizes } = useStoreSizes(storeId);

    const brands = useMemo(() => {
        return (brandData?.brands || []).filter((b: any) =>
            b.isActive !== false &&
            (category === 'cylinder' ? (b.type === 'cylinder' || !b.type) : b.type === category)
        );
    }, [brandData, category]);

    // Selection States
    const [selectedBrandId, setSelectedBrandId] = useState<string>('');
    const [selectedSize, setSelectedSize] = useState<string>('12kg');
    const [selectedRegulator, setSelectedRegulator] = useState<string>('22mm');
    const [selectedBurners, setSelectedBurners] = useState<number>(1);
    const [selectedRegulatorSize, setSelectedRegulatorSize] = useState<string>('22mm');

    const [purchaseType, setPurchaseType] = useState<'refill' | 'package'>('package');
    const [transactionType, setTransactionType] = useState<'buy' | 'add_stock'>('buy');
    const [quantity, setQuantity] = useState<number | ''>('');
    const [totalAmount, setTotalAmount] = useState<number | ''>('');
    const [unitPrice, setUnitPrice] = useState<number | ''>('');

    // Reset on item change
    useEffect(() => {
        if (isOpen && item) {
            setTransactionType('buy');
            setQuantity('');
            setTotalAmount('');
            setUnitPrice('');
            setPurchaseType(category === 'cylinder' ? 'refill' : 'package');

            if (item?.brandId?._id) setSelectedBrandId(item.brandId._id);
            else if (item?.brandName) {
                const b = brands.find((br: any) => br.name === item.brandName);
                if (b) setSelectedBrandId(b._id);
            }

            if (category === 'cylinder') {
                setSelectedSize(item.variant?.size || '12kg');
                setSelectedRegulator(item.variant?.regulator || '22mm');
            } else if (category === 'stove') {
                setSelectedBurners(item.variant?.burners || 1);
            } else if (category === 'regulator') {
                setSelectedRegulatorSize(item.variant?.size || '22mm');
            }
        }
    }, [isOpen, item]);

    // Propagate variant changes to parent for live card update
    useEffect(() => {
        if (!isOpen || !onVariantChange || !item) return;
        const selectedBrand = brands.find((b: any) => b._id === selectedBrandId);
        let newVariant: any = {};
        if (category === 'cylinder') newVariant = { size: selectedSize, regulator: selectedRegulator };
        else if (category === 'stove') newVariant = { burners: selectedBurners };
        else if (category === 'regulator') newVariant = { size: selectedRegulatorSize };
        onVariantChange({ ...item, brandId: selectedBrand || item.brandId, brandName: selectedBrand?.name || item.brandName, variant: newVariant });
    }, [selectedBrandId, selectedSize, selectedRegulator, selectedBurners, selectedRegulatorSize]);

    const handleQuantityChange = (val: string) => {
        const parsed = Number(val);
        const qty = val === '' ? '' : Math.max(0, parsed);
        setQuantity(qty);
        // Bubble up for the pending badge preview
        onQuantityChange?.(qty === '' ? 0 : qty);

        if (transactionType === 'buy' && qty !== '' && unitPrice !== '') {
            setTotalAmount(Number(qty) * Number(unitPrice));
        } else if (qty === '') { setTotalAmount(''); }
    };

    const handleTotalChange = (val: string) => {
        const total = val === '' ? '' : Number(val);
        setTotalAmount(total);
        if (total !== '' && quantity !== '' && Number(quantity) > 0) {
            setUnitPrice(Number(total) / Number(quantity));
        }
    };

    const handleUnitChange = (val: string) => {
        const unit = val === '' ? '' : Number(val);
        setUnitPrice(unit);
        if (unit !== '' && quantity !== '') setTotalAmount(Number(unit) * Number(quantity));
    };

    const handleConfirm = () => {
        if (!quantity) return;
        if (transactionType === 'buy' && (!totalAmount || !unitPrice)) return;
        const selectedBrand = brands.find((b: any) => b._id === selectedBrandId);
        let newVariant: any = {};
        if (category === 'cylinder') newVariant = { size: selectedSize, regulator: selectedRegulator };
        else if (category === 'stove') newVariant = { burners: selectedBurners };
        else if (category === 'regulator') newVariant = { size: selectedRegulatorSize };
        const modifiedItem = { ...item, brandId: selectedBrand || item.brandId, brandName: selectedBrand?.name || item.brandName, variant: newVariant };
        const finalTotal = transactionType === 'add_stock' ? 0 : Number(totalAmount);
        const finalUnit = transactionType === 'add_stock' ? 0 : Number(unitPrice);
        onConfirm(modifiedItem, Number(quantity), purchaseType, finalTotal, finalUnit);
        onClose();
    };

    const getVariantLabel = () => {
        if (category === 'stove') return `${selectedBurners} Burner`;
        if (category === 'regulator') return selectedRegulatorSize;
        return `${selectedSize} • ${selectedRegulator}`;
    };

    const getSidebarImage = () => {
        if (category === 'stove') return `/stoves/stove-${selectedBurners}.png`;
        if (category === 'regulator') return selectedRegulatorSize === '22mm' ? '/regulators/regulator-22.png' : '/regulators/regulator-20.png';
        return null;
    };

    const currentBrand = brands.find((b: any) => b._id === selectedBrandId);

    return (
        <div
            className={`fixed right-0 top-0 h-[100dvh] w-full sm:w-[420px] bg-background border-l shadow-2xl z-[100] flex flex-col transform transition-transform duration-500 ease-out origin-right flex-shrink-0 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b bg-primary/5">
                    <div className="flex items-center gap-2">
                        <PackagePlus className="w-5 h-5 text-primary" />
                        <div>
                            <h2 className="font-bold text-base">Restock</h2>
                            <p className="text-xs text-muted-foreground">{getVariantLabel()}</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="w-4 h-4" />
                    </Button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {/* Transaction Type Toggle */}
                    <div className="flex bg-muted rounded-lg p-1 text-sm font-medium">
                        <div
                            className={`flex-1 py-1.5 text-center rounded-md flex items-center justify-center gap-2 transition-all cursor-pointer ${transactionType === 'buy' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                            onClick={() => setTransactionType('buy')}
                        >
                            <ShoppingCart className="w-4 h-4" /> Buy from Company
                        </div>
                        <div
                            className={`flex-[1.5] py-1.5 px-2 text-center rounded-md flex items-center justify-center gap-1.5 transition-all cursor-pointer text-xs sm:text-sm ${transactionType === 'add_stock' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                            onClick={() => setTransactionType('add_stock')}
                        >
                            <PackagePlus className="w-4 h-4 shrink-0" /> Add Existing Stock
                        </div>
                    </div>

                    {/* Purchase Type — cylinders only */}
                    {category === 'cylinder' && (
                        <div className="flex gap-3 p-3 bg-muted/30 rounded-xl border">
                            <button
                                onClick={() => setPurchaseType('refill')}
                                className={`flex-1 flex flex-col items-center py-2.5 rounded-lg border-2 transition-all ${purchaseType === 'refill' ? 'border-primary bg-primary/5 text-primary' : 'border-transparent hover:bg-muted'}`}
                            >
                                <RefreshCw className="w-5 h-5 mb-1" />
                                <span className="font-bold text-sm">Refill</span>
                            </button>
                            <button
                                onClick={() => setPurchaseType('package')}
                                className={`flex-1 flex flex-col items-center py-2.5 rounded-lg border-2 transition-all ${purchaseType === 'package' ? 'border-primary bg-primary/5 text-primary' : 'border-transparent hover:bg-muted'}`}
                            >
                                <Package className="w-5 h-5 mb-1" />
                                <span className="font-bold text-sm">Package</span>
                            </button>
                        </div>
                    )}

                    {/* Brand & Variant Selectors */}
                    <div className="bg-muted/30 p-4 rounded-xl border space-y-3">
                        {/* Brand Image Preview */}
                        {getSidebarImage() && (
                            <div className="flex justify-center">
                                <img src={getSidebarImage()!} alt="item" className="h-16 object-contain" />
                            </div>
                        )}

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-muted-foreground">Brand</label>
                            <Select value={selectedBrandId} onValueChange={setSelectedBrandId}>
                                <SelectTrigger className="h-9 bg-white">
                                    <SelectValue placeholder="Select Brand" />
                                </SelectTrigger>
                                <SelectContent className="z-[10001]">
                                    {brands.map((b: any) => (
                                        <SelectItem key={b._id} value={b._id}>{b.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {category === 'cylinder' && (
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-muted-foreground">Size</label>
                                    <Select value={selectedSize} onValueChange={setSelectedSize}>
                                        <SelectTrigger className="h-9 bg-white"><SelectValue /></SelectTrigger>
                                        <SelectContent className="z-[10001]">
                                            {cylinderSizes.map((s: string) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-muted-foreground">Regulator</label>
                                    <Select value={selectedRegulator} onValueChange={setSelectedRegulator}>
                                        <SelectTrigger className="h-9 bg-white"><SelectValue /></SelectTrigger>
                                        <SelectContent className="z-[10001]">
                                            {REGULATOR_TYPES.map((r: string) => (
                                                <SelectItem key={r} value={r} className={r === '22mm' ? 'text-orange-600 font-bold' : 'text-yellow-600 font-bold'}>{r}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        )}

                        {category === 'stove' && (
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-muted-foreground">Burners</label>
                                <Select value={String(selectedBurners)} onValueChange={(v) => setSelectedBurners(Number(v))}>
                                    <SelectTrigger className="h-9 bg-white"><SelectValue /></SelectTrigger>
                                    <SelectContent className="z-[10001]">
                                        {[1, 2, 3, 4].map((n) => <SelectItem key={n} value={String(n)}>{n} Burner</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {category === 'regulator' && (
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-muted-foreground">Type</label>
                                <Select value={selectedRegulatorSize} onValueChange={setSelectedRegulatorSize}>
                                    <SelectTrigger className="h-9 bg-white"><SelectValue /></SelectTrigger>
                                    <SelectContent className="z-[10001]">
                                        {REGULATOR_TYPES.map((r: string) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>

                    {/* Quantity */}
                    <div className="space-y-1">
                        <label className="text-xs font-bold uppercase text-foreground">Quantity</label>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="icon" className="h-10 w-10 shrink-0"
                                onClick={() => handleQuantityChange(String(Math.max(0, (Number(quantity) || 0) - 1)))}>−</Button>
                            <Input
                                type="number"
                                min="0"
                                placeholder="0"
                                className="text-center text-2xl font-bold h-10"
                                value={quantity}
                                onChange={(e) => handleQuantityChange(e.target.value)}
                            />
                            <Button variant="outline" size="icon" className="h-10 w-10 shrink-0"
                                onClick={() => handleQuantityChange(String((Number(quantity) || 0) + 1))}>+</Button>
                        </div>
                    </div>

                    {/* Price Inputs */}
                    {transactionType === 'buy' && (
                        <div className={`space-y-3 transition-opacity ${!quantity ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                            <div>
                                <label className="text-sm font-medium mb-1.5 block">Total D.O. Amount (৳)</label>
                                <Input type="number" placeholder="Total..." className="text-lg h-12 font-bold"
                                    value={totalAmount} onChange={(e) => handleTotalChange(e.target.value)} />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-muted p-3 rounded-xl">
                                    <span className="text-xs font-bold text-muted-foreground uppercase mb-1 block">Buying Price</span>
                                    <div className="relative">
                                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">৳</span>
                                        <Input type="number" className="pl-5 h-9 bg-white font-medium"
                                            value={unitPrice} onChange={(e) => handleUnitChange(e.target.value)} />
                                    </div>
                                </div>
                                <div className="bg-primary/5 p-3 rounded-xl border border-primary/20">
                                    <span className="text-xs font-bold text-primary uppercase mb-1 block">Current RTL</span>
                                    <p className="text-base font-black text-primary">৳{item?.prices?.retailPriceFull || 0}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer CTA */}
                <div className="p-4 border-t bg-background">
                    <Button
                        className="w-full h-12 text-base font-bold"
                        disabled={!quantity || (transactionType === 'buy' && (!totalAmount || !unitPrice))}
                        onClick={handleConfirm}
                    >
                        <PackagePlus className="w-5 h-5 mr-2" />
                        {transactionType === 'buy' ? 'Confirm Restock' : 'Add Stock'}
                    </Button>
            </div>
        </div>
    );
};
