import { CreateBrandModal } from "@/features/brand/components/CreateBrandModal";
import { BrandList } from "@/features/brand/components/BrandList";

export const BrandPage = () => {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Global Brands</h2>
                    <p className="text-muted-foreground">Manage the catalog of gas brands available to stores.</p>
                </div>
                <CreateBrandModal />
            </div>

            <BrandList />
        </div>
    );
};
