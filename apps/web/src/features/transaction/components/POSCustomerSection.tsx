import { useState, useMemo, useEffect, useRef } from 'react';
import { usePosStore } from '../stores/pos.store';
import { useCustomers, useCreateCustomer, useUpdateCustomer } from '@/features/customer/hooks/useCustomers';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Search, User, Store, ArrowRight, FileText } from 'lucide-react';

interface POSCustomerSectionProps {
    storeId: string;
}

export const POSCustomerSection = ({ storeId }: POSCustomerSectionProps) => {
    const { transactionMode, setCustomer } = usePosStore();
    const { data: customers } = useCustomers(storeId);
    const createCustomer = useCreateCustomer();
    const updateCustomer = useUpdateCustomer();
    const navigate = useNavigate();

    // Form state
    const [phone, setPhone] = useState('');
    const [name, setName] = useState('');
    const [ownerName, setOwnerName] = useState('');
    const [address, setAddress] = useState('');
    const [district, setDistrict] = useState('');

    // Existing customer tracking
    const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Filter relevant customers based on mode and phone input
    const filteredCustomers = useMemo(() => {
        if (!customers) return [];
        const modeMatched = customers.filter(c =>
            transactionMode === 'wholesale' ? c.type === 'wholesale' : (!c.type || c.type === 'retail')
        );

        if (!phone) return [];
        return modeMatched
            .filter(c => c.phone?.includes(phone))
            // Lexicographical sort by phone number
            .sort((a, b) => (a.phone || '').localeCompare(b.phone || ''));
    }, [customers, transactionMode, phone]);

    // Handle clicks outside dropdown to close it
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // When a customer is selected from the dropdown
    const handleSelectExisting = (customer: any) => {
        setPhone(customer.phone || '');
        setName(customer.name || '');
        setOwnerName(customer.ownerName || '');
        setAddress(customer.address || '');
        setDistrict(customer.district || '');
        setSelectedCustomerId(customer._id);
        setShowDropdown(false);
    };

    // When the phone number is changed manually
    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setPhone(value);
        setShowDropdown(true);

        // If they edit the phone, clear the "selected" lock if it differs
        if (selectedCustomerId) {
            const selectedCust = customers?.find(c => c._id === selectedCustomerId);
            if (selectedCust && selectedCust.phone !== value) {
                setSelectedCustomerId(null);
            }
        }
    };

    const handleNext = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!phone || phone.length < 11) {
            toast.error("Please enter a valid 11-digit phone number");
            return;
        }

        if (!name) {
            toast.error("Name is required");
            return;
        }

        const isWholesale = transactionMode === 'wholesale';

        // Payload based on mode
        const payload: any = {
            type: isWholesale ? 'wholesale' : 'retail',
            phone,
            name,
            address,
        };

        if (isWholesale) {
            payload.ownerName = ownerName;
            payload.district = district;
        }

        const proceedToCheckout = (customObj: any) => {
            setCustomer({
                id: customObj._id,
                name: customObj.name,
                type: 'Customer'
            });
            window.scrollTo({ top: 0, behavior: 'instant' });
            navigate(`/stores/${storeId}/pos/checkout`);
        };

        if (selectedCustomerId) {
            // Already an existing customer. Just proceed.
            // If they changed the name/address, we could update it.
            const existing = customers?.find(c => c._id === selectedCustomerId);
            if (existing && (existing.name !== name || existing.address !== address || existing.ownerName !== ownerName || existing.district !== district)) {
                updateCustomer.mutate({ id: selectedCustomerId, data: payload }, {
                    onSuccess: (data: any) => {
                        proceedToCheckout(data.customer || existing);
                    }
                });
            } else {
                proceedToCheckout(existing);
            }
        } else {
            // New customer
            createCustomer.mutate(payload, {
                onSuccess: (data: any) => {
                    toast.success("New customer created successfully");
                    // Assuming response has the created customer in `data.customer`
                    proceedToCheckout(data.customer || data);
                }
            });
        }
    };

    const handleViewCustomers = () => {
        navigate(`/stores/${storeId}/customers`);
    };

    const selectedCustomer = selectedCustomerId ? customers?.find(c => c._id === selectedCustomerId) : null;
    const dueAmount = selectedCustomer?.totalDue || 0;

    return (
        <div id="pos-customer-section" className="mt-6 pt-6 pb-12 border-t-2 border-dashed border-slate-300 w-full shrink-0">
            <div className="flex items-center justify-between mb-6">
                 <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                    {transactionMode === 'wholesale' ? <Store className="text-emerald-600" /> : <User className="text-indigo-600" />}
                    Customer Information
                 </h2>
                 <Button variant="outline" size="sm" onClick={handleViewCustomers} className="shadow-sm font-bold text-slate-600 flex items-center gap-1">
                     <FileText size={16} /> All Customers
                 </Button>
            </div>

             <div className="bg-white p-6 rounded-xl border-2 border-slate-200 shadow-sm max-w-2xl mx-auto">
                 <form onSubmit={handleNext} className="space-y-6">
                    {/* Phone Number Field with Autocomplete */}
                    <div className="space-y-1 relative" ref={wrapperRef}>
                        <label className="text-sm font-bold text-slate-600 uppercase">Mobile Number (Primary)</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="017..."
                                value={phone}
                                onChange={handlePhoneChange}
                                className="pl-9 h-11 border-2 font-bold text-lg"
                                onFocus={() => setShowDropdown(true)}
                            />
                        </div>

                        {/* Dropdown */}
                        {showDropdown && filteredCustomers.length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-white border-2 border-slate-200 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                                {filteredCustomers.map(c => (
                                    <div
                                        key={c._id}
                                        className="p-3 border-b last:border-0 hover:bg-slate-50 cursor-pointer flex justify-between items-center transition-colors"
                                        onClick={() => handleSelectExisting(c)}
                                    >
                                        <div>
                                            <div className="font-bold text-slate-800">{c.phone}</div>
                                            <div className="text-xs text-slate-500">{c.name}</div>
                                        </div>
                                        <div className="text-xs font-bold px-2 py-1 bg-slate-100 rounded text-slate-600">
                                            Select
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {showDropdown && phone.length > 3 && filteredCustomers.length === 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-white border-2 border-blue-200 rounded-lg shadow-xl p-3 text-sm text-blue-700 font-medium">
                                No existing matching customer. A new one will be created.
                            </div>
                        )}
                    </div>

                    {/* Customer Details - Autofilled or Manual */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1 md:col-span-2">
                            <label className="text-sm font-bold text-slate-600 uppercase">
                                {transactionMode === 'wholesale' ? 'Shop Name' : 'Customer Name'}
                            </label>
                            <Input
                                placeholder={transactionMode === 'wholesale' ? 'Enter shop name' : 'Enter customer name'}
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="h-11 bg-slate-50 border-2"
                            />
                        </div>

                        {transactionMode === 'wholesale' && (
                            <>
                                <div className="space-y-1">
                                    <label className="text-sm font-bold text-slate-600 uppercase">Owner Name</label>
                                    <Input
                                        placeholder="Enter owner name"
                                        value={ownerName}
                                        onChange={(e) => setOwnerName(e.target.value)}
                                        className="h-11 bg-slate-50 border-2"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-bold text-slate-600 uppercase">District</label>
                                    <Input
                                        placeholder="e.g. Dhaka"
                                        value={district}
                                        onChange={(e) => setDistrict(e.target.value)}
                                        className="h-11 bg-slate-50 border-2"
                                    />
                                </div>
                            </>
                        )}

                        <div className="space-y-1 md:col-span-2">
                            <label className="text-sm font-bold text-slate-600 uppercase">Address (Optional)</label>
                            <Input
                                placeholder="Customer address"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                className="h-11 bg-slate-50 border-2"
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex justify-between items-center border-t border-slate-100 mt-4">
                        <div className="flex flex-col">
                            {selectedCustomer ? (
                                <>
                                    <span className="text-xs font-bold text-slate-500 uppercase">Current Due</span>
                                    <span className={`text-2xl font-black ${dueAmount > 0 ? 'text-amber-500' : 'text-slate-700'}`}>
                                        ৳{dueAmount}
                                    </span>
                                </>
                            ) : (
                                <span className="text-sm font-bold text-slate-400">New Customer</span>
                            )}
                        </div>

                        <Button
                            type="submit"
                            className="w-full md:w-auto h-12 px-8 font-black uppercase tracking-wider text-base shadow-md bg-green-600 hover:bg-green-700"
                            disabled={createCustomer.isPending || updateCustomer.isPending}
                        >
                            {createCustomer.isPending || updateCustomer.isPending ? 'Processing...' : 'Next \u2192'}
                        </Button>
                    </div>
                 </form>
             </div>
        </div>
    );
};
