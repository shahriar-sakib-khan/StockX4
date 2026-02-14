import { TableBody } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Banknote, ShoppingCart } from "lucide-react";
import { InventoryBadge, InventoryCell, InventoryCountCell, InventoryHeadCell, InventoryPriceCell, InventoryRow, InventoryTableWrapper, InventoryTableHeader } from "@/components/common/InventoryTableComponents";
import { useState } from "react";
import { AccessoryDefectModal } from "./AccessoryDefectModal";
import { BuyAccessoryModal } from "./BuyAccessoryModal";

interface AccessoryTableProps {
    items: any[];
    type: 'stove' | 'regulator';
    storeId: string;
    onSell: (item: any) => void;
}

const AccessoryRow = ({ item, storeId, type, onSell }: { item: any, storeId: string, type: 'stove' | 'regulator', onSell: any }) => {
    const [defectModalOpen, setDefectModalOpen] = useState(false);
    const [buyModalOpen, setBuyModalOpen] = useState(false);

    return (
        <>
            <InventoryRow key={item._id}>
                {/* Brand */}
                <InventoryCell>
                    <div className="flex items-center gap-3">
                        {item.image ? (
                             <img src={item.image} alt={item.name} className="w-10 h-10 object-contain rounded border bg-white" />
                        ) : (
                            <div className="w-10 h-10 bg-muted rounded flex items-center justify-center text-[10px] text-muted-foreground">No Img</div>
                        )}
                        <div className="flex flex-col">
                            <span className="font-bold text-base">{item.brand || 'N/A'}</span>
                        </div>
                    </div>
                </InventoryCell>

                {/* Model */}
                <InventoryCell>
                    <span className="font-medium">{item.modelNumber || 'N/A'}</span>
                </InventoryCell>

                {/* Variant */}
                <InventoryCell>
                    {type === 'stove' ? (
                         <div className="flex flex-col">
                            <InventoryBadge variant="default" className="w-fit mb-1">{item.burnerCount} Burner{item.burnerCount !== '1' && 's'}</InventoryBadge>
                         </div>
                    ) : (
                        <InventoryBadge variant={item.size === '22mm' ? 'orange' : 'yellow'}>
                            {item.size}
                        </InventoryBadge>
                    )}
                </InventoryCell>

                {/* Count (Stock) */}
                <InventoryCountCell count={item.stock} />

                {/* Damaged Count */}
                 <InventoryCountCell count={item.damagedStock || 0} type="destructive">
                     <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0 ml-1"
                        onClick={() => setDefectModalOpen(true)}
                    >
                         <div className="text-[10px] border px-1 rounded bg-background hover:bg-destructive/10">Adjust</div>
                    </Button>
                </InventoryCountCell>

                {/* Price */}
                <InventoryPriceCell price={item.sellingPrice} />

                {/* Action */}
                <InventoryCell align="right">
                    <div className="flex items-center justify-end gap-2">
                        <Button
                            size="sm"
                            className="h-8 px-3 text-xs bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border border-red-200"
                            variant="outline"
                            onClick={() => setBuyModalOpen(true)}
                        >
                            <ShoppingCart className="w-3 h-3 mr-1" /> Buy
                        </Button>
                        <Button
                            size="sm"
                            className="h-8 px-3 text-xs bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 border border-emerald-200"
                            variant="outline"
                            onClick={() => onSell(item)}
                        >
                            <Banknote className="w-3 h-3 mr-1" /> Sell
                        </Button>
                    </div>
                </InventoryCell>
            </InventoryRow>

            <AccessoryDefectModal
                isOpen={defectModalOpen}
                onClose={() => setDefectModalOpen(false)}
                item={item}
                storeId={storeId}
            />

            <BuyAccessoryModal
                isOpen={buyModalOpen}
                onClose={() => setBuyModalOpen(false)}
                item={item}
            />
        </>
    );
};

export const AccessoryTable = ({ items, type, storeId, onSell }: AccessoryTableProps) => {
    if (items.length === 0) {
        return <div className="p-8 text-center text-muted-foreground border rounded-xl border-dashed">No items in this category</div>;
    }

    return (
        <InventoryTableWrapper>
            <InventoryTableHeader>
                <InventoryHeadCell width="w-[20%]">Brand & Image</InventoryHeadCell>
                <InventoryHeadCell width="w-[15%]">Model</InventoryHeadCell>
                <InventoryHeadCell width="w-[10%]">Variant</InventoryHeadCell>
                <InventoryHeadCell width="w-[10%]" align="center">Stock</InventoryHeadCell>
                <InventoryHeadCell width="w-[15%]" align="center">Damaged</InventoryHeadCell>
                <InventoryHeadCell width="w-[10%]" align="right">Price</InventoryHeadCell>
                <InventoryHeadCell width="w-[20%]" align="right">Actions</InventoryHeadCell>
            </InventoryTableHeader>
            <TableBody>
                {items.map((item: any) => (
                    <AccessoryRow key={item._id} item={item} storeId={storeId} type={type} onSell={onSell} />
                ))}
            </TableBody>
        </InventoryTableWrapper>
    );
};
