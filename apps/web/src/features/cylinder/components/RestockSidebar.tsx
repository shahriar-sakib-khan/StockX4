import { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Sheet } from "@/components/ui/Sheet";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { PlusCircle } from "lucide-react";
import { useStoreBrands } from "@/features/brand/hooks/useBrands";
import { useStoreSizes } from "@/features/store/hooks/useStoreSizes";
import { REGULATOR_TYPES } from "../constants/restock.constants";
import { RestockProductSelectors } from "./restock/RestockProductSelectors";
import { RestockTransactionForm } from "./restock/RestockTransactionForm";
import { RestockPriceSummary } from "./restock/RestockPriceSummary";

interface RestockSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    item: any;
    storeId: string;
    category?: 'cylinder' | 'stove' | 'regulator';
    onConfirm: (item: any, qty: number, type: 'refill' | 'package', total: number, unit: number, wholesale?: number, retail?: number) => void;
    onVariantChange?: (updatedItem: any) => void;
    onQuantityChange?: (qty: number, type: 'refill' | 'package') => void;
    inventory?: any[];
}

export const RestockSidebar = ({ 
    isOpen, 
    onClose, 
    item, 
    storeId, 
    category = 'cylinder', 
    onConfirm, 
    onVariantChange, 
    onQuantityChange, 
    inventory = [] 
}: RestockSidebarProps) => {
    const { data: brandData } = useStoreBrands(storeId);
    const { sizes: cylinderSizes } = useStoreSizes(storeId);
    const brands = brandData?.brands || [];

    const [selectedBrandId, setSelectedBrandId] = useState<string>('');
    const [selectedSize, setSelectedSize] = useState<string>('12kg');
    const [selectedRegulator, setSelectedRegulator] = useState<string>('22mm');
    const [selectedBurners, setSelectedBurners] = useState<number>(1);
    const [selectedRegulatorSize, setSelectedRegulatorSize] = useState<string>('22mm');
    const [selectedProductId, setSelectedProductId] = useState<string>('');

    const [purchaseType, setPurchaseType] = useState<'refill' | 'package'>('package');
    const [transactionType, setTransactionType] = useState<'buy' | 'add_stock'>('buy');
    const [quantity, setQuantity] = useState<number | ''>('');
    const [totalAmount, setTotalAmount] = useState<number | ''>('');
    const [unitPrice, setUnitPrice] = useState<number | ''>('');
    const [wholesalePrice, setWholesalePrice] = useState<number | ''>('');
    const [retailPrice, setRetailPrice] = useState<number | ''>('');

    const filteredProducts = useMemo(() => {
        if (!inventory || inventory.length === 0) return [];
        return inventory.filter((i: any) => {
            if (category === 'stove') return Number(i.variant?.burners) === selectedBurners;
            if (category === 'regulator') return i.variant?.size === selectedRegulatorSize;
            return true;
        });
    }, [inventory, category, selectedBurners, selectedRegulatorSize]);

    const currentProduct = useMemo(() => {
        if (category === 'cylinder') return item;
        return filteredProducts.find(p => p.productId === selectedProductId || p._id === selectedProductId) || filteredProducts[0];
    }, [filteredProducts, selectedProductId, category, item]);

    useEffect(() => {
        if (category !== 'cylinder' && filteredProducts.length > 0) {
            const exists = filteredProducts.some(p => p.productId === selectedProductId || p._id === selectedProductId);
            if (!exists) {
                const first = filteredProducts[0];
                setSelectedProductId(first.productId || first._id);
            }
        }
    }, [filteredProducts, category, selectedProductId]);

    useEffect(() => {
        if (isOpen && item) {
            setTransactionType('buy');
            setQuantity('');
            setTotalAmount('');
            setUnitPrice('');
            setWholesalePrice('');
            setRetailPrice('');
            setPurchaseType(category === 'cylinder' ? 'refill' : 'package');

            if (category === 'stove') {
                const burners = Number(item.variant?.burners || 1);
                setSelectedBurners(burners);
                setSelectedProductId(item.productId || item._id);
            } else if (category === 'regulator') {
                const size = item.variant?.size || '22mm';
                setSelectedRegulatorSize(size);
                setSelectedProductId(item.productId || item._id);
            } else if (category === 'cylinder') {
                if (item?.brandId?._id) setSelectedBrandId(item.brandId._id);
                else if (item?.brandName) {
                    const b = brands.find((br: any) => br.name === item.brandName);
                    if (b) setSelectedBrandId(b._id);
                }
                setSelectedSize(item.variant?.size || '12kg');
                setSelectedRegulator(item.variant?.regulator || '22mm');
            }
        }
    }, [isOpen, item, brands, category]);

    useEffect(() => {
        if (!isOpen || !onVariantChange || !item) return;
        
        if (category === 'cylinder') {
            const selectedBrand = brands.find((b: any) => b._id === selectedBrandId);
            let newVariant: any = { ...item.variant };
            newVariant.size = selectedSize;
            newVariant.regulator = selectedRegulator;
            if (selectedBrand?.cylinderImage) {
                newVariant.cylinderImage = selectedBrand.cylinderImage;
            }
            onVariantChange({ ...item, brandId: selectedBrand || item.brandId, brandName: selectedBrand?.name || item.brandName, variant: newVariant });
        } else if (currentProduct) {
            onVariantChange(currentProduct);
        }
    }, [selectedBrandId, selectedSize, selectedRegulator, selectedBurners, selectedRegulatorSize, selectedProductId, currentProduct]);

    const handleQuantityChange = (val: string) => {
        const parsed = Number(val);
        const qty = val === '' ? '' : Math.max(0, parsed);
        setQuantity(qty);
        onQuantityChange?.(qty === '' ? 0 : qty, purchaseType);

        if (transactionType === 'buy' && qty !== '' && unitPrice !== '') {
            setTotalAmount(Number(qty) * Number(unitPrice));
        } else if (qty === '') { setTotalAmount(''); }
    };

    useEffect(() => {
        onQuantityChange?.(Number(quantity) || 0, purchaseType);
    }, [purchaseType, isOpen]);

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
        
        const finalTotal = transactionType === 'add_stock' ? 0 : Number(totalAmount);
        const finalUnit = transactionType === 'add_stock' ? 0 : Number(unitPrice);
        const finalWholesale = transactionType === 'add_stock' ? 0 : Number(wholesalePrice);
        const finalRetail = transactionType === 'add_stock' ? 0 : Number(retailPrice);
        
        if (category === 'cylinder') {
            const selectedBrand = brands.find((b: any) => b._id === selectedBrandId);
            const newVariant = { size: selectedSize, regulator: selectedRegulator };
            const modifiedItem = { ...item, brandId: selectedBrand || item.brandId, brandName: selectedBrand?.name || item.brandName, variant: newVariant };
            onConfirm(modifiedItem, Number(quantity), purchaseType, finalTotal, finalUnit, finalWholesale, finalRetail);
        } else if (currentProduct) {
            onConfirm(currentProduct, Number(quantity), purchaseType, finalTotal, finalUnit, finalWholesale, finalRetail);
        }
        onClose();
    };

    const getVariantLabel = () => {
        if (category === 'stove') return `${selectedBurners} Burner Stove`;
        if (category === 'regulator') return `${selectedRegulatorSize} Regulator`;
        return `${selectedSize} • ${selectedRegulator}`;
    };

    const getSidebarImage = () => {
        if (category === 'cylinder') {
            const currentBrand = brands.find((b: any) => b._id === selectedBrandId);
            if (currentBrand?.cylinderImage) return currentBrand.cylinderImage;
            return item?.variant?.cylinderImage || null;
        }
        return currentProduct?.variant?.cylinderImage || currentProduct?.product?.image || currentProduct?.image || null;
    };

    const footer = (
        <div className="w-full">
            <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-black text-slate-500 uppercase">Total Payable</span>
                <span className="text-3xl font-black text-rose-600">৳{totalAmount || 0}</span>
            </div>
            <Button
                className={cn(
                    "w-full h-16 text-lg font-black uppercase tracking-tighter shadow-lg transition-all active:scale-95",
                    purchaseType === 'package' 
                        ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200" 
                        : "bg-blue-600 hover:bg-blue-700 shadow-blue-200"
                )}
                disabled={!quantity || (transactionType === 'buy' && !totalAmount)}
                onClick={handleConfirm}
            >
                Confirm & Record {purchaseType === 'package' ? 'Package' : 'Refill'}
            </Button>
            <p className="text-[10px] text-center text-slate-400 mt-4 font-bold uppercase tracking-widest">
                Stock will be added to <span className={cn("font-black", purchaseType === 'package' ? "text-emerald-600" : "text-blue-600")}>
                    {purchaseType === 'package' ? 'Company Full/Package' : 'Store Empty Refill'}
                </span> inventory
            </p>
        </div>
    );

    return (
        <Sheet 
            isOpen={isOpen} 
            onClose={onClose} 
            title={currentProduct?.brandName || item?.brandName || "Restock Inventory"}
            footer={footer}
        >
            <div className="space-y-6">
                <div className="flex items-center gap-3 text-rose-600 mb-2">
                    <div className="p-2 bg-rose-50 rounded-lg">
                        <PlusCircle className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest">
                        {getVariantLabel()}
                    </span>
                </div>

                <div className="space-y-4">
                    {getSidebarImage() && (
                        <div className="flex justify-center">
                            <img src={getSidebarImage()!} alt="item" className="h-24 object-contain" />
                        </div>
                    )}

                    <RestockProductSelectors 
                        category={category}
                        selectedBrandId={selectedBrandId}
                        setSelectedBrandId={setSelectedBrandId}
                        brands={brands}
                        selectedSize={selectedSize}
                        setSelectedSize={setSelectedSize}
                        cylinderSizes={cylinderSizes}
                        selectedRegulator={selectedRegulator}
                        setSelectedRegulator={setSelectedRegulator}
                        selectedBurners={selectedBurners}
                        setSelectedBurners={setSelectedBurners}
                        selectedRegulatorSize={selectedRegulatorSize}
                        setSelectedRegulatorSize={setSelectedRegulatorSize}
                        selectedProductId={selectedProductId}
                        setSelectedProductId={setSelectedProductId}
                        filteredProducts={filteredProducts}
                    />
                </div>

                {category === 'cylinder' && (
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-black text-slate-500 uppercase tracking-wider">Purchase Type</span>
                            {purchaseType === 'package' ? (
                                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 uppercase text-[10px] font-black">Company Full</Badge>
                            ) : (
                                <Badge className="bg-blue-100 text-blue-700 border-blue-200 uppercase text-[10px] font-black">Your Empty Refill</Badge>
                            )}
                        </div>
                        
                        <Tabs value={purchaseType} onValueChange={(v) => setPurchaseType(v as any)} className="w-full">
                            <TabsList className="grid grid-cols-2 w-full h-16 p-1.5 bg-slate-200/50 rounded-xl">
                                <TabsTrigger 
                                    value="refill" 
                                    className="flex flex-col gap-0.5 rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-200 transition-all duration-200 h-full"
                                >
                                    <span className="text-sm font-black uppercase">Refill</span>
                                    <span className="text-[10px] font-bold opacity-80">Fill empty cylinders</span>
                                </TabsTrigger>
                                <TabsTrigger 
                                    value="package" 
                                    className="flex flex-col gap-0.5 rounded-lg data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-emerald-200 transition-all duration-200 h-full"
                                >
                                    <span className="text-sm font-black uppercase">Package</span>
                                    <span className="text-[10px] font-bold opacity-80">Buy fresh cylinders</span>
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>

                        <div className="mt-4 grid grid-cols-2 gap-4">
                            <div className="p-3 bg-white rounded-xl border border-slate-200 flex flex-col justify-center">
                                <span className="text-[10px] font-black text-slate-400 uppercase block mb-2 border-b pb-1">Current Store Stock</span>
                                {purchaseType === 'refill' ? (
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-bold text-slate-500 uppercase">Empty</span>
                                            <span className="text-lg font-black text-blue-600 leading-none">{item?.counts?.empty || 0}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-bold text-slate-500 uppercase">Full</span>
                                            <span className="text-lg font-black text-emerald-600 leading-none">{item?.counts?.full || 0}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between py-1">
                                         <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Package Full</span>
                                         <span className="text-2xl font-black text-emerald-600 leading-none">{item?.counts?.full || 0}</span>
                                    </div>
                                )}
                            </div>
                            <RestockPriceSummary currentProduct={currentProduct} />
                        </div>
                    </div>
                )}

                {category !== 'cylinder' && <RestockPriceSummary currentProduct={currentProduct} />}

                <RestockTransactionForm 
                    transactionType={transactionType}
                    setTransactionType={setTransactionType}
                    quantity={quantity}
                    handleQuantityChange={handleQuantityChange}
                    totalAmount={totalAmount}
                    handleTotalChange={handleTotalChange}
                    unitPrice={unitPrice}
                    handleUnitChange={handleUnitChange}
                    wholesalePrice={wholesalePrice}
                    setWholesalePrice={setWholesalePrice}
                    retailPrice={retailPrice}
                    setRetailPrice={setRetailPrice}
                />
            </div>
        </Sheet>
    );
};
