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
import { useInventoryService } from "@/features/cylinder/hooks/useCylinders";

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

    const [price, setPrice] = useState("");
    const [stock, setStock] = useState("0");
    const [burners, setBurners] = useState("1");
    const [regulatorType, setRegulatorType] = useState("20mm");

    // Derived states
    const [isCreating, setIsCreating] = useState(false);

    // Hooks
    const createCustomBrand = useCreateCustomBrand();
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
                        name: brandName,
                        type: type, // 'stove' or 'regulator'
                        color: '#000000', // Default
                        isCustom: true
                    }
                });
                brandId = newBrand.brand._id;
            }

            // 2. Upsert Inventory
            await upsertInventory.mutateAsync({
                storeId,
                data: {
                    brandId,
                    category: type,
                    variant: type === 'stove'
                        ? { burners: parseInt(burners) }
                        : { size: regulatorType }, // Changed from 'regulator' to 'size' to match schema/frontend
                    counts: { full: parseInt(stock) || 0, empty: 0, defected: 0 },
                    prices: { fullCylinder: parseFloat(price) || 0 }
                }
            });

            toast.success(`${type === 'stove' ? 'Stove' : 'Regulator'} added successfully`);
            onClose();
            // Reset form?
            setBrandName("");
            setPrice("");
            setStock("0");
        } catch (error) {
            console.error(error);
            toast.error("Failed to add product");
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
                    />
                    <datalist id="brand-suggestions">
                        {existingBrands.map((b: any) => (
                            <option key={b._id} value={b.name} />
                        ))}
                    </datalist>
                </div>

                {/* Model - Visual only for now as per schema limitation, or we can assume it's omitted */}
                <div className="grid gap-2">
                    <Label htmlFor="model">Model (Optional)</Label>
                    <Input
                        id="model"
                        placeholder="Model Number/Name"
                        value={modelName}
                        onChange={(e) => setModelName(e.target.value)}
                    />
                </div>

                {type === 'stove' ? (
                    <div className="grid gap-2">
                        <Label htmlFor="burners">Burner Count</Label>
                        <Select value={burners} onValueChange={setBurners}>
                            <SelectTrigger>
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
                            <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent className="z-[10001]">
                                <SelectItem value="20mm">20mm</SelectItem>
                                <SelectItem value="22mm">22mm</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="price">Price</Label>
                        <Input
                            id="price"
                            type="number"
                            placeholder="0.00"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="stock">Initial Stock</Label>
                        <Input
                            id="stock"
                            type="number"
                            placeholder="0"
                            value={stock}
                            onChange={(e) => setStock(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={isCreating}>
                        {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Add Product
                    </Button>
                </div>
            </form>
        </Modal>
    );
};
