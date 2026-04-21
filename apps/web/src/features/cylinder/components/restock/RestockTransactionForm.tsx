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

    // --- Clean, Professional SaaS Styles (Light Mode Locked) ---
    const labelStyle = "text-[13px] font-medium text-slate-700 block mb-2";
    const inputStyle = "h-11 w-full bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all";
    const currencyIconStyle = "absolute left-3.5 top-1/2 -translate-y-1/2 font-medium text-slate-400";

    return (
        <div className="space-y-5">
            
            {/* 1. Sleek Segmented Control */}
            <div className="flex p-1 bg-slate-100/80 rounded-xl border border-slate-200/60">
                <button
                    onClick={() => setTransactionType('buy')}
                    className={`flex-1 py-2 text-[13px] font-semibold rounded-lg transition-all duration-200 ${
                        transactionType === 'buy' 
                            ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50' 
                            : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                    Record Expense
                </button>
                <button
                    onClick={() => setTransactionType('add_stock')}
                    className={`flex-1 py-2 text-[13px] font-semibold rounded-lg transition-all duration-200 ${
                        transactionType === 'add_stock' 
                            ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50' 
                            : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                    Add to Stock Only
                </button>
            </div>

            <div className="space-y-5 pt-1">
                
                {/* 2. Primary Quantity Input */}
                <div>
                    <label className={labelStyle}>How many units?</label>
                    <Input
                        type="number"
                        placeholder="0"
                        className="text-lg font-semibold h-12 bg-white border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all"
                        value={quantity}
                        onChange={(e) => handleQuantityChange(e.target.value)}
                    />
                </div>

                {/* 3. Expense Tracking (Only visible on 'buy') */}
                {transactionType === 'buy' && (
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelStyle}>Total Investment</label>
                            <div className="relative">
                                <span className={currencyIconStyle}>৳</span>
                                <Input
                                    type="number"
                                    placeholder="0"
                                    className={`${inputStyle} pl-8`}
                                    value={totalAmount}
                                    onChange={(e) => handleTotalChange(e.target.value)}
                                />
                            </div>
                        </div>
                        <div>
                            <label className={labelStyle}>Unit Price</label>
                            <div className="relative">
                                <span className={currencyIconStyle}>৳</span>
                                <Input
                                    type="number"
                                    placeholder="0"
                                    className={`${inputStyle} pl-8`}
                                    value={unitPrice}
                                    onChange={(e) => handleUnitChange(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                )}

                <div className="h-px w-full bg-slate-100 my-2"></div>

                {/* 4. Price Updates */}
                <div className="grid grid-cols-2 gap-4 pb-2">
                    <div>
                        <label className={labelStyle}>New Wholesale</label>
                        <div className="relative">
                            <span className={currencyIconStyle}>৳</span>
                            <Input
                                type="number"
                                placeholder="0"
                                className={`${inputStyle} pl-8`}
                                value={wholesalePrice}
                                onChange={(e) => setWholesalePrice(e.target.value === '' ? '' : Number(e.target.value))}
                            />
                        </div>
                    </div>
                    <div>
                        <label className={labelStyle}>New Retail</label>
                        <div className="relative">
                            <span className={currencyIconStyle}>৳</span>
                            <Input
                                type="number"
                                placeholder="0"
                                className={`${inputStyle} pl-8 border-primary/20 focus:border-primary`}
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