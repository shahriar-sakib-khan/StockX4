import { useState, useMemo } from 'react';
import { useCustomers, useDeleteCustomer } from '@/features/customer/hooks/useCustomers';
import { Button } from '@/components/ui/button';
import { Plus, Trash2,Loader2, MapPin, Phone, User, Store, Edit, Users, Receipt, Building2, PackageMinus, Search, ChevronRight } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { CustomerForm } from '@/features/customer/components/CustomerForm';
import { CustomerDetails } from '@/features/customer/components/CustomerDetails';
import { InfoTooltip } from '@/features/store/components/setup/shared/InfoTooltip';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

type Customer = {
    _id: string;
    name: string;
    phone: string;
    address: string;
    imageUrl?: string;
    totalDue?: number;
    type?: 'retail' | 'wholesale';
    ownerName?: string;
    district?: string;
    dueCylinders?: { quantity: number }[];
};

export const CustomerPage = () => {
    const { data: customers, isLoading } = useCustomers();
    const { mutate: deleteCustomer } = useDeleteCustomer();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
    const [activeTab, setActiveTab] = useState<'retail' | 'wholesale'>('retail');
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredCustomers = customers?.filter((c: Customer) => {
        const matchesTab = activeTab === 'retail' ? (!c.type || c.type === 'retail') : c.type === 'wholesale';
        const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.phone.includes(searchQuery);
        return matchesTab && matchesSearch;
    });

    const metrics = useMemo(() => {
        if (!customers) return { retail: 0, wholesale: 0, totalDues: 0 };
        return customers.reduce((acc: any, c: Customer) => {
            if (c.type === 'wholesale') acc.wholesale++;
            else acc.retail++;
            if (c.totalDue) acc.totalDues += c.totalDue;
            return acc;
        }, { retail: 0, wholesale: 0, totalDues: 0 });
    }, [customers]);

    return (
        <div className="w-full pb-20 sm:pb-12 animate-in fade-in duration-300">
            
            {/* === COMPACT MOBILE HEADER === */}
            <div className="flex justify-between items-start sm:items-center mb-4 sm:mb-8 px-1">
                <div className="flex flex-col gap-0.5 sm:gap-1">
                    <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight uppercase flex items-center gap-2">
                        Partners
                        <InfoTooltip content="View and manage your customer list, wholesale partners, and track outstanding dues." />
                    </h3>
                    <p className="text-[9px] sm:text-xs font-bold text-slate-500 leading-tight">
                        Manage B2B/B2C relationships.
                    </p>
                </div>
                {/* THE FIX: Sleek Add Button instead of massive full-width block */}
                <Button 
                    onClick={() => setIsCreateOpen(true)} 
                    className="h-9 sm:h-12 px-3 sm:px-6 rounded-lg sm:rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest text-[9px] sm:text-[11px] shadow-sm sm:shadow-md transition-all active:scale-95 shrink-0"
                >
                    <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-2" /> 
                    <span className="hidden sm:inline">Add Entity</span>
                    <span className="sm:hidden ml-1">Add</span>
                </Button>
            </div>

            {/* === ULTRA-DENSE MOBILE METRICS === */}
            <div className="grid grid-cols-3 gap-2 sm:gap-5 mb-5 sm:mb-8">
                {/* Retail Metric */}
                <div className="bg-white border-t-2 sm:border-t-4 border-indigo-500 border-x border-b border-slate-200 rounded-xl sm:rounded-2xl p-2.5 sm:p-5 flex flex-col shadow-sm">
                    <div className="flex items-center justify-between mb-1 sm:mb-4">
                        <span className="text-[7px] sm:text-[10px] font-black uppercase tracking-widest text-indigo-500 truncate">Retail</span>
                        {/* Hidden on mobile, visible on desktop */}
                        <div className="hidden sm:flex w-8 h-8 rounded-lg bg-indigo-50 items-center justify-center shrink-0">
                            <Users className="w-4 h-4 text-indigo-600" />
                        </div>
                    </div>
                    <span className="text-base sm:text-3xl font-black text-slate-900 leading-none truncate">{metrics.retail}</span>
                </div>

                {/* Wholesale Metric */}
                <div className="bg-white border-t-2 sm:border-t-4 border-sky-500 border-x border-b border-slate-200 rounded-xl sm:rounded-2xl p-2.5 sm:p-5 flex flex-col shadow-sm">
                    <div className="flex items-center justify-between mb-1 sm:mb-4">
                        <span className="text-[7px] sm:text-[10px] font-black uppercase tracking-widest text-sky-500 truncate">Wholesale</span>
                        <div className="hidden sm:flex w-8 h-8 rounded-lg bg-sky-50 items-center justify-center shrink-0">
                            <Store className="w-4 h-4 text-sky-600" />
                        </div>
                    </div>
                    <span className="text-base sm:text-3xl font-black text-slate-900 leading-none truncate">{metrics.wholesale}</span>
                </div>

                {/* Dues Metric */}
                <div className="bg-white border-t-2 sm:border-t-4 border-rose-500 border-x border-b border-slate-200 rounded-xl sm:rounded-2xl p-2.5 sm:p-5 flex flex-col shadow-sm">
                    <div className="flex items-center justify-between mb-1 sm:mb-4">
                        <span className="text-[7px] sm:text-[10px] font-black uppercase tracking-widest text-rose-500 truncate">Dues</span>
                        <div className="hidden sm:flex w-8 h-8 rounded-lg bg-rose-50 items-center justify-center shrink-0">
                            <Receipt className="w-4 h-4 text-rose-600" />
                        </div>
                    </div>
                    <span className="text-base sm:text-3xl font-black text-rose-600 leading-none truncate">
                        ৳{metrics.totalDues > 9999 ? `${(metrics.totalDues/1000).toFixed(1)}k` : metrics.totalDues.toLocaleString()}
                    </span>
                </div>
            </div>

            {/* === CONTROLS (Tabs & Search) === */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-5 sm:mb-6">
                {/* Premium Segmented Control */}
                <div className="flex bg-slate-100/80 p-1 sm:p-1.5 rounded-xl w-full sm:w-[320px] border border-slate-200/60 shrink-0 shadow-inner">
                    <button
                        onClick={() => setActiveTab('retail')}
                        className={cn(
                            "flex-1 py-1.5 sm:py-2.5 px-3 text-[9px] sm:text-xs font-black rounded-lg transition-all uppercase tracking-widest flex items-center justify-center gap-1.5",
                            activeTab === 'retail' ? "bg-white text-indigo-600 shadow-sm border border-slate-200/50" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                        )}
                    >
                        <User className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Retail
                    </button>
                    <button
                        onClick={() => setActiveTab('wholesale')}
                        className={cn(
                            "flex-1 py-1.5 sm:py-2.5 px-3 text-[9px] sm:text-xs font-black rounded-lg transition-all uppercase tracking-widest flex items-center justify-center gap-1.5",
                            activeTab === 'wholesale' ? "bg-white text-sky-600 shadow-sm border border-slate-200/50" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                        )}
                    >
                        <Store className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Wholesale
                    </button>
                </div>

                {/* Search Bar */}
                <div className="relative flex-1">
                    <Search className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
                    <Input 
                        placeholder={`Search ${activeTab}ers...`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-10 sm:h-12 w-full pl-9 sm:pl-11 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 shadow-sm hover:border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all text-xs sm:text-sm"
                    />
                </div>
            </div>

            {/* === CUSTOMER LIST === */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 animate-spin text-indigo-500 mb-4" />
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] sm:text-xs">Loading Directory...</p>
                </div>
            ) : filteredCustomers?.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 sm:py-20 px-4 text-center bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm">
                    <div className="bg-slate-50 p-4 sm:p-5 rounded-full mb-3 sm:mb-4 border border-slate-100">
                        {activeTab === 'wholesale' ? <Store className="w-6 h-6 sm:w-8 sm:h-8 text-slate-300" /> : <User className="w-6 h-6 sm:w-8 sm:h-8 text-slate-300" />}
                    </div>
                    <h3 className="font-black text-base sm:text-lg text-slate-800 tracking-tight">No {activeTab} partners found</h3>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">Try adjusting your search.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    {filteredCustomers?.map((customer: Customer) => (
                        <div
                            key={customer._id}
                            onClick={() => setSelectedCustomerId(customer._id)}
                            className="group flex flex-col bg-white border border-slate-200 rounded-2xl hover:shadow-md hover:border-indigo-200 transition-all duration-200 cursor-pointer active:scale-[0.99] overflow-hidden"
                        >
                            {/* Card Header */}
                            <div className="p-3.5 sm:p-5 flex items-start gap-3 sm:gap-4">
                                {/* Avatar */}
                                <div className={cn(
                                    "w-10 h-10 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center shrink-0 border shadow-sm transition-colors",
                                    activeTab === 'wholesale' ? "bg-sky-50 border-sky-100 text-sky-500 group-hover:bg-sky-100" : "bg-indigo-50 border-indigo-100 text-indigo-500 group-hover:bg-indigo-100"
                                )}>
                                    {activeTab === 'wholesale' ? <Store className="w-5 h-5 sm:w-6 sm:h-6" /> : <User className="w-5 h-5 sm:w-6 sm:h-6" />}
                                </div>

                                {/* Identity */}
                                <div className="flex flex-col min-w-0 flex-1 mt-0.5">
                                    <h4 className="font-black text-sm sm:text-xl text-slate-900 tracking-tight leading-none truncate mb-1 sm:mb-1.5 uppercase">
                                        {customer.name}
                                    </h4>
                                    <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-slate-500 font-bold">
                                        <Phone className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                        <span className="truncate">{customer.phone}</span>
                                    </div>
                                </div>

                                {/* Hover Actions (Desktop) */}
                                <div className="flex items-center gap-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                                     <button 
                                        className="p-1.5 sm:p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                        onClick={(e) => { e.stopPropagation(); setEditingCustomer(customer); }}
                                     >
                                         <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                     </button>
                                     <button 
                                        className="p-1.5 sm:p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                        onClick={(e) => { e.stopPropagation(); setDeleteTarget(customer._id); }}
                                     >
                                         <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                     </button>
                                </div>
                            </div>

                            {/* Card Middle (Context Details) */}
                            <div className="px-3.5 sm:px-5 pb-3.5 sm:pb-4 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                                <div className="flex items-start gap-2 bg-slate-50 p-2 sm:p-2.5 rounded-xl border border-slate-100">
                                    <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 shrink-0 mt-0.5" />
                                    <span className="text-[10px] sm:text-[11px] font-bold text-slate-600 leading-snug line-clamp-2">
                                        {customer.address || 'Address not provided'}
                                    </span>
                                </div>
                                {activeTab === 'wholesale' && (
                                    <div className="flex items-start gap-2 bg-sky-50/50 p-2 sm:p-2.5 rounded-xl border border-sky-100/50">
                                        <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-500 shrink-0 mt-0.5" />
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-[8px] sm:text-[10px] font-black text-sky-600 uppercase tracking-widest leading-none mb-0.5 sm:mb-1">Owner</span>
                                            <span className="text-[10px] sm:text-xs font-bold text-slate-700 truncate">{customer.ownerName || 'Unknown'}</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Card Footer (Financials & Status) */}
                            <div className="px-3.5 sm:px-5 py-2.5 sm:py-3.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between mt-auto">
                                {/* Due Cylinders Badge */}
                                <div className="flex items-center gap-2">
                                    {customer.dueCylinders && customer.dueCylinders.length > 0 ? (
                                        <div className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-md bg-amber-100/50 border border-amber-200/50 text-amber-700">
                                            <PackageMinus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                            <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest">{customer.dueCylinders.reduce((sum, d) => sum + d.quantity, 0)} Cyls Due</span>
                                        </div>
                                    ) : (
                                        <span className="text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest">No Cylinders Due</span>
                                    )}
                                </div>

                                {/* Financial Status */}
                                <div className="flex items-center gap-2 sm:gap-3">
                                    {customer.totalDue && customer.totalDue > 0 ? (
                                        <div className="flex flex-col items-end">
                                            <span className="text-[7px] sm:text-[9px] font-black text-rose-400 uppercase tracking-widest leading-none mb-0.5">Unpaid Dues</span>
                                            <span className="text-base sm:text-lg font-black text-rose-600 leading-none">৳{customer.totalDue.toLocaleString()}</span>
                                        </div>
                                    ) : (
                                        <div className="inline-flex items-center px-2 sm:px-3 py-1 rounded-md bg-emerald-50 border border-emerald-100 text-[8px] sm:text-[10px] font-black text-emerald-600 uppercase tracking-widest shadow-sm">
                                            Settled
                                        </div>
                                    )}
                                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center group-hover:bg-indigo-50 group-hover:border-indigo-200 group-hover:text-indigo-600 transition-colors text-slate-400 shadow-sm hidden sm:flex">
                                        <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* === MODALS === */}
            <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title={activeTab === 'retail' ? "Add New Retailer" : "Add Wholesale Partner"}>
                <CustomerForm onSuccess={() => setIsCreateOpen(false)} defaultType={activeTab} />
            </Modal>

            <Modal isOpen={!!editingCustomer} onClose={() => setEditingCustomer(null)} title="Edit Profile">
                {editingCustomer && (
                    <CustomerForm initialData={editingCustomer as any} onSuccess={() => setEditingCustomer(null)} />
                )}
            </Modal>

            {selectedCustomerId && (
                <CustomerDetails
                    customerId={selectedCustomerId}
                    isOpen={!!selectedCustomerId}
                    onClose={() => setSelectedCustomerId(null)}
                />
            )}

            <ConfirmDialog
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={() => { if (deleteTarget) deleteCustomer(deleteTarget); setDeleteTarget(null); }}
                title="Delete Entity"
                description="Are you sure you want to permanently delete this profile? This action cannot be undone."
                confirmLabel="Delete Permanently"
                variant="destructive"
            />
        </div>
    );
};