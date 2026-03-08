
export interface InvoiceItem {
    productId: string;
    name: string;
    description?: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    saleType?: 'REFILL' | 'PACKAGED' | 'RETURN' | 'ACCESSORY' | 'EXPENSE' | 'DUE';
    category?: string;
    type?: string;
    isReturn?: boolean;
    isDue?: boolean;
    isSettled?: boolean;
    size?: string;
    regulator?: string;
    burners?: number;
}

interface InvoiceItemsTableProps {
    items: InvoiceItem[];
    highlightReturns?: boolean;
    isExpense?: boolean;
}

export const InvoiceItemsTable = ({ items, highlightReturns = false, isExpense = false }: InvoiceItemsTableProps) => {
    // Helper to render a section
    const renderSection = (title: string, sectionItems: InvoiceItem[], isReturnSection = false, isDueSection = false) => {
        if (sectionItems.length === 0) return null;

        return (
            <div className="py-2 sm:py-3">
                <h3 className={`font-black uppercase text-[10px] sm:text-xs underline mb-1.5 sm:mb-2 ${isReturnSection ? 'text-slate-500' : ''} ${isDueSection ? 'text-orange-700' : 'text-slate-800'}`}>{title}</h3>
                <div className="space-y-1 sm:space-y-2">
                    {sectionItems.map((item, idx) => {
                        const cat = item.category?.toLowerCase();
                        const type = item.type?.toLowerCase();
                        const isStove = cat === 'stove' || type === 'stove';
                        const isRegulator = cat === 'regulator' || type === 'regulator';

                        // Extract burner count for stoves if possible
                        let burnerDisplay = '-';
                        if (isStove) {
                            if (item.burners) {
                                burnerDisplay = `${item.burners}-Burner`;
                            } else if (item.name.toLowerCase().includes('burner')) {
                                burnerDisplay = (item.name.match(/(\d-burner)/i)?.[0] || item.name.match(/(\d-\w+)/i)?.[0] || '-');
                            }
                        }

                        // Size/Regulator display logic
                        const displaySize = isStove ? '-' : (item.size && item.size !== '?' ? item.size : '-');
                        const displayRegOrBurner = isStove ? burnerDisplay : (item.regulator && item.regulator !== '?' ? item.regulator : '-');

                        return (
                            <div key={item.productId || idx} className={`flex items-center py-1 sm:py-2 border-b border-dotted last:border-0 ${isReturnSection ? 'text-slate-500' : ''} ${isDueSection ? 'text-orange-900 bg-orange-50/20' : ''}`}>
                                {/* Item Name */}
                                <div className="flex-[2] pr-1">
                                    <div className="flex items-baseline gap-1 flex-wrap">
                                        <span className="text-xs sm:text-xl font-black leading-tight tracking-tight">{item.name}</span>
                                        {isReturnSection && !item.isSettled && <span className="text-[7px] sm:text-xs italic font-bold opacity-70">(Return)</span>}
                                        {isDueSection && <span className="text-[7px] sm:text-xs font-black italic text-orange-600">(DUE)</span>}
                                        {item.isSettled && <span className="text-[7px] sm:text-xs font-black italic text-green-600">(Settled)</span>}
                                    </div>
                                    {/* Description fallback if size/regulator empty, or extra info */}
                                    {item.description && !item.isSettled && !item.size && !item.regulator && <div className="text-[8px] sm:text-xs text-muted-foreground mt-0.5">{item.description}</div>}
                                </div>

                                {/* Size & Regulator - Hiden for Expenses */}
                                {!isExpense && (
                                    <>
                                        <div className="w-14 sm:w-20 text-center text-xs sm:text-base font-bold text-slate-700">
                                            {displaySize}
                                        </div>
                                        <div className="w-16 sm:w-24 text-center text-xs sm:text-base font-bold text-slate-700">
                                            {displayRegOrBurner}
                                        </div>
                                    </>
                                )}

                                {/* Qty */}
                                <div className="w-10 sm:w-16 text-center text-lg sm:text-2xl font-black text-slate-900">{item.quantity}</div>

                                {/* Price */}
                                <div className="w-14 sm:w-20 text-right text-sm sm:text-xl font-bold text-slate-700">{!isReturnSection && !isDueSection && item.unitPrice}</div>

                                {/* Total */}
                                <div className="w-14 sm:w-20 text-right font-black text-sm sm:text-xl text-slate-900">{!isReturnSection && !isDueSection && item.subtotal}</div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    // Filter items logic
    const packagedItems = items.filter(i => i.saleType === 'PACKAGED');
    const refillItems = items.filter(i => i.saleType === 'REFILL');

    // Returns logic: sub-sort regular first, then settled
    const allReturns = items.filter(i =>
        (i.saleType === 'RETURN' || i.isReturn || (i.unitPrice === 0 && (i.type === 'CYLINDER' || i.category === 'cylinder' && i.saleType !== 'DUE'))) &&
        !i.isDue
    );
    const regularReturns = allReturns.filter(i => !i.isSettled);
    const settledReturns = allReturns.filter(i => i.isSettled);
    const sortedReturns = [...regularReturns, ...settledReturns];

    const dueItems = items.filter(i => i.saleType === 'DUE' || i.isDue);
    const expenseItems = items.filter(i => i.saleType === 'EXPENSE');

    // Categorized Accessories
    const stoveItems = items.filter(i => i.category?.toLowerCase() === 'stove' || i.type?.toLowerCase() === 'stove');
    const regulatorItems = items.filter(i => i.category?.toLowerCase() === 'regulator' || i.type?.toLowerCase() === 'regulator');

    // Everything else (General Products)
    // CRITICAL: Exclude ALL categorized items strictly to prevent redundant data
    const productItems = items.filter(i => {
        const cat = i.category?.toLowerCase();
        const type = i.type?.toLowerCase();
        const sType = i.saleType?.toUpperCase();

        return (
            cat !== 'cylinder' &&
            type !== 'cylinder' &&
            cat !== 'stove' &&
            type !== 'stove' &&
            cat !== 'regulator' &&
            type !== 'regulator' &&
            sType !== 'EXPENSE' &&
            sType !== 'PACKAGED' &&
            sType !== 'REFILL' &&
            sType !== 'RETURN' &&
            sType !== 'DUE' &&
            !i.isReturn &&
            !i.isDue &&
            !i.isSettled
        );
    });

    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="overflow-x-auto -mx-1 px-1 pb-1">
                <div className="min-w-[500px] sm:min-w-0">
                    {/* Global Header */}
                    <div className="flex items-center text-[8px] sm:text-[11px] font-black uppercase tracking-widest text-muted-foreground border-b-2 border-dashed pb-1 sm:pb-2 bg-slate-50/50 p-1.5 sm:p-2 rounded-t-lg">
                        <span className="flex-[2]">Item / Description</span>
                        {!isExpense && (
                            <>
                                <span className="w-12 sm:w-20 text-center">Size</span>
                                <span className="w-16 sm:w-24 text-center">Burner/Reg</span>
                            </>
                        )}
                        <span className="w-8 sm:w-16 text-center">{isExpense ? 'Qty' : 'Qty'}</span>
                        <span className="w-12 sm:w-20 text-right">Price</span>
                        <span className="w-12 sm:w-20 text-right">Total</span>
                    </div>

                    <div className="divide-y divide-dashed divide-slate-100">
                        {renderSection('Packaged Cylinders', packagedItems)}
                        {renderSection('Refill Cylinders', refillItems)}
                        {renderSection('Stoves', stoveItems)}
                        {renderSection('Regulators', regulatorItems)}
                        {renderSection('Empty Returns', sortedReturns, true)}
                        {renderSection('Cylinders Kept as DUE', dueItems, false, true)}
                        {renderSection('General Products / Accessories', productItems)}
                        {renderSection('Expenses & Services', expenseItems)}
                    </div>
                </div>
            </div>
        </div>
    );
};
