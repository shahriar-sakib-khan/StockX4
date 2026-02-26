import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import { Plus, Check, Loader2, Minus, Trash2 } from "lucide-react";
import { useBrands, useUpdateStoreBrandsBulk } from "@/features/brand/hooks/useBrands";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Avatar } from "@/components/ui/Avatar";
import { Checkbox } from "@/components/ui/checkbox";

interface AddBrandModalProps {
    storeId: string;
    existingBrandIds: string[];
}

export const AddBrandModal = ({ storeId, existingBrandIds }: AddBrandModalProps) => {
    const { data, isLoading } = useBrands(storeId);
    const updateBulk = useUpdateStoreBrandsBulk();

    const [open, setOpen] = useState(false);
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

        // Classify added/removed brands
        const globalToAdd: string[] = [];
        const customToAdd: string[] = [];
        const globalToRemove: string[] = [];
        const customToRemove: string[] = [];

        // Helper to check if a brand ID is custom
        const isCustomBrand = (id: string) => {
            const brand = brands.find((b: any) => b._id === id);
            return brand?.isCustom || false;
        };

        brandsToAdd.forEach(id => {
            if (isCustomBrand(id)) customToAdd.push(id);
            else globalToAdd.push(id);
        });

        brandsToRemove.forEach(id => {
            if (isCustomBrand(id)) customToRemove.push(id);
            else globalToRemove.push(id);
        });

        // For Bulk Update (Activation)
        // We need to send ALL currently active brands + new ones - removed ones?
        // Actually, the API `updateStoreBrandsBulk` sets active state.
        // It deactivates everything and activates what we send.
        // So we should construct the "Final List" of IDs to send.

        // HOWEVER, the current implementation of `AddBrandModal` is incremental (Add/Remove).
        // `updateStoreBrandsBulk` in the API (as I just wrote it) is "Replace All".
        // It deactivates ALL, then activates the list.
        // If I use `updateStoreBrandsBulk`, I must send the FULL state of desired brands.

        // But `useSubscribeBatchBrand` calls `updateStoreBrandsBulk`.
        // If I want to use the incremental approach (Add/Remove), I should use `addStoreBrand` and `deleteStoreBrand` individually?
        // OR I should verify `useSubscribeBatchBrand` implementation.

        // Let's look at `useBrands.ts`:
        // export const useSubscribeBatchBrand = () => { ... brandApi.updateStoreBrandsBulk ... }

        // If the API does "Deactivate All", then I MUST send the complete list of *desired* active brands.
        // `existingBrandIds` contains current active ones.
        // `brandsToAdd` are new ones.
        // `brandsToRemove` are ones to drop.

        // Desired List = (Existing - Removed) + Added
        const currentSet = new Set(existingBrandIds);
        brandsToRemove.forEach(id => currentSet.delete(id));
        brandsToAdd.forEach(id => currentSet.add(id));

        const finalDesiredIds = Array.from(currentSet);

        const finalGlobalIds: string[] = [];
        const finalCustomIds: string[] = [];

        finalDesiredIds.forEach(id => {
             // We need to look up if it is custom.
             // But valid `id` might not be in `brands` list if `brands` only fetches *active*?
             // No, `useBrands` fetches ALL global and ALL Store (which includes active/inactive).
             if (isCustomBrand(id)) finalCustomIds.push(id);
             else finalGlobalIds.push(id);
        });

        // Use the Bulk Update API which is safer and cleaner
        try {
            await updateBulk.mutateAsync({
                storeId,
                globalBrandIds: finalGlobalIds,
                customBrandIds: finalCustomIds
            });
            toast.success("Inventory updated");
            setOpen(false);
            // Reset local state
            setBrandsToAdd([]);
            setBrandsToRemove([]);
        } catch (error: any) {
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
    // Show all brands (Global + Custom)
    // Removed legacy variant check as GlobalBrand schema no longer has variants array.
    const availableBrands = brands;

    const isPending = updateBulk.isPending;
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
