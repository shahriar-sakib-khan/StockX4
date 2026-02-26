import { Button } from "@/components/ui/button";

interface InventoryCardActionsProps {
    item: any;
    onBuy: (item: any) => void;
    onSell: (item: any) => void;
}

export const InventoryCardActions = ({ item, onBuy, onSell }: InventoryCardActionsProps) => {
    return (
        <div className="grid grid-cols-2 gap-4 mt-auto pt-1 shrink-0">
            <Button onClick={() => onBuy(item)} variant="outline" size="sm" className="h-10 text-base font-black border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 hover:text-rose-900 hover:border-rose-300 shadow-sm hover:shadow hover:-translate-y-0.5 transition-all">
                Buy
            </Button>
            <Button onClick={() => onSell(item)} variant="outline" size="sm" className="h-10 text-base font-black border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-900 hover:border-emerald-300 shadow-sm hover:shadow hover:-translate-y-0.5 transition-all">
                Sell
            </Button>
        </div>
    );
};
