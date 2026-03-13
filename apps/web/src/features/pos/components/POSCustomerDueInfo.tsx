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
            <span className="text-[8px] sm:text-xs font-bold text-slate-500 uppercase leading-none mb-1">Current Due</span>
            <div className="flex items-center gap-2 sm:gap-3">
                <span className={`text-lg sm:text-2xl font-black leading-none ${dueAmount > 0 ? 'text-amber-500' : 'text-slate-700'}`}>
                    ৳{dueAmount}
                </span>
                {totalDueCylinders > 0 && (
                    <div className="flex items-center gap-1.5 sm:gap-2">
                        <div className="flex items-center -space-x-1.5 sm:-space-x-2">
                            {mappedDueItems.slice(0, 3).map((item, i) => (
                                <div key={item.productId + i} className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white border-2 border-slate-100 flex items-center justify-center shadow-sm" title={`${item.brandName}: ${item.maxQty}`}>
                                    {item.image ? (
                                        <img src={item.image} alt="" className="w-5 h-5 sm:w-6 sm:h-6 object-contain" />
                                    ) : (
                                        <span className="text-[8px] sm:text-[10px] font-bold text-slate-400">{item.brandName[0]}</span>
                                    )}
                                </div>
                            ))}
                            {mappedDueItems.length > 3 && (
                                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center shadow-sm text-[8px] sm:text-[10px] font-bold text-slate-500">
                                    +{mappedDueItems.length - 3}
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[8px] sm:text-[10px] font-black text-orange-600 uppercase leading-none">Due Cyl</span>
                            <span className="text-[10px] sm:text-sm font-bold text-slate-700 leading-none">{totalDueCylinders}</span>
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-6 sm:h-8 px-1.5 sm:px-2 border-orange-200 text-orange-600 hover:bg-orange-50 font-black text-[8px] sm:text-xs uppercase rounded-[4px] sm:rounded-md"
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
