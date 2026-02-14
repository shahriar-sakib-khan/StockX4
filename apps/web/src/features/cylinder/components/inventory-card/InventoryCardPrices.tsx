import { Button } from "@/components/ui/button";
import { PenLine } from "lucide-react";

interface InventoryCardPricesProps {
    prices: {
        fullCylinder: number;
        gasOnly: number;
    };
    onEditClick: () => void;
}

export const InventoryCardPrices = ({ prices, onEditClick }: InventoryCardPricesProps) => {
    return (
        <div className="flex items-stretch gap-2 flex-1">
            <div className="grid grid-cols-2 gap-2 flex-1">
                <div className="text-center px-1 py-1 bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col justify-center h-full">
                    <span className="text-[9px] font-bold text-slate-400 uppercase block tracking-wider mb-0.5">Pkg Price</span>
                    <span className="text-lg lg:text-xl font-black text-slate-800">৳{prices.fullCylinder}</span>
                </div>
                <div className="text-center px-1 py-1 bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col justify-center h-full">
                    <span className="text-[9px] font-bold text-slate-400 uppercase block tracking-wider mb-0.5">Refill Price</span>
                    <span className="text-lg lg:text-xl font-black text-slate-800">৳{prices.gasOnly}</span>
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
