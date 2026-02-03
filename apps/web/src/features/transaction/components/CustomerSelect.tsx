import { useState } from 'react';
import { usePosStore } from '../stores/pos.store';
import { useCustomers } from '@/features/customer/hooks/useCustomers';
import { useShops } from '@/features/shop/hooks/useShops';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Loader2, User, Store, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface CustomerSelectProps {
    storeId: string;
}

export const CustomerSelect = ({ storeId }: CustomerSelectProps) => {
    const { customer, setCustomer } = usePosStore();
    const [tab, setTab] = useState<'Customer' | 'Shop'>('Customer');
    const [search, setSearch] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    const { data: customers = [], isLoading: loadingCustomers } = useCustomers(storeId);
    const { data: shops = [], isLoading: loadingShops } = useShops(storeId);

    const data = tab === 'Customer' ? customers : shops;
    const isLoading = tab === 'Customer' ? loadingCustomers : loadingShops;

    const filtered = data.filter((item: any) =>
        item.name.toLowerCase().includes(search.toLowerCase()) ||
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

    if (customer) {
        return (
            <div className="flex items-center gap-2 bg-muted p-2 rounded-md">
                {customer.type === 'Shop' ? <Store className="w-4 h-4" /> : <User className="w-4 h-4" />}
                <div className="flex flex-col leading-none">
                    <span className="font-bold text-sm">{customer.name}</span>
                    <span className="text-[10px] text-muted-foreground uppercase">{customer.type}</span>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6 ml-auto" onClick={() => setCustomer(null)}>
                    <X className="w-4 h-4" />
                </Button>
            </div>
        );
    }

    return (
        <div className="relative">
            <Input
                placeholder="Select Customer/Shop..."
                value={search}
                onChange={(e) => {
                    setSearch(e.target.value);
                    if (!isOpen) setIsOpen(true);
                }}
                onFocus={() => setIsOpen(true)}
            />

            {isOpen && (
                <Card className="absolute top-12 left-0 w-full z-50 p-2 shadow-xl bg-background border-border">
                    <Tabs value={tab} onValueChange={(v) => setTab(v as any)} className="mb-2">
                        <TabsList className="w-full">
                            <TabsTrigger value="Customer" className="flex-1">Customers</TabsTrigger>
                            <TabsTrigger value="Shop" className="flex-1">Shops</TabsTrigger>
                        </TabsList>
                    </Tabs>

                    {isLoading ? (
                        <div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div>
                    ) : (
                        <div className="max-h-[300px] overflow-auto space-y-1">
                            {filtered.length === 0 ? (
                                <p className="text-center text-sm text-muted-foreground p-2">No results found.</p>
                            ) : (
                                filtered.map((item: any) => (
                                    <div
                                        key={item._id}
                                        onClick={() => handleSelect(item)}
                                        className="flex items-center justify-between p-2 hover:bg-muted rounded-md cursor-pointer"
                                    >
                                        <div>
                                            <p className="font-medium text-sm">{item.name}</p>
                                            <p className="text-xs text-muted-foreground">{item.phone}</p>
                                        </div>
                                        {item.totalDue > 0 && (
                                            <span className="text-xs text-red-500 font-bold">Due: {item.totalDue}</span>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                     <div className="pt-2 border-t mt-2 text-center">
                        <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>Close</Button>
                    </div>
                </Card>
            )}
        </div>
    );
};
