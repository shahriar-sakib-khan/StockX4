
export interface InvoiceItem {
    productId: string;
    name: string;
    description?: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    saleType?: 'REFILL' | 'PACKAGED' | 'RETURN' | 'ACCESSORY' | 'EXPENSE';
    category?: string;
    type?: string;
    isReturn?: boolean;
    size?: string;
    regulator?: string;
}

interface InvoiceItemsTableProps {
    items: InvoiceItem[];
    highlightReturns?: boolean;
}

export const InvoiceItemsTable = ({ items, highlightReturns = false }: InvoiceItemsTableProps) => {
    // Helper to render a section
    const renderSection = (title: string, sectionItems: InvoiceItem[], isReturnSection = false) => {
        if (sectionItems.length === 0) return null;

        return (
            <div>
                <h3 className={`font-bold underline mb-2 ${isReturnSection ? 'text-gray-600' : ''}`}>{title}</h3>
                <div className="space-y-2">
                    {sectionItems.map((item, idx) => (
                        <div key={item.productId || idx} className={`flex items-center py-2 border-b border-dotted last:border-0 ${isReturnSection ? 'text-gray-600' : ''}`}>
                            {/* Item Name */}
                            <div className="flex-[2] pr-2">
                                <div className="flex items-baseline gap-2 flex-wrap">
                                    <span className="text-xl font-bold leading-none">{item.name}</span>
                                    {isReturnSection && <span className="text-sm italic text-muted-foreground">(Return)</span>}
                                </div>
                                {/* Description fallback if size/regulator empty, or extra info */}
                                {item.description && !item.size && !item.regulator && <div className="text-xs text-muted-foreground mt-0.5">{item.description}</div>}
                            </div>

                            {/* Size */}
                            <div className="w-20 text-center text-sm font-medium">
                                {item.size || '-'}
                            </div>

                             {/* Regulator */}
                             <div className="w-24 text-center text-sm font-medium">
                                {item.regulator || '-'}
                            </div>

                            {/* Qty */}
                            <div className="w-16 text-center text-xl font-medium">{item.quantity}</div>

                            {/* Price */}
                            <div className="w-20 text-right text-lg">{!isReturnSection && item.unitPrice}</div>

                            {/* Total */}
                            <div className="w-20 text-right font-bold text-lg">{!isReturnSection && item.subtotal}</div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    // Filter items logic
    const refillItems = items.filter(i => i.saleType === 'REFILL');
    const packagedItems = items.filter(i => i.saleType === 'PACKAGED');
    // Returns logic: either use explicit saleType 'RETURN' or infer from price/return flag
    const returnItems = items.filter(i => i.saleType === 'RETURN' || i.isReturn || (i.unitPrice === 0 && (i.type === 'CYLINDER' || i.category === 'cylinder')));
    const expenseItems = items.filter(i => i.saleType === 'EXPENSE');

    // Accessories: everything else
    const accessoryItems = items.filter(i =>
        i.saleType !== 'REFILL' &&
        i.saleType !== 'PACKAGED' &&
        i.saleType !== 'EXPENSE' &&
        !returnItems.includes(i) // Ensure returns aren't double counted
    );


    return (
        <div className="space-y-6">
            {/* Global Header */}
            <div className="flex items-center text-sm font-semibold text-muted-foreground border-b-2 border-dashed pb-2">
                <span className="flex-[2]">Item</span>
                <span className="w-20 text-center">Size</span>
                 <span className="w-24 text-center">Regulator</span>
                <span className="w-16 text-center">Qty</span>
                <span className="w-20 text-right">Price</span>
                <span className="w-20 text-right">Total</span>
            </div>

            {renderSection('Refill Cylinders', refillItems)}
            {renderSection('Empty Returns', returnItems, true)}
            {renderSection('Packaged Cylinders', packagedItems)}
            {renderSection('Expenses & Services', expenseItems)}
            {renderSection('Products / Accessories', accessoryItems)}
        </div>
    );
};
