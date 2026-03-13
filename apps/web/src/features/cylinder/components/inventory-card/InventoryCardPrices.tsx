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
        <div className="flex flex-col gap-1.5">
            <div className="grid grid-cols-[1fr_1fr_auto] gap-1 items-stretch">
                {/* Packaged Prices */}
                <div className="text-center px-1.5 py-1.5 bg-white border border-emerald-100 rounded-lg shadow-sm flex flex-col justify-center">
                    <span className="text-[10px] font-black text-emerald-600 uppercase block tracking-wider mb-1 border-b border-emerald-100 pb-0.5">Pkg</span>
                    <PriceRow label="Buy" value={prices.buyingPriceFull} color="rose" />
                    <PriceRow label="Whsle" value={prices.wholesalePriceFull} color="blue" />
                    <PriceRow label="Retail" value={prices.retailPriceFull} color="emerald" />
                </div>

                {/* Refill Prices */}
                <div className="text-center px-1.5 py-1.5 bg-white border border-cyan-100 rounded-lg shadow-sm flex flex-col justify-center">
                    <span className="text-[10px] font-black text-cyan-600 uppercase block tracking-wider mb-1 border-b border-cyan-100 pb-0.5">Ref</span>
                    <PriceRow label="Buy" value={prices.buyingPriceGas} color="rose" />
                    <PriceRow label="Whsle" value={prices.wholesalePriceGas} color="blue" />
                    <PriceRow label="Retail" value={prices.retailPriceGas} color="emerald" />
                </div>

                {/* Edit Button - compact on mobile */}
                <Button
                    variant="outline"
                    size="icon"
                    className="h-auto w-8 sm:w-10 flex flex-col items-center justify-center gap-0.5 border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-all shadow-sm active:scale-95 self-stretch"
                    onClick={onEditClick}
                    title="Edit Prices"
                >
                    <PenLine className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-[7px] sm:text-[8px] font-black uppercase leading-none">Edit</span>
                </Button>
            </div>
        </div>
    );
};

const colorMap: Record<string, string> = {
    rose: 'text-rose-500',
    blue: 'text-blue-600',
    emerald: 'text-emerald-600',
};

const PriceRow = ({ label, value, color }: { label: string; value: number; color: string }) => (
    <div className="flex justify-between items-center w-full gap-1">
        <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 shrink-0">{label}</span>
        <span className={`text-xs sm:text-sm font-black ${colorMap[color]} whitespace-nowrap`}>৳{value}</span>
    </div>
);
