import { useUpdateInventory } from "../hooks/useCylinders";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { DefectModal } from "./DefectModal";
import { Card } from "@/components/ui/card";
import { InventoryCardHeader } from "./inventory-card/InventoryCardHeader";
import { InventoryCardImage } from "./inventory-card/InventoryCardImage";
import { InventoryCardEditForm } from "./inventory-card/InventoryCardEditForm";
import { InventoryCardStats } from "./inventory-card/InventoryCardStats";
import { InventoryCardPrices } from "./inventory-card/InventoryCardPrices";
import { InventoryCardActions } from "./inventory-card/InventoryCardActions";

interface InventoryCardProps {
    item: any;
    storeId: string;
    onBuy: (item: any) => void;
    onSell: (item: any) => void;
    fallbackImage?: string;
}

export const InventoryCard = ({ item, storeId, onBuy, onSell, fallbackImage }: InventoryCardProps) => {
    const [defectModalOpen, setDefectModalOpen] = useState(false);
    const [isPriceMode, setIsPriceMode] = useState(false);
    const update = useUpdateInventory();

    const counts = {
        full: item.counts?.full || 0,
        empty: item.counts?.empty || 0,
        defected: item.counts?.defected || 0
    };

    const [prices, setPrices] = useState({
        fullCylinder: item.prices?.fullCylinder || 0,
        gasOnly: item.prices?.gasOnly || 0,
        buyingPriceFull: item.prices?.buyingPriceFull || 0,
        buyingPriceGas: item.prices?.buyingPriceGas || 0
    });

    useEffect(() => {
        setPrices({
            fullCylinder: item.prices?.fullCylinder || 0,
            gasOnly: item.prices?.gasOnly || 0,
            buyingPriceFull: item.prices?.buyingPriceFull || 0,
            buyingPriceGas: item.prices?.buyingPriceGas || 0
        });
    }, [item]);

    const handlePriceChange = (field: string, value: string) => {
        setPrices(prev => ({ ...prev, [field]: Number(value) }));
    };

    const handleSavePrices = () => {
        update.mutate({
            storeId,
            inventoryId: item._id,
            data: { prices }
        }, {
            onSuccess: () => {
                toast.success("Prices Updated");
                setIsPriceMode(false);
            }
        });
    };

    // Inventory Status Logic
    const totalStock = counts.full;
    let statusConfig = { label: "In Stock", color: "bg-income text-primary-foreground border-income shadow-sm" };

    if (totalStock === 0) {
        statusConfig = { label: "Out of Stock", color: "bg-expense text-primary-foreground border-expense shadow-sm" };
    } else if (totalStock < 50) {
        statusConfig = { label: "Low Stock", color: "bg-warning text-white border-warning shadow-sm" };
    }

    return (
        <>
            <Card className="overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 group bg-white shadow-sm hover:shadow-md h-full flex flex-col">
                <div className="p-4 flex flex-col h-full gap-4 flex-1">

                    {/* 1. Top Section: Brand & Status */}
                    <InventoryCardHeader item={item} statusConfig={statusConfig} />

                    {/* 2. Main Content: Image Left, Stats Right */}
                    <div className="flex gap-4 h-full flex-1">

                        {/* LEFT: Cylinder Image */}
                        <InventoryCardImage item={item} fallbackImage={fallbackImage} />

                        {/* RIGHT: Stats & Prices */}
                        <div className="flex-1 flex flex-col min-w-0 h-full relative">

                            {isPriceMode ? (
                                // --- EDIT MODE ---
                                <InventoryCardEditForm
                                    prices={prices}
                                    onPriceChange={handlePriceChange}
                                    onSave={handleSavePrices}
                                    onCancel={() => setIsPriceMode(false)}
                                    isPending={update.isPending}
                                />
                            ) : (
                                // --- VIEW MODE ---
                                <div className="flex flex-col gap-3 h-full">
                                    {/* Stats Grid - Single Line */}
                                    <InventoryCardStats
                                        counts={counts}
                                        onDefectClick={() => setDefectModalOpen(true)}
                                    />

                                    {/* Prices & Edit Button */}
                                    <InventoryCardPrices
                                        prices={prices}
                                        onEditClick={() => setIsPriceMode(true)}
                                    />

                                    {/* Actions */}
                                    <InventoryCardActions
                                        item={item}
                                        onBuy={onBuy}
                                        onSell={onSell}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </Card>

            <DefectModal
                isOpen={defectModalOpen}
                onClose={() => setDefectModalOpen(false)}
                item={item}
                storeId={storeId}
            />
        </>
    );
};
