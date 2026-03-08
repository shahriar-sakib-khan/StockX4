import { Button } from '@/components/ui/button';
import { AllocatedDue } from '../stores/pos.types';

interface POSCustomerDueInfoProps {
    selectedCustomer: any;
    dueAmount: number;
    totalDueCylinders: number;
    mappedDueItems: AllocatedDue[];
    onReturnClick: () => void;
}

export const POSCustomerDueInfo = ({
    selectedCustomer,
    dueAmount,
    totalDueCylinders,
    mappedDueItems,
    onReturnClick
}: POSCustomerDueInfoProps) => {
    if (!selectedCustomer) {
        return <span className="text-sm font-bold text-slate-400">New Customer</span>;
    }

    return (
        <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-500 uppercase">Current Due</span>
            <div className="flex items-center gap-3">
                <span className={`text-2xl font-black ${dueAmount > 0 ? 'text-amber-500' : 'text-slate-700'}`}>
                    ৳{dueAmount}
                </span>
                {totalDueCylinders > 0 && (
                    <div className="flex items-center gap-2">
                        <div className="flex items-center -space-x-2">
                            {mappedDueItems.slice(0, 3).map((item, i) => (
                                <div key={item.productId + i} className="w-8 h-8 rounded-full bg-white border-2 border-slate-100 flex items-center justify-center shadow-sm" title={`${item.brandName}: ${item.maxQty}`}>
                                    {item.image ? (
                                        <img src={item.image} alt="" className="w-6 h-6 object-contain" />
                                    ) : (
                                        <span className="text-[10px] font-bold text-slate-400">{item.brandName[0]}</span>
                                    )}
                                </div>
                            ))}
                            {mappedDueItems.length > 3 && (
                                <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center shadow-sm text-[10px] font-bold text-slate-500">
                                    +{mappedDueItems.length - 3}
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-orange-600 uppercase">Cylinders</span>
                            <span className="text-sm font-bold text-slate-700">{totalDueCylinders} Owed</span>
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8 px-2 ml-1 border-orange-200 text-orange-600 hover:bg-orange-50 font-black text-xs uppercase"
                            onClick={onReturnClick}
                        >
                            Return
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};
