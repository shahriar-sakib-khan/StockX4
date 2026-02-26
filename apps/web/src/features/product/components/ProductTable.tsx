import { TableBody } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, ShoppingCart, Edit, Banknote } from "lucide-react";
import { InventoryBadge, InventoryCell, InventoryCountCell, InventoryHeadCell, InventoryPriceCell, InventoryRow, InventoryTableWrapper, InventoryTableHeader } from "@/components/common/InventoryTableComponents";

interface ProductTableProps {
    products: any[];
    type: 'stove' | 'regulator';
    onBuy: (product: any) => void;
    onDelete: (id: string) => void;
    onManageDefect: (product: any) => void;
}

export const ProductTable = ({ products, type, onBuy, onDelete, onManageDefect }: ProductTableProps) => {
    return (
        <InventoryTableWrapper>
            <InventoryTableHeader>
                <InventoryHeadCell width="w-[20%]">Brand & Model</InventoryHeadCell>
                <InventoryHeadCell width="w-[15%]">Type</InventoryHeadCell>
                <InventoryHeadCell width="w-[10%]" align="center">Stock</InventoryHeadCell>
                <InventoryHeadCell width="w-[15%]" align="center" className="text-destructive">Damaged</InventoryHeadCell>
                <InventoryHeadCell width="w-[10%]" align="right">Buying Price</InventoryHeadCell>
                <InventoryHeadCell width="w-[10%]" align="right">Selling Price</InventoryHeadCell>
                <InventoryHeadCell width="w-[20%]" align="right">Actions</InventoryHeadCell>
            </InventoryTableHeader>
            <TableBody>
                {products.map((p: any) => (
                    <InventoryRow key={p._id}>
                        <InventoryCell>
                            <div className="flex flex-col">
                                <span className="font-bold text-lg">{p.brand || 'Generic'}</span>
                                {p.modelNumber && <span className="text-xs text-muted-foreground font-mono">{p.modelNumber}</span>}
                            </div>
                        </InventoryCell>
                        <InventoryCell>
                            {p.type === 'stove' && (
                                <InventoryBadge variant={p.burnerCount === 'single' ? 'blue' : 'orange'}>
                                    {p.burnerCount === 'single' ? 'Single Burner' : 'Double Burner'}
                                </InventoryBadge>
                            )}
                             {p.type === 'regulator' && (
                                <InventoryBadge variant={p.size === '22mm' ? 'orange' : 'yellow'}>
                                    {p.size || 'N/A'}
                                </InventoryBadge>
                            )}
                        </InventoryCell>
                        <InventoryCountCell count={p.stock || 0} />
                        <InventoryCountCell count={p.damaged || 0} type="destructive">
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6 text-muted-foreground hover:text-destructive ml-1"
                                onClick={() => onManageDefect(p)}
                            >
                                <div className="text-[10px] border px-1 rounded bg-background hover:bg-destructive/10">Adjust</div>
                            </Button>
                        </InventoryCountCell>
                        <InventoryPriceCell price={p.costPrice || 0} />
                        <InventoryPriceCell price={p.sellingPrice || 0} />
                        <InventoryCell align="right">
                            <div className="flex items-center justify-end gap-2">
                                <Button
                                    size="sm"
                                    className="h-8 px-3 text-xs bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border border-red-200"
                                    variant="outline"
                                    onClick={() => onBuy(p)}
                                    title="Buy Stock"
                                >
                                    <ShoppingCart className="w-3 h-3 mr-1" /> Buy
                                </Button>
                                <Button
                                    size="sm"
                                    className="h-8 px-3 text-xs bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 border border-emerald-200"
                                    variant="outline"
                                    title="Sell Stock"
                                >
                                    <Banknote className="w-3 h-3 mr-1" /> Sell
                                </Button>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 text-muted-foreground hover:text-red-500"
                                    onClick={() => {
                                        if (confirm('Delete this item?')) onDelete(p._id);
                                    }}
                                    title="Delete"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </InventoryCell>
                    </InventoryRow>
                ))}
            </TableBody>
        </InventoryTableWrapper>
    );
};
