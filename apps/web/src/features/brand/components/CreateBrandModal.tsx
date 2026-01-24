import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Loader2, Check, Upload, X } from "lucide-react";
import { useCreateBrand, useUpdateBrand, useUploadImage } from "../hooks/useBrands";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { globalBrandSchema, GlobalBrandInput, CylinderSizeOptions } from "@repo/shared";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import * as React from "react";

interface CreateBrandModalProps {
    initialData?: any; // Should be GlobalBrand type
    open?: boolean;
    onClose?: () => void;
}

export const CreateBrandModal = ({ initialData, open: controlledOpen, onClose }: CreateBrandModalProps = {}) => {
    const [internalOpen, setInternalOpen] = useState(false);
    const isControlled = controlledOpen !== undefined;
    const isOpen = isControlled ? controlledOpen : internalOpen;

    const setOpen = (val: boolean) => {
        if (isControlled) {
            if (!val && onClose) onClose();
        } else {
            setInternalOpen(val);
        }
    };

    const [step, setStep] = useState(1);
    const [customSize, setCustomSize] = useState("");
    const [customSizes, setCustomSizes] = useState<string[]>([]);

    // Size Selection State
    const [selectedSizes, setSelectedSizes] = useState<string[]>([]);

    const create = useCreateBrand();
    const update = useUpdateBrand();
    const upload = useUploadImage();
    const isEditing = !!initialData;

    const form = useForm<GlobalBrandInput>({
        resolver: zodResolver(globalBrandSchema),
        defaultValues: {
            name: "",
            logo: "",
            color20mm: "#FF0000",
            color22mm: "#0000FF",
            variants: [],
        }
    });

    const { replace, fields } = useFieldArray({
        control: form.control,
        name: "variants"
    });

    // Initialize form with data if editing
    useEffect(() => {
        if (initialData && isOpen) {
            form.reset({
                name: initialData.name,
                logo: initialData.logo || "",
                color20mm: initialData.color20mm || initialData.cylinderColor || "#FF0000", // Fallback for legacy
                color22mm: initialData.color22mm || initialData.cylinderColor || "#0000FF",
                variants: initialData.variants.map((v: any) => ({
                    size: v.size,
                    regulator: v.regulator,
                    cylinderImage: v.cylinderImage || ""
                }))
            });

            // Extract unique sizes from variants to populate selectedSizes
            const uniqueSizes = Array.from(new Set(initialData.variants.map((v: any) => v.size))) as string[];
            setSelectedSizes(uniqueSizes);

            // Add any custom sizes found
            const custom = uniqueSizes.filter(s => !CylinderSizeOptions.includes(s));
            setCustomSizes(custom);
        } else if (!isOpen) {
            // Reset when closing
            setStep(1);
            form.reset();
            setSelectedSizes([]);
            setCustomSizes([]);
        }
    }, [initialData, isOpen, form]);

    const allSizes = [...CylinderSizeOptions, ...customSizes];

    const generateVariants = (sizes: string[]) => {
        // If editing, try to preserve existing variant data (prices/images)
        const currentVariants = form.getValues().variants || [];

        const newVariants: any[] = [];
        sizes.forEach(size => {
            // Check if we already have this variant in current form data (preserve edits)
            const existing20 = currentVariants.find(v => v.size === size && v.regulator === "20mm");
            const existing22 = currentVariants.find(v => v.size === size && v.regulator === "22mm");

            newVariants.push(existing20 || {
                size,
                regulator: "20mm",
                cylinderImage: ""
            });
            newVariants.push(existing22 || {
                size,
                regulator: "22mm",
                cylinderImage: ""
            });
        });
        replace(newVariants);
    };

    const handleNext = async () => {
        const isValid = await form.trigger(["name", "color20mm", "color22mm"]);
        if (isValid) {
            setStep(2);
        }
    };

    const handleAddCustomSize = () => {
        if (customSize) {
            let sizeToAdd = customSize.trim();
            if (!sizeToAdd.toLowerCase().endsWith('kg')) {
                sizeToAdd += 'kg';
            }

            if (!allSizes.includes(sizeToAdd)) {
                setCustomSizes([...customSizes, sizeToAdd]);
                setCustomSize("");
            }
        }
    };

    const [uploadingIndices, setUploadingIndices] = useState<number[]>([]);

    const handleFeatureImageUpload = async (file: File) => {
         // Logic for feature image if added later
    };

    const handleLogoUpload = async (file: File) => {
        const toastId = toast.loading("Uploading logo...");
        try {
            const res = await upload.mutateAsync(file);
            form.setValue("logo", res.url);
            toast.dismiss(toastId);
            toast.success("Logo uploaded");
        } catch (error) {
            toast.dismiss(toastId);
            toast.error("Logo upload failed");
        }
    };

    const handleImageUpload = async (file: File, index: number) => {
        // Add to uploading state
        setUploadingIndices(prev => [...prev, index]);

        try {
            const res = await upload.mutateAsync(file);
            form.setValue(`variants.${index}.cylinderImage`, res.url);
            // No global toast needed for inline action feeling
        } catch (error) {
            toast.error("Upload failed");
        } finally {
            // Remove from uploading state
            setUploadingIndices(prev => prev.filter(i => i !== index));
        }
    };

    const onSubmit = (data: GlobalBrandInput) => {
        if (isEditing && initialData?._id) {
            update.mutate({ id: initialData._id, data }, {
                onSuccess: () => {
                    toast.success("Brand updated successfully");
                    setOpen(false);
                },
                onError: (err: any) => {
                    toast.error(err.message || "Failed to update brand");
                }
            });
            return;
        }

        create.mutate(data, {
            onSuccess: () => {
                toast.success("Brand created successfully");
                setOpen(false);
            },
            onError: (err: any) => {
                toast.error(err.message || "Failed to create brand");
            }
        });
    };

    const toggleSize = (size: string) => {
        const newSizes = selectedSizes.includes(size)
            ? selectedSizes.filter(s => s !== size)
            : [...selectedSizes, size];
        setSelectedSizes(newSizes);
        generateVariants(newSizes);
    };

    return (
        <>
            {!isControlled && (
                <Button onClick={() => setOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" /> Create Brand
                </Button>
            )}

            {/* Custom Full Screen Modal Overlay */}
            {isOpen && (
                <div className="fixed inset-0 z-[9999] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="w-full h-full max-w-5xl max-h-[90vh] bg-card border rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b">
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight">
                                    {isEditing ? "Edit Global Brand" : "Create Global Brand"}
                                </h2>
                                <p className="text-muted-foreground">Define brand identity using split colors and pricing.</p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                                <X className="w-6 h-6" />
                            </Button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            <Form {...form}>
                                <form id="brand-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-3xl mx-auto">

                                    {/* Step 1 */}
                                    {step === 1 && (
                                        <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                                            {/* Basic Info Grid */}
                                            <div className="grid gap-6 md:grid-cols-2">
                                                {/* Name Input */}
                                                <FormField
                                                    control={form.control}
                                                    name="name"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-lg">Brand Name</FormLabel>
                                                            <FormControl><Input placeholder="e.g. Bashundhara" className="text-lg p-6" {...field} /></FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                {/* Logo Upload */}
                                                <FormField
                                                    control={form.control}
                                                    name="logo"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-lg">Brand Logo</FormLabel>
                                                            <FormControl>
                                                                <div className="flex items-center gap-4">
                                                                    <div className="relative w-16 h-16 rounded-xl border-2 border-dashed flex items-center justify-center bg-muted/20 overflow-hidden group">
                                                                         {field.value ? (
                                                                             <img src={field.value} alt="Logo" className="w-full h-full object-cover" />
                                                                         ) : (
                                                                             <Upload className="w-6 h-6 text-muted-foreground" />
                                                                         )}
                                                                         <Input
                                                                             type="file"
                                                                             accept="image/*"
                                                                             className="absolute inset-0 opacity-0 cursor-pointer"
                                                                             onChange={(e) => {
                                                                                 if (e.target.files?.[0]) handleLogoUpload(e.target.files[0]);
                                                                             }}
                                                                         />
                                                                    </div>
                                                                    <div className="flex flex-col gap-1">
                                                                        <Button type="button" variant="outline" size="sm" className="relative w-fit">
                                                                            {field.value ? 'Change Logo' : 'Upload Logo'}
                                                                            <Input
                                                                                 type="file"
                                                                                 accept="image/*"
                                                                                 className="absolute inset-0 opacity-0 cursor-pointer"
                                                                                 onChange={(e) => {
                                                                                     if (e.target.files?.[0]) handleLogoUpload(e.target.files[0]);
                                                                                 }}
                                                                             />
                                                                        </Button>
                                                                        {field.value && (
                                                                            <Button
                                                                                type="button"
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                className="text-destructive h-6 px-2 w-fit"
                                                                                onClick={() => form.setValue('logo', '')}
                                                                            >
                                                                                Remove
                                                                            </Button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            {/* Dual Colors */}
                                            <div className="grid gap-6 md:grid-cols-2">
                                                <FormField
                                                    control={form.control}
                                                    name="color20mm"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>20mm Color Identity</FormLabel>
                                                            <div className="flex items-center gap-4 p-2 border rounded-lg bg-muted/20">
                                                                <div className="relative w-12 h-12 rounded-full overflow-hidden shadow-inner border-2 border-background ring-2 ring-border">
                                                                    <Input
                                                                        type="color"
                                                                        className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] cursor-pointer p-0 border-none"
                                                                        {...field}
                                                                    />
                                                                </div>
                                                                <span className="font-mono text-lg font-medium">{field.value}</span>
                                                            </div>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="color22mm"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>22mm Color Identity</FormLabel>
                                                            <div className="flex items-center gap-4 p-2 border rounded-lg bg-muted/20">
                                                                <div className="relative w-12 h-12 rounded-full overflow-hidden shadow-inner border-2 border-background ring-2 ring-border">
                                                                    <Input
                                                                        type="color"
                                                                        className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] cursor-pointer p-0 border-none"
                                                                        {...field}
                                                                    />
                                                                </div>
                                                                <span className="font-mono text-lg font-medium">{field.value}</span>
                                                            </div>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            {/* Sizes */}
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <FormLabel className="text-lg">Select Cylinder Sizes</FormLabel>
                                                    <div className="flex gap-2">
                                                        <Input
                                                            placeholder="Custom size (e.g. 50kg)"
                                                            value={customSize}
                                                            onChange={(e) => setCustomSize(e.target.value)}
                                                            className="w-40 h-9"
                                                        />
                                                        <Button type="button" size="sm" variant="secondary" onClick={handleAddCustomSize} disabled={!customSize}>
                                                            Add
                                                        </Button>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                                    {allSizes.map((size) => (
                                                        <div
                                                            key={size}
                                                            onClick={() => toggleSize(size)}
                                                            className={cn(
                                                                "cursor-pointer p-4 border rounded-xl text-center transition-all hover:shadow-md active:scale-95",
                                                                selectedSizes.includes(size)
                                                                    ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2"
                                                                    : "bg-card hover:border-primary/50"
                                                            )}
                                                        >
                                                            <span className="text-lg font-bold block">{size}</span>
                                                            {selectedSizes.includes(size) && <Check className="w-4 h-4 mx-auto mt-2" />}
                                                        </div>
                                                    ))}
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    Selecting a size will automatically generate <span className="font-semibold text-foreground">20mm</span> and <span className="font-semibold text-foreground">22mm</span> variants.
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Step 2 */}
                                    {step === 2 && (
                                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-xl font-semibold">Configure Variants</h3>
                                                <span className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">Step 2 of 2</span>
                                            </div>

                                            <div className="space-y-4">
                                                {selectedSizes.length === 0 && <p className="text-center text-destructive py-12">No sizes selected.</p>}

                                                {/* Header Row */}
                                                <div className="grid grid-cols-12 gap-4 px-4 py-2 bg-muted/30 rounded-lg text-sm font-medium text-muted-foreground uppercase tracking-wider">
                                                    <div className="col-span-2">Size</div>
                                                    <div className="col-span-5 text-center">20mm Variant</div>
                                                    <div className="col-span-5 text-center">22mm Variant</div>
                                                </div>

                                                {selectedSizes.map((size) => {
                                                    // Find indices for this size's variants
                                                    const idx20 = fields.findIndex(f => f.size === size && f.regulator === '20mm');
                                                    const idx22 = fields.findIndex(f => f.size === size && f.regulator === '22mm');

                                                    const variant20 = idx20 !== -1 ? fields[idx20] : null;
                                                    const variant22 = idx22 !== -1 ? fields[idx22] : null;

                                                    const isUploading20 = idx20 !== -1 && uploadingIndices.includes(idx20);
                                                    const isUploading22 = idx22 !== -1 && uploadingIndices.includes(idx22);

                                                    return (
                                                        <div key={size} className="grid grid-cols-12 gap-4 p-4 border rounded-xl bg-card items-center hover:border-primary/20 transition-all">
                                                            {/* Size Label */}
                                                            <div className="col-span-2">
                                                                <span className="text-2xl font-bold tracking-tight">{size}</span>
                                                            </div>

                                                            {/* 20mm Column */}
                                                            <div className="col-span-5 flex flex-col items-center">
                                                                {variant20 ? (
                                                                    <div className="relative w-full group">
                                                                        <FormField
                                                                            control={form.control}
                                                                            name={`variants.${idx20}.cylinderImage`}
                                                                            render={({ field }) => (
                                                                                <FormItem className="space-y-0">
                                                                                    {field.value ? (
                                                                                        <div className="relative w-full h-32 bg-muted rounded-lg border overflow-hidden">
                                                                                            <img src={field.value} alt="20mm" className={cn("w-full h-full object-contain p-2", isUploading20 && "opacity-50")} />
                                                                                            {isUploading20 && (
                                                                                                <div className="absolute inset-0 flex items-center justify-center">
                                                                                                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                                                                                </div>
                                                                                            )}
                                                                                            {!isUploading20 && (
                                                                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                                                                    <Button
                                                                                                        type="button"
                                                                                                        size="sm"
                                                                                                        variant="secondary"
                                                                                                        className="h-8 w-8 p-0"
                                                                                                        onClick={() => document.getElementById(`upload-20-${size}`)?.click()}
                                                                                                    >
                                                                                                        <Upload className="w-4 h-4" />
                                                                                                    </Button>
                                                                                                    <Button
                                                                                                        type="button"
                                                                                                        size="sm"
                                                                                                        variant="destructive"
                                                                                                        className="h-8 w-8 p-0"
                                                                                                        onClick={() => {
                                                                                                            // Remove logic: find ANY index that matches properties
                                                                                                            // Since field array index can shift, we must be careful.
                                                                                                            // Best to just use remove(idx20).
                                                                                                            // But react-hook-form 'remove' takes an index.
                                                                                                            // Since we are mapping inside render, idx20 is correct for this render cycle.
                                                                                                            // However, if we remove one, other indices shift.
                                                                                                            // But this is a click handler closure, so idx20 should be valid at time of click?
                                                                                                            // Actually, performant safer way:
                                                                                                            // We call a wrapper that calls remove(current_index).
                                                                                                            // Let's rely on remove(idx20).
                                                                                                            // Note: if modifying array, key prop on parent (size) helps React reconciling but field array needs correct index.
                                                                                                            // The `fields` array from useFieldArray has stable IDs.
                                                                                                            // BUT for simplicity, let's just use `remove(idx20)`.

                                                                                                            // WAIT. `remove` is available from useFieldArray destructure. I need to destructure it.
                                                                                                            // I need `remove` in the component scope. I only destructured { replace, fields }. I need { replace, fields, remove, append }.
                                                                                                            // I will assume I will update the destructuring in a separate step or try to use a method if exposed.
                                                                                                            // Ah, I can't change lines 57 in this replacement chunk.
                                                                                                            // Workaround: I'll use `form.setValue` to nullify or filter? No, I need real removal.
                                                                                                            // Actually, let's just show "Delete" implies "Remove from array".
                                                                                                            // I will need to edit line 57 first or encompass it.
                                                                                                            // Let's broaden the edit range in a moment. For now, let's just make the UI logic assuming `variant20` exists.
                                                                                                            // Actually, I can use `form.setValue` to set variants array by filtering.
                                                                                                            const current = form.getValues().variants;
                                                                                                            const filtered = current.filter((_, i) => i !== idx20);
                                                                                                            replace(filtered);
                                                                                                        }}
                                                                                                    >
                                                                                                        <X className="w-4 h-4" />
                                                                                                    </Button>
                                                                                                </div>
                                                                                            )}
                                                                                        </div>
                                                                                    ) : (
                                                                                        <div
                                                                                            className="w-full h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors relative"
                                                                                            onClick={() => !isUploading20 && document.getElementById(`upload-20-${size}`)?.click()}
                                                                                        >
                                                                                            {isUploading20 ? (
                                                                                                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                                                                                            ) : (
                                                                                                <>
                                                                                                    <Upload className="w-6 h-6 text-muted-foreground mb-2" />
                                                                                                    <span className="text-xs text-muted-foreground font-medium">Upload 20mm</span>
                                                                                                </>
                                                                                            )}
                                                                                        </div>
                                                                                    )}
                                                                                    <Input
                                                                                        id={`upload-20-${size}`}
                                                                                        type="file"
                                                                                        accept="image/*"
                                                                                        className="hidden"
                                                                                        disabled={isUploading20}
                                                                                        onChange={(e) => {
                                                                                            if (e.target.files?.[0]) handleImageUpload(e.target.files[0], idx20);
                                                                                        }}
                                                                                    />
                                                                                </FormItem>
                                                                            )}
                                                                        />
                                                                        <div className="mt-2 flex items-center gap-2">
                                                                             <div className="h-3 w-3 rounded-full border shadow-sm" style={{ backgroundColor: form.getValues('color20mm') }} />
                                                                             <span className="text-xs font-mono text-muted-foreground">20mm - {form.getValues('color20mm')}</span>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <Button
                                                                        variant="outline"
                                                                        className="h-32 w-full border-dashed flex flex-col gap-2"
                                                                        onClick={() => {
                                                                            // Add 20mm variant
                                                                             const current = form.getValues().variants;
                                                                             replace([...current, {
                                                                                 size,
                                                                                 regulator: "20mm",
                                                                                 cylinderImage: ""
                                                                             }]);
                                                                        }}
                                                                    >
                                                                        <Plus className="w-6 h-6 text-muted-foreground" />
                                                                        <span className="text-xs text-muted-foreground">Add 20mm</span>
                                                                    </Button>
                                                                )}
                                                            </div>

                                                            {/* 22mm Column */}
                                                            <div className="col-span-5 flex flex-col items-center">
                                                                {variant22 ? (
                                                                    <div className="relative w-full group">
                                                                        <FormField
                                                                            control={form.control}
                                                                            name={`variants.${idx22}.cylinderImage`}
                                                                            render={({ field }) => (
                                                                                <FormItem className="space-y-0">
                                                                                    {field.value ? (
                                                                                        <div className="relative w-full h-32 bg-muted rounded-lg border overflow-hidden">
                                                                                            <img src={field.value} alt="22mm" className={cn("w-full h-full object-contain p-2", isUploading22 && "opacity-50")} />
                                                                                            {isUploading22 && (
                                                                                                <div className="absolute inset-0 flex items-center justify-center">
                                                                                                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                                                                                </div>
                                                                                            )}
                                                                                            {!isUploading22 && (
                                                                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                                                                     <Button
                                                                                                        type="button"
                                                                                                        size="sm"
                                                                                                        variant="secondary"
                                                                                                        className="h-8 w-8 p-0"
                                                                                                        onClick={() => document.getElementById(`upload-22-${size}`)?.click()}
                                                                                                    >
                                                                                                        <Upload className="w-4 h-4" />
                                                                                                    </Button>
                                                                                                    <Button
                                                                                                        type="button"
                                                                                                        size="sm"
                                                                                                        variant="destructive"
                                                                                                        className="h-8 w-8 p-0"
                                                                                                        onClick={() => {
                                                                                                            // Remove logic
                                                                                                            const current = form.getValues().variants;
                                                                                                            const filtered = current.filter((_, i) => i !== idx22);
                                                                                                            replace(filtered);
                                                                                                        }}
                                                                                                    >
                                                                                                        <X className="w-4 h-4" />
                                                                                                    </Button>
                                                                                                </div>
                                                                                            )}
                                                                                        </div>
                                                                                    ) : (
                                                                                        <div
                                                                                            className="w-full h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors relative"
                                                                                            onClick={() => !isUploading22 && document.getElementById(`upload-22-${size}`)?.click()}
                                                                                        >
                                                                                            {isUploading22 ? (
                                                                                                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                                                                                            ) : (
                                                                                                <>
                                                                                                    <Upload className="w-6 h-6 text-muted-foreground mb-2" />
                                                                                                    <span className="text-xs text-muted-foreground font-medium">Upload 22mm</span>
                                                                                                </>
                                                                                            )}
                                                                                        </div>
                                                                                    )}
                                                                                    <Input
                                                                                        id={`upload-22-${size}`}
                                                                                        type="file"
                                                                                        accept="image/*"
                                                                                        className="hidden"
                                                                                        disabled={isUploading22}
                                                                                        onChange={(e) => {
                                                                                            if (e.target.files?.[0]) handleImageUpload(e.target.files[0], idx22);
                                                                                        }}
                                                                                    />
                                                                                </FormItem>
                                                                            )}
                                                                        />
                                                                         <div className="mt-2 flex items-center gap-2">
                                                                             <div className="h-3 w-3 rounded-full border shadow-sm" style={{ backgroundColor: form.getValues('color22mm') }} />
                                                                             <span className="text-xs font-mono text-muted-foreground">22mm - {form.getValues('color22mm')}</span>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <Button
                                                                        variant="outline"
                                                                        className="h-32 w-full border-dashed flex flex-col gap-2"
                                                                        onClick={() => {
                                                                            // Add 22mm variant
                                                                             const current = form.getValues().variants;
                                                                             replace([...current, {
                                                                                 size,
                                                                                 regulator: "22mm",
                                                                                 cylinderImage: ""
                                                                             }]);
                                                                        }}
                                                                    >
                                                                        <Plus className="w-6 h-6 text-muted-foreground" />
                                                                        <span className="text-xs text-muted-foreground">Add 22mm</span>
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                </form>
                            </Form>
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t bg-muted/10 flex items-center justify-between">
                            {step === 2 ? (
                                <Button size="lg" variant="outline" onClick={() => setStep(1)} className="px-8">Back</Button>
                            ) : (
                                <div />
                            )}

                            {step === 1 ? (
                                <Button size="lg" onClick={handleNext} disabled={selectedSizes.length === 0} className="px-8">
                                    Next Step
                                </Button>
                            ) : (
                                <Button size="lg" onClick={form.handleSubmit(onSubmit)} disabled={create.isPending || update.isPending || fields.length === 0} className="px-8 min-w-[200px]">
                                    {create.isPending || update.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
                                    {isEditing ? "Save Changes" : "Create Brand"}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
