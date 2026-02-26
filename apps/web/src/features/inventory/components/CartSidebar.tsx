import { Button } from "@/components/ui/button";
import { ShoppingCart, X, ChevronRight, ChevronLeft, Trash2 } from "lucide-react";
import { CartItem } from "../pages/InventoryPage";
import { cn } from "@/lib/utils";

interface CartSidebarProps {
    cartItems: CartItem[];
    onCheckout: () => void;
    onRemoveItem: (id: string) => void;
    isCollapsed: boolean;
    onToggleCollapse: () => void;
}

export const CartSidebar = ({ cartItems, onCheckout, onRemoveItem, isCollapsed, onToggleCollapse }: CartSidebarProps) => {
    const total = cartItems.reduce((sum, item) => sum + item.totalAmount, 0);

    return (
        <div className={cn(
            "hidden lg:flex flex-col h-full border rounded-xl bg-card shadow-sm transition-all duration-300 relative",
            isCollapsed ? "w-[70px]" : "w-full"
        )}>
             {/* Collapse Toggle */}
             <button
                onClick={onToggleCollapse}
                className="absolute top-3 left-3 z-10 p-1.5 hover:bg-muted rounded-md text-muted-foreground transition-colors"
                title={isCollapsed ? "Expand Cart" : "Collapse Cart"}
             >
                {isCollapsed ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
             </button>

            {/* Header */}
            <div className={cn("p-4 border-b bg-muted/30 flex items-center justify-between", isCollapsed && "flex-col gap-4 py-8")}>
                {!isCollapsed && (
                    <h3 className="font-bold flex items-center gap-2 pl-8">
                        <ShoppingCart className="w-5 h-5 text-primary" /> Current Cart
                    </h3>
                )}
                {isCollapsed && (
                     <div className="mt-8 flex flex-col items-center gap-1">
                        <ShoppingCart className="w-6 h-6 text-primary" />
                        <span className="text-xs font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">{cartItems.length}</span>
                     </div>
                )}
            </div>

            {/* Content */}
            <div className={cn("flex-1 overflow-y-auto p-2 space-y-2 scrollbar-none", !isCollapsed ? 'pb-32' : 'pb-24')}>
                {cartItems.map((item) => (
                    <div key={item.id} className={cn("group relative flex gap-3 p-2 border rounded-lg hover:bg-muted/50 transition-colors", isCollapsed && "justify-center p-1 border-transparent hover:border-border")}>
                        {!isCollapsed && (
                            <button
                                onClick={() => onRemoveItem(item.id)}
                                className="absolute -top-2 -right-2 bg-destructive text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-10"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        )}

                        <div className={cn("w-10 h-10 rounded-md flex items-center justify-center shrink-0 text-xs font-bold border",
                            item.purchaseType === 'package' ? 'bg-green-100 text-green-700 border-green-200' :
                            item.purchaseType === 'refill' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                            'bg-orange-100 text-orange-700 border-orange-200'
                        )}>
                             {isCollapsed ? item.quantity : (item.item?.variant?.size || "Pr")}
                        </div>

                        {!isCollapsed && (
                            <>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm truncate">{item.item.brandName || item.item.name}</p>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                        <span className="capitalize">{item.purchaseType}</span>
                                        <span>x{item.quantity}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-sm">৳{item.totalAmount.toLocaleString()}</p>
                                </div>
                            </>
                        )}
                    </div>
                ))}

                {cartItems.length === 0 && !isCollapsed && (
                    <div className="text-center py-10 text-muted-foreground">
                        <div className="bg-muted w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                            <ShoppingCart className="w-6 h-6 opacity-50" />
                        </div>
                        <p className="text-sm">Cart is empty</p>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className={cn(
                "fixed bottom-4 right-4 z-50 bg-background/95 backdrop-blur shadow-2xl border rounded-xl transition-all duration-300",
                isCollapsed ? "w-[70px] p-2 flex flex-col items-center bottom-4 right-4 border-primary/20" : "w-[350px] p-4 border-t space-y-4 right-6 bottom-4 border-primary/20"
            )}>
                {!isCollapsed ? (
                    <>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground font-medium">Total Amount</span>
                            <span className="text-xl font-bold">৳{total.toLocaleString()}</span>
                        </div>
                        <Button className="w-full h-11 text-base font-bold shadow-lg shadow-primary/20" onClick={onCheckout} disabled={cartItems.length === 0}>
                            Checkout ({cartItems.length})
                        </Button>
                    </>
                ) : (
                    <div className="space-y-2 w-full text-center pb-2">
                        <div className="text-xs font-bold text-muted-foreground border-b pb-2">Total<br/>৳{(total/1000).toFixed(1)}k</div>
                        <Button size="icon" className="w-full h-10 rounded-lg" onClick={onCheckout} disabled={cartItems.length === 0}>
                            <ChevronRight className="w-5 h-5" />
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};
