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
    
    // --- Clean, Professional SaaS Styles (Strictly Light Mode) ---
    const labelStyle = "text-[13px] font-medium text-slate-700 block mb-2";
    const triggerStyle = "h-11 w-full bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all";
    const contentStyle = "z-[10001] rounded-xl border border-slate-100 shadow-lg bg-white";

    return (
        <div className="space-y-5">
            
            {category === 'cylinder' && (
                <>
                    <div>
                        <label className={labelStyle}>Brand</label>
                        <Select value={selectedBrandId} onValueChange={setSelectedBrandId}>
                            <SelectTrigger className={triggerStyle}>
                                <SelectValue placeholder="Select Brand" />
                            </SelectTrigger>
                            <SelectContent className={contentStyle}>
                                {brands.map((b: any) => (
                                    <SelectItem key={b._id} value={b._id} className="cursor-pointer text-slate-700 focus:bg-slate-50 focus:text-slate-900">{b.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelStyle}>Size</label>
                            <Select value={selectedSize} onValueChange={setSelectedSize}>
                                <SelectTrigger className={triggerStyle}><SelectValue /></SelectTrigger>
                                <SelectContent className={contentStyle}>
                                    {cylinderSizes.map((s: string) => (
                                        <SelectItem key={s} value={s} className="cursor-pointer text-slate-700 focus:bg-slate-50 focus:text-slate-900">{s}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className={labelStyle}>Regulator</label>
                            <Select value={selectedRegulator} onValueChange={setSelectedRegulator}>
                                <SelectTrigger className={triggerStyle}><SelectValue /></SelectTrigger>
                                <SelectContent className={contentStyle}>
                                    {REGULATOR_TYPES.map((r: string) => (
                                        <SelectItem 
                                            key={r} 
                                            value={r} 
                                            className="cursor-pointer focus:bg-slate-50"
                                        >
                                            <span className={r === '22mm' ? 'text-orange-600' : 'text-amber-600'}>
                                                {r}
                                            </span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </>
            )}

            {category === 'stove' && (
                <>
                    <div>
                        <label className={labelStyle}>Burners</label>
                        <Select value={String(selectedBurners)} onValueChange={(v) => setSelectedBurners(Number(v))}>
                            <SelectTrigger className={triggerStyle}><SelectValue /></SelectTrigger>
                            <SelectContent className={contentStyle}>
                                {[1, 2, 3, 4].map((n) => (
                                    <SelectItem key={n} value={String(n)} className="cursor-pointer text-slate-700 focus:bg-slate-50 focus:text-slate-900">{n} Burner</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <label className={labelStyle}>Model Selection</label>
                        <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                            <SelectTrigger className={triggerStyle}>
                                <SelectValue placeholder="Select Product" />
                            </SelectTrigger>
                            <SelectContent className={contentStyle}>
                                {filteredProducts.map((p: any) => (
                                    <SelectItem key={p.productId || p._id} value={p.productId || p._id} className="cursor-pointer text-slate-700 focus:bg-slate-50 focus:text-slate-900">
                                        {p.brandName} {p.variant?.modelNumber && <span className="text-slate-400 ml-1">({p.variant.modelNumber})</span>}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </>
            )}

            {category === 'regulator' && (
                <>
                    <div>
                        <label className={labelStyle}>Regulator Type</label>
                        <Select value={selectedRegulatorSize} onValueChange={setSelectedRegulatorSize}>
                            <SelectTrigger className={triggerStyle}><SelectValue /></SelectTrigger>
                            <SelectContent className={contentStyle}>
                                {REGULATOR_TYPES.map((r: string) => (
                                    <SelectItem key={r} value={r} className="cursor-pointer text-slate-700 focus:bg-slate-50 focus:text-slate-900">{r}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <label className={labelStyle}>Model Selection</label>
                        <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                            <SelectTrigger className={triggerStyle}>
                                <SelectValue placeholder="Select Product" />
                            </SelectTrigger>
                            <SelectContent className={contentStyle}>
                                {filteredProducts.map((p: any) => (
                                    <SelectItem key={p.productId || p._id} value={p.productId || p._id} className="cursor-pointer text-slate-700 focus:bg-slate-50 focus:text-slate-900">
                                        {p.brandName} {p.variant?.modelNumber && <span className="text-slate-400 ml-1">({p.variant.modelNumber})</span>}
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