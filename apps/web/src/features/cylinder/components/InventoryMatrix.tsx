import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BuyStockModal } from "./BuyStockModal";
import { useNavigate } from "react-router-dom";

interface InventoryMatrixProps {
    storeId: string;
    inventory: any[];
    onAddToCart: any;
}

export const InventoryMatrix = ({ storeId, inventory, onAddToCart }: InventoryMatrixProps) => {
    const navigate = useNavigate();
    const [buyModalOpen, setBuyModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>(null);

    // 1. Group by Brand
    const groupedInventory = useMemo(() => {
        const groups: Record<string, any[]> = {};
        inventory.forEach(item => {
            const brand = item.brandName;
            if (!groups[brand]) groups[brand] = [];
            groups[brand].push(item);
        });
        return groups;
    }, [inventory]);

    // 2. Define Columns (Variants)
    // We assume the incoming inventory is already "complete" (has virtual items for all variants)
    // based on CylindersContent logic.
    const columns = [
        { size: '12kg', regulator: '22mm', label: '12kg (22mm)' },
        { size: '12kg', regulator: '20mm', label: '12kg (20mm)' },
        { size: '35kg', regulator: '22mm', label: '35kg (22mm)' },
        { size: '45kg', regulator: '22mm', label: '45kg (22mm)' },
    ];

    const handleCellClick = (item: any) => {
        // If virtual or real, we open Buy Modal to add stock
        setSelectedItem(item);
        setBuyModalOpen(true);
    };

    const getStatusColor = (count: number) => {
        if (count === 0) return "bg-gray-50 text-gray-400 hover:bg-gray-100";
        if (count < 10) return "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100";
        return "bg-green-50 text-green-700 border-green-200 hover:bg-green-100";
    };

    return (
        <div className="overflow-x-auto rounded-lg border bg-white shadow-sm">
            <BuyStockModal
                isOpen={buyModalOpen}
                onClose={() => setBuyModalOpen(false)}
                brandName={selectedItem?.brandName || ''}
                variant={`${selectedItem?.variant?.size} ${selectedItem?.variant?.regulator}`}
                logo={selectedItem?.brandId?.logo}
                cylinderImage={selectedItem?.variant?.cylinderImage}
                onAddToCart={onAddToCart}
                item={selectedItem}
                storeId={storeId}
            />

            <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                    <tr>
                        <th className="px-6 py-4 font-bold text-gray-900 w-[200px]">Brand</th>
                        {columns.map(col => (
                            <th key={col.label} className="px-6 py-4 text-center">
                                {col.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {Object.entries(groupedInventory).map(([brandName, items]) => {
                        // Get Logo from first item
                        const brandLogo = items[0]?.brandId?.logo;

                        return (
                            <tr key={brandName} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4 font-medium text-gray-900">
                                    <div className="flex items-center gap-3">
                                        {brandLogo ? (
                                            <img src={brandLogo} alt={brandName} className="w-8 h-8 object-contain" />
                                        ) : (
                                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-500">
                                                {brandName.substring(0, 2)}
                                            </div>
                                        )}
                                        <span className="text-base">{brandName}</span>
                                    </div>
                                </td>
                                {columns.map(col => {
                                    // Find item for this column
                                    const item = items.find(i =>
                                        i.variant.size === col.size &&
                                        i.variant.regulator === col.regulator
                                    );

                                    const count = item?.counts?.full || 0;
                                    const isEmpty = !item || item.isVirtual || count === 0;

                                    return (
                                        <td key={col.label} className="px-2 py-2 text-center">
                                            {item ? (
                                                <div
                                                    onClick={() => handleCellClick(item)}
                                                    className={cn(
                                                        "mx-auto w-20 py-2 rounded-md border cursor-pointer transition-all flex flex-col items-center justify-center gap-1",
                                                        getStatusColor(count),
                                                        isEmpty && "border-dashed"
                                                    )}
                                                >
                                                    <span className="text-lg font-bold leading-none">{count}</span>
                                                    <span className="text-[10px] uppercase font-semibold opacity-70">
                                                        {isEmpty ? "Add" : "Full"}
                                                    </span>
                                                </div>
                                            ) : (
                                                <div className="w-20 mx-auto py-2 text-gray-300 text-xs">-</div>
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};
