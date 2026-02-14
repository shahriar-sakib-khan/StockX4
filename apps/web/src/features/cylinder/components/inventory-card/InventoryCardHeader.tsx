import { Badge } from "@/components/ui/badge";

interface InventoryCardHeaderProps {
    item: any;
    statusConfig: { label: string; color: string };
}

export const InventoryCardHeader = ({ item, statusConfig }: InventoryCardHeaderProps) => {
    return (
        <div className="flex items-center justify-between border-b pb-3 border-slate-100">
            <div className="flex items-center gap-3">
                {/* Brand Logo or Placeholder */}
                <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center border text-slate-500 font-bold text-lg shrink-0 overflow-hidden shadow-sm p-1">
                    {item.brandId?.logo ? (
                        <img src={item.brandId.logo} alt={item.brandName} className="w-full h-full object-contain mix-blend-multiply" />
                    ) : (
                        item.brandName.substring(0, 2).toUpperCase()
                    )}
                </div>
                <div>
                    <h3 className="font-extrabold text-2xl leading-none text-slate-800 tracking-tight">{item.brandName}</h3>
                    <div className="flex items-center gap-2 mt-1.5">
                        {/* Cylinder: Size + Regulator */}
                        {item.variant.size && item.variant.regulator && (
                            <>
                                <Badge variant="outline" className="text-sm font-black bg-slate-100 text-slate-800 border-slate-300 px-2.5 py-0.5 h-6">
                                    {item.variant.size}
                                </Badge>
                                <Badge
                                    className={`text-sm font-black border-0 px-2.5 py-0.5 h-6 ${item.variant.regulator === '22mm' ? 'bg-orange-100 text-orange-600 hover:bg-orange-100' : 'bg-yellow-100 text-yellow-600 hover:bg-yellow-100'}`}
                                >
                                    {item.variant.regulator}
                                </Badge>
                            </>
                        )}

                        {/* Stove: Burners */}
                        {item.variant.burners && (
                            <Badge variant="outline" className="text-sm font-black bg-orange-50 text-orange-600 border-orange-200 px-2.5 py-0.5 h-6">
                                {item.variant.burners} Burner{item.variant.burners > 1 ? 's' : ''}
                            </Badge>
                        )}

                        {/* Regulator: Size only */}
                        {item.category === 'regulator' && item.variant.size && (
                             <Badge variant="outline" className="text-sm font-black bg-slate-100 text-slate-800 border-slate-300 px-2.5 py-0.5 h-6">
                                {item.variant.size}
                            </Badge>
                        )}
                    </div>
                </div>
            </div>

            {/* Inventory Status Badge */}
            <div className={`px-4 py-1.5 rounded-full border-2 text-xs font-black uppercase tracking-wider shadow-sm ${statusConfig.color.replace('bg-', 'bg-').replace('text-', 'text-').replace('border-', 'border-')}`}>
                {statusConfig.label}
            </div>
        </div>
    );
};
