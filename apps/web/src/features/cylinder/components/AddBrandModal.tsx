import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import { Plus, Check, Loader2, Minus, Trash2 } from "lucide-react";
import { useBrands } from "@/features/brand/hooks/useBrands";
import { useSubscribeBatchBrand, useRemoveBrand } from "../hooks/useCylinders";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Avatar } from "@/components/ui/Avatar";
import { Checkbox } from "@/components/ui/checkbox";

interface AddBrandModalProps {
    storeId: string;
    existingBrandIds: string[];
}

export const AddBrandModal = ({ storeId, existingBrandIds }: AddBrandModalProps) => {
    const [open, setOpen] = useState(false);
    const { data, isLoading } = useBrands();
    const subscribeBatch = useSubscribeBatchBrand();
    const removeBrand = useRemoveBrand();

    // State for new additions
    const [brandsToAdd, setBrandsToAdd] = useState<string[]>([]);
    // State for removals (from existing)
    const [brandsToRemove, setBrandsToRemove] = useState<string[]>([]);

    useEffect(() => {
        if (!open) {
            setBrandsToAdd([]);
            setBrandsToRemove([]);
        }
    }, [open]);

    const handleUpdate = async () => {
        if (brandsToAdd.length === 0 && brandsToRemove.length === 0) return;

        const promises = [];

        if (brandsToAdd.length > 0) {
            promises.push(subscribeBatch.mutateAsync({ storeId, globalBrandIds: brandsToAdd }));
        }

        if (brandsToRemove.length > 0) {
            const deletePromises = brandsToRemove.map(id => removeBrand.mutateAsync({ storeId, globalBrandId: id }));
            promises.push(...deletePromises);
        }

        try {
            await Promise.all(promises);
            toast.success("Inventory updated");
            setOpen(false);
        } catch (error: any) {
             // extracting error message
             const errorMsg = error?.response?.json ? (await error.response.json()).error : error.message;
             toast.error(typeof errorMsg === 'string' ? errorMsg : "Failed to update inventory");
             console.error(error);
        }
    };

    const toggleBrand = (brandId: string) => {
        const isExisting = existingBrandIds.includes(brandId);

        if (isExisting) {
            // Toggle removal status
            setBrandsToRemove(prev =>
                prev.includes(brandId)
                    ? prev.filter(id => id !== brandId) // Create: Restore (Unmark delete)
                    : [...prev, brandId] // Delete: Mark for delete
            );
        } else {
            // Toggle addition status
            setBrandsToAdd(prev =>
                prev.includes(brandId)
                    ? prev.filter(id => id !== brandId)
                    : [...prev, brandId]
            );
        }
    };

    const brands = data?.brands || [];
    const availableBrands = brands;

    const isPending = subscribeBatch.isPending || removeBrand.isPending;
    const hasChanges = brandsToAdd.length > 0 || brandsToRemove.length > 0;

    return (
        <>
            <Button onClick={() => setOpen(true)}>
                <Plus className="w-4 h-4 mr-2" /> Manage Brand
            </Button>

            <Modal isOpen={open} onClose={() => setOpen(false)} title="Manage Gas Brands" className="max-w-4xl">
                <div className="space-y-4">
                    {isLoading ? (
                        <div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div>
                    ) : availableBrands.length === 0 ? (
                        <p className="text-muted-foreground text-center">No brands available.</p>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 max-h-[600px] overflow-y-auto p-1">
                                {availableBrands.map((brand: any) => {
                                    const isExisting = existingBrandIds.includes(brand._id);

                                    // Status logic
                                    const isMarkedForAdd = brandsToAdd.includes(brand._id);
                                    const isMarkedForRemove = brandsToRemove.includes(brand._id);

                                    // Visual check state:
                                    // If existing: Checked if NOT marked for remove.
                                    // If new: Checked if marked for add.
                                    const isChecked = isExisting ? !isMarkedForRemove : isMarkedForAdd;

                                    // Styling
                                    let rowClass = "flex flex-col items-center p-4 border rounded-xl transition-all cursor-pointer hover:shadow-md relative ";
                                    if (isMarkedForRemove) rowClass += "border-destructive bg-destructive/5 ";
                                    else if (isMarkedForAdd) rowClass += "border-primary bg-primary/5 ring-1 ring-primary ";
                                    else if (isExisting) rowClass += "border-green-500 bg-green-50/50 ring-1 ring-green-500 "; // Highlight existing
                                    else rowClass += "hover:bg-muted/50 ";

                                    return (
                                        <div
                                            key={brand._id}
                                            className={rowClass}
                                            onClick={() => toggleBrand(brand._id)}
                                        >
                                            <div className="absolute top-3 right-3">
                                                 <Checkbox
                                                    checked={isChecked}
                                                    onCheckedChange={() => toggleBrand(brand._id)}
                                                    className={isExisting && isMarkedForRemove ? "data-[state=unchecked]:border-destructive" : ""}
                                                />
                                            </div>

                                            {brand.logo ? (
                                                <img className="w-16 h-12 object-contain mb-3" src={brand.logo} alt={brand.name} />
                                            ) : (
                                                <div className="w-16 h-16 rounded-full flex items-center justify-center font-bold text-white text-xl mb-3 shadow-sm"
                                                     style={{ backgroundColor: brand.cylinderColor || '#000' }}>
                                                    {brand.name.substring(0,2).toUpperCase()}
                                                </div>
                                            )}

                                            <p className={`font-bold text-center ${isMarkedForRemove ? 'text-destructive line-through' : ''}`}>
                                                {brand.name}
                                            </p>

                                            <div className="flex gap-2 mt-2">
                                                {isExisting && !isMarkedForRemove && <span className="text-[10px] bg-green-100 text-green-700 border border-green-200 px-2 py-0.5 rounded-full font-bold">In Stock</span>}
                                                {isMarkedForRemove && <span className="text-[10px] bg-destructive/10 text-destructive px-2 py-0.5 rounded-full font-bold">Removing</span>}
                                                {isMarkedForAdd && <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">New</span>}
                                            </div>

                                            <p className="text-[10px] text-muted-foreground mt-1">{brand.variants.length} Variants</p>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="flex justify-end pt-2">
                                <Button
                                    onClick={handleUpdate}
                                    disabled={isPending || !hasChanges}
                                    variant={brandsToRemove.length > 0 ? "destructive" : "default"}
                                    className="w-full sm:w-auto"
                                >
                                    {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : (brandsToRemove.length > 0 ? <Trash2 className="w-4 h-4 mr-2" /> : <Check className="w-4 h-4 mr-2" />)}
                                    {isPending ? "Updating..." : `Update Inventory (${brandsToAdd.length + brandsToRemove.length})`}
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </Modal>
        </>
    );
};
