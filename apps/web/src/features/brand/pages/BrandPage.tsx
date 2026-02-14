import { GlobalBrandList } from "@/features/brand/components/GlobalBrandList";

export const BrandPage = () => {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Global Brands</h2>
                    <p className="text-muted-foreground">Manage the master catalog of gas brands available to all stores.</p>
                </div>
            </div>

            <GlobalBrandList />
        </div>
    );
};
