import { Input } from "@/components/ui/input";

interface RestockTransactionFormProps {
    transactionType: 'buy' | 'add_stock';
    setTransactionType: (type: 'buy' | 'add_stock') => void;
    quantity: number | '';
    handleQuantityChange: (val: string) => void;
    totalAmount: number | '';
    handleTotalChange: (val: string) => void;
    unitPrice: number | '';
    handleUnitChange: (val: string) => void;
    wholesalePrice: number | '';
    setWholesalePrice: (val: number | '') => void;
    retailPrice: number | '';
    setRetailPrice: (val: number | '') => void;
}

export const RestockTransactionForm = ({
    transactionType,
    setTransactionType,
    quantity,
    handleQuantityChange,
    totalAmount,
    handleTotalChange,
    unitPrice,
    handleUnitChange,
    wholesalePrice,
    setWholesalePrice,
    retailPrice,
    setRetailPrice
}: RestockTransactionFormProps) => {
    return (
        <div className="space-y-4">
            {/* Transaction Type Selector */}
            <div className="grid grid-cols-2 gap-2 bg-muted/50 p-1 rounded-lg border">
                <button
                    onClick={() => setTransactionType('buy')}
                    className={`py-2 text-xs font-black rounded-md transition-all ${transactionType === 'buy' ? 'bg-white text-zinc-950 shadow-sm border' : 'text-muted-foreground hover:text-foreground'}`}
                >Record Expense</button>
                <button
                    onClick={() => setTransactionType('add_stock')}
                    className={`py-2 text-xs font-black rounded-md transition-all ${transactionType === 'add_stock' ? 'bg-white text-rose-600 shadow-sm border border-rose-100' : 'text-muted-foreground hover:text-foreground'}`}
                >Add to Stock Only</button>
            </div>

            <div className="space-y-4 pt-2">
                <div className="space-y-1">
                    <label className="text-xs font-black uppercase text-zinc-500">How many units?</label>
                    <Input
                        type="number"
                        placeholder="0"
                        className="text-2xl font-black h-14 bg-zinc-50 border-zinc-200 focus:ring-rose-500 focus:border-rose-500"
                        value={quantity}
                        onChange={(e) => handleQuantityChange(e.target.value)}
                    />
                </div>

                {transactionType === 'buy' && (
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">Total Investment</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-black text-zinc-400">৳</span>
                                <Input
                                    type="number"
                                    placeholder="0"
                                    className="pl-7 font-black h-12 bg-zinc-50 border-zinc-200"
                                    value={totalAmount}
                                    onChange={(e) => handleTotalChange(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">Unit Price</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-black text-zinc-400">৳</span>
                                <Input
                                    type="number"
                                    placeholder="0"
                                    className="pl-7 font-black h-12 bg-zinc-50 border-zinc-200"
                                    value={unitPrice}
                                    onChange={(e) => handleUnitChange(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-3 pb-2">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-zinc-500 tracking-wider flex items-center gap-1.5">
                            New Wholesale
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 font-black text-zinc-400">৳</span>
                            <Input
                                type="number"
                                placeholder="0"
                                className="pl-7 font-black h-12 bg-amber-50/50 border-amber-200 focus:border-amber-500 focus:ring-amber-500"
                                value={wholesalePrice}
                                onChange={(e) => setWholesalePrice(e.target.value === '' ? '' : Number(e.target.value))}
                            />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-zinc-500 tracking-wider flex items-center gap-1.5">
                            New Retail
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 font-black text-zinc-400">৳</span>
                            <Input
                                type="number"
                                placeholder="0"
                                className="pl-7 font-black h-12 bg-emerald-50/50 border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500"
                                value={retailPrice}
                                onChange={(e) => setRetailPrice(e.target.value === '' ? '' : Number(e.target.value))}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
