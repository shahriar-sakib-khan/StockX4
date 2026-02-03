
export interface InvoiceItem {
    productId: string;
    name: string;
    description?: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    saleType?: 'REFILL' | 'PACKAGED' | 'RETURN' | 'ACCESSORY';
    category?: string;
    type?: string;
    isReturn?: boolean;
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
                     <div className="flex justify-between text-sm text-muted-foreground border-b pb-1">
                        <span className="flex-1">Item</span>
                        <span className="w-8 text-center">Qty</span>
                        {!isReturnSection && <span className="w-12 text-right">Price</span>}
                        {!isReturnSection && <span className="w-12 text-right">Total</span>}
                    </div>
                    {sectionItems.map((item, idx) => (
                        <div key={item.productId || idx} className={`flex justify-between py-1 border-b border-dotted last:border-0 ${isReturnSection ? 'text-gray-600' : ''}`}>
                            <div className="flex-1 pr-2 font-semibold">
                                {item.name}
                                {isReturnSection && ' (Return)'}
                            </div>
                            <div className="w-8 text-center">{item.quantity}</div>
                            {!isReturnSection && <div className="w-12 text-right">{item.unitPrice}</div>}
                            {!isReturnSection && <div className="w-12 text-right font-bold">{item.subtotal}</div>}
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
    // Accessories: everything else
    const accessoryItems = items.filter(i =>
        i.saleType !== 'REFILL' &&
        i.saleType !== 'PACKAGED' &&
        !returnItems.includes(i) // Ensure returns aren't double counted
    );


    return (
        <div className="space-y-4">
            {renderSection('Refill Cylinders', refillItems)}
            {renderSection('Empty Returns', returnItems, true)}
            {renderSection('Packaged Cylinders', packagedItems)}
            {renderSection('Products / Accessories', accessoryItems)}
        </div>
    );
};
