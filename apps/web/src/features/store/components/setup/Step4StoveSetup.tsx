import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { useStoveImages } from '@/features/product/hooks/useGlobalProducts';
import { StoveCard, SavedStove, StoveForm } from './stove/StoveCard';
import { StoveAddForm } from './stove/StoveAddForm';

const emptyForm = (): StoveForm => ({
  name: '', modelNumber: '', burnerCount: '1',
  stock: 0, damagedStock: 0,
  costPrice: 0, wholesalePrice: 0, sellingPrice: 0,
  image: '',
});

export const Step4StoveSetup = ({ storeId, onItemAdded }: { storeId: string; onItemAdded?: () => void }) => {
  const imgMap = useStoveImages();
  const [form, setForm] = useState<StoveForm>(emptyForm());
  const [stoves, setStoves] = useState<SavedStove[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!storeId) return;
    const fetchStoves = async () => {
      try {
        const res = await api.get('inventory', { headers: { 'x-store-id': storeId } }).json<{ inventory: any[] }>();
        setStoves(res.inventory.filter((p: any) => p.product?.category === 'stove').map((p: any) => ({
          _id: p.product._id,          // productId — used for PATCH/DELETE on StoreProduct
          productId: p.product._id,
          name: p.product?.details?.brandName || '',
          modelNumber: p.product?.details?.model || '',
          burnerCount: String(p.product?.details?.burners || 1) as '1' | '2' | '3' | '4',
          stock: p.counts?.full || 0,
          damagedStock: p.counts?.defected || 0,
          costPrice: p.prices?.buyingPriceFull || 0,
          wholesalePrice: p.prices?.wholesalePriceFull || 0,
          sellingPrice: p.prices?.retailPriceFull || 0,
          image: '',  // resolved from imgMap at render time on StoveCard
        })));
      } catch (err) { console.error('Failed to load existing stoves', err); }
    };
    fetchStoves();
  }, [storeId]); // imgMap intentionally excluded — StoveCard resolves image at render

  const set = <K extends keyof StoveForm>(k: K, v: StoveForm[K]) => setForm(p => ({ ...p, [k]: v }));

  const handleAdd = async () => {
    if (!form.name.trim()) { toast.error('Product name is required'); return; }

    // Guard: same brandName + burner count + model (normalized) already exists
    const normalizedModel = form.modelNumber.trim();
    const duplicate = stoves.find(s =>
      s.name.trim().toLowerCase() === form.name.trim().toLowerCase() &&
      s.burnerCount === form.burnerCount &&
      (s.modelNumber?.trim() || '') === normalizedModel
    );
    if (duplicate) { toast.error(`A ${form.burnerCount}-burner stove named "${form.name}"${normalizedModel ? ` (${normalizedModel})` : ''} already exists`); return; }

    setLoading(true);
    try {
      const productRes = await api.post('store-products/stove', {
        headers: { 'x-store-id': storeId },
        json: { brandName: form.name, model: form.modelNumber || undefined, burners: Number(form.burnerCount) }
      }).json<{ product: any }>();

      await api.post('inventory/upsert', {
        headers: { 'x-store-id': storeId },
        json: {
          productId: productRes.product._id,
          counts: { full: form.stock, empty: 0, defected: form.damagedStock },
          prices: { buyingPriceFull: form.costPrice, buyingPriceGas: 0, wholesalePriceFull: form.wholesalePrice, wholesalePriceGas: 0, retailPriceFull: form.sellingPrice, retailPriceGas: 0 },
        }
      });

      setStoves(p => [...p, { ...form, _id: productRes.product._id, productId: productRes.product._id }]);
      setForm(emptyForm());
      toast.success('Stove added');
      onItemAdded?.();
    } catch (e: any) {
      const msg = await e?.response?.json?.().catch(() => null);
      toast.error(Array.isArray(msg?.error) ? msg.error[0]?.message : msg?.error || 'Failed to add stove');
    } finally { setLoading(false); }
  };

  const handleSave = async (id: string, fields: Partial<StoveForm>) => {
    try {
      const current = stoves.find(s => s._id === id);
      if (!current) return;
      const merged = { ...current, ...fields };

      // 1. Update counts/prices on the ledger
      await api.post('inventory/upsert', {
        headers: { 'x-store-id': storeId },
        json: {
          productId: current.productId,
          counts: { full: merged.stock, empty: 0, defected: merged.damagedStock },
          prices: { buyingPriceFull: merged.costPrice, buyingPriceGas: 0, wholesalePriceFull: merged.wholesalePrice, wholesalePriceGas: 0, retailPriceFull: merged.sellingPrice, retailPriceGas: 0 },
        }
      });

      // 2. Update product details (name/model) on the SKU
      if (fields.name !== undefined || fields.modelNumber !== undefined) {
        await api.patch(`inventory/product/${current.productId}`, {
          headers: { 'x-store-id': storeId },
          json: { details: { brandName: merged.name, model: merged.modelNumber || undefined, burners: Number(merged.burnerCount) } }
        });
      }

      setStoves(p => p.map(s => s._id === id ? { ...s, ...fields } : s));
    } catch (e: any) {
      const msg = await e?.response?.json?.().catch(() => null);
      toast.error(msg?.error || 'Failed to update stove');
    }
  };

  const handleRemove = async (id: string) => {
    try {
      // id = productId — archive via DELETE /inventory/:id
      await api.delete(`inventory/${id}`, { headers: { 'x-store-id': storeId } });
      setStoves(p => p.filter(s => s._id !== id));
      toast.success('Stove removed');
    } catch { toast.error('Failed to remove stove'); }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Add Gas Stoves <span className="text-base font-normal text-muted-foreground">(Optional)</span></h2>
        <p className="text-sm text-muted-foreground mt-1">Add the stoves your store carries. You can skip and add later.</p>
      </div>

      <StoveAddForm form={form} set={set} loading={loading} imgMap={imgMap} onAdd={handleAdd} />

      {stoves.length > 0 && (
        <div>
          <p className="text-xs font-black text-muted-foreground uppercase tracking-wider mb-3">Added ({stoves.length})</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {stoves.map(s => (
              <StoveCard key={s._id} item={s} imgMap={imgMap} onSave={handleSave} onRemove={handleRemove} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
