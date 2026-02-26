import { useGlobalBrands, useDeleteGlobalBrand } from "../hooks/useBrands";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Trash2, AlertTriangle, Pencil, Plus } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { GlobalBrandForm } from "./GlobalBrandForm";

export const GlobalBrandList = () => {
    const { data, isLoading } = useGlobalBrands();
    const deleteBrand = useDeleteGlobalBrand();
    const brands = data?.brands || [];

    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [editingBrand, setEditingBrand] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

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
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
        </div>;
    }

    return (
        <>
            <div className="flex justify-end mb-4">
                 <Button onClick={() => setIsModalOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" /> Add Global Brand
                </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {brands.map((brand: any) => (
                    <div key={brand._id} className="group relative border rounded-xl overflow-hidden bg-card shadow-sm hover:shadow-md transition-all flex h-40">
                        {/* Actions Overlay */}
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            <Button
                                variant="secondary"
                                size="icon"
                                className="h-7 w-7 bg-white/90 hover:bg-white shadow-sm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingBrand(brand);
                                    setIsModalOpen(true);
                                }}
                                title="Edit"
                            >
                                <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                            </Button>
                            <Button
                                variant="destructive"
                                size="icon"
                                className="h-7 w-7 shadow-sm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setDeleteId(brand._id);
                                }}
                                title="Delete"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                        </div>

                        {/* Left: Cylinder Image */}
                        <div className="w-1/3 bg-muted/10 p-2 flex items-center justify-center border-r">
                             <div className="w-full h-full flex items-center justify-center filter drop-shadow-md transition-transform group-hover:scale-105">
                                <img src={brand.cylinderImage} alt={`${brand.name} Cylinder`} className="w-full h-full object-contain" />
                            </div>
                        </div>

                        {/* Right: Info */}
                        <div className="flex-1 p-3 flex flex-col justify-center gap-3">
                            {/* Brand Logo */}
                            <div className="h-10 w-24 border rounded-md p-1 flex items-center justify-center bg-white shadow-sm">
                                <img src={brand.logo} alt={brand.name} className="w-full h-full object-contain" />
                            </div>

                            {/* Color Info */}
                            <div className="flex items-center gap-2 border rounded px-2 py-1 w-fit bg-muted/5">
                                <div className="w-3 h-3 rounded-full shadow-sm ring-1 ring-border" style={{ backgroundColor: brand.color }} />
                                <span className="text-xs font-mono text-muted-foreground">{brand.color}</span>
                            </div>

                            {/* Brand Name */}
                            <h3 className="font-semibold text-sm truncate border rounded px-2 py-1 bg-muted/5 text-center w-full">
                                {brand.name}
                            </h3>
                        </div>
                    </div>
                ))}

                {brands.length === 0 && (
                    <div className="col-span-full text-center p-12 text-muted-foreground border-2 border-dashed rounded-xl">
                        <p>No global brands found.</p>
                        <Button variant="link" onClick={() => setIsModalOpen(true)}>Add your first brand</Button>
                    </div>
                )}
            </div>

            {/* Custom Delete Modal */}
            <Modal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                title="Delete Global Brand"
            >
                <div className="space-y-4">
                    <div className="flex items-center gap-3 text-destructive bg-destructive/10 p-4 rounded-lg">
                        <AlertTriangle className="w-5 h-5" />
                        <p className="font-medium text-sm">Dangerous Action</p>
                    </div>
                    <p className="text-muted-foreground text-sm">
                        Are you sure you want to delete this global brand? This might affect stores that have added this brand to their catalog.
                    </p>
                    <div className="flex justify-end gap-3 pt-2">
                        <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={deleteBrand.isPending}>
                            {deleteBrand.isPending ? "Deleting..." : "Delete Brand"}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Edit/Create Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingBrand(null);
                }}
                title={editingBrand ? "Edit Global Brand" : "Add Global Brand"}
                className="max-w-2xl"
            >
                 <GlobalBrandForm
                    onSuccess={() => {
                        setIsModalOpen(false);
                        setEditingBrand(null);
                    }}
                    initialData={editingBrand}
                />
            </Modal>
        </>
    );
};
