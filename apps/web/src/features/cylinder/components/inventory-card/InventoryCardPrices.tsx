import { Button } from "@/components/ui/button";
import { PenLine } from "lucide-react";

interface InventoryCardPricesProps {
    prices: {
        retailPriceFull: number;
        retailPriceGas: number;
        wholesalePriceFull: number;
        wholesalePriceGas: number;
        buyingPriceFull: number;
        buyingPriceGas: number;
    };
    onEditClick: () => void;
}

export const InventoryCardPrices = ({ prices, onEditClick }: InventoryCardPricesProps) => {
    return (
        <div className="flex items-stretch gap-2 flex-1">
            <div className="grid grid-cols-2 gap-2 flex-1 relative group">
                {/* Packaged Prices */}
                <div className="text-center px-1 py-1 bg-white border border-emerald-100 rounded-lg shadow-sm flex flex-col justify-center h-full relative overflow-hidden">
                    <span className="text-[10px] font-black text-emerald-600 uppercase block tracking-wider mb-1 border-b border-emerald-100 pb-0.5">Packaged</span>
                    <div className="flex justify-between items-center w-full px-1">
                        <span className="text-[10px] font-bold text-slate-400">BUY</span>
                        <span className="text-base font-black text-rose-500">৳{prices.buyingPriceFull}</span>
                    </div>
                    <div className="flex justify-between items-center w-full px-1">
                        <span className="text-[10px] font-bold text-slate-400">RTL</span>
                        <span className="text-base font-black text-emerald-600">৳{prices.retailPriceFull}</span>
                    </div>
                    <div className="flex justify-between items-center w-full px-1">
                        <span className="text-[10px] font-bold text-slate-400">WSL</span>
                        <span className="text-base font-black text-blue-600">৳{prices.wholesalePriceFull}</span>
                    </div>
                </div>

                {/* Refill Prices */}
                <div className="text-center px-1 py-1 bg-white border border-cyan-100 rounded-lg shadow-sm flex flex-col justify-center h-full relative overflow-hidden">
                    <span className="text-[10px] font-black text-cyan-600 uppercase block tracking-wider mb-1 border-b border-cyan-100 pb-0.5">Refill</span>
                    <div className="flex justify-between items-center w-full px-1">
                        <span className="text-[10px] font-bold text-slate-400">BUY</span>
                        <span className="text-base font-black text-rose-500">৳{prices.buyingPriceGas}</span>
                    </div>
                    <div className="flex justify-between items-center w-full px-1">
                        <span className="text-[10px] font-bold text-slate-400">RTL</span>
                        <span className="text-base font-black text-emerald-600">৳{prices.retailPriceGas}</span>
                    </div>
                    <div className="flex justify-between items-center w-full px-1">
                        <span className="text-[10px] font-bold text-slate-400">WSL</span>
                        <span className="text-base font-black text-blue-600">৳{prices.wholesalePriceGas}</span>
                    </div>
                </div>
            </div>
            <Button
                variant="outline"
                size="sm"
                className="h-full px-3 flex flex-col items-center justify-center gap-0.5 border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-all shadow-sm group/edit shrink-0"
                onClick={onEditClick}
                title="Edit Prices"
            >
                <PenLine className="w-4 h-4 group-hover/edit:scale-110 transition-transform" />
                <span className="text-[9px] font-black uppercase">Edit</span>
            </Button>
        </div>
    );
};
