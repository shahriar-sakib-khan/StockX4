import { useState } from 'react';
import { useShops, useDeleteShop } from '@/features/shop/hooks/useShops';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, MapPin, Phone, Store, Edit } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { ShopForm } from '@/features/shop/components/ShopForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShopDetails } from '@/features/shop/components/ShopDetails';

// Define simplified type for display
type Shop = {
    _id: string;
    name: string;
    phone: string;
    address: string;
    district?: string;
    imageUrl?: string;
    totalDue?: number;
};

export const ShopPage = () => {
    const { data: shops, isLoading } = useShops();
    const { mutate: deleteShop } = useDeleteShop();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [selectedShopId, setSelectedShopId] = useState<string | null>(null);
    const [editingShop, setEditingShop] = useState<Shop | null>(null);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Shops</h1>
                    <p className="text-muted-foreground">Manage your B2B customers and retailers.</p>
                </div>
                <Button onClick={() => setIsCreateOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Add Shop
                </Button>
            </div>

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
                    {shops?.map((shop: Shop) => (
                        <Card
                            key={shop._id}
                            className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg border-slate-200 hover:border-primary/50 cursor-pointer bg-white"
                            onClick={() => setSelectedShopId(shop._id)}
                        >
                            <div className="relative h-32 w-full overflow-hidden bg-slate-100">
                                {shop.imageUrl ? (
                                    <img src={shop.imageUrl} alt={shop.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-slate-50">
                                        <Store className="h-10 w-10 text-slate-300" />
                                    </div>
                                )}
                                {/* Gradient Removed */}
                                <div className="absolute bottom-2 left-3 right-3 text-slate-900">
                                    <h3 className="font-black text-3xl leading-none tracking-tight">{shop.name}</h3>
                                    <p className="text-xs text-slate-500 font-bold">{shop.district || 'No District'}</p>
                                </div>

                                <div className="absolute top-2 right-2 flex gap-1 z-10 translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                                    <Button
                                        variant="secondary"
                                        size="icon"
                                        className="h-7 w-7 bg-white/90 hover:bg-white shadow-sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setEditingShop(shop);
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
                                            if (confirm('Are you sure you want to delete this shop?')) deleteShop(shop._id);
                                        }}
                                    >
                                        <Trash2 size={14} />
                                    </Button>
                                </div>
                            </div>

                            <CardContent className="p-3 space-y-3">
                                <div className="space-y-1.5 text-xs text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                                        <span className="font-medium text-slate-600">{shop.phone}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                        <span className="line-clamp-1">{shop.address}</span>
                                    </div>
                                </div>

                                <div className="pt-2 border-t border-dashed flex justify-between items-center">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Due</span>
                                    <span className={`text-lg font-black ${shop.totalDue ? 'text-red-600' : 'text-emerald-600'}`}>
                                        ৳{shop.totalDue || 0}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {shops?.length === 0 && (
                        <div className="col-span-full text-center py-12 text-muted-foreground">
                            <Store className="w-12 h-12 mx-auto mb-4 opacity-20" />
                            <p>No shops found. Add one to get started.</p>
                        </div>
                    )}
                </div>
            )}

            <Modal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                title="Add New Shop"
            >
                <ShopForm onSuccess={() => setIsCreateOpen(false)} />
            </Modal>

            <Modal
                isOpen={!!editingShop}
                onClose={() => setEditingShop(null)}
                title="Edit Shop"
            >
                {editingShop && (
                    <ShopForm
                        initialData={editingShop}
                        onSuccess={() => setEditingShop(null)}
                    />
                )}
            </Modal>

            {selectedShopId && (
                <ShopDetails
                    shopId={selectedShopId}
                    isOpen={!!selectedShopId}
                    onClose={() => setSelectedShopId(null)}
                />
            )}
        </div>
    );
};
