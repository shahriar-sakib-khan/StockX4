import { useState, useMemo, useEffect, useRef } from 'react';
import { usePosStore } from '../stores/pos.store';
import { useCustomers, useCreateCustomer, useUpdateCustomer } from '@/features/customer/hooks/useCustomers';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { User, Store, FileText, PackageMinus } from 'lucide-react';
import { POSCustomerModal } from './POSCustomerModal';
import { DueCylinderModal } from './DueCylinderModal';
import { POSCustomerSearch } from './POSCustomerSearch';
import { POSCustomerFormFields } from './POSCustomerFormFields';
import { POSCustomerDueInfo } from './POSCustomerDueInfo';
import { useProducts } from '@/features/product/hooks/useProducts';
import { useCreateTransaction } from '../api/transaction.api';
import { ChevronRight, PackagePlus } from 'lucide-react';
import { AllocatedDue } from '../stores/pos.types';

interface POSCustomerSectionProps {
    storeId: string;
}

export const POSCustomerSection = ({ storeId }: POSCustomerSectionProps) => {
    const { transactionMode, setTransactionMode, setCustomer } = usePosStore();
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
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDueSettlementOpen, setIsDueSettlementOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const { data: products } = useProducts(storeId);
    const settleTransaction = useCreateTransaction();

    // Filter relevant customers based on mode
    const modeFilteredCustomers = useMemo(() => {
        if (!customers) return [];
        return customers.filter(c =>
            transactionMode === 'wholesale' ? c.type === 'wholesale' : (!c.type || c.type === 'retail')
        );
    }, [customers, transactionMode]);

    // Filter relevant customers based on phone input for autocomplete
    const filteredCustomers = useMemo(() => {
        if (!phone) return modeFilteredCustomers.slice(0, 50); // Show top 50 if empty
        return modeFilteredCustomers
            .filter(c => c.phone?.includes(phone))
            // Lexicographical sort by phone number
            .sort((a, b) => (a.phone || '').localeCompare(b.phone || ''));
    }, [modeFilteredCustomers, phone]);

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

        // Immediate selection for transaction
        setCustomer({
            id: customer._id,
            name: customer.name,
            type: customer.type || (transactionMode === 'wholesale' ? 'wholesale' : 'retail'),
            phone: customer.phone,
            address: customer.address
        });
        toast.success(`Selected customer: ${customer.name}`);
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
                setCustomer(null); // Clear from store as well
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

        if (isWholesale && !address) {
            toast.error("Shop address is required for wholesale");
            return;
        }

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
                type: customObj.type || (transactionMode === 'wholesale' ? 'wholesale' : 'retail'),
                phone: customObj.phone,
                address: customObj.address
            });

            // Navigate to checkout
            window.scrollTo({ top: 0, behavior: 'smooth' });
            navigate(`/stores/${storeId}/pos/checkout`);
        };

        if (selectedCustomerId) {
            // Already an existing customer. Just proceed.
            const existing = customers?.find(c => c._id === selectedCustomerId);
            // Update if details changed
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
            // Create New Customer case
            createCustomer.mutate(payload, {
                onSuccess: (data: any) => {
                    const newCust = data.customer || data;
                    toast.success("New customer created successfully");

                    // Mark as selected but DON'T navigate yet
                    // This changes the button to "Go to checkout"
                    setPhone(newCust.phone);
                    setSelectedCustomerId(newCust._id);
                    setCustomer({
                        id: newCust._id,
                        name: newCust.name,
                        type: newCust.type || (transactionMode === 'wholesale' ? 'wholesale' : 'retail'),
                        phone: newCust.phone,
                        address: newCust.address
                    });
                }
            });
        }
    };

    const { settledDueCylinders, setSettledDueCylinders } = usePosStore();

    const handleSettleDue = (allocated: AllocatedDue[]) => {
        setSettledDueCylinders(allocated);
        setIsDueSettlementOpen(false);
    };

    const handleViewCustomers = () => {
        setIsModalOpen(true);
    };

    const selectedCustomer = selectedCustomerId ? customers?.find(c => c._id === selectedCustomerId) : null;
    const dueAmount = selectedCustomer?.totalDue || 0;
    const dueCylinders = selectedCustomer?.dueCylinders || [];
    const totalDueCylinders = dueCylinders.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0;

    // Map customer due cylinders to AllocatedDue format for the modal
    const mappedDueItems: AllocatedDue[] = useMemo(() => {
        return dueCylinders.map((due: any) => {
            const product = products?.find((p: any) => p._id === due.productId);
            // Restore selection if already staged in store
            const stagedSelection = settledDueCylinders.find(s => s.productId === due.productId);
            return {
                productId: due.productId,
                brandName: due.brandName,
                quantity: 0, // not used in this mode
                maxQty: due.quantity,
                selectedQty: stagedSelection ? stagedSelection.selectedQty : 0,
                image: due.image || product?.image,
                size: due.size || product?.size,
                regulator: due.regulator || product?.regulator
            };
        });
    }, [dueCylinders, products, settledDueCylinders]);

    const { getIsBalanced } = usePosStore();
    const isBalanced = getIsBalanced();

    return (
        <div id="pos-customer-section" className="mt-6 pt-6 pb-12 border-t-2 border-dashed border-slate-300 w-full shrink-0 relative">
            <div className="flex items-center justify-between mb-6">
                 <div className="flex items-center gap-4">
                    <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                        {transactionMode === 'wholesale' ? <Store className="text-emerald-600" /> : <User className="text-indigo-600" />}
                        Customer Information
                    </h2>

                    {/* Synced Toggle - Accessible outside restriction */}
                    <div className="flex items-center border rounded-md overflow-hidden bg-slate-100 p-1 gap-0.5 ml-2">
                        <button
                            type="button"
                            className={`px-3 py-1 text-[10px] font-black rounded uppercase transition-all ${transactionMode === 'wholesale' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                            onClick={() => {
                                setTransactionMode('wholesale');
                                setPhone('');
                                setName('');
                                setOwnerName('');
                                setAddress('');
                                setDistrict('');
                                setSelectedCustomerId(null);
                            }}
                        >
                            Wholesale
                        </button>
                        <button
                            type="button"
                            className={`px-3 py-1 text-[10px] font-black rounded uppercase transition-all ${transactionMode === 'retail' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                            onClick={() => {
                                setTransactionMode('retail');
                                setPhone('');
                                setName('');
                                setOwnerName('');
                                setAddress('');
                                setDistrict('');
                                setSelectedCustomerId(null);
                            }}
                        >
                            Retail
                        </button>
                    </div>
                 </div>
                 <Button type="button" variant="outline" size="sm" onClick={handleViewCustomers} className="shadow-sm font-bold text-slate-600 flex items-center gap-1">
                     <FileText size={16} /> Select Existing
                 </Button>
            </div>

            {/* Lock Overlay / Blocker */}
            {!isBalanced && (
                <div className="absolute inset-x-0 bottom-0 top-16 z-50 bg-slate-50/10 backdrop-blur-[2px] flex flex-col items-center justify-center p-6 text-center">
                    <div className="bg-white/90 p-6 rounded-2xl shadow-xl border-2 border-red-200 max-w-md animate-in fade-in zoom-in duration-300">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <PackageMinus className="w-8 h-8 text-red-600" />
                        </div>
                        <h3 className="text-xl font-black text-slate-800 mb-2 uppercase">Returns Unbalanced</h3>
                        <p className="text-slate-600 font-bold text-sm leading-relaxed">
                            Cylinder Sell count and Return count (Empty + Due) must be exactly equal before you can proceed with customer details.
                        </p>
                    </div>
                </div>
            )}

            <div className={`transition-all duration-300 ${!isBalanced ? 'opacity-30 blur-[4px] pointer-events-none select-none' : ''}`}>

             <div className="bg-white p-6 rounded-xl border-2 border-slate-200 shadow-sm max-w-2xl mx-auto">
                 <form onSubmit={handleNext} className="space-y-6">
                    <POSCustomerSearch
                        phone={phone}
                        onPhoneChange={handlePhoneChange}
                        filteredCustomers={filteredCustomers}
                        onSelectExisting={handleSelectExisting}
                        showDropdown={showDropdown}
                        setShowDropdown={setShowDropdown}
                        wrapperRef={wrapperRef}
                        onClear={() => {
                            setPhone('');
                            setName('');
                            setOwnerName('');
                            setAddress('');
                            setDistrict('');
                            setSelectedCustomerId(null);
                            setCustomer(null);
                        }}
                    />

                    <POSCustomerFormFields
                        transactionMode={transactionMode}
                        name={name}
                        setName={setName}
                        ownerName={ownerName}
                        setOwnerName={setOwnerName}
                        address={address}
                        setAddress={setAddress}
                        district={district}
                        setDistrict={setDistrict}
                        disabled={!!selectedCustomerId}
                    />

                    <div className="pt-4 flex justify-between items-center border-t border-slate-100 mt-4">
                        <POSCustomerDueInfo
                            selectedCustomer={selectedCustomer}
                            dueAmount={dueAmount}
                            totalDueCylinders={totalDueCylinders}
                            mappedDueItems={mappedDueItems}
                            onReturnClick={() => setIsDueSettlementOpen(true)}
                        />

                        <Button
                            type="submit"
                            className={`w-full md:w-auto h-12 px-8 font-black uppercase tracking-wider text-base shadow-md transition-all duration-300 ${
                                isBalanced
                                    ? 'bg-green-600 hover:bg-green-700'
                                    : 'bg-amber-500 hover:bg-amber-600 text-white'
                            }`}
                            disabled={createCustomer.isPending || updateCustomer.isPending}
                        >
                            {createCustomer.isPending || updateCustomer.isPending
                                ? 'Processing...'
                                : selectedCustomerId
                                    ? 'Go to checkout \u2192'
                                    : 'Create new customer'}
                        </Button>
                    </div>
                 </form>
             </div>

             <POSCustomerModal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                customers={modeFilteredCustomers}
                onSelect={handleSelectExisting}
             />

             <DueCylinderModal
                isOpen={isDueSettlementOpen}
                onClose={() => setIsDueSettlementOpen(false)}
                title="Settle Due Cylinders"
                mode="SETTLE"
                items={mappedDueItems}
                onConfirm={handleSettleDue}
                confirmLabel="Done"
             />
            </div>
        </div>
    );
};
