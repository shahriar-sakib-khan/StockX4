import { useState } from 'react';
import { useCustomers, useDeleteCustomer } from '@/features/customer/hooks/useCustomers';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, MapPin, Phone, User, Store, Edit } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CustomerForm } from '@/features/customer/components/CustomerForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Customers & Shops</h1>
                    <p className="text-muted-foreground">Manage your retail (B2C) and wholesale (B2B) ties.</p>
                </div>
                <Button onClick={() => setIsCreateOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Add New
                </Button>
            </div>

            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
                <TabsList className="grid w-full max-w-md grid-cols-2 bg-slate-100 p-1 rounded-lg">
                    <TabsTrigger value="retail" className="rounded-md data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all focus-visible:ring-0 focus-visible:ring-offset-0">Retail Customers</TabsTrigger>
                    <TabsTrigger value="wholesale" className="rounded-md data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all focus-visible:ring-0 focus-visible:ring-offset-0">Wholesale (Shops)</TabsTrigger>
                </TabsList>
            </Tabs>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="animate-pulse">
                            <CardHeader className="h-24 bg-muted/20" />
                            <CardContent className="h-32 bg-muted/10" />
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredCustomers?.map((customer: Customer) => (
                        <Card
                            key={customer._id}
                            className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg border-slate-200 hover:border-primary/50 cursor-pointer bg-white"
                            onClick={() => setSelectedCustomerId(customer._id)}
                        >
                            <div className="relative h-32 w-full overflow-hidden bg-slate-100">
                                {customer.imageUrl ? (
                                    <img src={customer.imageUrl} alt={customer.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-slate-50">
                                        {customer.type === 'wholesale' ? <Store className="h-10 w-10 text-slate-300" /> : <User className="h-10 w-10 text-slate-300" />}
                                    </div>
                                )}
                                {/* Gradient Removed */}
                                <div className="absolute bottom-2 left-3 right-3 text-slate-900">
                                    <h3 className="font-black text-3xl leading-none tracking-tight truncate">{customer.name}</h3>
                                    {customer.type === 'wholesale' && customer.ownerName && (
                                        <p className="text-sm font-semibold text-slate-700 truncate mt-1">
                                            Owner: {customer.ownerName}
                                        </p>
                                    )}
                                    <div className="flex items-center gap-1.5 text-slate-600 mt-0.5">
                                        <Phone className="w-3 h-3 flex-shrink-0" />
                                        <p className="text-xs font-bold truncate">{customer.phone}</p>
                                    </div>
                                </div>

                                <div className="absolute top-2 right-2 flex gap-1 z-10 translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                                    <Button
                                        variant="secondary"
                                        size="icon"
                                        className="h-7 w-7 bg-white/90 hover:bg-white shadow-sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setEditingCustomer(customer);
                                        }}
                                    >
                                        <Edit className="w-3.5 h-3.5 text-slate-700" />
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="icon"
                                        className="h-7 w-7 shadow-sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (confirm('Are you sure you want to delete this customer?')) deleteCustomer(customer._id);
                                        }}
                                    >
                                        <Trash2 size={14} />
                                    </Button>
                                </div>
                            </div>

                            <CardContent className="p-3">
                                <div className="flex flex-col gap-2 mb-3 min-h-[2.5em]">
                                    <div className="flex items-start gap-2 text-xs text-muted-foreground">
                                        <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                                        <span className="line-clamp-2 leading-relaxed">{customer.address || 'No Address'}</span>
                                    </div>
                                    {customer.type === 'wholesale' && customer.district && (
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground pl-[22px]">
                                            <span className="font-medium bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 border border-slate-200">{customer.district}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="pt-2 border-t border-dashed flex justify-between items-center">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Due</span>
                                    <span className={`text-2xl font-black ${customer.totalDue ? 'text-expense' : 'text-income'}`}>
                                        ৳{customer.totalDue || 0}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {filteredCustomers?.length === 0 && (
                        <div className="col-span-full text-center py-12 text-muted-foreground">
                            {activeTab === 'wholesale' ? <Store className="w-12 h-12 mx-auto mb-4 opacity-20" /> : <User className="w-12 h-12 mx-auto mb-4 opacity-20" />}
                            <p>No {activeTab}s found. Add one to get started.</p>
                        </div>
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
        </div>
    );
};
