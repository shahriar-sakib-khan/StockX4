import { useBrands, useDeleteBrand } from "../hooks/useBrands";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Trash2, Pencil, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { CreateBrandModal } from "./CreateBrandModal";

export const BrandList = () => {
    const { data, isLoading } = useBrands();
    const deleteBrand = useDeleteBrand();
    const brands = data?.brands || [];

    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [editBrand, setEditBrand] = useState<any>(null);

    const handleDelete = async () => {
        if (!deleteId) return;

        try {
            await deleteBrand.mutateAsync(deleteId);
            toast.success("Brand deleted successfully");
            setDeleteId(null);
        } catch (error) {
            toast.error("Failed to delete brand");
        }
    };

    if (isLoading) {
        return <div className="space-y-2">
            {[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
        </div>;
    }

    if (brands.length === 0) {
        return <div className="text-center p-8 text-muted-foreground border border-dashed rounded-lg bg-muted/20">No brands found. Create one to get started.</div>;
    }

    return (
        <>
            <div className="border rounded-lg overflow-hidden bg-card shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50">
                            <TableHead>Identity</TableHead>
                            <TableHead>Colors (20mm / 22mm)</TableHead>
                            <TableHead>Variants</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {brands.map((brand: any) => (
                            <TableRow key={brand._id}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm overflow-hidden"
                                             style={{ background: brand.logo ? 'none' : `linear-gradient(135deg, ${brand.color20mm}, ${brand.color22mm})` }}>
                                            {brand.logo ? (
                                                <img src={brand.logo} alt={brand.name} className="w-full h-full object-cover" />
                                            ) : (
                                                brand.name.substring(0, 2).toUpperCase()
                                            )}
                                        </div>
                                        <span className="font-semibold">{brand.name}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2" title="20mm Color">
                                            <div className="w-5 h-5 rounded-full border shadow-sm" style={{ backgroundColor: brand.color20mm }} />
                                            <span className="text-xs text-muted-foreground font-mono">20mm</span>
                                        </div>
                                        <div className="flex items-center gap-2" title="22mm Color">
                                            <div className="w-5 h-5 rounded-full border shadow-sm" style={{ backgroundColor: brand.color22mm }} />
                                            <span className="text-xs text-muted-foreground font-mono">22mm</span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-wrap gap-1.5">
                                        {brand.variants.map((v: any, idx: number) => (
                                            <Badge key={idx} variant="secondary" className="font-normal text-xs">
                                                {v.size} / {v.regulator}
                                            </Badge>
                                        ))}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${brand.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {brand.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                            onClick={() => setEditBrand(brand)}
                                            title="Edit"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                            onClick={() => setDeleteId(brand._id)}
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Custom Delete Modal */}
            <Modal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                title="Delete Brand"
            >
                <div className="space-y-4">
                    <div className="flex items-center gap-3 text-destructive bg-destructive/10 p-4 rounded-lg">
                        <AlertTriangle className="w-5 h-5" />
                        <p className="font-medium text-sm">This action cannot be undone.</p>
                    </div>
                    <p className="text-muted-foreground text-sm">
                        Are you sure you want to delete this brand? This might affect existing inventory and sales records associated with this brand.
                    </p>
                    <div className="flex justify-end gap-3 pt-2">
                        <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={deleteBrand.isPending}>
                            {deleteBrand.isPending ? "Deleting..." : "Delete Brand"}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Edit Modal (Hidden for now until CreateBrandModal is refactored to accept props) */}
            {editBrand && (
                <CreateBrandModal
                    key={editBrand._id} // Force re-mount on change
                    initialData={editBrand}
                    onClose={() => setEditBrand(null)}
                    open={true}
                />
            )}
        </>
    );
};
