interface InventoryCardImageProps {
    item: any;
    fallbackImage?: string;
}

export const InventoryCardImage = ({ item, fallbackImage }: InventoryCardImageProps) => {
    // ALWAYS force the fallback image (which comes from parent as brand's 12kg-22mm image)
    // If no fallback is provided (shouldn't happen given the logic), use a hardcoded default
    const imageToUse = fallbackImage || "https://placehold.co/150x300?text=Cylinder";

    return (
        <div className="w-40 shrink-0 flex flex-col items-center justify-center bg-slate-50/50 rounded-xl border border-slate-100 p-2 min-h-[180px]">
            <img
                src={imageToUse}
                alt={item.brandName}
                className="w-full h-full object-contain hover:scale-105 transition-transform duration-300 transform-gpu"
            />
        </div>
    );
};
