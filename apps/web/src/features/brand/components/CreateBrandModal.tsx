import { Button } from "@/components/ui/button";
import { X, Loader2, Package } from "lucide-react";
import { useStoreBrands, useUpdateStoreBrandsBulk, useDeleteStoreBrand } from "../hooks/useBrands";
import { CustomBrandForm } from "./CustomBrandForm";
import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { AllBrandsTab } from "./AllBrandsTab";

interface CreateBrandModalProps {
    open?: boolean;
    onClose?: () => void;
    initialData?: any;
    storeId: string;
}

type Tab = 'all' | 'custom' | 'create';

export const CreateBrandModal = ({ open: controlledOpen, onClose, initialData, storeId }: CreateBrandModalProps) => {
    const [tab, setTab] = useState<Tab>('all');
    const [selectedGlobalIds, setSelectedGlobalIds] = useState<Set<string>>(new Set());

    const isEditing = !!initialData;

    const { data: storeData } = useStoreBrands(storeId);
    const updateBrandsBulk = useUpdateStoreBrandsBulk();
    const deleteStoreBrand = useDeleteStoreBrand();

    // Initialise selection from current active global-linked brands
    useEffect(() => {
        if (storeData?.brands) {
            const activeGlobalIds = storeData.brands
                .filter((b: any) => !b.isCustom && b.isActive !== false)
                .map((b: any) => b.globalBrandId)
                .filter(Boolean);
            setSelectedGlobalIds(new Set(activeGlobalIds));
        }
    }, [storeData]);

    const customBrands = useMemo(() =>
        (storeData?.brands || []).filter((b: any) => b.isCustom),
        [storeData]
    );

    // Conditional render MUST come after all hooks
    if (!controlledOpen) return null;

    const handleSaveGlobalBrands = async () => {
        try {
            await updateBrandsBulk.mutateAsync({ storeId, globalBrandIds: Array.from(selectedGlobalIds) });
            toast.success("Brand catalog updated");
            onClose?.();
        } catch {
            toast.error("Failed to update brands");
        }
    };

    const handleDeleteCustomBrand = async (id: string) => {
        try {
            await deleteStoreBrand.mutateAsync({ storeId, id });
            toast.success("Custom brand deleted");
        } catch {
            toast.error("Failed to delete brand");
        }
    };

    const TABS: { key: Tab; label: string }[] = [
        { key: 'all', label: 'All Brands' },
        { key: 'custom', label: `Custom (${customBrands.length})` },
        { key: 'create', label: '+ Create Custom' },
    ];

    return (
        <div
            className="fixed inset-0 z-[9999] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
        >
            <div className="w-full h-full max-w-4xl max-h-[85vh] bg-card border rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">
                            {isEditing ? 'Edit Brand' : 'Manage Brands'}
                        </h2>
                        <p className="text-muted-foreground text-sm">
                            {isEditing ? 'Update brand details' : 'Manage your cylinder brand catalog'}
                        </p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="w-6 h-6" />
                    </Button>
                </div>

                {isEditing ? (
                    <div className="flex-1 overflow-y-auto p-6">
                        <CustomBrandForm onSuccess={() => onClose?.()} initialData={initialData} storeId={storeId} />
                    </div>
                ) : (
                    <>
                        {/* Tab Bar */}
                        <div className="flex border-b px-6 pt-4 gap-2">
                            {TABS.map(t => (
                                <button
                                    key={t.key}
                                    onClick={() => setTab(t.key)}
                                    className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors ${
                                        tab === t.key
                                            ? 'border-primary text-primary'
                                            : 'border-transparent text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    {t.label}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content */}
                        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                            {tab === 'all' && (
                                <AllBrandsTab
                                    storeId={storeId}
                                    selectedGlobalIds={selectedGlobalIds}
                                    onSelectionChange={setSelectedGlobalIds}
                                />
                            )}
                            {tab === 'custom' && (
                                <div className="flex-1 overflow-y-auto p-6">
                                    {customBrands.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
                                            <Package className="w-10 h-10 opacity-40" />
                                            <p className="text-sm">No custom brands yet. Create one below.</p>
                                            <Button variant="outline" size="sm" onClick={() => setTab('create')}>
                                                + Create Custom Brand
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {customBrands.map((brand: any) => (
                                                <div key={brand._id} className="flex h-20 border rounded-lg overflow-hidden bg-card shadow-sm">
                                                    <div className="w-14 flex-shrink-0 flex items-center justify-center"
                                                         style={{ backgroundColor: brand.color + '22' }}>
                                                        {brand.logo ? (
                                                            <img src={brand.logo} alt={brand.name} className="w-10 h-10 object-contain" />
                                                        ) : (
                                                            <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm"
                                                                 style={{ backgroundColor: brand.color }}>
                                                                {brand.name?.substring(0, 2).toUpperCase()}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 flex items-center px-3 gap-2 min-w-0">
                                                        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: brand.color }} />
                                                        <span className="font-semibold text-sm truncate">{brand.name}</span>
                                                        <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full font-bold border border-purple-200 flex-shrink-0">Custom</span>
                                                    </div>
                                                    <button
                                                        onClick={() => handleDeleteCustomBrand(brand._id)}
                                                        className="w-10 flex-shrink-0 bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition-colors"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                            {tab === 'create' && (
                                <div className="flex-1 overflow-y-auto p-6">
                                    <CustomBrandForm
                                        onSuccess={() => { setTab('custom'); }}
                                        storeId={storeId}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Footer — only show Save on "All Brands" tab */}
                        {tab === 'all' && (
                            <div className="p-4 border-t bg-muted/10 flex justify-end">
                                <Button
                                    onClick={handleSaveGlobalBrands}
                                    className="min-w-[120px]"
                                    disabled={updateBrandsBulk.isPending}
                                >
                                    {updateBrandsBulk.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                    Save Changes
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};
