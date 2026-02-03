import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { PosItem, usePosStore } from '../stores/pos.store';
import { X, Plus, Minus } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface POSTableProps {
    title: string;
    items: PosItem[];
    variant: 'selling' | 'returned';
    isActive?: boolean;
    onClick?: () => void;
    isDisabled?: boolean;
}

export const POSTable = ({ title, items, variant, isActive, onClick, isDisabled }: POSTableProps) => {
    const { removeItemSpecific, addItem } = usePosStore();
    const isSelling = variant === 'selling';

    // Selection Styles
    const activeBorder = isActive ? 'ring-2 ring-blue-500 border-transparent' : '';
    const disabledStyle = isDisabled ? 'opacity-50 pointer-events-none grayscale' : 'cursor-pointer';

    // Mock re-add/subtract using addItem logic?
    // Note: addItem(product, quantity). We need product object.
    // PosItem stores simplified data. We can't re-call addItem easily without the full Product object
    // UNLESS we store enough in PosItem or refetch.
    // Simplification: Just allow REMOVE for now, or implement strict +/- state manipulation in store.

    // Strategy: Only implement 'Remove' for now as requested "Quantity Stepper" was in previous prompt but user said "cylinders will be added... like rows".
    // Wait, typical POS table has Qty +/-.
    // Let's rely on 'removeItemSpecific' for X.
    // For +/-: If we don't have full product, we can't strictly re-run 'Refill' logic easily which adds dual items.
    // BUT: If user adjusts qty in table, they probably mean JUST that row.
    // Let's keep it simple: X button to remove row.

    return (
        <div
            onClick={!isDisabled ? onClick : undefined}
            className={`flex flex-col h-full border rounded-md overflow-hidden transition-all duration-200 ${isSelling ? 'border-green-200 bg-green-50/10' : 'border-orange-200 bg-orange-50/10'} ${activeBorder} ${disabledStyle}`}
        >
            <div className={`p-2 font-bold text-center uppercase text-sm ${isSelling ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                {title} ({items.reduce((a, b) => a + b.quantity, 0)})
            </div>
            <div className="flex-1 overflow-hidden relative">
             <ScrollArea className="h-full w-full">
                <Table>
                    <TableHeader className="sticky top-0 bg-background z-10">
                        <TableRow>
                            <TableHead className="w-[100px]">Product</TableHead>
                            <TableHead>Details</TableHead>
                            <TableHead className="text-right">Price</TableHead>
                            <TableHead className="text-right">Qty</TableHead>
                            <TableHead className="w-[40px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                    No items in {title.toLowerCase()} list
                                </TableCell>
                            </TableRow>
                        ) : (
                            items.map((item) => (
                                <TableRow key={item.productId} className="text-xs">
                                    <TableCell className="font-medium">
                                        {/* Placeholder Logo? */}
                                        {item.name}
                                    </TableCell>
                                    <TableCell>{item.description}</TableCell>
                                    <TableCell className="text-right">{item.unitPrice}</TableCell>
                                    <TableCell className="text-right font-bold">{item.quantity}</TableCell>
                                    <TableCell>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 text-red-500"
                                            onClick={() => removeItemSpecific(item.productId, isSelling ? 'SALE' : 'RETURN')}
                                        >
                                            <X className="w-3 h-3" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
             </ScrollArea>
            </div>
        </div>
    );
};
