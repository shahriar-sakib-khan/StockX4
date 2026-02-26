import { useState } from "react";
import { BuyStockModal } from "./BuyStockModal";
import { useNavigate } from "react-router-dom";
import { InventoryCard } from "./InventoryCard";

export const InventoryTable = ({ storeId, inventory, onAddToCart }: { storeId: string, inventory: any[], onAddToCart: any }) => {
    const navigate = useNavigate();
    const [buyModalOpen, setBuyModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>(null);

    const handleBuy = (item: any) => {
        setSelectedItem(item);
        setBuyModalOpen(true);
    };

    const handleSell = (item: any) => {
        navigate('/pos');
    };

    return (
        <div className="pb-20">
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

            {/* Responsive Grid Layout - Flat List - 2 Columns Max */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {inventory.map((item: any) => {
                    // Standardize Image: Always prefer the brand's 12kg-22mm image if available
                    // logic: find the 12kg-22mm variant for this brand from the products list (if available in context)
                    // simplified logic for now: rely on the `fallbackImage` being passed or calculated correctly.
                    // Since we don't have full product list here easily without context, we'll try to find it in the current items list for the same brand
                    const brand22mmItem = inventory.find(i => i.brandId?._id === item.brandId?._id && i.variant?.size === '12kg' && i.variant?.regulator === '22mm');
                    const fallbackImage = brand22mmItem?.variant?.cylinderImage;

                    return (
                        <InventoryCard
                            key={item._id}
                            item={item}
                            storeId={storeId}
                            onBuy={handleBuy}
                            onSell={handleSell}
                            fallbackImage={fallbackImage}
                        />
                    );
                })}
            </div>
        </div>
    );
}
