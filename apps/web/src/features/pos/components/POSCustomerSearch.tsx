import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface POSCustomerSearchProps {
    phone: string;
    onPhoneChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    filteredCustomers: any[];
    onSelectExisting: (customer: any) => void;
    showDropdown: boolean;
    setShowDropdown: (show: boolean) => void;
    wrapperRef: React.RefObject<HTMLDivElement>;
    onClear: () => void;
}

export const POSCustomerSearch = ({
    phone,
    onPhoneChange,
    filteredCustomers,
    onSelectExisting,
    showDropdown,
    setShowDropdown,
    wrapperRef,
    onClear
}: POSCustomerSearchProps) => {
    return (
        <div className="space-y-0.5 sm:space-y-1 relative" ref={wrapperRef}>
            <label className="text-[10px] sm:text-sm font-bold text-slate-600 uppercase">Mobile Number (Primary)</label>
            <div className="relative">
                <Search className="absolute left-3 sm:left-4 top-2.5 sm:top-3.5 h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
                <Input
                    placeholder="017..."
                    value={phone}
                    onChange={onPhoneChange}
                    className="pl-9 sm:pl-11 pr-9 sm:pr-11 h-12 border border-slate-200 sm:border-2 font-black text-base sm:text-xl rounded-lg sm:rounded-xl bg-slate-50/50"
                    onFocus={() => setShowDropdown(true)}
                />
               {phone && (
                    <Button
                        type="button"
                        variant="ghost"
                         size="icon"
                         className="absolute right-1 sm:right-1.5 top-1 sm:top-1.5 h-8 w-8 sm:h-9 sm:w-9 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md sm:rounded-lg active:scale-90 transition-all"
                         onClick={(e) => {
                             e.preventDefault();
                             e.stopPropagation();
                             onClear();
                         }}
                     >
                         <X size={16} className="sm:w-5 sm:h-5" />
                     </Button>
               )}
            </div>

            {/* Dropdown */}
            {showDropdown && filteredCustomers.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border-2 border-slate-200 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                    {filteredCustomers.map(c => {
                        const cylinderCount = c.dueCylinders?.reduce((sum: number, d: any) => sum + d.quantity, 0) || 0;
                        return (
                             <div
                                 key={c._id}
                                 className="p-2 sm:p-3 border-b last:border-0 hover:bg-slate-50 cursor-pointer flex justify-between items-center transition-colors"
                                 onClick={() => onSelectExisting(c)}
                             >
                                 <div className="flex-1 min-w-0 pr-2">
                                     <div className="font-bold text-sm sm:text-base text-slate-800 truncate">{c.phone}</div>
                                     <div className="text-[10px] sm:text-xs text-slate-500 truncate">{c.name}</div>
                                 </div>

                                <div className="flex items-center gap-2 shrink-0 mr-3">
                                    {c.totalDue > 0 && (
                                        <div className="text-right">
                                            <div className="text-[9px] font-bold text-red-400 uppercase leading-none">Due</div>
                                            <div className="text-xs font-black text-red-600">৳{c.totalDue}</div>
                                        </div>
                                    )}
                                    {cylinderCount > 0 && (
                                        <div className="text-right border-l pl-2 border-slate-100">
                                            <div className="text-[9px] font-bold text-amber-500 uppercase leading-none">Cyl</div>
                                            <div className="text-xs font-black text-amber-600">{cylinderCount}</div>
                                        </div>
                                    )}
                                </div>

                                <div className="text-xs font-bold px-2 py-1 bg-slate-100 rounded text-slate-600 shrink-0">
                                    Select
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {showDropdown && phone.length > 3 && filteredCustomers.length === 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border-2 border-blue-200 rounded-lg shadow-xl p-3 text-sm text-blue-700 font-medium">
                    No existing matching customer. A new one will be created.
                </div>
            )}
        </div>
    );
};
