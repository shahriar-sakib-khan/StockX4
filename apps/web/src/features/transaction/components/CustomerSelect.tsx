import { useState, useRef, useEffect } from 'react';
import { usePosStore } from '../stores/pos.store';
import { useCustomers } from '@/features/customer/hooks/useCustomers';
import { useShops } from '@/features/shop/hooks/useShops';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Loader2, User, Store, X, Search, ChevronDown, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Modal } from '@/components/ui/Modal';
import { CustomerForm } from '@/features/customer/components/CustomerForm';
import { ShopForm } from '@/features/shop/components/ShopForm';

interface CustomerSelectProps {
    storeId: string;
    hasError?: boolean;
}

export const CustomerSelect = ({ storeId, hasError }: CustomerSelectProps) => {
    const { customer, setCustomer } = usePosStore();
    const [tab, setTab] = useState<'Customer' | 'Shop'>('Customer');
    const [search, setSearch] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const { data: customers = [], isLoading: loadingCustomers } = useCustomers(storeId);
    const { data: shops = [], isLoading: loadingShops } = useShops(storeId);

    const data = tab === 'Customer' ? customers : shops;
    const isLoading = tab === 'Customer' ? loadingCustomers : loadingShops;

    const filtered = data.filter((item: any) =>
        (item.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (item.phone && item.phone.includes(search))
    );

    const handleSelect = (item: any) => {
        setCustomer({
            id: item._id,
            name: item.name,
            type: tab
        });
        setIsOpen(false);
        setSearch('');
    };

    // Auto-focus input when opened
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    if (customer) {
        return (
            <div className="flex items-center gap-3 bg-primary/10 border border-primary/20 p-2 rounded-lg shadow-sm group hover:border-primary/40 transition-colors">
                <div className="bg-white p-1.5 rounded-full text-primary shadow-sm">
                    {customer.type === 'Shop' ? <Store className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>
                <div className="flex flex-col leading-none">
                    <span className="font-bold text-sm text-primary">{customer.name}</span>
                    <span className="text-[10px] text-muted-foreground uppercase font-medium">{customer.type}</span>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 ml-auto hover:bg-red-100 hover:text-red-500 rounded-full"
                    onClick={() => setCustomer(null)}
                >
                    <X className="w-4 h-4" />
                </Button>
            </div>
        );
    }

    return (
        <div className="relative">
            <div
                className={cn(
                    "relative flex items-center w-full",
                    hasError && "animate-pulse"
                )}
            >
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                    <Search className={cn("w-4 h-4", hasError ? "text-red-500" : "")} />
                </div>
                <Input
                    ref={inputRef}
                    className={cn(
                        "pl-9 pr-10 h-11 bg-white shadow-sm transition-all text-base",
                        hasError
                            ? "border-red-500 ring-2 ring-red-200 placeholder:text-red-400 focus-visible:ring-red-500"
                            : "border-input focus-visible:ring-primary focus-visible:border-primary"
                    )}
                    placeholder={hasError ? "Select Customer Required *" : "Select Customer or Shop..."}
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        if (!isOpen) setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                />
                 <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                    <ChevronDown className="w-4 h-4 opacity-50" />
                </div>
            </div>

            {isOpen && (
                <Card className="absolute top-12 left-0 w-full z-50 p-2 shadow-xl bg-background border-border animate-in fade-in zoom-in-95 duration-100">
                    <Tabs value={tab} onValueChange={(v) => setTab(v as any)} className="mb-2">
                        <TabsList className="w-full grid grid-cols-2">
                            <TabsTrigger value="Customer">Customers</TabsTrigger>
                            <TabsTrigger value="Shop">Shops</TabsTrigger>
                        </TabsList>
                    </Tabs>

                    {isLoading ? (
                        <div className="flex justify-center p-8 text-muted-foreground"><Loader2 className="animate-spin w-6 h-6" /></div>
                    ) : (
                        <>
                            <div className="max-h-[300px] overflow-auto space-y-1 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                                {filtered.length === 0 ? (
                                    <div className="text-center py-8">
                                        <p className="text-sm text-muted-foreground mb-2">No {tab.toLowerCase()}s found.</p>
                                    </div>
                                ) : (
                                    filtered.map((item: any) => (
                                        <div
                                            key={item._id}
                                            onClick={() => handleSelect(item)}
                                            className="flex items-center justify-between p-2.5 hover:bg-muted/80 rounded-lg cursor-pointer transition-colors group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="bg-primary/5 p-2 rounded-full text-primary group-hover:bg-white transition-colors">
                                                    {tab === 'Shop' ? <Store className="w-4 h-4" /> : <User className="w-4 h-4" />}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-sm leading-none mb-1">{item.name}</p>
                                                    <p className="text-xs text-muted-foreground">{item.phone || 'No phone'}</p>
                                                </div>
                                            </div>
                                            {item.totalDue > 0 && (
                                                <span className="text-xs bg-red-100 text-red-600 font-bold px-2 py-1 rounded-full">
                                                    Due: {item.totalDue}
                                                </span>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Sticky Add Button */}
                            <div className="p-2 pt-2 border-t text-center bg-white sticky bottom-0">
                               <Button variant="outline" size="sm" className="w-full bg-primary/5 hover:bg-primary/10 border-primary/20 text-primary" onClick={() => setCreateModalOpen(true)}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Create New {tab}
                                </Button>
                            </div>
                        </>
                    )}
                     <div className="pt-2 border-t mt-0 flex justify-between items-center text-xs text-muted-foreground px-1">
                        <span>{filtered.length} results</span>
                        <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => setIsOpen(false)}>Close</Button>
                    </div>
                </Card>
            )}

            {/* Overlay to close on click outside (simple version) */}
            {isOpen && <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setIsOpen(false)} />}

            {/* Create Modal */}
            <Modal
                isOpen={createModalOpen}
                onClose={() => setCreateModalOpen(false)}
                title={`Add New ${tab}`}
                className="max-w-xl"
            >
                {tab === 'Customer' ? (
                     <CustomerForm onSuccess={() => setCreateModalOpen(false)} />
                ) : (
                     <ShopForm onSuccess={() => setCreateModalOpen(false)} />
                )}
            </Modal>
        </div>
    );
};
