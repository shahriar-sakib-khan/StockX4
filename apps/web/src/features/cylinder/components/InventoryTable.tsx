import { useState } from "react";
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
    const [liveItem, setLiveItem] = useState<any>(null); // tracks variant changes from sidebar
    const [highlightRestocked, setHighlightRestocked] = useState(false);
    const [pendingQuantity, setPendingQuantity] = useState(0); // tracks live stats badge from sidebar input
    const [pendingType, setPendingType] = useState<'refill' | 'package'>('package');

    const updateInventory = useUpdateInventory();
    const createTransaction = useCreateTransaction();
    const [invoiceTx, setInvoiceTx] = useState<any>(null);
    const isProcessing = createTransaction.isPending;

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
            // 1. Generate Transaction (Backend now handles inventory & price updates automatically for Restock type)
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
        } catch (error: any) {
            // Error is already handled by toast in useCreateTransaction, but we can catch it here if needed
        }
    };

    const handleCloseRestock = () => {
        setRestockOpen(false);
        setPendingQuantity(0);
        onRestockStateChange?.(false);
    }

    // Group inventory by brand
    const inventoryByBrand = inventory.reduce((acc: Record<string, any[]>, item: any) => {
        const brand = item.brandName || "Unknown Brand";
        if (!acc[brand]) acc[brand] = [];
        acc[brand].push(item);
        return acc;
    }, {});

    return (
        <div className="relative w-full min-h-[500px]">
            {invoiceTx && (
                <HistoryInvoiceModal
                     isOpen={!!invoiceTx}
                     onClose={() => setInvoiceTx(null)}
                     transaction={invoiceTx}
                />
            )}

            {/* Scoped Backdrop */}
            {restockOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute -inset-6 bg-black/40 z-[90] rounded-xl"
                    onClick={handleCloseRestock}
                />
            )}

            {/* Live Preview Card - Animates from Grid */}
            <AnimatePresence>
                {restockOpen && liveItem && (
                    <motion.div
                        layoutId={`card-${liveItem._id}`}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ layout: { type: "spring", bounce: 0.15, duration: 0.8 }, opacity: { duration: 0.4 } }}
                        className="fixed top-[30%] left-1/2 lg:left-[calc(30%)] -translate-x-1/2 z-[110] w-[90%] sm:w-[500px] md:w-[600px] lg:w-[650px] xl:w-[750px] max-w-[calc(100vw-450px)] hidden sm:block"
                    >
                        <div className="transition-all duration-500 w-full shadow-2xl rounded-xl bg-background overflow-hidden">
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
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Sidebar Desktop Overlay */}
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

            {/* Main Grid Content - Conditional Grouping */}
            <div className={`transition-all duration-300 ease-in-out ${restockOpen ? 'opacity-20 pointer-events-none' : 'opacity-100'}`}>
                {groupByBrand ? (
                    Object.entries(inventoryByBrand).map(([brandName, items]) => (
                        <div key={brandName} className="mb-8 last:mb-0">
                            <div className="flex items-center gap-3 mb-4">
                                <h3 className="text-sm font-black uppercase tracking-widest text-slate-800">{brandName}</h3>
                                <div className="h-px flex-1 bg-slate-200"></div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 relative z-10">
                                {items.map((item: any) => {
                                    const isHidden = restockOpen && liveItem?._id === item._id;
                                    return (
                                        <motion.div
                                            key={item._id}
                                            layoutId={isHidden ? undefined : `card-${item._id}`}
                                            animate={{
                                                opacity: isHidden ? 0 : (restockOpen ? 0.1 : 1),
                                                scale: isHidden ? 0 : (restockOpen ? 0.95 : 1)
                                            }}
                                            transition={{ duration: 0.6, ease: "easeInOut" }}
                                            className={isHidden ? 'pointer-events-none' : ''}
                                        >
                                            <InventoryCard item={item} storeId={storeId} onRestock={handleRestock} fallbackImage={item.variant?.cylinderImage} />
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 relative z-10">
                        {inventory.map((item: any) => {
                            const isHidden = restockOpen && liveItem?._id === item._id;
                            return (
                                <motion.div
                                    key={item._id}
                                    layoutId={isHidden ? undefined : `card-${item._id}`}
                                    animate={{
                                        opacity: isHidden ? 0 : (restockOpen ? 0.1 : 1),
                                        scale: isHidden ? 0 : (restockOpen ? 0.95 : 1)
                                    }}
                                    transition={{ duration: 0.6, ease: "easeInOut" }}
                                    className={isHidden ? 'pointer-events-none' : ''}
                                >
                                    <InventoryCard item={item} storeId={storeId} onRestock={handleRestock} fallbackImage={item.variant?.cylinderImage} />
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};
