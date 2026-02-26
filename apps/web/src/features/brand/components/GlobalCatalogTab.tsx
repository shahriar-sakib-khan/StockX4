import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Check, Search, Trash2, Edit2 } from "lucide-react";
import { useBrands } from "../hooks/useBrands";
import { useState, useMemo } from "react";
import { toast } from "sonner";

interface GlobalCatalogTabProps {
    storeId: string;
    selectedBrandIds: Set<string>;
    onSelectionChange: (newSet: Set<string>) => void;
}

export const GlobalCatalogTab = ({ storeId, selectedBrandIds, onSelectionChange }: GlobalCatalogTabProps) => {
    // Use the Unified Hook to get BOTH Global and Custom brands
    const { data, isLoading } = useBrands(storeId);

    const [search, setSearch] = useState("");

    const brands = data?.brands || [];

    // Filter Brands
    const filtered = brands.filter((b: any) =>
        b.name.toLowerCase().includes(search.toLowerCase())
    );

    const isSelected = (brandId: string) => selectedBrandIds.has(brandId);

    const areAllSelected = filtered.length > 0 && filtered.every((b: any) => isSelected(b._id));

    const handleToggle = (brandId: string) => {
        const newSet = new Set(selectedBrandIds);
        if (newSet.has(brandId)) {
            newSet.delete(brandId);
        } else {
            newSet.add(brandId);
        }
        onSelectionChange(newSet);
    };

    const handleBulkAction = () => {
        if (filtered.length === 0) return;

        const newSet = new Set(selectedBrandIds);

        if (areAllSelected) {
            // Deselect All Visible
            filtered.forEach((b: any) => newSet.delete(b._id));
            toast.info("Deselected all visible brands");
        } else {
            // Select All Visible
            filtered.forEach((b: any) => newSet.add(b._id));
            toast.info("Selected all visible brands");
        }
        onSelectionChange(newSet);
    };

    if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading brands...</div>;

    return (
        <div className="flex flex-col flex-1 min-h-0 gap-4">
            <div className="flex items-center gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search brands..."
                        className="pl-9 bg-muted/30"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Button
                    variant="outline"
                    onClick={handleBulkAction}
                    disabled={filtered.length === 0}
                    className="min-w-[100px]"
                >
                    {areAllSelected ? "Deselect All" : "Select All"}
                </Button>
            </div>

            <div className="flex-1 min-h-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 overflow-y-auto pr-2 pb-2">
                {filtered.map((brand: any) => {
                    const selected = isSelected(brand._id);
                    const isCustom = brand.isCustom;

                    return (
                        <div
                            key={brand._id}
                            onClick={() => handleToggle(brand._id)}
                            className={`group flex h-28 w-full border rounded-lg overflow-hidden transition-all shadow-sm cursor-pointer relative ${
                                selected
                                    ? "bg-emerald-100 border-emerald-500 ring-1 ring-emerald-500"
                                    : "bg-card hover:border-primary/50 hover:shadow-md"
                            }`}
                        >
                            {/* Left Side: Content */}
                            <div className="flex-1 flex flex-col min-w-0">
                                {/* Logo Area */}
                                <div className={`flex-1 p-2 flex items-center justify-center relative ${selected ? "bg-emerald-50/50" : "bg-white/50"}`}>
                                    {brand.logo ? (
                                        <img src={brand.logo} alt={brand.name} className="h-full w-auto object-contain max-h-16" />
                                    ) : (
                                        <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-lg shadow-sm"
                                             style={{ backgroundColor: brand.color || brand.cylinderColor || '#000' }}>
                                            {brand.name.substring(0,2).toUpperCase()}
                                        </div>
                                    )}
                                    {isCustom && <span className="absolute top-1 left-1 text-[9px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full font-bold border border-purple-200">Custom</span>}
                                </div>
                                {/* Info Area */}
                                <div className={`h-9 border-t flex items-center px-3 gap-2 ${selected ? "bg-emerald-200/50 border-emerald-200" : "bg-muted/10"}`}>
                                     <div className="w-3 h-3 rounded-full shadow-sm ring-1 ring-border" style={{ backgroundColor: brand.color || brand.cylinderColor }} />
                                     <span className="font-medium text-sm truncate">{brand.name}</span>
                                </div>
                            </div>

                            {/* Right Side: Action Button */}
                            <div className={`w-12 border-l flex flex-col ${selected ? "border-emerald-200" : ""}`}>
                                <div
                                    className={`w-full h-full flex items-center justify-center transition-colors ${selected
                                        ? "bg-emerald-100 text-emerald-700"
                                        : "bg-muted/5 text-muted-foreground group-hover:text-primary group-hover:bg-primary/5"}`}
                                >
                                     {selected ? (
                                        <Check className="w-6 h-6" />
                                     ) : (
                                        <Plus className="w-5 h-5" />
                                     )}
                                </div>
                            </div>
                        </div>
                    );
                })}
                {filtered.length === 0 && <div className="col-span-full text-center p-8 text-muted-foreground">No brands found matching "{search}"</div>}
            </div>
        </div>
    );
};
