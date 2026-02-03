import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { productSchema, ProductInput, ProductType } from '@repo/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCreateProduct } from '../hooks/useProducts';

// Convert Zod Enum to options
const typeOptions = Object.values(ProductType.Values);

interface ProductFormProps {
    onSuccess?: () => void;
    fixedType?: string; // 'stove' | 'regulator'
}

// Local schema for form validation
// We extend the base schema to make 'name' optional in the form (since it's auto-generated)
// and allow string input for prices that we convert to numbers
const formSchema = productSchema.extend({
    name: z.string().optional(),
    costPrice: z.any().transform((val) => Number(val) || 0),
    sellingPrice: z.any().transform((val) => Number(val) || 0),
});

export const ProductForm = ({ onSuccess, fixedType }: ProductFormProps) => {
    const { mutate, isPending } = useCreateProduct();
    const form = useForm<ProductInput>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            // @ts-ignore
            type: fixedType || 'accessory',
            modelNumber: '',
            burnerCount: '1',
            size: '22mm',
            stock: 0,
            costPrice: undefined, // undefined to show empty placeholder
            sellingPrice: undefined,
            lowStockAlert: 5
        }
    });

    const onSubmit: SubmitHandler<ProductInput> = (data) => {
        if (fixedType) {
            // @ts-ignore
            data.type = fixedType;
        }

        // Auto-generate name if fixedType is present (simplified form)
        if (fixedType === 'stove') {
            data.name = `Gas Stove - ${data.brand || 'Generic'} ${data.modelNumber ? `(${data.modelNumber})` : ''} - ${data.burnerCount} burner`.trim();
        } else if (fixedType === 'regulator') {
             data.name = `Regulator - ${data.brand || 'Generic'} - ${data.size}`.trim();
        }

        mutate(data, {
            onSuccess: () => {
                form.reset();
                onSuccess?.();
            }
        });
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-4">
            <div className={`grid ${fixedType ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
                {!fixedType && (
                    <div>
                        <label className="text-sm font-medium">Product Name</label>
                        <Input {...form.register('name')} placeholder="Product name" />
                        {form.formState.errors.name && <p className="text-red-500 text-xs">{form.formState.errors.name.message}</p>}
                    </div>
                )}
                {!fixedType && (
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
                )}
            </div>

            {/* Brand - Logic moved up for Stoves/Regulators */}
            <div>
                 <label className="text-sm font-medium">Brand</label>
                 <Input {...form.register('brand')} placeholder="Brand Name" />
            </div>

             {/* Type Specific Fields */}
             {fixedType === 'stove' && (
                <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="text-sm font-medium">Model</label>
                        <Input {...form.register('modelNumber')} placeholder="Model Name/Number" />
                     </div>
                     <div>
                        <label className="text-sm font-medium">Burner Type</label>
                        <select
                            {...form.register('burnerCount')}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                            <option value="1">1 Burner</option>
                            <option value="2">2 Burners</option>
                            <option value="3">3 Burners</option>
                            <option value="4">4 Burners</option>
                        </select>
                     </div>
                </div>
             )}

             {fixedType === 'regulator' && (
                 <div>
                    <label className="text-sm font-medium">Regulator Type</label>
                    <select
                        {...form.register('size')}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                        <option value="22mm">22mm</option>
                        <option value="20mm">20mm</option>
                    </select>
                 </div>
             )}

            <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="text-sm font-medium">Buying Price (Optional)</label>
                   <Input
                      type="number"
                      {...form.register('costPrice', { required: false })}
                      placeholder="0.00"
                   />
                   {form.formState.errors.costPrice && <p className="text-red-500 text-xs">{/* @ts-ignore */ form.formState.errors.costPrice.message}</p>}
                </div>
                <div>
                   <label className="text-sm font-medium">Selling Price (Optional)</label>
                   <Input
                      type="number"
                      {...form.register('sellingPrice', { required: false })}
                      placeholder="0.00"
                   />
                   {form.formState.errors.sellingPrice && <p className="text-red-500 text-xs">{/* @ts-ignore */ form.formState.errors.sellingPrice.message}</p>}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                   <label className="text-sm font-medium">Count</label>
                   <Input
                      type="number"
                      {...form.register('stock', { valueAsNumber: true })}
                      placeholder="0"
                   />
                </div>
            </div>



            <div className="flex justify-end">
                <Button type="submit" disabled={isPending}>
                    {isPending ? 'Saving...' : 'Save Product'}
                </Button>
            </div>
        </form>
    );
};
