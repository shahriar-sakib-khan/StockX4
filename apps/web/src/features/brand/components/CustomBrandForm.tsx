import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Check, Loader2, Upload } from "lucide-react";
import { useCreateCustomBrand, useUpdateStoreBrand, useUploadImage } from "../hooks/useBrands";
import { useState } from "react";
import { toast } from "sonner";

export const CustomBrandForm = ({ onSuccess, initialData, storeId }: { onSuccess: () => void, initialData?: any, storeId: string }) => {
    const create = useCreateCustomBrand();
    const update = useUpdateStoreBrand();
    const upload = useUploadImage();

    // Simple state form for custom brand
    const [name, setName] = useState(initialData?.name || "");
    const [color, setColor] = useState(initialData?.color || "#EAB308");
    const [logo, setLogo] = useState(initialData?.logo || "");
    const [cylinderImage, setCylinderImage] = useState(initialData?.cylinderImage || "");
    const [isUploadingLogo, setIsUploadingLogo] = useState(false);
    const [isUploadingCyl, setIsUploadingCyl] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Submitting Custom Brand Form", { name, color, initialData });
        try {
            if (initialData) {
                await update.mutateAsync({
                    storeId,
                    id: initialData._id,
                    data: { name, color, logo, cylinderImage }
                });
                toast.success("Brand updated");
            } else {
                await create.mutateAsync({
                    storeId,
                    data: {
                        name,
                        color,
                        logo,
                        cylinderImage,
                        isCustom: true
                    }
                });
                toast.success("Custom brand created");
            }
            onSuccess();
        } catch (error) {
            toast.error("Failed to save brand");
        }
    };

    const handleUpload = async (file: File, type: 'logo' | 'cylinder') => {
        const setter = type === 'logo' ? setLogo : setCylinderImage;
        const loader = type === 'logo' ? setIsUploadingLogo : setIsUploadingCyl;

        loader(true);
        try {
             const res = await upload.mutateAsync(file);
             setter(res.url);
        } catch (error) {
            toast.error("Upload failed");
        } finally {
            loader(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-lg mx-auto">
            <div className="space-y-2">
                <label className="text-sm font-medium">Brand Name</label>
                <Input placeholder="Enter brand name" value={name} onChange={e => setName(e.target.value)} required />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Primary Indentity Color</label>
                <div className="flex items-center gap-3">
                    <Input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-16 h-10 p-1 cursor-pointer" />
                    <span className="text-sm font-mono text-muted-foreground">{color}</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Brand Logo</label>
                     <div
                        className="h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors relative bg-muted/10 overflow-hidden"
                        onClick={() => document.getElementById('custom-logo-upload')?.click()}
                    >
                        {logo ? (
                            <img src={logo} alt="Logo" className="w-full h-full object-contain p-2" />
                        ) : (
                            isUploadingLogo ? <Loader2 className="w-6 h-6 animate-spin" /> : <Upload className="w-6 h-6 text-muted-foreground" />
                        )}
                        <Input
                            id="custom-logo-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0], 'logo')}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Cylinder Image</label>
                    <div
                        className="h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors relative bg-muted/10 overflow-hidden"
                        onClick={() => document.getElementById('custom-cyl-upload')?.click()}
                    >
                         {cylinderImage ? (
                            <img src={cylinderImage} alt="Cylinder" className="w-full h-full object-contain p-2" />
                        ) : (
                            isUploadingCyl ? <Loader2 className="w-6 h-6 animate-spin" /> : <Upload className="w-6 h-6 text-muted-foreground" />
                        )}
                        <Input
                            id="custom-cyl-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0], 'cylinder')}
                        />
                    </div>
                </div>
            </div>

            <Button type="submit" className="w-full" disabled={create.isPending || update.isPending || !name}>
                {(create.isPending || update.isPending) ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : (initialData ? <Check className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />)}
                {initialData ? 'Update Brand' : 'Create Custom Brand'}
            </Button>
        </form>
    );
};
