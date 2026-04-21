import { useState, useMemo, useEffect, useRef } from 'react';
import { usePosStore } from '../stores/pos.store';
import { useCustomers, useCreateCustomer, useUpdateCustomer } from '@/features/customer/hooks/useCustomers';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { User, Store, FileText, PackageMinus, PackagePlus } from 'lucide-react';
import { POSCustomerModal } from './POSCustomerModal';
import { DueCylinderModal } from './DueCylinderModal';
import { POSCustomerSearch } from './POSCustomerSearch';
import { POSCustomerFormFields } from './POSCustomerFormFields';
import { POSCustomerDueInfo } from './POSCustomerDueInfo';
import { useProducts } from '@/features/product/hooks/useProducts';
import { useCreateTransaction } from '../api/transaction.api';
import { AllocatedDue } from '../stores/pos.types';
import { cn } from '@/lib/utils';

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
                    proceedToCheckout(newCust);
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
            const stagedSelection = settledDueCylinders.find(s => s.productId === due.productId);
            return {
                productId: due.productId,
                brandName: due.brandName,
                quantity: 0, 
                maxQty: due.quantity,
                selectedQty: stagedSelection ? stagedSelection.selectedQty : 0,
                image: due.image || product?.image,
                size: due.size || product?.size,
                regulator: due.regulator || product?.regulator
            };
        });
    }, [dueCylinders, products, settledDueCylinders]);

    const { getIsBalanced, setDueModalOpen, saleItems, returnItems, allocatedDueCylinders: cartDueCylinders } = usePosStore();
    const isBalanced = getIsBalanced();
    const isCartEmpty = saleItems.length === 0 && returnItems.length === 0 && cartDueCylinders.length === 0;

    return (
        <div id="pos-customer-section" className="mt-4 sm:mt-8 pt-4 sm:pt-8 pb-6 sm:pb-12 border-t-2 border-dashed border-slate-300 w-full shrink-0 relative">
            
            {/* === PREMIUM TOP HEADER === */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-4 sm:mb-6 gap-4">
                 
                 {/* Title & Mode Switcher */}
                 <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 w-full lg:w-auto">
                    <h2 className="text-base sm:text-xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-2 shrink-0">
                        {transactionMode === 'wholesale' ? <Store size={20} className="text-emerald-600" /> : <User size={20} className="text-indigo-600" />}
                        Customer Info
                    </h2>

                    {/* Native App Style Segmented Control */}
                    <div className="flex items-center bg-slate-100/80 border border-slate-200/60 rounded-xl p-1 gap-1 w-full sm:w-[260px] h-10 sm:h-12 shadow-inner shrink-0">
                        <button
                            type="button"
                            className={cn(
                                "flex-1 h-full flex items-center justify-center text-[10px] sm:text-[11px] font-black rounded-lg uppercase tracking-widest transition-all duration-200",
                                transactionMode === 'wholesale' 
                                    ? "bg-white text-emerald-600 shadow-sm border border-slate-200/50 scale-[1.02]" 
                                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                            )}
                            onClick={() => {
                                setTransactionMode('wholesale');
                                setPhone(''); setName(''); setOwnerName(''); setAddress(''); setDistrict(''); setSelectedCustomerId(null);
                            }}
                        >
                            Wholesale
                        </button>
                        <button
                            type="button"
                            className={cn(
                                "flex-1 h-full flex items-center justify-center text-[10px] sm:text-[11px] font-black rounded-lg uppercase tracking-widest transition-all duration-200",
                                transactionMode === 'retail' 
                                    ? "bg-white text-indigo-600 shadow-sm border border-slate-200/50 scale-[1.02]" 
                                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                            )}
                            onClick={() => {
                                setTransactionMode('retail');
                                setPhone(''); setName(''); setOwnerName(''); setAddress(''); setDistrict(''); setSelectedCustomerId(null);
                            }}
                        >
                            Retail
                        </button>
                    </div>
                 </div>

                 {/* Select Existing Button */}
                 <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleViewCustomers} 
                    className="w-full lg:w-auto h-10 sm:h-12 px-6 shadow-sm font-black text-slate-700 flex items-center justify-center gap-2 rounded-xl active:scale-95 border-slate-200 hover:bg-slate-50 uppercase text-[10px] sm:text-[11px] tracking-widest shrink-0"
                 >
                     <FileText size={16} /> Select Existing
                 </Button>
            </div>

            {/* === DYNAMIC INLINE STATES === */}
            <div className="w-full mx-auto transition-all duration-500">
                
                {isCartEmpty ? (
                    
                    /* --- INLINE EMPTY STATE (Short & Clean) --- */
                    <div className="flex flex-col items-center justify-center py-8 sm:py-12 px-4 bg-slate-50/60 border border-slate-200/80 rounded-2xl shadow-sm text-center">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-full flex items-center justify-center mb-3 sm:mb-4 shadow-sm border border-slate-100">
                            <PackagePlus className="w-6 h-6 sm:w-8 sm:h-8 text-slate-400" />
                        </div>
                        <h3 className="text-sm sm:text-lg font-black text-slate-700 mb-1 uppercase tracking-tight">Cart is Empty</h3>
                        <p className="text-slate-500 font-bold text-[10px] sm:text-[12px] leading-relaxed max-w-[260px] sm:max-w-md mx-auto">
                            Please add items to your cart before entering customer details or checking out.
                        </p>
                    </div>

                ) : !isBalanced ? (

                    /* --- INLINE UNBALANCED STATE (Short & Clean) --- */
                    <div className="flex flex-col items-center justify-center py-8 sm:py-12 px-4 bg-red-50/40 border border-red-100/80 rounded-2xl shadow-sm text-center">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-full flex items-center justify-center mb-3 sm:mb-4 shadow-sm border border-red-100">
                            <PackageMinus className="w-6 h-6 sm:w-8 sm:h-8 text-red-500" />
                        </div>
                        <h3 className="text-sm sm:text-lg font-black text-slate-800 mb-1 uppercase tracking-tight">Returns Unbalanced</h3>
                        <p className="text-slate-600 font-bold text-[10px] sm:text-[12px] leading-relaxed mb-4 sm:mb-6 max-w-[280px] sm:max-w-md mx-auto">
                            Cylinder Sell count and Return count must be exactly equal before you can proceed.
                        </p>
                        <Button 
                            type="button"
                            onClick={() => setDueModalOpen(true)}
                            className="w-full sm:w-auto px-8 bg-red-500 hover:bg-red-600 text-white font-black uppercase tracking-widest text-[10px] sm:text-[12px] h-10 sm:h-12 rounded-xl shadow-md transition-all active:scale-95"
                        >
                            Add Due Cylinders
                        </Button>
                    </div>

                ) : (

                    /* --- ACTUAL FORM (Expands Organically) --- */
                    <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <form onSubmit={handleNext} className="space-y-4 sm:space-y-6">
                            
                            <POSCustomerSearch
                                phone={phone}
                                onPhoneChange={handlePhoneChange}
                                filteredCustomers={filteredCustomers}
                                onSelectExisting={handleSelectExisting}
                                showDropdown={showDropdown}
                                setShowDropdown={setShowDropdown}
                                wrapperRef={wrapperRef}
                                onClear={() => {
                                    setPhone(''); setName(''); setOwnerName(''); setAddress(''); setDistrict(''); setSelectedCustomerId(null); setCustomer(null);
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

                            {/* Bottom Due Info & Checkout Action */}
                            <div className="pt-4 flex flex-col sm:flex-row justify-between items-stretch sm:items-center border-t border-slate-100 mt-4 gap-4">
                                <POSCustomerDueInfo
                                    selectedCustomer={selectedCustomer}
                                    dueAmount={dueAmount}
                                    totalDueCylinders={totalDueCylinders}
                                    mappedDueItems={mappedDueItems}
                                    onReturnClick={() => setIsDueSettlementOpen(true)}
                                />

                                <Button
                                    type="submit"
                                    className="w-full sm:w-auto h-12 px-8 font-black uppercase tracking-widest text-[11px] sm:text-[13px] bg-emerald-500 hover:bg-emerald-600 text-white shadow-[0_4px_14px_-4px_rgba(16,185,129,0.4)] transition-all duration-300 active:scale-95 rounded-xl shrink-0"
                                    disabled={createCustomer.isPending || updateCustomer.isPending}
                                >
                                    {createCustomer.isPending || updateCustomer.isPending
                                        ? 'Processing...'
                                        : selectedCustomerId
                                            ? 'Checkout \u2192'
                                            : 'Create & Checkout \u2192'}
                                </Button>
                            </div>
                        </form>
                    </div>

                )}

            </div>

            {/* Modals */}
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
    );
};