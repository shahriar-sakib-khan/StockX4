import { Input } from '@/components/ui/input';

interface POSCustomerFormFieldsProps {
    transactionMode: 'retail' | 'wholesale';
    name: string;
    setName: (val: string) => void;
    ownerName: string;
    setOwnerName: (val: string) => void;
    address: string;
    setAddress: (val: string) => void;
    district: string;
    setDistrict: (val: string) => void;
    disabled?: boolean;
}

export const POSCustomerFormFields = ({
    transactionMode,
    name,
    setName,
    ownerName,
    setOwnerName,
    address,
    setAddress,
    district,
    setDistrict,
    disabled = false
}: POSCustomerFormFieldsProps) => {
    if (transactionMode === 'wholesale') {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1.5 sm:space-y-2">
                    <label className="text-xs sm:text-sm font-bold text-slate-600 uppercase">Shop Name</label>
                    <Input
                        placeholder="Enter shop name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="h-12 bg-slate-50 border border-slate-200 sm:border-2 font-black text-sm sm:text-base rounded-lg sm:rounded-xl px-3 sm:px-4"
                        disabled={disabled}
                    />
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                    <label className="text-xs sm:text-sm font-bold text-slate-600 uppercase">Owner Name</label>
                    <Input
                        placeholder="Enter owner name"
                        value={ownerName}
                        onChange={(e) => setOwnerName(e.target.value)}
                        className="h-12 bg-slate-50 border border-slate-200 sm:border-2 font-black text-sm sm:text-base rounded-lg sm:rounded-xl px-3 sm:px-4"
                        disabled={disabled}
                    />
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                    <label className="text-xs sm:text-sm font-bold text-slate-600 uppercase">District</label>
                    <Input
                        placeholder="e.g. Dhaka"
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        className="h-12 bg-slate-50 border border-slate-200 sm:border-2 font-black text-sm sm:text-base rounded-lg sm:rounded-xl px-3 sm:px-4"
                        disabled={disabled}
                    />
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                    <label className="text-xs sm:text-sm font-bold text-slate-600 uppercase">Address (Req)</label>
                    <Input
                        placeholder="Shop address (Required)"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="h-12 bg-slate-50 border border-slate-200 sm:border-2 font-black text-sm sm:text-base rounded-lg sm:rounded-xl px-3 sm:px-4"
                        disabled={disabled}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-1.5 sm:space-y-2 md:col-span-2">
                <label className="text-xs sm:text-sm font-bold text-slate-600 uppercase">Customer Name</label>
                <Input
                    placeholder="Enter customer name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-12 bg-slate-50 border border-slate-200 sm:border-2 font-black text-sm sm:text-base rounded-lg sm:rounded-xl px-3 sm:px-4"
                    disabled={disabled}
                />
            </div>
            <div className="space-y-1.5 sm:space-y-2 md:col-span-2">
                <label className="text-xs sm:text-sm font-bold text-slate-600 uppercase">Address (Opt)</label>
                <Input
                    placeholder="Customer address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="h-12 bg-slate-50 border border-slate-200 sm:border-2 font-black text-sm sm:text-base rounded-lg sm:rounded-xl px-3 sm:px-4"
                    disabled={disabled}
                />
            </div>
        </div>
    );
};
