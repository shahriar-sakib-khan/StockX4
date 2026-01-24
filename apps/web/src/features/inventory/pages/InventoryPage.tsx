import { useParams } from "react-router-dom";
import { Loader2, Package, RefreshCw, Box, AlertTriangle, Search, Filter, Plus, Flame, Settings } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { InvoiceModal } from "@/features/cylinder/components/InvoiceModal";
import { ShoppingCart } from "lucide-react";
import { CylindersContent } from "@/features/cylinder/components/CylindersContent";
import { ProductsContent } from "@/features/product/components/ProductsContent";
import { CartSidebar } from "@/features/inventory/components/CartSidebar";

export interface CartItem {
    id: string; // unique ID for cart item
    item: any; // original inventory item (or product)
    quantity: number;
    purchaseType: 'refill' | 'package' | 'product'; // added product
    totalAmount: number;
    unitPrice: number;
}


type Tab = 'cylinders' | 'stoves' | 'regulators';

export const InventoryPage = () => {
    const { storeId } = useParams();
    const params = useParams();
    const effectiveStoreId = params.storeId || params.id;

    const [activeTab, setActiveTab] = useState<Tab>('cylinders');

    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

    // Layout State
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Toggle Handlers
    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const toggleFullscreen = () => setIsFullscreen(!isFullscreen);

    const handleAddToCart = (item: any, quantity: number, purchaseType: 'refill' | 'package', totalAmount: number, unitPrice: number) => {
        const newItem: CartItem = {
            id: Math.random().toString(36).substr(2, 9),
            item,
            quantity,
            purchaseType,
            totalAmount,
            unitPrice
        };
        setCartItems([...cartItems, newItem]);
    };

    // Wrapper for product add to cart to fit signature
    const handleAddProductToCart = (item: any, quantity: number, totalAmount: number, unitPrice: number) => {
        const newItem: CartItem = {
             id: Math.random().toString(36).substr(2, 9),
             item,
             quantity,
             purchaseType: 'product',
             totalAmount,
             unitPrice
        };
        setCartItems([...cartItems, newItem]);
    }

    const handleClearCart = () => {
        setCartItems([]);
        setIsInvoiceOpen(false);
    };

    const handleRemoveItem = (id: string) => {
        setCartItems(cartItems.filter(item => item.id !== id));
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'cylinders':
                return <CylindersContent storeId={effectiveStoreId!} onAddToCart={handleAddToCart} />;
            case 'stoves':
                return <ProductsContent storeId={effectiveStoreId!} type="stove" title="Gas Stoves" onAddToCart={handleAddProductToCart} />;
            case 'regulators':
                return <ProductsContent storeId={effectiveStoreId!} type="regulator" title="Regulators" onAddToCart={handleAddProductToCart} />;
            default:
                return null;
        }
    };

    const sidebarWidthClass = isFullscreen ? 'hidden' : (isSidebarOpen ? 'lg:col-span-1' : 'lg:w-[80px]');
    const mainContentClass = isFullscreen ? 'lg:col-span-4' : (isSidebarOpen ? 'lg:col-span-3' : 'lg:col-span-4 lg:pr-[100px]'); // Adjust based on grid

    return (
        <div className="space-y-4 h-[calc(100dvh-2rem)] flex flex-col">
            {/* Header Section - Compact */}
            <div className="flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">Inventory</h1>
                        <p className="text-xs text-muted-foreground">Manage stock • {effectiveStoreId}</p>
                    </div>
                </div>

                 <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={toggleFullscreen} className="hidden lg:flex gap-2">
                        {isFullscreen ? <Settings className="w-4 h-4" /> : <Box className="w-4 h-4" />}
                        {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                    </Button>
                 </div>
            </div>

            {/* Tabs - Compact */}
            <div className="border-b shrink-0">
                <div className="flex gap-4">
                    <button
                        onClick={() => setActiveTab('cylinders')}
                        className={`border-b-2 px-3 py-1.5 font-medium text-sm flex items-center gap-2 transition-all ${activeTab === 'cylinders' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                    >
                         <Box className="w-4 h-4" /> Cylinders
                    </button>
                    <button
                         onClick={() => setActiveTab('stoves')}
                         className={`border-b-2 px-3 py-1.5 font-medium text-sm flex items-center gap-2 transition-all ${activeTab === 'stoves' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                    >
                        <Flame className="w-4 h-4" /> Stoves
                    </button>
                    <button
                        onClick={() => setActiveTab('regulators')}
                        className={`border-b-2 px-3 py-1.5 font-medium text-sm flex items-center gap-2 transition-all ${activeTab === 'regulators' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                    >
                        <Settings className="w-4 h-4" /> Regulators
                    </button>
                </div>
            </div>

            {/* Content Grid - Flex/Grid Hybrid for Fixed Layout */}
            <div className="flex flex-1 gap-4 overflow-hidden relative">
                {/* Main Inventory List */}
                <div className={`flex-1 h-full overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent rounded-lg border bg-card/50 shadow-sm transition-all duration-300`}>
                    <div className="p-4">
                        {renderContent()}
                    </div>
                </div>

                {/* Sidebar (Desktop) */}
                {!isFullscreen && (
                    <div className={`hidden lg:block h-full transition-all duration-300 ${isSidebarOpen ? 'w-[350px]' : 'w-[70px]'}`}>
                        <CartSidebar
                            cartItems={cartItems}
                            onCheckout={() => setIsInvoiceOpen(true)}
                            onRemoveItem={handleRemoveItem}
                            isCollapsed={!isSidebarOpen}
                            onToggleCollapse={toggleSidebar}
                        />
                    </div>
                )}
            </div>

            {/* Mobile Actions */}
            <div className="lg:hidden fixed bottom-4 right-4 z-50">
                 {cartItems.length > 0 && (
                     <Button
                        size="lg"
                        className="rounded-full shadow-xl"
                        onClick={() => setIsInvoiceOpen(true)}
                     >
                        <ShoppingCart className="w-5 h-5 mr-2" />
                        Checkout ({cartItems.length})
                     </Button>
                 )}
            </div>

            <InvoiceModal
                isOpen={isInvoiceOpen}
                onClose={() => setIsInvoiceOpen(false)}
                cartItems={cartItems}
                onClearCart={handleClearCart}
                storeId={effectiveStoreId!}
            />
        </div>
    );
};
