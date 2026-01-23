import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productSchema, ProductInput, ProductType } from '@repo/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCreateProduct } from '../hooks/useProducts';

// Convert Zod Enum to options
const typeOptions = Object.values(ProductType.Values);

interface ProductFormProps {
    onSuccess?: () => void;
}

export const ProductForm = ({ onSuccess }: ProductFormProps) => {
    const { mutate, isPending } = useCreateProduct();
    const form = useForm<ProductInput>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            name: '',
            // @ts-ignore
            type: 'accessory',
            stock: 0,
            costPrice: 0,
            sellingPrice: 0,
            lowStockAlert: 5
        }
    });

    const onSubmit = (data: ProductInput) => {
        mutate(data, {
            onSuccess: () => {
                form.reset();
                onSuccess?.();
            }
        });
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="text-sm font-medium">Product Name</label>
                   <Input {...form.register('name')} placeholder="Product name" />
                   {form.formState.errors.name && <p className="text-red-500 text-xs">{form.formState.errors.name.message}</p>}
                </div>
                <div>
                   <label className="text-sm font-medium">Type</label>
                   <select
                     {...form.register('type')}
                     className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                   >
                       {typeOptions.map(t => (
                           <option key={t} value={t}>{t.toUpperCase()}</option>
                       ))}
                   </select>
                   {form.formState.errors.type && <p className="text-red-500 text-xs">{form.formState.errors.type.message}</p>}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="text-sm font-medium">Buying Price</label>
                   <Input
                      type="number"
                      {...form.register('costPrice', { valueAsNumber: true })}
                      placeholder="0.00"
                   />
                   {form.formState.errors.costPrice && <p className="text-red-500 text-xs">{form.formState.errors.costPrice.message}</p>}
                </div>
                <div>
                   <label className="text-sm font-medium">Selling Price</label>
                   <Input
                      type="number"
                      {...form.register('sellingPrice', { valueAsNumber: true })}
                      placeholder="0.00"
                   />
                   {form.formState.errors.sellingPrice && <p className="text-red-500 text-xs">{form.formState.errors.sellingPrice.message}</p>}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="text-sm font-medium">Initial Stock</label>
                   <Input
                      type="number"
                      {...form.register('stock', { valueAsNumber: true })}
                      placeholder="0"
                   />
                </div>
                <div>
                   <label className="text-sm font-medium">Low Stock Alert</label>
                   <Input
                      type="number"
                      {...form.register('lowStockAlert', { valueAsNumber: true })}
                      placeholder="5"
                   />
                </div>
            </div>

            <div>
                 <label className="text-sm font-medium">Brand (Optional)</label>
                 <Input {...form.register('brand')} placeholder="Brand Name" />
            </div>

            <div className="flex justify-end">
                <Button type="submit" disabled={isPending}>
                    {isPending ? 'Saving...' : 'Save Product'}
                </Button>
            </div>
        </form>
    );
};
