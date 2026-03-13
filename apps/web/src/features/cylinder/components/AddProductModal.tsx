import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/Modal";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useCreateCustomBrand } from "@/features/brand/hooks/useBrands";
import { useInventoryService, useAddStoveProduct, useAddRegulatorProduct } from "@/features/cylinder/hooks/useCylinders";

interface AddProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    storeId: string;
    type: 'stove' | 'regulator';
    existingBrands: any[]; // Pass existing brands to suggest/select
}

export const AddProductModal = ({ isOpen, onClose, storeId, type, existingBrands }: AddProductModalProps) => {
    const [brandName, setBrandName] = useState("");
    const [modelName, setModelName] = useState("");

    const [buyingPrice, setBuyingPrice] = useState("");
    const [retailPrice, setRetailPrice] = useState("");
    const [wholesalePrice, setWholesalePrice] = useState("");
    const [stock, setStock] = useState("0");
    const [burners, setBurners] = useState("1");
    const [regulatorType, setRegulatorType] = useState("20mm");

    // Derived states
    const [isCreating, setIsCreating] = useState(false);

    // Hooks
    const createCustomBrand = useCreateCustomBrand();
    const addStove = useAddStoveProduct();
    const addRegulator = useAddRegulatorProduct();
    const { upsertInventory } = useInventoryService();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!brandName) {
            toast.error("Brand name is required");
            return;
        }

        setIsCreating(true);
        try {
            // 1. Find or Create Brand
            let brandId = existingBrands.find(b => b.name.toLowerCase() === brandName.toLowerCase())?._id;

            if (!brandId) {
                // Create Custom Brand
                const newBrand = await createCustomBrand.mutateAsync({
                    storeId,
                    data: {
                        customName: brandName,
                        type: type, // 'stove' or 'regulator'
                        customColor: '#000000', // Default
                        isCustom: true
                    }
                });
                brandId = newBrand.brand._id;
            }

            // 2. Create the SKU
            let createdProductId;
            if (type === 'stove') {
                const res = await addStove.mutateAsync({
                    storeId,
                    data: {
                        brandName,
                        model: modelName || undefined,
                        burners: parseInt(burners)
                    }
                });
                createdProductId = res.product._id;
            } else {
                const res = await addRegulator.mutateAsync({
                    storeId,
                    data: {
                        brandName,
                        model: modelName || undefined,
                        type: regulatorType
                    }
                });
                createdProductId = res.product._id;
            }

            // 3. Upsert Inventory Ledger
            await upsertInventory.mutateAsync({
                storeId,
                data: {
                    productId: createdProductId,
                    counts: { full: parseInt(stock) || 0, empty: 0, defected: 0 },
                    prices: {
                        buyingPriceFull: parseFloat(buyingPrice) || 0,
                        retailPriceFull: parseFloat(retailPrice) || 0,
                        wholesalePriceFull: parseFloat(wholesalePrice) || 0,
                        buyingPriceGas: 0,
                        retailPriceGas: 0,
                        wholesalePriceGas: 0
                    }
                }
            });

            toast.success(`${type === 'stove' ? 'Stove' : 'Regulator'} added successfully`);
            onClose();
            // Reset form?
            setBrandName("");
            setBuyingPrice("");
            setRetailPrice("");
            setWholesalePrice("");
            setStock("0");
        } catch (error: any) {
            console.error(error);
            const message = await error.response?.json().then((d: any) => d.error).catch(() => error.message || "Failed to add product");
            toast.error(message);
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Add ${type === 'stove' ? 'Gas Stove' : 'Regulator'}`}
        >
            <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                <div className="grid gap-2">
                    <Label htmlFor="brand">Brand Name</Label>
                    <Input
                        id="brand"
                        placeholder="e.g. RFL, Miyako..."
                        value={brandName}
                        onChange={(e) => setBrandName(e.target.value)}
                        list="brand-suggestions"
                        className="h-12 sm:h-10 text-sm font-semibold"
                    />
                    <datalist id="brand-suggestions">
                        {existingBrands.map((b: any) => (
                            <option key={b._id} value={b.name} />
                        ))}
                    </datalist>
                </div>

                {type === 'stove' && (
                    <div className="grid gap-2">
                        <Label htmlFor="model">Model (Optional)</Label>
                        <Input
                            id="model"
                            placeholder="Model Number/Name"
                            value={modelName}
                            onChange={(e) => setModelName(e.target.value)}
                            className="h-12 sm:h-10 text-sm font-semibold"
                        />
                    </div>
                )}

                {type === 'stove' ? (
                    <div className="grid gap-2">
                        <Label htmlFor="burners">Burner Count</Label>
                        <Select value={burners} onValueChange={setBurners}>
                            <SelectTrigger className="h-12 sm:h-10 text-sm font-semibold">
                                <SelectValue placeholder="Select burners" />
                            </SelectTrigger>
                            <SelectContent className="z-[10001]">
                                <SelectItem value="1">1 Burner</SelectItem>
                                <SelectItem value="2">2 Burners</SelectItem>
                                <SelectItem value="3">3 Burners</SelectItem>
                                <SelectItem value="4">4 Burners</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                ) : (
                    <div className="grid gap-2">
                        <Label htmlFor="type">Type</Label>
                        <Select value={regulatorType} onValueChange={setRegulatorType}>
                            <SelectTrigger className="h-12 sm:h-10 text-sm font-semibold">
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent className="z-[10001]">
                                <SelectItem value="20mm">20mm</SelectItem>
                                <SelectItem value="22mm">22mm</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="buyingPrice">Buy Price</Label>
                        <Input
                            id="buyingPrice"
                            type="number"
                            placeholder="0.00"
                            value={buyingPrice}
                            onChange={(e) => setBuyingPrice(e.target.value)}
                            className="h-12 sm:h-10 text-sm font-semibold"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="retailPrice">Sell Price</Label>
                        <Input
                            id="retailPrice"
                            type="number"
                            placeholder="0.00"
                            value={retailPrice}
                            onChange={(e) => setRetailPrice(e.target.value)}
                            className="h-12 sm:h-10 text-sm font-semibold"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="wholesalePrice">Wholesale</Label>
                        <Input
                            id="wholesalePrice"
                            type="number"
                            placeholder="0.00"
                            value={wholesalePrice}
                            onChange={(e) => setWholesalePrice(e.target.value)}
                            className="h-12 sm:h-10 text-sm font-semibold"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="stock">Stock</Label>
                        <Input
                            id="stock"
                            type="number"
                            placeholder="0"
                            value={stock}
                            onChange={(e) => setStock(e.target.value)}
                            className="h-12 sm:h-10 text-sm font-semibold"
                        />
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={isCreating} className="w-full sm:w-auto h-12 sm:h-10">
                        {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Add Product
                    </Button>
                </div>
            </form>
        </Modal>
    );
};
