import { useState, useMemo } from 'react';
import { useCustomers, useDeleteCustomer } from '@/features/customer/hooks/useCustomers';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, MapPin, Phone, User, Store, Edit, Users, Receipt, Building2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CustomerForm } from '@/features/customer/components/CustomerForm';
import { Card, CardContent } from '@/components/ui/card';
import { CustomerDetails } from '@/features/customer/components/CustomerDetails';

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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">Customers & Shops</h1>
                    <p className="text-slate-500 font-medium">Manage relationships, tracking, and B2B/B2C finances.</p>
                </div>
                <Button size="lg" className="shadow-lg hover:shadow-xl transition-all min-h-12 w-full md:w-auto" onClick={() => setIsCreateOpen(true)}>
                    <Plus className="mr-2 h-5 w-5" /> Add New Entity
                </Button>
            </div>

            {/* Metrics Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-indigo-50 to-white border-indigo-100 shadow-sm">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-bold text-indigo-500 uppercase tracking-wider">Retail Customers</p>
                            <h3 className="text-3xl sm:text-4xl font-black text-slate-800 mt-1">{metrics.retail}</h3>
                        </div>
                        <div className="h-14 w-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center">
                            <Users className="w-7 h-7" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-sky-50 to-white border-sky-100 shadow-sm">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-bold text-sky-500 uppercase tracking-wider">Wholesale Shops</p>
                            <h3 className="text-3xl sm:text-4xl font-black text-slate-800 mt-1">{metrics.wholesale}</h3>
                        </div>
                        <div className="h-14 w-14 bg-sky-100 text-sky-600 rounded-2xl flex items-center justify-center">
                            <Building2 className="w-7 h-7" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-rose-50 to-white border-rose-100 shadow-sm">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-bold text-expense uppercase tracking-wider">Total Market Dues</p>
                            <h3 className="text-3xl sm:text-4xl font-black text-expense mt-1">৳{metrics.totalDues.toLocaleString()}</h3>
                        </div>
                        <div className="h-14 w-14 bg-rose-100 text-expense rounded-2xl flex items-center justify-center">
                            <Receipt className="w-7 h-7" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="flex bg-slate-100 p-1 rounded-xl w-full max-w-md mx-auto md:mx-0 shadow-inner">
                <button
                    onClick={() => setActiveTab('retail')}
                    className={`flex-1 py-2.5 px-4 text-sm font-bold rounded-lg transition-all ${activeTab === 'retail' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <User className="w-4 h-4 inline-block mr-2 -mt-0.5" /> Retail (B2C)
                </button>
                <button
                    onClick={() => setActiveTab('wholesale')}
                    className={`flex-1 py-2.5 px-4 text-sm font-bold rounded-lg transition-all ${activeTab === 'wholesale' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <Store className="w-4 h-4 inline-block mr-2 -mt-0.5" /> Wholesale (B2B)
                </button>
            </div>

            {isLoading ? (
                <div className="h-64 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : (
                <Card className="overflow-hidden border-slate-200 shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-xs border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4">Name</th>
                                    {activeTab === 'wholesale' && <th className="px-6 py-4">Owner / District</th>}
                                    <th className="px-6 py-4">Contact & Location</th>
                                    <th className="px-6 py-4 text-right">Outstanding Dues</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {filteredCustomers?.map((customer: Customer) => (
                                    <tr
                                        key={customer._id}
                                        className="hover:bg-slate-50 transition-colors cursor-pointer group"
                                        onClick={() => setSelectedCustomerId(customer._id)}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 text-slate-400">
                                                    {activeTab === 'wholesale' ? <Store className="w-5 h-5" /> : <User className="w-5 h-5" />}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-900 text-base">{customer.name}</div>
                                                    <div className="text-xs text-slate-500 mt-0.5">{customer._id.substring(customer._id.length - 6).toUpperCase()}</div>
                                                </div>
                                            </div>
                                        </td>

                                        {activeTab === 'wholesale' && (
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-slate-700">{customer.ownerName || '-'}</div>
                                                <div className="text-xs text-slate-500 mt-0.5">{customer.district || '-'}</div>
                                            </td>
                                        )}

                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex items-center gap-2 text-slate-700 font-medium">
                                                    <Phone className="w-3.5 h-3.5 text-slate-400" /> {customer.phone}
                                                </div>
                                                <div className="flex items-center gap-2 text-slate-500 text-xs">
                                                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                                                    <span className="truncate max-w-[200px]">{customer.address || '-'}</span>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 text-right">
                                            <div className="flex flex-col items-end gap-1">
                                                {customer.totalDue && customer.totalDue > 0 ? (
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-black bg-rose-50 text-expense border border-rose-100">
                                                        ৳{customer.totalDue.toLocaleString()}
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-income border border-emerald-100">
                                                        Settled
                                                    </span>
                                                )}

                                                {customer.dueCylinders && customer.dueCylinders.length > 0 && (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black bg-amber-50 text-amber-600 border border-amber-100 uppercase tracking-tight">
                                                        {customer.dueCylinders.reduce((sum, d) => sum + d.quantity, 0)} due cylinders
                                                    </span>
                                                )}
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="secondary"
                                                    size="icon"
                                                    className="h-8 w-8 bg-slate-100 hover:bg-slate-200"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setEditingCustomer(customer);
                                                    }}
                                                >
                                                    <Edit className="w-4 h-4 text-slate-600" />
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (confirm('Are you sure you want to delete this entity?')) deleteCustomer(customer._id);
                                                    }}
                                                >
                                                    <Trash2 size={16} />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {filteredCustomers?.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                            <div className="flex flex-col items-center justify-center">
                                                {activeTab === 'wholesale' ? <Store className="w-12 h-12 mb-3 text-slate-300" /> : <User className="w-12 h-12 mb-3 text-slate-300" />}
                                                <p className="text-lg font-medium text-slate-600">No {activeTab}s found.</p>
                                                <p className="text-sm">Click "Add New Entity" to register one.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
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
        </div>
    );
};
