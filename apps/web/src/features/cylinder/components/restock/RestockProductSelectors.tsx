import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { REGULATOR_TYPES } from "../../constants/restock.constants";

interface RestockProductSelectorsProps {
    category: string;
    selectedBrandId: string;
    setSelectedBrandId: (id: string) => void;
    brands: any[];
    selectedSize: string;
    setSelectedSize: (size: string) => void;
    cylinderSizes: string[];
    selectedRegulator: string;
    setSelectedRegulator: (type: string) => void;
    selectedBurners: number;
    setSelectedBurners: (count: number) => void;
    selectedRegulatorSize: string;
    setSelectedRegulatorSize: (size: string) => void;
    selectedProductId: string;
    setSelectedProductId: (id: string) => void;
    filteredProducts: any[];
}

export const RestockProductSelectors = ({
    category,
    selectedBrandId,
    setSelectedBrandId,
    brands,
    selectedSize,
    setSelectedSize,
    cylinderSizes,
    selectedRegulator,
    setSelectedRegulator,
    selectedBurners,
    setSelectedBurners,
    selectedRegulatorSize,
    setSelectedRegulatorSize,
    selectedProductId,
    setSelectedProductId,
    filteredProducts
}: RestockProductSelectorsProps) => {
    return (
        <div className="bg-muted/30 p-4 rounded-xl border space-y-3">
            {category === 'cylinder' && (
                <>
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-muted-foreground">Brand</label>
                        <Select value={selectedBrandId} onValueChange={setSelectedBrandId}>
                            <SelectTrigger className="h-9 bg-white">
                                <SelectValue placeholder="Select Brand" />
                            </SelectTrigger>
                            <SelectContent className="z-[10001]">
                                {brands.map((b: any) => (
                                    <SelectItem key={b._id} value={b._id}>{b.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-muted-foreground">Size</label>
                            <Select value={selectedSize} onValueChange={setSelectedSize}>
                                <SelectTrigger className="h-9 bg-white"><SelectValue /></SelectTrigger>
                                <SelectContent className="z-[10001]">
                                    {cylinderSizes.map((s: string) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-muted-foreground">Regulator</label>
                            <Select value={selectedRegulator} onValueChange={setSelectedRegulator}>
                                <SelectTrigger className="h-9 bg-white"><SelectValue /></SelectTrigger>
                                <SelectContent className="z-[10001]">
                                    {REGULATOR_TYPES.map((r: string) => (
                                        <SelectItem key={r} value={r} className={r === '22mm' ? 'text-orange-600 font-bold' : 'text-yellow-600 font-bold'}>{r}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </>
            )}

            {category === 'stove' && (
                <>
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-muted-foreground">Burners</label>
                        <Select value={String(selectedBurners)} onValueChange={(v) => setSelectedBurners(Number(v))}>
                            <SelectTrigger className="h-9 bg-white"><SelectValue /></SelectTrigger>
                            <SelectContent className="z-[10001]">
                                {[1, 2, 3, 4].map((n) => <SelectItem key={n} value={String(n)}>{n} Burner</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-muted-foreground">Select Model (Brand)</label>
                        <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                            <SelectTrigger className="h-9 bg-white">
                                <SelectValue placeholder="Select Product" />
                            </SelectTrigger>
                            <SelectContent className="z-[10001]">
                                {filteredProducts.map((p: any) => (
                                    <SelectItem key={p.productId || p._id} value={p.productId || p._id}>
                                        {p.brandName} {p.variant?.modelNumber && `(${p.variant.modelNumber})`}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </>
            )}

            {category === 'regulator' && (
                <>
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-muted-foreground">Regulator Type</label>
                        <Select value={selectedRegulatorSize} onValueChange={setSelectedRegulatorSize}>
                            <SelectTrigger className="h-9 bg-white"><SelectValue /></SelectTrigger>
                            <SelectContent className="z-[10001]">
                                {REGULATOR_TYPES.map((r: string) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-muted-foreground">Select Model (Brand)</label>
                        <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                            <SelectTrigger className="h-9 bg-white">
                                <SelectValue placeholder="Select Product" />
                            </SelectTrigger>
                            <SelectContent className="z-[10001]">
                                {filteredProducts.map((p: any) => (
                                    <SelectItem key={p.productId || p._id} value={p.productId || p._id}>
                                        {p.brandName} {p.variant?.modelNumber && `(${p.variant.modelNumber})`}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </>
            )}
        </div>
    );
};
