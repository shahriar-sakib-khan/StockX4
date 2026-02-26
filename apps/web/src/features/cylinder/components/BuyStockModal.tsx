import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, useEffect, useMemo } from 'react';
import { RefreshCw, Package, ShoppingCart } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CYLINDER_SIZES, REGULATOR_TYPES } from "@/constants/inventory";
import { useStoreBrands } from "@/features/brand/hooks/useBrands";

interface BuyStockModalProps {
    isOpen: boolean;
    onClose: () => void;
    brandName: string;
    variant: string;
    logo?: string;
    cylinderImage?: string;
    onAddToCart: (item: any, quantity: number, type: 'refill' | 'package', totalAmount: number, unitPrice: number, sellingPrice: number) => void;
    item: any;
    storeId: string;
    category?: 'cylinder' | 'stove' | 'regulator';
}

export const BuyStockModal = ({ isOpen, onClose, brandName, variant, logo, onAddToCart, item, storeId, category = 'cylinder' }: BuyStockModalProps) => {
    const { data: brandData } = useStoreBrands(storeId);

    // Memoize brands to prevent unstable reference
    const brands = useMemo(() => {
        return (brandData?.brands || []).filter((b: any) =>
            b.isActive !== false &&
            (category === 'cylinder' ? (b.type === 'cylinder' || !b.type) : b.type === category)
        );
    }, [brandData, category]);

    // Selection States
    const [selectedBrandId, setSelectedBrandId] = useState<string>('');

    // Cylinder Params
    const [selectedSize, setSelectedSize] = useState<string>('12kg');
    const [selectedRegulator, setSelectedRegulator] = useState<string>('22mm');

    // Stove Params
    const [selectedBurners, setSelectedBurners] = useState<number>(1);

    // Regulator Params
    const [selectedRequlatorSize, setSelectedRegulatorSize] = useState<string>('22mm');


    const [purchaseType, setPurchaseType] = useState<'refill' | 'package'>('refill');
    const [transactionType, setTransactionType] = useState<'buy' | 'add_stock'>('buy');

    const [quantity, setQuantity] = useState<number | ''>('');
    const [totalAmount, setTotalAmount] = useState<number | ''>('');
    const [unitPrice, setUnitPrice] = useState<number | ''>('');
    const [sellingPrice, setSellingPrice] = useState<number | ''>('');

    // Effect 1: Reset Form State ON OPEN ONLY
    useEffect(() => {
        if (isOpen) {
            setPurchaseType(category === 'cylinder' ? 'refill' : 'package');
            setTransactionType('buy');
            setQuantity('');
            setTotalAmount('');
            setUnitPrice('');
            setSellingPrice('');
        }
    }, [isOpen, category]);

    // Effect 2: Initialize Selections from Item
    useEffect(() => {
        if (isOpen && item) {
            if (item?.brandId?._id) setSelectedBrandId(item.brandId._id);
            else if (item?.brandName) {
                const b = brands.find((br: any) => br.name === item.brandName);
                if (b) setSelectedBrandId(b._id);
            }

            if (category === 'cylinder') {
                const variantStr = (item?.variant?.size && item?.variant?.regulator)
                    ? `${item.variant.size} ${item.variant.regulator}`
                    : variant;
                const parts = variantStr.split(' ');
                setSelectedSize(parts[0] || '12kg');
                setSelectedRegulator(parts.length > 1 ? parts[1] : '22mm');
            } else if (category === 'stove') {
                // Try to parse burners from item or variant string
                if (item?.variant?.burners) setSelectedBurners(item.variant.burners);
                else if (variant.includes('Burner')) {
                    const match = variant.match(/(\d+)/);
                    if (match) setSelectedBurners(parseInt(match[1]));
                }
            } else if (category === 'regulator') {
                if (item?.variant?.size) setSelectedRegulatorSize(item.variant.size);
                else if (variant.includes('mm')) {
                    const match = variant.match(/(\d+mm)/);
                    if (match) setSelectedRegulatorSize(match[1]);
                }
            }
        }
    }, [isOpen, item, brands, variant, category]);

    const handleQuantityChange = (val: string) => {
        const qty = val === '' ? '' : Number(val);
        setQuantity(qty);

        if (transactionType === 'buy' && qty !== '' && unitPrice !== '') {
            setTotalAmount(Number(qty) * Number(unitPrice));
        } else if (qty === '') {
             setTotalAmount('');
        }
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

        if (unit !== '' && quantity !== '') {
            setTotalAmount(Number(unit) * Number(quantity));
        }
    };

    const handleAddToCart = () => {
        if (!quantity) return;

        const finalTotal = transactionType === 'add_stock' ? 0 : Number(totalAmount);
        const finalUnit = transactionType === 'add_stock' ? 0 : Number(unitPrice);
        const finalSelling = sellingPrice === '' ? 0 : Number(sellingPrice);

        if (transactionType === 'buy' && (!totalAmount || !unitPrice)) return;

        // Construct modified item with selected Brand/Variant
        const selectedBrand = brands.find((b: any) => b._id === selectedBrandId);

        let newVariant: any = {};
        if (category === 'cylinder') {
            newVariant = { size: selectedSize, regulator: selectedRegulator };
        } else if (category === 'stove') {
            newVariant = { burners: selectedBurners };
        } else if (category === 'regulator') {
            newVariant = { size: selectedRequlatorSize };
        }

        const modifiedItem = {
            ...item,
            brandId: selectedBrand || item.brandId,
            brandName: selectedBrand?.name || brandName,
            variant: newVariant
        };

        onAddToCart(
            modifiedItem,
            Number(quantity),
            purchaseType,
            finalTotal,
            finalUnit,
            finalSelling
        );
        onClose();
    };

    const currentBrand = brands.find((b: any) => b._id === selectedBrandId);
    const displayLogo = currentBrand?.logo || logo;
    const displayBrandName = currentBrand?.name || brandName;

    // Dynamic Title
    const getTitle = () => {
        const typeLabel = category === 'stove' ? 'Gas Stoves' : category === 'regulator' ? 'Regulators' : 'LPG Cylinders';
        return transactionType === 'buy' ? `Buy ${typeLabel}` : "Add Existing Stock";
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={getTitle()}>
            <div className="space-y-6">
                 {/* Top Navigation */}
                 <div className="flex bg-muted rounded-lg p-1 text-sm font-medium cursor-pointer">
                    <div
                        className={`flex-1 py-1.5 text-center rounded-md flex items-center justify-center gap-2 transition-all ${transactionType === 'buy' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                        onClick={() => setTransactionType('buy')}
                    >
                        <ShoppingCart className="w-4 h-4" /> Buy from Company
                    </div>
                    <div
                        className={`flex-1 py-1.5 text-center flex items-center justify-center gap-2 rounded-md transition-all ${transactionType === 'add_stock' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                        onClick={() => setTransactionType('add_stock')}
                    >
                        + Add Existing Stock
                    </div>
                </div>

                {/* Purchase Type - ONLY FOR CYLINDERS */}
                {category === 'cylinder' && (
                    <div className="flex gap-4 p-4 bg-muted/30 rounded-xl border">
                        <button
                            onClick={() => setPurchaseType('refill')}
                            className={`flex-1 flex flex-col items-center justify-center py-3 rounded-lg border-2 transition-all ${purchaseType === 'refill' ? 'border-primary bg-primary/5 text-primary' : 'border-transparent hover:bg-muted'}`}
                        >
                            <RefreshCw className="w-6 h-6 mb-2" />
                            <span className="font-bold">Refill</span>
                        </button>
                        <button
                            onClick={() => setPurchaseType('package')}
                            className={`flex-1 flex flex-col items-center justify-center py-3 rounded-lg border-2 transition-all ${purchaseType === 'package' ? 'border-primary bg-primary/5 text-primary' : 'border-transparent hover:bg-muted'}`}
                        >
                            <Package className="w-6 h-6 mb-2" />
                            <span className="font-bold">Package</span>
                        </button>
                    </div>
                )}

                 {/* Brand & Variant Info */}
                 <div className="bg-muted/30 p-4 rounded-xl border space-y-4">
                    <div className="flex items-start gap-4">
                         {/* Dynamic Image Logic */}
                         {(() => {
                             let imgSrc = displayLogo;

                             // For Stoves and Regulators, prioritize the Product Image over the Brand Logo
                             // because the visual configuration (1 Burner vs 2 Burner) is more important for the "Buy" context.
                             if (category === 'stove') {
                                 imgSrc = `/stoves/stove-${selectedBurners}.png`;
                             } else if (category === 'regulator') {
                                 imgSrc = selectedRequlatorSize === '22mm' ? "/regulators/regulator-22.png" : "/regulators/regulator-20.png";
                             }

                             if (imgSrc) {
                                 return <img src={imgSrc} alt="Item" className="w-16 h-12 object-contain bg-white rounded p-1 border" onError={(e) => {
                                     // Fallback if image fails to load
                                     (e.target as HTMLImageElement).style.display = 'none';
                                     (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                                 }} />;
                             }

                             return (
                                <div className="w-16 h-12 bg-muted flex items-center justify-center text-xs rounded border text-muted-foreground font-bold">
                                    {displayBrandName?.substring(0,2)}
                                </div>
                             );
                         })()}
                         {/* Fallback Element for onError */}
                         <div className="hidden w-16 h-12 bg-muted flex items-center justify-center text-xs rounded border text-muted-foreground font-bold">
                             {displayBrandName?.substring(0,2)}
                         </div>
                         <div className="flex-1 space-y-3">
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

                             {/* CYLINDER VARIANTS */}
                             {category === 'cylinder' && (
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-muted-foreground">Size</label>
                                        <Select value={selectedSize} onValueChange={setSelectedSize}>
                                            <SelectTrigger className="h-9 bg-white">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="z-[10001]">
                                                {CYLINDER_SIZES.map((s: string) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-muted-foreground">Regulator</label>
                                        <Select value={selectedRegulator} onValueChange={setSelectedRegulator}>
                                            <SelectTrigger className="h-9 bg-white">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="z-[10001]">
                                                {REGULATOR_TYPES.map((r: string) => (
                                                        <SelectItem
                                                            key={r}
                                                            value={r}
                                                            className={r === '22mm' ? 'text-orange-600 font-bold' : r === '20mm' ? 'text-yellow-600 font-bold' : ''}
                                                        >
                                                            {r}
                                                        </SelectItem>
                                                    ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                             )}

                             {/* STOVE VARIANTS */}
                             {category === 'stove' && (
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-muted-foreground">Burners</label>
                                    <Select value={String(selectedBurners)} onValueChange={(v) => setSelectedBurners(Number(v))}>
                                        <SelectTrigger className="h-9 bg-white">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="z-[10001]">
                                            {[1, 2, 3, 4].map((n) => (
                                                <SelectItem key={n} value={String(n)}>{n} Burner</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                             )}

                             {/* REGULATOR VARIANTS */}
                             {category === 'regulator' && (
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-muted-foreground">Type</label>
                                    <Select value={selectedRequlatorSize} onValueChange={setSelectedRegulatorSize}>
                                        <SelectTrigger className="h-9 bg-white">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="z-[10001]">
                                            {REGULATOR_TYPES.map((r: string) => (
                                                <SelectItem key={r} value={r}>{r}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                             )}

                         </div>
                    </div>

                    <div className="p-3 bg-white rounded-lg border">
                        <div className="flex items-center justify-between mb-2">
                             <span className="text-sm font-medium text-muted-foreground">Configuration</span>
                             <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">
                                {category === 'cylinder' && `${selectedSize} • ${selectedRegulator}`}
                                {category === 'stove' && `${selectedBurners} Burner`}
                                {category === 'regulator' && `${selectedRequlatorSize}`}
                             </span>
                        </div>

                        {/* Quantity Input */}
                        <div>
                            <label className="text-xs font-bold text-foreground uppercase mb-1 block">Quantity</label>
                            <div className="flex items-center gap-2 relative z-10">
                                    <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-10 w-10 shrink-0"
                                    onClick={() => handleQuantityChange(String(Math.max(0, (Number(quantity) || 0) - 1)))}
                                >
                                    -
                                </Button>
                                <Input
                                    type="number"
                                    placeholder="0"
                                    className="text-center text-2xl font-bold h-10 ring-primary/20"
                                    value={quantity}
                                    onChange={(e) => handleQuantityChange(e.target.value)}
                                    // Removed autoFocus to avoid focus trapping issues
                                />
                                    <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-10 w-10 shrink-0"
                                    onClick={() => handleQuantityChange(String((Number(quantity) || 0) + 1))}
                                >
                                    +
                                </Button>
                            </div>
                        </div>
                    </div>
                 </div>

                 {/* Price Section */}
                 {transactionType === 'buy' && (
                     <div className={`space-y-4 transition-opacity ${!quantity ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                        <div>
                            <label className="text-sm font-medium mb-1.5 block">Total D.O. Amount (৳)</label>
                            <Input
                                type="number"
                                placeholder="Total..."
                                className="text-lg h-12 font-bold"
                                value={totalAmount}
                                onChange={(e) => handleTotalChange(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-muted p-3 rounded-xl">
                                 <span className="text-xs font-bold text-muted-foreground uppercase mb-1 block">Buying Price</span>
                                 <div className="relative">
                                     <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-xs">৳</span>
                                     <Input
                                        type="number"
                                        className="pl-5 h-9 bg-white font-medium"
                                        value={unitPrice}
                                        onChange={(e) => handleUnitChange(e.target.value)}
                                     />
                                 </div>
                            </div>
                             <div className="bg-orange-50 p-3 rounded-xl border border-orange-100">
                                 <span className="text-xs font-bold text-orange-600 uppercase mb-1 block">Selling Price</span>
                                 <div className="relative">
                                     <span className="absolute left-2 top-1/2 -translate-y-1/2 text-orange-400 font-medium text-xs">৳</span>
                                     <Input
                                        type="number"
                                        className="pl-5 h-9 bg-white font-medium border-orange-200 focus-visible:ring-orange-200"
                                        value={sellingPrice}
                                        onChange={(e) => setSellingPrice(e.target.value === '' ? '' : Number(e.target.value))}
                                     />
                                 </div>
                            </div>
                        </div>
                     </div>
                 )}

                 {transactionType === 'add_stock' && (
                     <div className={`transition-opacity ${!quantity ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                         <div className="bg-orange-50 p-3 rounded-xl border border-orange-100">
                             <span className="text-xs font-bold text-orange-600 uppercase mb-1 block">Selling Price</span>
                             <div className="relative">
                                 <span className="absolute left-2 top-1/2 -translate-y-1/2 text-orange-400 font-medium text-xs">৳</span>
                                 <Input
                                    type="number"
                                    className="pl-5 h-9 bg-white font-medium border-orange-200 focus-visible:ring-orange-200"
                                    value={sellingPrice}
                                    onChange={(e) => setSellingPrice(e.target.value === '' ? '' : Number(e.target.value))}
                                 />
                             </div>
                        </div>
                     </div>
                 )}

                <Button
                    className="w-full h-12 text-lg font-bold shadow-lg shadow-primary/20"
                    disabled={!quantity || (transactionType === 'buy' && (!totalAmount || !unitPrice))}
                    onClick={handleAddToCart}
                >
                    {transactionType === 'buy' ? '+ Add to Cart' : 'Update Stock'}
                </Button>
            </div>
        </Modal>
    );
};
