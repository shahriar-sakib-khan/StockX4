import { Button } from "@/components/ui/button";
import { X, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GlobalCatalogTab } from "./GlobalCatalogTab";
import { CustomBrandForm } from "./CustomBrandForm";
import { useStoreBrands, useUpdateStoreBrandsBulk } from "../hooks/useBrands";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface CreateBrandModalProps {
    open?: boolean;
    onClose?: () => void;
    initialData?: any;
    storeId: string;
}

export const CreateBrandModal = ({ open: controlledOpen, onClose, initialData, storeId }: CreateBrandModalProps) => {
    // We treat this modal as a "Manage Brands" modal mainly
    const setOpen = (val: boolean) => {
        if (!val && onClose) onClose();
    };

    if (!controlledOpen) return null;

    const isEditing = !!initialData;

    const { data: storeData } = useStoreBrands(storeId);
    const updateBrandsBulk = useUpdateStoreBrandsBulk();

    // Contains BOTH Global IDs and Custom Store Brand IDs
    const [selectedBrandIds, setSelectedBrandIds] = useState<Set<string>>(new Set());

    // Store original set to check for changes if needed, but not strictly required by UI

    // Initialize state from existing store records
    useEffect(() => {
        if (storeData?.brands) {
             const activeIds = storeData.brands
                .filter((b: any) => b.isActive !== false)
                .map((b: any) => b.isCustom ? b._id : b.globalBrandId) // Use _id for Custom, globalBrandId for Global
                .filter(Boolean);

             setSelectedBrandIds(new Set(activeIds));
        }
    }, [storeData]);

    const handleSelectionChange = (newSet: Set<string>) => {
        setSelectedBrandIds(newSet);
    };

    const handleSave = async () => {
        try {
            // Split IDs into Global and Custom
            const allSelected = Array.from(selectedBrandIds);

            // We need to identify which IDs are Custom vs Global.
            // Assumption: Global IDs are from the master list. Custom IDs are from storeData.
            // A safer way is to check against the storeData we have.

            const customBrandIds: string[] = [];
            const globalBrandIds: string[] = [];

            // Map of known custom brands in this store
            const knownCustomBrands = new Set(
                (storeData?.brands || [])
                    .filter((b: any) => b.isCustom)
                    .map((b: any) => b._id)
            );

            allSelected.forEach(id => {
                if (knownCustomBrands.has(id)) {
                    customBrandIds.push(id);
                } else {
                    globalBrandIds.push(id);
                }
            });

            await updateBrandsBulk.mutateAsync({
                storeId,
                globalBrandIds,
                customBrandIds
            });
            toast.success("Brand catalog updated");
            setOpen(false);
        } catch (error) {
            toast.error("Failed to update brands");
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full h-full max-w-4xl max-h-[85vh] bg-card border rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-6 border-b">
                     <div>
                        <h2 className="text-2xl font-bold tracking-tight">{isEditing ? 'Edit Brand' : 'Manage Brands'}</h2>
                        <p className="text-muted-foreground">{isEditing ? 'Update brand details' : 'Add brands to your store catalog'}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                        <X className="w-6 h-6" />
                    </Button>
                </div>

                <div className="flex-1 overflow-hidden flex flex-col">
                    {isEditing ? (
                         <div className="flex-1 overflow-y-auto p-6 pt-4 min-h-0">
                            <CustomBrandForm onSuccess={() => setOpen(false)} initialData={initialData} storeId={storeId} />
                         </div>
                    ) : (
                        <Tabs defaultValue="catalog" className="flex-1 flex flex-col min-h-0">
                        <div className="px-6 pt-4">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="catalog">Global Catalog</TabsTrigger>
                                <TabsTrigger value="custom">Create Custom</TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent value="catalog" className="flex-1 overflow-hidden flex flex-col p-6 pt-4 data-[state=inactive]:hidden min-h-0">
                            <GlobalCatalogTab
                                storeId={storeId}
                                selectedBrandIds={selectedBrandIds}
                                onSelectionChange={handleSelectionChange}
                            />
                        </TabsContent>

                        <TabsContent value="custom" className="flex-1 overflow-y-auto p-6 pt-4 data-[state=inactive]:hidden min-h-0">
                            <CustomBrandForm onSuccess={() => setOpen(false)} storeId={storeId} />
                        </TabsContent>
                    </Tabs>
                    )}
                </div>

                <div className="p-4 border-t bg-muted/10 flex justify-end">
                    <Button
                        onClick={handleSave}
                        className="w-full sm:w-auto min-w-[100px]"
                        disabled={updateBrandsBulk.isPending}
                    >
                        {updateBrandsBulk.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Done
                    </Button>
                </div>

            </div>
        </div>
    );
};
