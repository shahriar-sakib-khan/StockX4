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
        <div className="space-y-1 relative" ref={wrapperRef}>
            <label className="text-sm font-bold text-slate-600 uppercase">Mobile Number (Primary)</label>
            <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                    placeholder="017..."
                    value={phone}
                    onChange={onPhoneChange}
                    className="pl-9 pr-9 h-11 border-2 font-bold text-lg"
                    onFocus={() => setShowDropdown(true)}
                />
                {phone && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1 h-9 w-9 text-slate-400 hover:text-slate-600 rounded-lg"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onClear();
                        }}
                    >
                        <X size={18} />
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
                                className="p-3 border-b last:border-0 hover:bg-slate-50 cursor-pointer flex justify-between items-center transition-colors"
                                onClick={() => onSelectExisting(c)}
                            >
                                <div className="flex-1 min-w-0 pr-2">
                                    <div className="font-bold text-slate-800 truncate">{c.phone}</div>
                                    <div className="text-xs text-slate-500 truncate">{c.name}</div>
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
