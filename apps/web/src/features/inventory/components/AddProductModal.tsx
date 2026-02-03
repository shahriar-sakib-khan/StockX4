import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useCreateProduct } from "@/features/product/hooks/useProducts";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Modal } from "@/components/ui/Modal";

interface AddProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: 'stove' | 'regulator';
    storeId: string;
}

export const AddProductModal = ({ isOpen, onClose, type, storeId }: AddProductModalProps) => {
    const create = useCreateProduct();
    const [name, setName] = useState("");
    const [brand, setBrand] = useState("");
    const [model, setModel] = useState(""); // Optional
    const [price, setPrice] = useState("");
    const [count, setCount] = useState("");

    // Dynamic fields
    const [burners, setBurners] = useState("1");
    const [size, setSize] = useState("22mm");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Basic validation
        if (!name || !price || !count) {
            toast.error("Please fill required fields");
            return;
        }

        const data: any = {
            storeId,
            name,
            brand: name, // User requested "Name (Brand Name)"
            type,
            sellingPrice: Number(price),
            costPrice: Number(price) * 0.8, // Auto-calculate cost for now
            stock: Number(count),
            modelNumber: model
        };

        if (type === 'stove') {
            data.burnerCount = burners;
        } else {
            data.size = size;
        }

        create.mutate(data, {
            onSuccess: () => {
                toast.success("Product added");
                onClose();
                setName("");
                setBrand("");
                setModel("");
                setPrice("");
                setCount("");
            }
        });
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Add New ${type === 'stove' ? 'Stove' : 'Regulator'}`}
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label>Product Name (Brand)</Label>
                    <Input
                        placeholder="e.g. RFL Gas Stove"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label>Model (Optional)</Label>
                    <Input
                        placeholder="e.g. Model-X"
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                    />
                </div>

                {type === 'stove' && (
                    <div className="space-y-2">
                        <Label>Burners</Label>
                        <Select value={burners} onValueChange={setBurners}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1">1 Burner</SelectItem>
                                <SelectItem value="2">2 Burners</SelectItem>
                                <SelectItem value="3">3 Burners</SelectItem>
                                <SelectItem value="4">4 Burners</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                )}

                {type === 'regulator' && (
                    <div className="space-y-2">
                        <Label>Size</Label>
                        <Select value={size} onValueChange={setSize}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="22mm">22mm</SelectItem>
                                <SelectItem value="20mm">20mm</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                        <Label>Price</Label>
                        <Input
                            type="number"
                            placeholder="0.00"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Initial Stock</Label>
                        <Input
                            type="number"
                            placeholder="0"
                            value={count}
                            onChange={(e) => setCount(e.target.value)}
                            required
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
                    <Button type="submit" disabled={create.isPending}>
                        {create.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Add Product
                    </Button>
                </div>
            </form>
        </Modal>
    );
};
