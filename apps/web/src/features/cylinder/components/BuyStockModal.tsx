import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';
import { RefreshCw, Package, ShoppingCart } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CYLINDER_SIZES, REGULATOR_TYPES } from "@/constants/inventory";
import { useBrands } from "@/features/brand/hooks/useBrands";

interface BuyStockModalProps {
    isOpen: boolean;
    onClose: () => void;
    brandName: string;
    variant: string;
    logo?: string;
    cylinderImage?: string;
    onAddToCart: (item: any, quantity: number, type: 'refill' | 'package', totalAmount: number, unitPrice: number) => void;
    item: any;
}

export const BuyStockModal = ({ isOpen, onClose, brandName, variant, logo, onAddToCart, item }: BuyStockModalProps) => {
    const { data: brandData } = useBrands();
    const brands = brandData?.brands || [];

    // Selection States
    const [selectedBrandId, setSelectedBrandId] = useState<string>('');
    const [selectedSize, setSelectedSize] = useState<string>('12kg');
    const [selectedRegulator, setSelectedRegulator] = useState<string>('22mm');

    const [purchaseType, setPurchaseType] = useState<'refill' | 'package'>('refill');
    const [transactionType, setTransactionType] = useState<'buy' | 'add_stock'>('buy');

    const [quantity, setQuantity] = useState<number | ''>('');
    const [totalAmount, setTotalAmount] = useState<number | ''>('');
    const [unitPrice, setUnitPrice] = useState<number | ''>('');

    // Reset state on open
    useEffect(() => {
        if (isOpen) {
            setPurchaseType('refill');
            setTransactionType('buy');
            setQuantity('');
            setTotalAmount('');
            setUnitPrice('');

            // Set initial values from item
            if (item?.brandId?._id) setSelectedBrandId(item.brandId._id);
            else if (item?.brandName) {
                const b = brands.find((br: any) => br.name === item.brandName);
                if (b) setSelectedBrandId(b._id);
            }

            // Parse variant string "12kg 22mm"
            const variantStr = (item?.variant?.size && item?.variant?.regulator)
                ? `${item.variant.size} ${item.variant.regulator}`
                : variant;

            const parts = variantStr.split(' ');
            setSelectedSize(parts[0] || '12kg');
            setSelectedRegulator(parts.length > 1 ? parts[1] : '22mm');
        }
    }, [isOpen, item, variant, brands]);

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

        if (transactionType === 'buy' && (!totalAmount || !unitPrice)) return;

        // Construct modified item with selected Brand/Variant
        const selectedBrand = brands.find((b: any) => b._id === selectedBrandId);
        const modifiedItem = {
            ...item,
            brandId: selectedBrand || item.brandId,
            brandName: selectedBrand?.name || brandName,
            variant: {
                size: selectedSize,
                regulator: selectedRegulator
            }
        };

        onAddToCart(
            modifiedItem,
            Number(quantity),
            purchaseType,
            finalTotal,
            finalUnit
        );
        onClose();
    };

    const currentBrand = brands.find((b: any) => b._id === selectedBrandId);
    const displayLogo = currentBrand?.logo || logo;
    const displayBrandName = currentBrand?.name || brandName;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={transactionType === 'buy' ? "Buy LPG Cylinders" : "Add Existing Stock"}>
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

                {/* Purchase Type */}
                <div className="flex gap-4 p-4 bg-muted/30 rounded-xl border">
                    <button
                        onClick={() => setPurchaseType('refill')}
                        className={`flex-1 flex flex-col items-center justify-center py-3 rounded-lg border-2 transition-all ${purchaseType === 'refill' ? 'border-primary bg-primary/5 text-primary' : 'border-transparent hover:bg-muted'}`}
                    >
                        <RefreshCw className="w-6 h-6 mb-2" />
                        <span className="font-bold">Refill (Empty)</span>
                    </button>
                    <button
                        onClick={() => setPurchaseType('package')}
                        className={`flex-1 flex flex-col items-center justify-center py-3 rounded-lg border-2 transition-all ${purchaseType === 'package' ? 'border-primary bg-primary/5 text-primary' : 'border-transparent hover:bg-muted'}`}
                    >
                        <Package className="w-6 h-6 mb-2" />
                        <span className="font-bold">Package (Full)</span>
                    </button>
                </div>

                 {/* Brand & Variant Info */}
                 <div className="bg-muted/30 p-4 rounded-xl border space-y-4">
                    <div className="flex items-start gap-4">
                         {displayLogo ? (
                            <img src={displayLogo} alt="Brand" className="w-16 h-12 object-contain bg-white rounded p-1 border" />
                         ) : (
                             <div className="w-16 h-12 bg-muted flex items-center justify-center text-xs rounded border text-muted-foreground font-bold">{displayBrandName?.substring(0,2)}</div>
                         )}
                         <div className="flex-1 space-y-3">
                             <div className="space-y-1">
                                <label className="text-xs font-semibold text-muted-foreground">Brand</label>
                                <Select value={selectedBrandId} onValueChange={setSelectedBrandId}>
                                    <SelectTrigger className="h-9 bg-white">
                                        <SelectValue placeholder="Select Brand" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {brands.map((b: any) => (
                                            <SelectItem key={b._id} value={b._id}>{b.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                             </div>

                             <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-muted-foreground">Size</label>
                                    <Select value={selectedSize} onValueChange={setSelectedSize}>
                                        <SelectTrigger className="h-9 bg-white">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {(currentBrand?.variants?.map((v: any) => v.size) || CYLINDER_SIZES)
                                                .filter((value: any, index: any, self: any) => self.indexOf(value) === index)
                                                .map((s: string) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-muted-foreground">Regulator</label>
                                    <Select value={selectedRegulator} onValueChange={setSelectedRegulator}>
                                        <SelectTrigger className="h-9 bg-white">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {(currentBrand?.variants?.filter((v: any) => v.size === selectedSize).map((v: any) => v.regulator) || REGULATOR_TYPES)
                                                .filter((value: any, index: any, self: any) => self.indexOf(value) === index)
                                                .map((r: string) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                             </div>
                         </div>
                    </div>

                    <div className="p-3 bg-white rounded-lg border">
                        <div className="flex items-center justify-between mb-2">
                             <span className="text-sm font-medium text-muted-foreground">Configuration</span>
                             <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">{selectedSize} • {selectedRegulator}</span>
                        </div>

                        {/* Quantity Input */}
                        <div>
                            <label className="text-xs font-bold text-foreground uppercase mb-1 block">Quantity</label>
                            <div className="flex items-center gap-2">
                                    <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-10 w-10 shrink-0"
                                    onClick={() => handleQuantityChange(String(Math.max(0, Number(quantity || 0) - 1)))}
                                >
                                    -
                                </Button>
                                <Input
                                    type="number"
                                    placeholder="0"
                                    className="text-center text-2xl font-bold h-10 ring-primary/20"
                                    value={quantity}
                                    onChange={(e) => handleQuantityChange(e.target.value)}
                                    autoFocus
                                />
                                    <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-10 w-10 shrink-0"
                                    onClick={() => handleQuantityChange(String(Number(quantity || 0) + 1))}
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

                        <div className="bg-muted p-3 rounded-xl flex items-center justify-between">
                             <span className="text-sm font-medium flex items-center gap-2">
                                <Package className="w-4 h-4" /> Unit Price
                             </span>
                             <div className="relative w-32">
                                 <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">৳</span>
                                 <Input
                                    type="number"
                                    className="pl-6 h-9 bg-white text-right font-medium"
                                    value={unitPrice}
                                    onChange={(e) => handleUnitChange(e.target.value)}
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
