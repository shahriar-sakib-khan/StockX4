import { Badge } from '@/components/ui/badge';

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
                            <div key={item.productId || idx} className={`py-3 sm:py-4 md:py-2 border-b border-dotted border-slate-200 md:flex md:items-center last:border-0 ${isReturnSection ? 'text-slate-500' : ''} ${isDueSection ? 'text-orange-900 bg-orange-50/10' : ''}`}>
                                {/* Mobile-only: Item Name and Status - Full width */}
                                <div className="md:hidden flex justify-between items-start mb-1.5">
                                    <div className="flex flex-col flex-1 truncate pr-2">
                                        <span className="text-sm sm:text-lg font-black leading-tight tracking-tight truncate">{item.name}</span>
                                        <div className="flex gap-1 mt-0.5">
                                            {isReturnSection && !item.isSettled && <Badge variant="secondary" className="text-[7px] sm:text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-500 py-0 h-4">RET</Badge>}
                                            {isDueSection && <Badge className="text-[7px] sm:text-[10px] font-black uppercase tracking-widest bg-orange-100 text-orange-600 border-orange-200 py-0 h-4">DUE</Badge>}
                                            {item.isSettled && <Badge className="text-[7px] sm:text-[10px] font-black uppercase tracking-widest bg-green-100 text-green-600 border-green-200 py-0 h-4">SET</Badge>}
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <div className="text-lg sm:text-2xl font-black text-slate-900 leading-none">৳{(item.subtotal || 0).toLocaleString()}</div>
                                        {!isReturnSection && !isDueSection && (
                                            <div className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase mt-0.5">
                                                {item.quantity} × {item.unitPrice}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Desktop Item Name */}
                                <div className="hidden md:flex md:flex-[2] md:pr-1 md:items-baseline md:gap-1 md:flex-wrap">
                                    <span className="text-xl font-black leading-tight tracking-tight">{item.name}</span>
                                    {isReturnSection && !item.isSettled && <span className="text-xs italic font-bold opacity-70">(Return)</span>}
                                    {isDueSection && <span className="text-xs font-black italic text-orange-600">(DUE)</span>}
                                    {item.isSettled && <span className="text-xs font-black italic text-green-600">(Settled)</span>}
                                    {item.description && !item.isSettled && !item.size && !item.regulator && (
                                        <div className="text-xs text-muted-foreground ml-2">{item.description}</div>
                                    )}
                                </div>

                                 {/* Grid/Grid-like Details for Mobile & Table for Desktop */}
                                 <div className="flex items-center justify-between md:contents">
                                     {!isExpense && (
                                         <div className="grid grid-cols-2 gap-2 sm:gap-4 md:contents md:flex-none">
                                             <div className="md:w-20 text-left md:text-center text-[10px] sm:text-xs md:text-base font-black bg-slate-50 md:bg-transparent px-1.5 sm:px-2 py-0.5 sm:py-1 rounded md:p-0 border md:border-0 border-slate-100">
                                                 <span className="md:hidden text-[6px] sm:text-[8px] uppercase block opacity-40 font-black">Size</span>
                                                 {displaySize}
                                             </div>
                                             <div className="md:w-24 text-left md:text-center text-[10px] sm:text-xs md:text-base font-black bg-slate-50 md:bg-transparent px-1.5 sm:px-2 py-0.5 sm:py-1 rounded md:p-0 border md:border-0 border-slate-100">
                                                 <span className="md:hidden text-[6px] sm:text-[8px] uppercase block opacity-40 font-black">R/B</span>
                                                 {displayRegOrBurner}
                                             </div>
                                         </div>
                                     )}
                                    {/* These are hidden on mobile as they are in the header card above */}
                                    <div className="hidden md:block w-16 text-center text-2xl font-black text-slate-900">{item.quantity}</div>
                                    <div className="hidden md:block w-20 text-right text-xl font-bold text-slate-700">{!isReturnSection && !isDueSection && item.unitPrice}</div>
                                    <div className="hidden md:block w-20 text-right font-black text-xl text-slate-900">{!isReturnSection && !isDueSection && item.subtotal}</div>

                                    {/* Mobile-only secondary info line if description exists */}
                                    {item.description && !item.isSettled && !item.size && !item.regulator && (
                                        <div className="md:hidden w-full text-[10px] text-muted-foreground mt-2 border-t pt-2 italic">
                                            {item.description}
                                        </div>
                                    )}
                                </div>
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
            <div className="md:border-b-2 md:border-dashed md:pb-2 md:bg-slate-50/50 md:rounded-t-lg hidden md:flex items-center text-[11px] font-black uppercase tracking-widest text-muted-foreground p-2">
                <span className="flex-[2]">Item / Description</span>
                {!isExpense && (
                    <>
                        <span className="w-20 text-center">Size</span>
                        <span className="w-24 text-center">Burner/Reg</span>
                    </>
                )}
                <span className="w-16 text-center">Qty</span>
                <span className="w-20 text-right">Price</span>
                <span className="w-20 text-right">Total</span>
            </div>

            <div className="divide-y divide-dashed divide-slate-200">
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
    );
};
