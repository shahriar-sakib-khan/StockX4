import { useState } from 'react';
import { useProducts, useDeleteProduct } from '@/features/product/hooks/useProducts';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { ProductForm } from '@/features/product/components/ProductForm';

type Product = {
    _id: string;
    name: string;
    type: string;
    stock: number;
    sellingPrice: number;
    costPrice: number;
};

export const ProductPage = () => {
    const { data: products, isLoading } = useProducts();
    const { mutate: deleteProduct } = useDeleteProduct();
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const columns: ColumnDef<Product>[] = [
        {
            accessorKey: 'name',
            header: 'Product',
        },
        {
            accessorKey: 'type',
            header: 'Type',
            cell: ({ row }) => <span className="uppercase text-xs font-bold px-2 py-1 bg-muted rounded">{row.original.type}</span>,
        },
        {
            accessorKey: 'stock',
            header: 'Stock',
            cell: ({ row }) => (
                <span className={row.original.stock < 5 ? 'text-red-500 font-bold' : 'text-green-600'}>
                    {row.original.stock}
                </span>
            )
        },
        {
            accessorKey: 'sellingPrice',
            header: 'Price',
             cell: ({ row }) => `৳${row.original.sellingPrice}`,
        },
        {
            id: 'actions',
            cell: ({ row }) => (
                <div className="flex justify-end">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={(e) => {
                            e.stopPropagation();
                            if(confirm('Are you sure?')) deleteProduct(row.original._id);
                        }}
                    >
                        <Trash2 size={16} />
                    </Button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Inventory</h1>
                    <p className="text-muted-foreground">Manage your products and stock levels.</p>
                </div>
                <Button onClick={() => setIsCreateOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Add Product
                </Button>
            </div>

            {isLoading ? (
                <div className="text-center py-10">Loading inventory...</div>
            ) : (
                <DataTable columns={columns} data={products || []} />
            )}

            <Modal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                title="Add New Product"
            >
                <ProductForm onSuccess={() => setIsCreateOpen(false)} />
            </Modal>
        </div>
    );
};
