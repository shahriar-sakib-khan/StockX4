import { useState } from "react";
import { Loader2, Box, AlertTriangle, Search, Plus, Flame, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProducts, useDeleteProduct, useUpdateProduct } from "@/features/product/hooks/useProducts";
import { toast } from "sonner";
import { Modal } from "@/components/ui/Modal";
import { ProductForm } from "./ProductForm";
import { BuyProductModal } from "./BuyProductModal";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatsCard } from "@/components/common/StatsCard";
import { DefectManagementModal } from "@/components/common/DefectManagementModal";
import { ProductTable } from "./ProductTable";

export const ProductsContent = ({ storeId, type, title, onAddToCart }: { storeId: string, type: 'stove' | 'regulator', title: string, onAddToCart: any }) => {
    const { data: products, isLoading } = useProducts();
    const { mutate: deleteProduct } = useDeleteProduct();
    const updateProduct = useUpdateProduct();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [regulatorFilter, setRegulatorFilter] = useState<string | null>(null);
    const [burnerFilter, setBurnerFilter] = useState<string | null>(null);
    const [showDamaged, setShowDamaged] = useState(false);

    // Buy Modal State
    const [buyModalOpen, setBuyModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);



    // Defect Modal
    const [defectModalOpen, setDefectModalOpen] = useState(false);
    const [selectedDefectProduct, setSelectedDefectProduct] = useState<any>(null);

    const handleBuy = (product: any) => {
        setSelectedProduct(product);
        setBuyModalOpen(true);
    };

    const handleManageDefect = (product: any) => {
        setSelectedDefectProduct(product);
        setDefectModalOpen(true);
    };

    // Filter products
    const filteredProducts = products?.filter((p: any) => {
        if(p.type !== type) return false;
        if(search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.brand?.toLowerCase().includes(search.toLowerCase())) return false;

        if (showDamaged) {
            return (p.damaged || 0) > 0;
        }

        if(type === 'regulator' && regulatorFilter && p.size !== regulatorFilter) return false;
        if(type === 'stove' && burnerFilter && p.burnerCount !== burnerFilter) return false;
        return true;
    }) || [];

    // Stats
    // Stats
    const stats = {
        total: products?.reduce((sum: number, p: any) => {
            if (p.type !== type) return sum;
            return sum + (p.stock || 0);
        }, 0) || 0,
        variant1: products?.filter((p: any) => {
            if (p.type !== type) return false;
            return type === 'stove' ? p.burnerCount === 'single' : p.size === '22mm';
        }).reduce((sum: number, p: any) => sum + (p.stock || 0), 0) || 0,
        variant2: products?.filter((p: any) => {
            if (p.type !== type) return false;
            return type === 'stove' ? p.burnerCount === 'double' : p.size === '20mm';
        }).reduce((sum: number, p: any) => sum + (p.stock || 0), 0) || 0,
        damaged: products?.reduce((sum: number, p: any) => {
             if (p.type !== type) return sum;
             return sum + (p.damaged || 0);
        }, 0) || 0
    };

    if (isLoading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
             <BuyProductModal
                isOpen={buyModalOpen}
                onClose={() => setBuyModalOpen(false)}
                product={selectedProduct}
                onAddToCart={onAddToCart}
            />

             {/* Stats Cards */}
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatsCard
                    title="Total Units"
                    value={stats.total}
                    subTitle=""
                    icon={Box}
                    color="primary"
                    isActive={burnerFilter === null && regulatorFilter === null && !showDamaged}
                    onClick={() => {
                         setBurnerFilter(null);
                         setRegulatorFilter(null);
                         setShowDamaged(false);
                    }}
                />
                <StatsCard
                    title={type === 'stove' ? 'Single Burner' : '22mm Size'}
                    value={stats.variant1}
                    subTitle=""
                    icon={type === 'stove' ? Flame : Settings}
                    color="blue"
                    isActive={burnerFilter === 'single' || regulatorFilter === '22mm'}
                    onClick={() => {
                        setShowDamaged(false);
                        if (type === 'stove') setBurnerFilter(burnerFilter === 'single' ? null : 'single');
                        else setRegulatorFilter(regulatorFilter === '22mm' ? null : '22mm');
                    }}
                />
                <StatsCard
                    title={type === 'stove' ? 'Double Burner' : '20mm Size'}
                    value={stats.variant2}
                    subTitle=""
                    icon={type === 'stove' ? Flame : Settings}
                    color="orange"
                    isActive={burnerFilter === 'double' || regulatorFilter === '20mm'}
                    onClick={() => {
                        setShowDamaged(false);
                        if (type === 'stove') setBurnerFilter(burnerFilter === 'double' ? null : 'double');
                        else setRegulatorFilter(regulatorFilter === '20mm' ? null : '20mm');
                    }}
                />
                <StatsCard
                    title="Damaged"
                    value={stats.damaged}
                    subTitle=""
                    icon={AlertTriangle}
                    color="red"
                    isActive={showDamaged}
                    onClick={() => {
                        setShowDamaged(!showDamaged);
                        setBurnerFilter(null);
                        setRegulatorFilter(null);
                    }}
                />
             </div>

             {/* Filter Bar */}
             <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-card p-4 rounded-xl border">
                 <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                    {/* Filters Removed as they are now in stats cards */}
                 </div>

                 <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                     <div className="relative w-full sm:w-[300px]">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder={`Search ${title.toLowerCase()}...`}
                            className="pl-9"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Button onClick={() => setIsCreateOpen(true)} className="bg-orange-500 hover:bg-orange-600 text-white">
                         <Plus className="mr-2 h-4 w-4" /> Buy/Add {title}
                    </Button>
                 </div>
             </div>

             {/* Content Table */}
             {filteredProducts.length === 0 ? (
                 <div className="flex flex-col items-center justify-center p-12 bg-card border rounded-xl border-dashed">
                      <div className="p-4 bg-muted rounded-full mb-4">
                         <Box className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <p className="font-medium text-lg">No {title.toLowerCase()} found</p>
                      <Button variant="outline" className="mt-4" onClick={() => setIsCreateOpen(true)}>
                          Buy/Add {title}
                      </Button>
                 </div>
             ) : (
                <ProductTable
                    products={filteredProducts}
                    type={type}
                    onBuy={handleBuy}
                    onDelete={(id) => deleteProduct(id)}
                    onManageDefect={handleManageDefect}
                />
             )}

             {selectedDefectProduct && (
                <DefectManagementModal
                    isOpen={defectModalOpen}
                    onClose={() => setDefectModalOpen(false)}
                    title="Manage Damaged Products"
                    currentStock={selectedDefectProduct.stock}
                    currentDamaged={selectedDefectProduct.damaged}
                    itemName={selectedDefectProduct.name}
                    isPending={updateProduct.isPending}
                    onUpdate={async (action, qty) => {
                        const newStock = action === 'mark' ? selectedDefectProduct.stock - qty : selectedDefectProduct.stock + qty;
                        const newDamaged = action === 'mark' ? selectedDefectProduct.damaged + qty : selectedDefectProduct.damaged - qty;
                        await updateProduct.mutateAsync({
                             productId: selectedDefectProduct._id,
                             data: { stock: newStock, damaged: newDamaged }
                        });
                        toast.success(action === 'mark' ? 'Marked as damaged' : 'Restored to stock');
                    }}
                />
             )}

            <Modal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                title={`Add New ${title}`}
            >
                <div className="max-w-xl mx-auto">
                     <ProductForm onSuccess={() => setIsCreateOpen(false)} fixedType={type} />
                </div>
            </Modal>
        </div>
    );
};
