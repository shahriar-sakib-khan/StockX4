import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Save } from "lucide-react";

interface InventoryCardEditFormProps {
    prices: {
        retailPriceFull: number;
        retailPriceGas: number;
        wholesalePriceFull: number;
        wholesalePriceGas: number;
        buyingPriceFull: number;
        buyingPriceGas: number;
    };
    onPriceChange: (field: string, value: string) => void;
    onSave: () => void;
    onCancel: () => void;
    isPending: boolean;
}

export const InventoryCardEditForm = ({ prices, onPriceChange, onSave, onCancel, isPending }: InventoryCardEditFormProps) => {
    return (
        <div className="absolute inset-0 flex flex-col gap-2 animate-in fade-in zoom-in-95 duration-200 bg-white z-10 p-2">
            <div className="grid grid-cols-2 gap-2 flex-1 min-h-0 mb-1">
                <div className="p-1 bg-emerald-50/50 rounded-lg border border-emerald-100 flex flex-col justify-start h-full overflow-y-auto hidden-scrollbar">
                    <span className="text-[10px] font-black text-emerald-800 uppercase block text-center border-b border-emerald-200 pb-0.5 mb-1 sticky top-0 bg-emerald-50/50 backdrop-blur-sm">Packaged</span>
                    <div className="space-y-1">
                        <div className="flex items-center justify-between gap-1 group">
                            <label className="text-[10px] font-black text-rose-500 uppercase w-10 group-focus-within:text-rose-600">Buy</label>
                            <Input type="number" className="h-7 text-sm font-black text-rose-600 bg-white border-rose-200 focus-visible:ring-rose-500 px-1 w-full" value={prices.buyingPriceFull} onChange={(e) => onPriceChange('buyingPriceFull', e.target.value)} />
                        </div>
                        <div className="flex items-center justify-between gap-1 group">
                            <label className="text-[10px] font-black text-emerald-600 uppercase w-10 group-focus-within:text-emerald-700">Retail</label>
                            <Input type="number" className="h-7 text-sm font-black text-emerald-700 bg-white border-emerald-200 focus-visible:ring-emerald-500 px-1 w-full" value={prices.retailPriceFull} onChange={(e) => onPriceChange('retailPriceFull', e.target.value)} />
                        </div>
                        <div className="flex items-center justify-between gap-1 group">
                            <label className="text-[10px] font-black text-blue-600 uppercase w-10 group-focus-within:text-blue-700">Whsle</label>
                            <Input type="number" className="h-7 text-sm font-black text-blue-700 bg-white border-blue-200 focus-visible:ring-blue-500 px-1 w-full" value={prices.wholesalePriceFull} onChange={(e) => onPriceChange('wholesalePriceFull', e.target.value)} />
                        </div>
                    </div>
                </div>
                <div className="p-1 bg-cyan-50/50 rounded-lg border border-cyan-100 flex flex-col justify-start h-full overflow-y-auto hidden-scrollbar">
                    <span className="text-[10px] font-black text-cyan-800 uppercase block text-center border-b border-cyan-200 pb-0.5 mb-1 sticky top-0 bg-cyan-50/50 backdrop-blur-sm">Refill</span>
                    <div className="space-y-1">
                        <div className="flex items-center justify-between gap-1 group">
                            <label className="text-[10px] font-black text-rose-500 uppercase w-10 group-focus-within:text-rose-600">Buy</label>
                            <Input type="number" className="h-7 text-sm font-black text-rose-600 bg-white border-rose-200 focus-visible:ring-rose-500 px-1 w-full" value={prices.buyingPriceGas} onChange={(e) => onPriceChange('buyingPriceGas', e.target.value)} />
                        </div>
                        <div className="flex items-center justify-between gap-1 group">
                            <label className="text-[10px] font-black text-emerald-600 uppercase w-10 group-focus-within:text-emerald-700">Retail</label>
                            <Input type="number" className="h-7 text-sm font-black text-emerald-700 bg-white border-emerald-200 focus-visible:ring-emerald-500 px-1 w-full" value={prices.retailPriceGas} onChange={(e) => onPriceChange('retailPriceGas', e.target.value)} />
                        </div>
                        <div className="flex items-center justify-between gap-1 group">
                            <label className="text-[10px] font-black text-blue-600 uppercase w-10 group-focus-within:text-blue-700">Whsle</label>
                            <Input type="number" className="h-7 text-sm font-black text-blue-700 bg-white border-blue-200 focus-visible:ring-blue-500 px-1 w-full" value={prices.wholesalePriceGas} onChange={(e) => onPriceChange('wholesalePriceGas', e.target.value)} />
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex gap-2 mt-auto pt-1 shrink-0">
                <Button onClick={onCancel} variant="ghost" size="sm" className="flex-1 h-9 text-sm font-black text-slate-500 hover:bg-slate-100">
                    Cancel
                </Button>
                <Button onClick={onSave} disabled={isPending} className="flex-1 h-9 text-sm font-black" size="sm">
                    {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <Save className="w-4 h-4 mr-1.5" />}
                    Save
                </Button>
            </div>
        </div>
    );
};
