
import { useState, useMemo } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger as TabTrigger, TabsContent } from '@/components/ui/tabs';
import { Search, Plus, User, ArrowLeft, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CustomerCard } from './CustomerCard';
import { useCustomers } from '@/features/customer/hooks/useCustomers';
import { useShops } from '@/features/shop/hooks/useShops';
import { usePosStore } from '../stores/pos.store';
import { useNavigate } from 'react-router-dom';
import { ShopForm } from '@/features/shop/components/ShopForm';
import { CustomerForm } from '@/features/customer/components/CustomerForm';

interface CustomerSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    storeId: string;
}

export const CustomerSelectionModal = ({ isOpen, onClose, storeId }: CustomerSelectionModalProps) => {
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState<'b2b' | 'b2c' | 'walkin'>('b2b');
    const [view, setView] = useState<'selection' | 'add-shop' | 'add-customer'>('selection');
    const navigate = useNavigate();

    // Fetch Data
    const { data: customers } = useCustomers(storeId);
    const { data: shops } = useShops(storeId);

    // Use POS Store
    const { setCustomer } = usePosStore();

    // Filter Logic
    const filteredShops = useMemo(() => {
        if (!shops) return [];
        return shops.filter((shop: any) =>
            shop.name.toLowerCase().includes(search.toLowerCase()) ||
            shop.ownerName?.toLowerCase().includes(search.toLowerCase()) ||
            shop.phone?.includes(search)
        );
    }, [shops, search]);

    const filteredCustomers = useMemo(() => {
        if (!customers) return [];
        return customers.filter((c: any) =>
            c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.phone?.includes(search)
        );
    }, [customers, search]);

    // Handlers
    const handleSelectShop = (shop: any) => {
        setCustomer({
            id: shop._id,
            name: shop.name || shop.ownerName,
            type: 'Shop'
        });
        onClose();
        navigate(`/stores/${storeId}/pos/checkout`);
    };

    const handleSelectCustomer = (customer: any) => {
         setCustomer({
            id: customer._id,
            name: customer.name,
            type: 'Customer'
        });
        onClose();
        navigate(`/stores/${storeId}/pos/checkout`);
    };

    const handleWalkIn = () => {
         setCustomer({
            id: 'walk-in',
            name: 'Walk-in Customer',
            type: 'Customer' // Treat walk-in as generic customer for now
         });
         onClose();
         navigate(`/stores/${storeId}/pos/checkout`);
    };

    const handleBack = () => {
        setView('selection');
    };

    const renderSelectionView = () => (
        <div className="space-y-4 h-[600px] flex flex-col">
            {/* Search & Actions */}
            <div className="flex gap-4 items-center shrink-0">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name, phone..."
                        className="pl-9"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        autoFocus
                    />
                </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1 flex flex-col min-h-0">
                <TabsList className="grid w-full grid-cols-3 shrink-0">
                    <TabTrigger value="b2b">Shops (B2B)</TabTrigger>
                    <TabTrigger value="b2c">Customers (B2C)</TabTrigger>
                    <TabTrigger value="walkin">Walk-in</TabTrigger>
                </TabsList>

                <div className="flex-1 overflow-y-auto mt-4 pr-1 min-h-0">
                    <TabsContent value="b2b" className="mt-0 h-full">
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
                            {filteredShops.map(shop => (
                                <CustomerCard
                                    key={shop._id}
                                    type="B2B"
                                    name={shop.name}
                                    phone={shop.phone}
                                    address={shop.address}
                                    balance={shop.totalDue || 0}
                                    onClick={() => handleSelectShop(shop)}
                                />
                            ))}

                            {/* Add New Shop Card */}
                            <div
                                onClick={() => setView('add-shop')}
                                className="border border-dashed rounded-xl p-4 cursor-pointer hover:bg-slate-50 flex flex-col items-center justify-center gap-2 min-h-[140px] text-muted-foreground hover:text-primary hover:border-primary transition-colors h-full"
                            >
                                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                                    <Plus size={24} />
                                </div>
                                <span className="font-semibold">Add New Shop</span>
                            </div>
                        </div>
                         {filteredShops.length === 0 && <div className="hidden"></div>}
                    </TabsContent>

                    <TabsContent value="b2c" className="mt-0 h-full">
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
                            {filteredCustomers.map(customer => (
                                <CustomerCard
                                    key={customer._id}
                                    type="B2C"
                                    name={customer.name}
                                    phone={customer.phone}
                                    address={customer.address}
                                     balance={customer.totalDue || 0}
                                    onClick={() => handleSelectCustomer(customer)}
                                />
                            ))}

                            {/* Add New Customer Card */}
                            <div
                                onClick={() => setView('add-customer')}
                                className="border border-dashed rounded-xl p-4 cursor-pointer hover:bg-slate-50 flex flex-col items-center justify-center gap-2 min-h-[140px] text-muted-foreground hover:text-primary hover:border-primary transition-colors h-full"
                            >
                                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                                    <Plus size={24} />
                                </div>
                                <span className="font-semibold">Add New Customer</span>
                            </div>
                        </div>
                        {filteredCustomers.length === 0 && <div className="hidden"></div>}
                    </TabsContent>

                    <TabsContent value="walkin" className="mt-0 h-full">
                          <div className="flex flex-col items-center justify-center h-full space-y-4">
                              <div className="p-8 bg-slate-50 rounded-full">
                                  <User size={64} className="text-slate-400" />
                              </div>
                              <div className="text-center space-y-2">
                                  <h3 className="text-xl font-bold">Walk-in Customer</h3>
                                  <p className="text-muted-foreground max-w-xs mx-auto">
                                      Process transaction for a non-registered customer. No details will be saved for future reference.
                                  </p>
                              </div>
                              <Button size="lg" onClick={handleWalkIn} className="gap-2">
                                  Proceed as Walk-in <User size={16} />
                              </Button>
                          </div>
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={
                view === 'selection' ? "Select Customer" :
                view === 'add-shop' ? "Add New Shop" : "Add New Customer"
            }
            className="max-w-4xl"
        >
             {view !== 'selection' && (
                <div className="mb-4">
                     <Button variant="ghost" size="sm" onClick={handleBack} className="gap-1 pl-0 hover:pl-2 transition-all">
                        <ArrowLeft size={16} /> Back to Selection
                     </Button>
                </div>
            )}

            {view === 'selection' && renderSelectionView()}

            {view === 'add-shop' && (
                <div className="max-w-2xl mx-auto">
                    <ShopForm onSuccess={() => setView('selection')} />
                </div>
            )}

            {view === 'add-customer' && (
                 <div className="max-w-2xl mx-auto">
                    <CustomerForm onSuccess={() => setView('selection')} />
                </div>
            )}
        </Modal>
    );
};
