import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Save } from "lucide-react";

interface InventoryCardEditFormProps {
    prices: {
        buyingPriceFull: number;
        fullCylinder: number;
        buyingPriceGas: number;
        gasOnly: number;
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
                <div className="space-y-0.5 p-1 bg-emerald-50/50 rounded-lg border border-emerald-100 flex flex-col justify-center h-full">
                    <span className="text-sm font-black text-emerald-800 uppercase block text-center border-b border-emerald-200 pb-0.5 mb-0.5">Packaged</span>
                    <div>
                        <label className="text-[11px] font-black text-slate-500 uppercase block leading-none mb-0.5">Buy</label>
                        <Input type="number" className="h-8 text-xl font-black bg-white border-emerald-200 focus-visible:ring-emerald-500 px-1" value={prices.buyingPriceFull} onChange={(e) => onPriceChange('buyingPriceFull', e.target.value)} />
                    </div>
                    <div>
                        <label className="text-[11px] font-black text-slate-500 uppercase block leading-none mb-0.5">Sell</label>
                        <Input type="number" className="h-8 text-xl font-black bg-white border-emerald-200 focus-visible:ring-emerald-500 px-1" value={prices.fullCylinder} onChange={(e) => onPriceChange('fullCylinder', e.target.value)} />
                    </div>
                </div>
                <div className="space-y-0.5 p-1 bg-cyan-50/50 rounded-lg border border-cyan-100 flex flex-col justify-center h-full">
                    <span className="text-sm font-black text-cyan-800 uppercase block text-center border-b border-cyan-200 pb-0.5 mb-0.5">Refill</span>
                    <div>
                        <label className="text-[11px] font-black text-slate-500 uppercase block leading-none mb-0.5">Buy</label>
                        <Input type="number" className="h-8 text-xl font-black bg-white border-cyan-200 focus-visible:ring-cyan-500 px-1" value={prices.buyingPriceGas} onChange={(e) => onPriceChange('buyingPriceGas', e.target.value)} />
                    </div>
                    <div>
                        <label className="text-[11px] font-black text-slate-500 uppercase block leading-none mb-0.5">Sell</label>
                        <Input type="number" className="h-8 text-xl font-black bg-white border-cyan-200 focus-visible:ring-cyan-500 px-1" value={prices.gasOnly} onChange={(e) => onPriceChange('gasOnly', e.target.value)} />
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
