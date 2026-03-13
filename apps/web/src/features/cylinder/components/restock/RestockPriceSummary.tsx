interface RestockPriceSummaryProps {
    currentProduct: any;
}

export const RestockPriceSummary = ({ currentProduct }: RestockPriceSummaryProps) => {
    return (
        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between">
            <span className="text-xs font-black text-amber-700 uppercase">Old RTL Price</span>
            <p className="text-lg font-black text-amber-800">৳{currentProduct?.prices?.retailPriceFull || 0}</p>
        </div>
    );
};
