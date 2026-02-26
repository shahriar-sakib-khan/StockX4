import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Check, Search } from "lucide-react";
import { useGlobalBrands, useStoreBrands } from "../hooks/useBrands";
import { useState, useMemo } from "react";
import { toast } from "sonner";

interface AllBrandsTabProps {
    storeId: string;
    selectedGlobalIds: Set<string>;
    onSelectionChange: (newSet: Set<string>) => void;
}

/**
 * Shows ALL GlobalBrands (the master catalog).
 * Brands already linked+active in this store are pre-selected.
 * Toggling triggers a selection change; parent saves via updateStoreBrandsBulk.
 */
export const AllBrandsTab = ({ storeId, selectedGlobalIds, onSelectionChange }: AllBrandsTabProps) => {
    const { data: globalData, isLoading } = useGlobalBrands();
    const [search, setSearch] = useState("");

    const globalBrands = globalData?.brands || [];

    const filtered = useMemo(() =>
        globalBrands.filter((b: any) => b.name.toLowerCase().includes(search.toLowerCase())),
        [globalBrands, search]
    );

    const areAllSelected = filtered.length > 0 && filtered.every((b: any) => selectedGlobalIds.has(b._id));

    const handleToggle = (brandId: string) => {
        const newSet = new Set(selectedGlobalIds);
        if (newSet.has(brandId)) { newSet.delete(brandId); } else { newSet.add(brandId); }
        onSelectionChange(newSet);
    };

    const handleBulkAction = () => {
        const newSet = new Set(selectedGlobalIds);
        if (areAllSelected) {
            filtered.forEach((b: any) => newSet.delete(b._id));
            toast.info("Deselected all visible brands");
        } else {
            filtered.forEach((b: any) => newSet.add(b._id));
            toast.info("Selected all visible brands");
        }
        onSelectionChange(newSet);
    };

    if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading brands...</div>;

    return (
        <div className="flex flex-col flex-1 min-h-0 gap-4 p-6">
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
                <Button variant="outline" onClick={handleBulkAction} disabled={filtered.length === 0} className="min-w-[110px]">
                    {areAllSelected ? "Deselect All" : "Select All"}
                </Button>
            </div>

            <div className="flex-1 min-h-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 overflow-y-auto pr-2 pb-2">
                {filtered.map((brand: any) => {
                    const selected = selectedGlobalIds.has(brand._id);
                    return (
                        <div
                            key={brand._id}
                            onClick={() => handleToggle(brand._id)}
                            className={`group flex h-28 w-full border rounded-lg overflow-hidden transition-all shadow-sm cursor-pointer ${
                                selected
                                    ? "bg-emerald-100 border-emerald-500 ring-1 ring-emerald-500"
                                    : "bg-card hover:border-primary/50 hover:shadow-md"
                            }`}
                        >
                            <div className="flex-1 flex flex-col min-w-0">
                                <div className={`flex-1 p-2 flex items-center justify-center ${selected ? "bg-emerald-50/50" : "bg-white/50"}`}>
                                    {brand.logo ? (
                                        <img src={brand.logo} alt={brand.name} className="h-full w-auto object-contain max-h-16" />
                                    ) : (
                                        <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-lg shadow-sm"
                                             style={{ backgroundColor: brand.color || '#000' }}>
                                            {brand.name.substring(0, 2).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <div className={`h-9 border-t flex items-center px-3 gap-2 ${selected ? "bg-emerald-200/50 border-emerald-200" : "bg-muted/10"}`}>
                                    <div className="w-3 h-3 rounded-full ring-1 ring-border" style={{ backgroundColor: brand.color }} />
                                    <span className="font-medium text-sm truncate">{brand.name}</span>
                                </div>
                            </div>
                            <div className={`w-12 border-l flex items-center justify-center transition-colors ${
                                selected ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                                         : "bg-muted/5 text-muted-foreground group-hover:text-primary group-hover:bg-primary/5"
                            }`}>
                                {selected ? <Check className="w-6 h-6" /> : <Plus className="w-5 h-5" />}
                            </div>
                        </div>
                    );
                })}
                {filtered.length === 0 && (
                    <div className="col-span-full text-center p-8 text-muted-foreground">
                        No brands found matching "{search}"
                    </div>
                )}
            </div>
        </div>
    );
};
