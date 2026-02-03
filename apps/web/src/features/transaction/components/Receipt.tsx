import { format } from 'date-fns';

interface ReceptorProps {
    transaction: any;
    storeName: string;
}

export const Receipt = ({ transaction, storeName }: ReceptorProps) => {
    return (
        <div id="receipt-print" className="bg-white p-6 w-full max-w-[80mm] mx-auto text-sm font-mono leading-tight shadow-none print:shadow-none">
            {/* 1. Header: Store Name & Details */}
            <div className="text-center mb-6">
                <h1 className="text-xl font-bold uppercase mb-1 tracking-wider">{storeName}</h1>
                <p className="text-[10px] text-muted-foreground">LPG Distribution Point</p>
                <div className="border-b-2 border-dashed border-gray-300 my-2 w-full"></div>
            </div>

            {/* 2. Customer & Invoice Details */}
            <div className="mb-4 space-y-1 text-xs">
                <div className="flex justify-between">
                    <span className="font-semibold">Date:</span>
                    <span>{format(new Date(transaction.createdAt || Date.now()), 'dd/MM/yyyy HH:mm')}</span>
                </div>
                <div className="flex justify-between">
                     <span className="font-semibold">Invoice #:</span>
                     <span>{transaction._id.slice(-6).toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                    <span className="font-semibold">Customer:</span>
                    <span className="font-bold">{transaction.customerName || 'Walk-in Customer'}</span>
                </div>
                {transaction.customerType && (
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                        <span>Type:</span>
                        <span>{transaction.customerType}</span>
                    </div>
                )}
            </div>

            <div className="border-b-2 border-dashed border-gray-300 mb-4"></div>

            {/* 3. Product List (Categorized) */}
            <div className="space-y-4 mb-4">

                {/* Refill Cylinders */}
                {transaction.items.filter((i: any) => i.saleType === 'REFILL').length > 0 && (
                    <div>
                        <h3 className="font-bold underline mb-2">Refill Cylinders</h3>
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-xs text-muted-foreground">
                                    <th className="pb-1">Item</th>
                                    <th className="text-center pb-1">Qty</th>
                                    <th className="text-right pb-1">Price</th>
                                    <th className="text-right pb-1">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transaction.items.filter((i: any) => i.saleType === 'REFILL').map((item: any, i: number) => (
                                    <tr key={i} className="border-b border-dotted border-gray-200 last:border-0">
                                        <td className="py-1 pr-1 align-top font-semibold">
                                            {item.name || item.productId?.name}
                                        </td>
                                        <td className="text-center py-1 align-top">{item.quantity}</td>
                                        <td className="text-right py-1 align-top">{item.unitPrice}</td>
                                        <td className="text-right py-1 align-top font-bold">
                                            {item.subtotal || item.quantity * item.unitPrice}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Returns (Moved after Refill) */}
                {transaction.returnItems && transaction.returnItems.length > 0 && ( /* Check if returnItems exists on transaction object passed from checkout */
                     null /* Handled below if passed as items with type/category adjustments or distinct array */
                )}

                {/* Logic adjust: The transaction object usually has 'items'. Returns might be in 'items' with price 0 or negative.
                    If we are using the 'transaction' object from the API, returns might be items with 0 price or handled differently.
                    However, look at CheckoutPage, it passes `completedTransaction`.
                    Let's assume standard item structure.
                    If `returnItems` are separate (like in store), we need to merge or handle them.
                    Standard `transaction` object usually implies a finalized sale where items are unified.
                    But in CheckoutPage, we construct `receipt` from `completedTransaction`.
                    Let's revert to filtering from `items` if they are there, otherwise check `returnItems` prop if passed.

                    Wait, `transaction.items` in `Receipt` came from `apiItems` in `CheckoutPage`.
                    In `CheckoutPage`:
                    items: [...saleItems, ...returnItems]
                    So they are all in `transaction.items`.
                    Returns have `unitPrice` but usually 0 in this logic? Or they are just items.
                    Let's check `CheckoutPage` again.
                    `returnItems` are mapped with `type` and `variant`.
                    The `Receipt` component filters based on logic.

                    Let's find "Returns" in `transaction.items`.
                    Usually specific logic or just `unitPrice === 0` and `type === 'CYLINDER'` logic?
                    In `pos.store.ts`, returns are `unitPrice: 0`.
                */}

                 {/* Empty Returns (Simulated from items with 0 price or explicit return flag if available) */}
                 {transaction.items.filter((i: any) => (i.unitPrice === 0 && (i.type === 'CYLINDER' || i.category === 'cylinder')) || i.isReturn).length > 0 && (
                    <div className="mt-4">
                        <h3 className="font-bold underline mb-2 text-gray-600">Empty Returns</h3>
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-xs text-muted-foreground">
                                    <th className="pb-1">Item</th>
                                    <th className="text-center pb-1">Qty</th>
                                </tr>
                            </thead>
                             <tbody>
                                {transaction.items.filter((i: any) => (i.unitPrice === 0 && (i.type === 'CYLINDER' || i.category === 'cylinder')) || i.isReturn).map((item: any, i: number) => (
                                    <tr key={i} className="border-b border-dotted border-gray-200 last:border-0 text-gray-600">
                                        <td className="py-1 pr-1 align-top font-semibold">
                                            {item.name || item.productId?.name} (Return)
                                        </td>
                                        <td className="text-center py-1 align-top">{item.quantity}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                 )}


                {/* Packaged Cylinders */}
                {transaction.items.filter((i: any) => i.saleType === 'PACKAGED').length > 0 && (
                    <div className="mt-4">
                        <h3 className="font-bold underline mb-2">Packaged Cylinders</h3>
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-xs text-muted-foreground">
                                    <th className="pb-1">Item</th>
                                    <th className="text-center pb-1">Qty</th>
                                    <th className="text-right pb-1">Price</th>
                                    <th className="text-right pb-1">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transaction.items.filter((i: any) => i.saleType === 'PACKAGED').map((item: any, i: number) => (
                                    <tr key={i} className="border-b border-dotted border-gray-200 last:border-0">
                                        <td className="py-1 pr-1 align-top font-semibold">
                                            {item.name || item.productId?.name}
                                        </td>
                                        <td className="text-center py-1 align-top">{item.quantity}</td>
                                        <td className="text-right py-1 align-top">{item.unitPrice}</td>
                                        <td className="text-right py-1 align-top font-bold">
                                            {item.subtotal || item.quantity * item.unitPrice}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}


                {/* Accessories/Others Category */}
                {transaction.items.filter((i: any) => i.type === 'ACCESSORY' || (i.category !== 'cylinder' && i.type !== 'CYLINDER')).length > 0 && (
                    <div className="mt-4">
                        <h3 className="font-bold underline mb-2">Products / Accessories</h3>
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-xs text-muted-foreground">
                                    <th className="pb-1">Item</th>
                                    <th className="text-center pb-1">Qty</th>
                                    <th className="text-right pb-1">Price</th>
                                    <th className="text-right pb-1">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transaction.items.filter((i: any) => i.type === 'ACCESSORY' || (i.category !== 'cylinder' && i.type !== 'CYLINDER')).map((item: any, i: number) => (
                                    <tr key={i} className="border-b border-dotted border-gray-200 last:border-0">
                                        <td className="py-1 pr-1 align-top font-semibold">
                                            {item.name || item.productId?.name}
                                        </td>
                                        <td className="text-center py-1 align-top">{item.quantity}</td>
                                        <td className="text-right py-1 align-top">{item.unitPrice}</td>
                                        <td className="text-right py-1 align-top font-bold">
                                            {item.subtotal || item.quantity * item.unitPrice}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className="border-b-2 border-dashed border-gray-300 mb-4"></div>

            {/* 4. Pricing Section */}
            <div className="space-y-2 text-right text-sm">
                <div className="flex justify-between text-gray-600">
                    <span>Subtotal:</span>
                    <span>{transaction.totalAmount}</span>
                </div>

                {/* Discount / Adjustments if any (Derived) */}
                {(transaction.finalAmount < transaction.totalAmount) && (
                     <div className="flex justify-between text-gray-600">
                        <span>Discount:</span>
                        <span>- {transaction.totalAmount - transaction.finalAmount}</span>
                    </div>
                )}

                 <div className="flex justify-between text-xl font-bold border-y-2 border-dashed border-gray-300 py-2 my-2">
                    <span>NET TOTAL:</span>
                    <span>{transaction.finalAmount}</span>
                </div>

                <div className="flex justify-between pt-1">
                    <span>Paid Amount:</span>
                    <span className="font-semibold">{transaction.paidAmount}</span>
                </div>
                <div className="flex justify-between">
                    <span>{transaction.dueAmount > 0 ? 'Due Amount:' : 'Change Return:'}</span>
                    <span className="font-bold">{Math.abs(transaction.dueAmount)}</span>
                </div>
            </div>

            {/* 5. Footer */}
            <div className="mt-8 text-center text-[10px] text-gray-500">
                <p className="mb-1">Thank you for your business!</p>
                <p>Powered by StockX POS</p>
            </div>

            {/* Print Styles */}
            <style>
                {`
                    @media print {
                        body * {
                            visibility: hidden;
                        }
                        #receipt-print, #receipt-print * {
                            visibility: visible;
                        }
                        #receipt-print {
                            position: absolute;
                            left: 0;
                            top: 0;
                            width: 100% !important;
                            max-width: none !important;
                            padding: 0;
                            margin: 0;
                        }
                        @page {
                            size: auto;
                            margin: 5mm;
                        }
                        html, body {
                            height: 100%;
                            margin: 0 !important;
                            padding: 0 !important;
                            overflow: visible;
                        }
                    }
                `}
            </style>
        </div>
    );
};
