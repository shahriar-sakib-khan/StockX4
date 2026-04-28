import { useState } from "react";
import { createPortal } from "react-dom";
import { RestockSidebar } from "./RestockSidebar";
import { useNavigate } from "react-router-dom";
import { InventoryCard } from "./InventoryCard";
import { motion, AnimatePresence } from "framer-motion";
import { useUpdateInventory } from "@/features/cylinder/hooks/useCylinders";
import { transactionApi, useCreateTransaction } from "@/features/pos/api/transaction.api";
import { HistoryInvoiceModal } from "@/features/history/components/HistoryInvoiceModal";
import { toast } from "sonner";

interface InventoryTableProps {
    storeId: string;
    inventory: any[];
    onRestockStateChange?: (isOpen: boolean) => void;
    groupByBrand?: boolean;
}

export const InventoryTable = ({ storeId, inventory, onRestockStateChange, groupByBrand = false }: InventoryTableProps) => {
    const navigate = useNavigate();
    const [restockOpen, setRestockOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [liveItem, setLiveItem] = useState<any>(null);
    const [highlightRestocked, setHighlightRestocked] = useState(false);
    const [pendingQuantity, setPendingQuantity] = useState(0);
    const [pendingType, setPendingType] = useState<'refill' | 'package'>('package');

    const updateInventory = useUpdateInventory();
    const createTransaction = useCreateTransaction();
    const [invoiceTx, setInvoiceTx] = useState<any>(null);

    const handleRestock = (item: any) => {
        setSelectedItem(item);
        setLiveItem(item);
        setPendingQuantity(0);
        setPendingType('refill');
        setRestockOpen(true);
        onRestockStateChange?.(true);
    };

    const handleConfirmRestock = async (item: any, quantity: number, purchaseType: 'refill' | 'package', totalAmount: number, unitPrice: number, wholesalePrice?: number, retailPrice?: number) => {
        try {
            const transactionItem = {
                 productId: item.productId,
                 type: 'CYLINDER' as const,
                 quantity: quantity,
                 unitPrice: unitPrice,
                 wholesalePrice,
                 retailPrice,
                 variant: purchaseType,
                 name: item.brandName || "Cylinder",
                 size: item.variant?.size,
                 regulator: item.variant?.regulator,
                 category: 'Restock Inventory'
            };

            const txResult = await createTransaction.mutateAsync({
                storeId,
                data: {
                    type: 'EXPENSE',
                    paymentMethod: 'CASH', 
                    items: [transactionItem as any],
                    finalAmount: totalAmount,
                    paidAmount: totalAmount
                }
            });

            if (txResult?.data) {
                setInvoiceTx(txResult.data);
            }

            setPendingQuantity(0);
            setRestockOpen(false);
            toast.success("Stock Added & Transaction Recorded.");
        } catch (error: any) {}
    };

    const handleCloseRestock = () => {
        setRestockOpen(false);
        setPendingQuantity(0);
        onRestockStateChange?.(false);
    }

    const inventoryByBrand = inventory.reduce((acc: Record<string, any[]>, item: any) => {
        const brand = item.brandName || "Unknown Brand";
        if (!acc[brand]) acc[brand] = [];
        acc[brand].push(item);
        return acc;
    }, {});

    // THE FIX: Fluid CSS Multi-Column (True Masonry Architecture)
    const renderFluidGrid = (itemsToRender: any[]) => {
        return (
            // `columns-[280px]` natively creates infinite columns based on monitor size.
            // This decouples the vertical axis completely. Column 2 does not care what happens in Column 1.
            <div className="columns-1 sm:columns-[280px] gap-4 sm:gap-6 w-full">
                <AnimatePresence mode="popLayout">
                    {itemsToRender.map((item: any) => {
                        const isSelected = restockOpen && liveItem && (liveItem._id === item._id);
                        
                        return (
                            <motion.div
                                key={item._id}
                                layout 
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{
                                    opacity: isSelected ? 0 : 1, 
                                    scale: isSelected ? 0.95 : 1,
                                    y: 0
                                }}
                                exit={{ opacity: 0, scale: 0.9, y: -20, transition: { duration: 0.2 } }}
                                transition={{ duration: 0.4, ease: "easeOut" }}
                                style={{ visibility: isSelected ? 'hidden' : 'visible' }}
                                // `break-inside-avoid` prevents the card from splitting across two columns
                                // `mb-4 sm:mb-6` handles the vertical spacing between cards natively
                                className={`break-inside-avoid block w-full mb-4 sm:mb-6 ${isSelected ? 'pointer-events-none' : ''}`}
                            >
                                <InventoryCard 
                                    item={item} 
                                    storeId={storeId} 
                                    onRestock={handleRestock} 
                                    fallbackImage={item.variant?.cylinderImage} 
                                />
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        );
    };

    return (
        <div className="relative w-full min-h-[500px]">
            {invoiceTx && (
                <HistoryInvoiceModal
                     isOpen={!!invoiceTx}
                     onClose={() => setInvoiceTx(null)}
                     transaction={invoiceTx}
                />
            )}

            {/* MAIN CONTENT GRID */}
            <div className={`transition-all duration-300 ease-in-out ${restockOpen ? 'opacity-20 pointer-events-none' : 'opacity-100'}`}>
                <AnimatePresence mode="popLayout">
                    {groupByBrand ? (
                        Object.entries(inventoryByBrand).map(([brandName, items]) => {
                            if (items.length === 0) return null;
                            return (
                                <motion.div 
                                    key={brandName} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20, scale: 0.98 }} transition={{ duration: 0.5, ease: "easeInOut" }}
                                    className="mb-10 last:mb-0 w-full"
                                >
                                    <div className="flex items-center gap-4 mb-6">
                                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-800">{brandName}</h3>
                                        <div className="h-px flex-1 bg-gradient-to-r from-slate-200 to-transparent"></div>
                                    </div>
                                    {renderFluidGrid(items as any[])}
                                </motion.div>
                            );
                        })
                    ) : (
                        <motion.div layout className="relative z-10 w-full">
                            {renderFluidGrid(inventory)}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* --- MAXIMUM Z-INDEX PORTAL --- */}
            {typeof document !== 'undefined' && createPortal(
                <AnimatePresence>
                    {restockOpen && liveItem && (
                        <div 
                            className="fixed inset-y-0 left-0 right-[400px] hidden sm:flex items-center justify-center p-6 lg:p-8 pointer-events-none"
                            style={{ zIndex: 999999 }} 
                        >
                            <div className="w-full max-w-[380px] lg:max-w-[420px] shadow-[0_0_100px_rgba(0,0,0,0.5)] rounded-2xl bg-white border border-slate-200 pointer-events-auto animate-in slide-in-from-left-8 fade-in duration-300">
                                <InventoryCard
                                    item={liveItem}
                                    storeId={storeId}
                                    onRestock={handleRestock}
                                    fallbackImage={liveItem?.variant?.cylinderImage}
                                    highlightStats={highlightRestocked}
                                    pendingQuantity={pendingQuantity}
                                    pendingType={pendingType}
                                    isLivePreview={true}
                                />
                            </div>
                        </div>
                    )}
                </AnimatePresence>,
                document.body
            )}

            {/* THE DRAWER */}
            <RestockSidebar
                isOpen={restockOpen}
                onClose={handleCloseRestock}
                item={selectedItem}
                storeId={storeId}
                category="cylinder"
                inventory={inventory}
                onConfirm={handleConfirmRestock}
                onVariantChange={(updated) => setLiveItem(updated)}
                onQuantityChange={(qty: number, type: 'refill' | 'package') => {
                    setPendingQuantity(qty);
                    if (type) setPendingType(type);
                }}
            />
        </div>
    );
};