import { useState, useMemo } from 'react';
import { useCustomers, useDeleteCustomer } from '@/features/customer/hooks/useCustomers';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, MapPin, Phone, User, Store, Edit, Users, Receipt, Building2, PackageMinus } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CustomerForm } from '@/features/customer/components/CustomerForm';
import { Card, CardContent } from '@/components/ui/card';
import { CustomerDetails } from '@/features/customer/components/CustomerDetails';
import { InfoTooltip } from '@/features/store/components/setup/shared/InfoTooltip';

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

    const filteredCustomers = customers?.filter((c: Customer) =>
        activeTab === 'retail' ? (!c.type || c.type === 'retail') : c.type === 'wholesale'
    );

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
        <div className="space-y-6 pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 sm:gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-800 tracking-tight">
                        Logistics & Partners
                        <InfoTooltip content="View and manage your customer list, dues, and payment history." />
                    </h1>
                    <p className="text-[10px] sm:text-xs md:text-sm text-slate-500 font-bold uppercase tracking-wide">Manage relationships and B2B/B2C finances.</p>
                </div>
                <Button className="h-10 sm:h-12 md:h-14 shadow-lg hover:shadow-xl transition-all w-full md:w-auto font-black uppercase tracking-widest text-[10px] sm:text-xs rounded-xl sm:rounded-2xl" onClick={() => setIsCreateOpen(true)}>
                    <Plus className="mr-2 h-4 w-4 sm:h-5 sm:w-5" /> Add Entity
                </Button>
            </div>

            {/* Metrics Section */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-6">
                <Card className="bg-gradient-to-br from-indigo-50 to-white border-indigo-100 shadow-sm overflow-hidden border-2 rounded-xl sm:rounded-2xl">
                    <CardContent className="p-1.5 sm:p-4 md:p-6 flex flex-col sm:flex-row items-center justify-between text-center sm:text-left">
                        <div>
                            <p className="text-[7px] sm:text-[10px] md:text-xs font-black text-indigo-500 uppercase tracking-widest">Retail</p>
                            <h3 className="text-sm sm:text-2xl md:text-4xl font-black text-slate-900 mt-0.5 sm:mt-1">{metrics.retail}</h3>
                        </div>
                        <div className="hidden sm:flex h-10 w-10 sm:h-14 sm:w-14 bg-indigo-100 text-indigo-600 rounded-lg sm:rounded-2xl items-center justify-center shadow-inner">
                            <Users className="w-5 h-5 sm:w-7 sm:h-7" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-sky-50 to-white border-sky-100 shadow-sm overflow-hidden border-2 rounded-xl sm:rounded-2xl">
                    <CardContent className="p-1.5 sm:p-4 md:p-6 flex flex-col sm:flex-row items-center justify-between text-center sm:text-left">
                        <div>
                            <p className="text-[7px] sm:text-[10px] md:text-xs font-black text-sky-500 uppercase tracking-widest">Wholesale</p>
                            <h3 className="text-sm sm:text-2xl md:text-4xl font-black text-slate-900 mt-0.5 sm:mt-1">{metrics.wholesale}</h3>
                        </div>
                        <div className="hidden sm:flex h-10 w-10 sm:h-14 sm:w-14 bg-sky-100 text-sky-600 rounded-lg sm:rounded-2xl items-center justify-center shadow-inner">
                            <Store className="w-5 h-5 sm:w-7 sm:h-7" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-rose-50 to-white border-rose-100 shadow-sm overflow-hidden border-2 rounded-xl sm:rounded-2xl">
                    <CardContent className="p-1.5 sm:p-4 md:p-6 flex flex-col sm:flex-row items-center justify-between text-center sm:text-left">
                        <div className="w-full truncate">
                            <p className="text-[7px] sm:text-[10px] md:text-xs font-black text-expense uppercase tracking-widest">Dues</p>
                            <h3 className="text-sm sm:text-2xl md:text-4xl font-black text-expense mt-0.5 sm:mt-1 truncate">৳{metrics.totalDues > 999 ? `${(metrics.totalDues/1000).toFixed(1)}k` : metrics.totalDues.toLocaleString()}</h3>
                        </div>
                        <div className="hidden sm:flex h-10 w-10 sm:h-14 sm:w-14 bg-rose-100 text-expense rounded-lg sm:rounded-2xl items-center justify-center shadow-inner">
                            <Receipt className="w-5 h-5 sm:w-7 sm:h-7" />
                        </div>
                    </CardContent>
                </Card>
            </div>

             <div className="flex bg-white backdrop-blur-sm p-1 rounded-xl w-full sm:max-w-md mx-auto md:mx-0 shadow-sm border border-slate-200">
                <button
                    onClick={() => setActiveTab('retail')}
                    className={`flex-1 py-1.5 sm:py-2 px-3 text-[9px] sm:text-xs md:text-sm font-black rounded-lg sm:rounded-xl transition-all uppercase tracking-widest ${activeTab === 'retail' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-indigo-400'}`}
                >
                    <User className="w-3.5 h-3.5 inline-block mr-1.5 -mt-0.5" /> Retail
                </button>
                <button
                    onClick={() => setActiveTab('wholesale')}
                    className={`flex-1 py-1.5 sm:py-2 px-3 text-[9px] sm:text-xs md:text-sm font-black rounded-lg sm:rounded-xl transition-all uppercase tracking-widest ${activeTab === 'wholesale' ? 'bg-sky-600 text-white shadow-lg' : 'text-slate-400 hover:text-sky-400'}`}
                >
                    <Store className="w-3.5 h-3.5 inline-block mr-1.5 -mt-0.5" /> Wholesale
                </button>
            </div>

            {isLoading ? (
                <div className="h-64 flex flex-col items-center justify-center gap-4">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-primary"></div>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading entities...</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Desktop View: Table */}
                    <Card className="hidden md:block overflow-hidden border-slate-200 shadow-xl border-2 rounded-2xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50/50 text-slate-400 font-black uppercase tracking-widest text-[10px] border-b border-slate-200">
                                    <tr>
                                        <th className="px-6 py-5">Entity Name</th>
                                        {activeTab === 'wholesale' && <th className="px-6 py-5">Owner / District</th>}
                                        <th className="px-6 py-5">Contact & Location</th>
                                        <th className="px-6 py-5 text-right">Outstanding Dues</th>
                                        <th className="px-6 py-5 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                    {filteredCustomers?.map((customer: Customer) => (
                                        <tr
                                            key={customer._id}
                                            className="hover:bg-slate-50/80 transition-all cursor-pointer group"
                                            onClick={() => setSelectedCustomerId(customer._id)}
                                        >
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0 text-slate-400 group-hover:bg-white group-hover:shadow-md transition-all">
                                                        {activeTab === 'wholesale' ? <Store className="w-6 h-6 text-sky-500" /> : <User className="w-6 h-6 text-indigo-500" />}
                                                    </div>
                                                    <div>
                                                        <div className="font-extrabold text-slate-900 text-lg tracking-tight group-hover:text-primary transition-colors">{customer.name}</div>
                                                        <div className="text-[10px] text-slate-400 mt-0.5 font-bold uppercase tracking-widest">#{customer._id.substring(customer._id.length - 6).toUpperCase()}</div>
                                                    </div>
                                                </div>
                                            </td>

                                            {activeTab === 'wholesale' && (
                                                <td className="px-6 py-5">
                                                    <div className="font-bold text-slate-700">{customer.ownerName || '-'}</div>
                                                    <div className="text-xs text-slate-400 mt-1 font-semibold">{customer.district || '-'}</div>
                                                </td>
                                            )}

                                            <td className="px-6 py-5">
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex items-center gap-2 text-slate-700 font-black">
                                                        <Phone className="w-4 h-4 text-slate-300" /> {customer.phone}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
                                                        <MapPin className="w-4 h-4 text-slate-300 flex-shrink-0" />
                                                        <span className="truncate max-w-[200px]">{customer.address || 'Address N/A'}</span>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-6 py-5 text-right">
                                                <div className="flex flex-col items-end gap-1.5">
                                                    {customer.totalDue && customer.totalDue > 0 ? (
                                                        <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-sm font-black bg-rose-50 text-expense border-2 border-rose-100 shadow-sm">
                                                            ৳{customer.totalDue.toLocaleString()}
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-black bg-emerald-50 text-income border-2 border-emerald-100 shadow-sm uppercase tracking-widest">
                                                            Settled
                                                        </span>
                                                    )}

                                                    {customer.dueCylinders && customer.dueCylinders.length > 0 && (
                                                        <span className="inline-flex items-center px-2 py-1 rounded-lg text-[10px] font-black bg-amber-50 text-amber-600 border border-amber-200 uppercase tracking-tighter shadow-sm">
                                                            {customer.dueCylinders.reduce((sum, d) => sum + d.quantity, 0)} due cylinders
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            <td className="px-6 py-5 text-right">
                                                <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button
                                                        variant="secondary"
                                                        size="icon"
                                                        className="h-10 w-10 bg-white border-2 border-slate-100 hover:border-slate-300 shadow-sm hover:shadow-md transition-all"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setEditingCustomer(customer);
                                                        }}
                                                    >
                                                        <Edit className="w-5 h-5 text-slate-600" />
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="icon"
                                                        className="h-10 w-10 shadow-lg hover:shadow-rose-200 transition-all"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setDeleteTarget(customer._id);
                                                        }}
                                                    >
                                                        <Trash2 size={20} />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>

                    {/* Mobile View: Card List */}
                    <div className="grid grid-cols-1 gap-3 md:hidden">
                        {filteredCustomers?.map((customer: Customer) => (
                            <Card 
                                key={customer._id} 
                                className="border border-slate-200 shadow-sm active:scale-[0.98] transition-all overflow-hidden rounded-2xl"
                                onClick={() => setSelectedCustomerId(customer._id)}
                            >
                                <CardContent className="p-3 sm:p-5 space-y-3 sm:space-y-5">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-4">
                                            <div className="h-14 w-14 rounded-2xl bg-slate-50 border-2 border-slate-100 flex items-center justify-center text-slate-400 shadow-inner">
                                                {activeTab === 'wholesale' ? <Store className="w-7 h-7 text-sky-500" /> : <User className="w-7 h-7 text-indigo-500" />}
                                            </div>
                                            <div>
                                                <h4 className="font-black text-slate-900 text-xl leading-none tracking-tight">{customer.name}</h4>
                                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1.5 flex items-center gap-1">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-slate-300"></span>
                                                    ID: {customer._id.substring(customer._id.length - 6).toUpperCase()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            {customer.totalDue && customer.totalDue > 0 ? (
                                                <div className="flex flex-col items-end">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Due</span>
                                                    <span className="text-2xl font-black text-expense leading-tight">
                                                        ৳{customer.totalDue.toLocaleString()}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-xs font-black text-income px-3 py-1.5 bg-emerald-50 rounded-xl border-2 border-emerald-100 shadow-sm uppercase tracking-widest">
                                                    Settled
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-2">
                                        <a 
                                            href={`tel:${customer.phone}`}
                                            className="flex items-center justify-between p-2.5 sm:p-4 bg-slate-50 rounded-xl sm:rounded-2xl border border-slate-100 min-h-10 sm:min-h-12 active:bg-slate-100 transition-colors shadow-sm"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <div className="flex items-center gap-2 sm:gap-3">
                                                <div className="p-1.5 bg-indigo-100 text-indigo-600 rounded-lg">
                                                    <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                </div>
                                                <span className="text-xs sm:text-base font-black text-slate-700 tracking-tight">{customer.phone}</span>
                                            </div>
                                        </a>
                                        <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-4 bg-slate-50/50 rounded-xl sm:rounded-2xl border border-slate-100/50 min-h-10 sm:min-h-12 shadow-sm">
                                            <div className="p-1.5 bg-rose-100 text-rose-600 rounded-lg shrink-0">
                                                <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                            </div>
                                            <span className="text-[10px] sm:text-sm font-bold text-slate-500 truncate">
                                                {customer.address || 'No Address Provided'}
                                            </span>
                                        </div>
                                    </div>

                                    {activeTab === 'wholesale' && (
                                        <div className="p-2.5 bg-sky-50 rounded-xl border border-sky-100 flex items-center justify-between shadow-sm">
                                            <div className="flex items-center gap-2 sm:gap-3">
                                                <div className="p-1.5 bg-sky-200 text-sky-700 rounded-lg">
                                                    <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                </div>
                                                <span className="text-xs sm:text-sm font-black text-slate-800 tracking-tight">{customer.ownerName || 'Unknown Owner'}</span>
                                            </div>
                                            <span className="text-[8px] sm:text-[10px] font-black text-sky-400 uppercase tracking-widest">{customer.district || 'Loc N/A'}</span>
                                        </div>
                                    )}

                                    <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 pt-2.5 border-t border-slate-100">
                                        <div className="flex flex-wrap gap-1.5 w-full justify-center sm:justify-start">
                                            {customer.dueCylinders && customer.dueCylinders.length > 0 && (
                                                <span className="inline-flex items-center px-2 py-1 rounded-lg bg-amber-50 text-amber-600 border border-amber-100 text-[9px] sm:text-xs font-black uppercase tracking-tighter shadow-sm">
                                                    <PackageMinus className="w-3.5 h-3.5 mr-1" />
                                                    {customer.dueCylinders.reduce((sum, d) => sum + d.quantity, 0)} Cyls Due
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex gap-2 w-full">
                                            <Button
                                                variant="secondary"
                                                className="flex-1 h-10 sm:h-14 rounded-xl sm:rounded-2xl bg-white border border-slate-200 text-slate-700 font-black uppercase tracking-widest shadow-sm hover:bg-slate-50 transition-all text-[9px] sm:text-xs"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setEditingCustomer(customer);
                                                }}
                                            >
                                                <Edit className="w-3.5 h-3.5 mr-1.5" /> Edit
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                className="flex-1 h-10 sm:h-14 rounded-xl sm:rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-rose-100 transition-all text-[9px] sm:text-xs"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setDeleteTarget(customer._id);
                                                }}
                                            >
                                                <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Delete
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {filteredCustomers?.length === 0 && (
                        <Card className="border-slate-200 bg-white">
                            <div className="px-6 py-12 text-center text-slate-500">
                                <div className="flex flex-col items-center justify-center">
                                    {activeTab === 'wholesale' ? <Store className="w-12 h-12 mb-4 text-slate-300" /> : <User className="w-12 h-12 mb-4 text-slate-300" />}
                                    <p className="text-lg font-bold text-slate-800">No {activeTab}s found.</p>
                                    <p className="text-sm text-slate-500 mt-1">Click "Add New Entity" to register one.</p>
                                </div>
                            </div>
                        </Card>
                    )}
                </div>
            )}

            <Modal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                title={activeTab === 'retail' ? "Add New Customer" : "Add New Shop"}
            >
                <CustomerForm onSuccess={() => setIsCreateOpen(false)} defaultType={activeTab} />
            </Modal>

            <Modal
                isOpen={!!editingCustomer}
                onClose={() => setEditingCustomer(null)}
                title="Edit Customer"
            >
                {editingCustomer && (
                    <CustomerForm
                        initialData={editingCustomer as any}
                        onSuccess={() => setEditingCustomer(null)}
                    />
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
                title="Delete Customer"
                description="Are you sure you want to delete this customer? This action cannot be undone."
                confirmLabel="Delete"
                variant="destructive"
            />
        </div>
    );
};
