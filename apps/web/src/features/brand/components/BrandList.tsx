import { useStoreBrands, useDeleteStoreBrand } from "../hooks/useBrands";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

import { Trash2, AlertTriangle, Plus, Pencil } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { CreateBrandModal } from "./CreateBrandModal";

export const BrandList = ({ storeId }: { storeId: string }) => {
    const { data, isLoading } = useStoreBrands(storeId);
    const deleteBrand = useDeleteStoreBrand();
    const brands = (data?.brands || []).filter((b: any) => b.isActive !== false);

    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [editingBrand, setEditingBrand] = useState<any>(null);
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const handleDelete = async () => {
        if (!deleteId) return;

        try {
            await deleteBrand.mutateAsync({ storeId, id: deleteId });
            toast.success("Brand removed successfully");
            setDeleteId(null);
        } catch (error) {
            toast.error("Failed to remove brand");
        }
    };

    if (isLoading) {
        return <div className="space-y-2">
            {[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
        </div>;
    }

    return (
        <>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">My Brands</h2>
                <Button onClick={() => setIsCreateOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" /> Add Brand
                </Button>
            </div>

            {brands.length === 0 ? (
                <div className="text-center p-8 text-muted-foreground border border-dashed rounded-lg bg-muted/20">
                    No brands configured. Click "Add Brand" to select from catalog or create custom.
                </div>
            ) : (
                <div className="border rounded-lg overflow-hidden bg-card shadow-sm">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead>Brand Identity</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Cylinder Color</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {brands.map((brand: any) => (
                                <TableRow key={brand._id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm overflow-hidden bg-white border">
                                                {brand.logo ? (
                                                    <img src={brand.logo} alt={brand.name} className="w-full h-full object-contain p-1" />
                                                ) : (
                                                    <span className="text-muted-foreground">{brand.name.substring(0, 2).toUpperCase()}</span>
                                                )}
                                            </div>
                                            <span className="font-semibold">{brand.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className={`text-xs px-2 py-1 rounded-md font-medium border ${brand.isCustom ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-purple-50 text-purple-700 border-purple-200'}`}>
                                            {brand.isCustom ? 'Custom' : 'Global Catalog'}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full border shadow-sm" style={{ backgroundColor: brand.color }} />
                                            <span className="text-xs text-muted-foreground font-mono">{brand.color}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${brand.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {brand.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                                            onClick={() => {
                                                setEditingBrand(brand);
                                                setIsCreateOpen(true);
                                            }}
                                            title="Edit"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                            onClick={() => setDeleteId(brand._id)}
                                            title="Remove"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            {/* Custom Delete Modal */}
            <Modal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                title="Remove Brand"
            >
                <div className="space-y-4">
                    <div className="flex items-center gap-3 text-destructive bg-destructive/10 p-4 rounded-lg">
                        <AlertTriangle className="w-5 h-5" />
                        <p className="font-medium text-sm">This will hide the brand.</p>
                    </div>
                    <p className="text-muted-foreground text-sm">
                        Are you sure you want to remove this brand from your list? Inventory records will be preserved but hidden until you add it back.
                    </p>
                    <div className="flex justify-end gap-3 pt-2">
                        <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={deleteBrand.isPending}>
                            {deleteBrand.isPending ? "Removing..." : "Remove Brand"}
                        </Button>
                    </div>
                </div>
            </Modal>

            <CreateBrandModal
                open={isCreateOpen}
                onClose={() => {
                    setIsCreateOpen(false);
                    setEditingBrand(null);
                }}
                initialData={editingBrand}
                storeId={storeId}
            />
        </>
    );
};
