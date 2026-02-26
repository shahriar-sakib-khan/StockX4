import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { useRegulatorImages } from '@/features/product/hooks/useGlobalProducts';
import { RegulatorCard, SavedReg, RegForm } from './regulator/RegulatorCard';
import { RegulatorAddForm } from './regulator/RegulatorAddForm';

const emptyForm = (): RegForm => ({
  name: '', modelNumber: '', size: '22mm',
  stock: 0, damagedStock: 0,
  costPrice: 0, wholesalePrice: 0, sellingPrice: 0,
  image: '',
});

export const Step5RegulatorSetup = ({ storeId, onItemAdded }: { storeId: string; onItemAdded?: () => void }) => {
  const imgMap = useRegulatorImages();
  const [form, setForm] = useState<RegForm>(emptyForm());
  const [regulators, setRegulators] = useState<SavedReg[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!storeId) return;
    const fetchRegulators = async () => {
      try {
        const res = await api.get('inventory', { headers: { 'x-store-id': storeId } }).json<{ inventory: any[] }>();
        setRegulators(res.inventory.filter((p: any) => p.product?.category === 'regulator').map((p: any) => ({
          _id: p.product._id,           // productId — used for PATCH/DELETE on StoreProduct
          productId: p.product._id,
          name: p.product?.details?.brandName || '',
          modelNumber: p.product?.details?.model || '',
          size: (p.product?.details?.type || '22mm') as '22mm' | '20mm',
          stock: p.counts?.full || 0,
          damagedStock: p.counts?.defected || 0,
          costPrice: p.prices?.buyingPriceFull || 0,
          wholesalePrice: p.prices?.wholesalePriceFull || 0,
          sellingPrice: p.prices?.retailPriceFull || 0,
          image: '',  // resolved from imgMap at render time on RegulatorCard
        })));
      } catch (err) { console.error('Failed to load existing regulators', err); }
    };
    fetchRegulators();
  }, [storeId]); // imgMap intentionally excluded — RegulatorCard resolves image at render

  const set = <K extends keyof RegForm>(k: K, v: RegForm[K]) => setForm(p => ({ ...p, [k]: v }));

  const handleAdd = async () => {
    if (!form.name.trim()) { toast.error('Product name is required'); return; }

    // Guard: same brandName + regulator type + model (normalized) already exists
    const normalizedModel = form.modelNumber.trim();
    const duplicate = regulators.find(r =>
      r.name.trim().toLowerCase() === form.name.trim().toLowerCase() &&
      r.size === form.size &&
      (r.modelNumber?.trim() || '') === normalizedModel
    );
    if (duplicate) { toast.error(`A ${form.size} regulator named "${form.name}"${normalizedModel ? ` (${normalizedModel})` : ''} already exists`); return; }

    setLoading(true);
    try {
      const productRes = await api.post('store-products/regulator', {
        headers: { 'x-store-id': storeId },
        json: { brandName: form.name, model: form.modelNumber || undefined, type: form.size }
      }).json<{ product: any }>();

      await api.post('inventory/upsert', {
        headers: { 'x-store-id': storeId },
        json: {
          productId: productRes.product._id,
          counts: { full: form.stock, empty: 0, defected: form.damagedStock },
          prices: { buyingPriceFull: form.costPrice, buyingPriceGas: 0, wholesalePriceFull: form.wholesalePrice, wholesalePriceGas: 0, retailPriceFull: form.sellingPrice, retailPriceGas: 0 },
        }
      });

      setRegulators(p => [...p, { ...form, _id: productRes.product._id, productId: productRes.product._id }]);
      setForm(emptyForm());
      toast.success('Regulator added');
      onItemAdded?.();
    } catch (e: any) {
      const msg = await e?.response?.json?.().catch(() => null);
      toast.error(Array.isArray(msg?.error) ? msg.error[0]?.message : msg?.error || 'Failed to add regulator');
    } finally { setLoading(false); }
  };

  const handleSave = async (id: string, fields: Partial<RegForm>) => {
    try {
      const current = regulators.find(r => r._id === id);
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
          json: { details: { brandName: merged.name, model: merged.modelNumber || undefined, type: merged.size } }
        });
      }

      setRegulators(p => p.map(r => r._id === id ? { ...r, ...fields } : r));
    } catch (e: any) {
      const msg = await e?.response?.json?.().catch(() => null);
      toast.error(msg?.error || 'Failed to update regulator');
    }
  };

  const handleRemove = async (id: string) => {
    try {
      // id = productId — archive via DELETE /inventory/:id
      await api.delete(`inventory/${id}`, { headers: { 'x-store-id': storeId } });
      setRegulators(p => p.filter(r => r._id !== id));
      toast.success('Regulator removed');
    } catch { toast.error('Failed to remove regulator'); }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Add Regulators <span className="text-base font-normal text-muted-foreground">(Optional)</span></h2>
        <p className="text-sm text-muted-foreground mt-1">Add the regulators your store carries. You can skip and add later.</p>
      </div>

      <RegulatorAddForm form={form} set={set} loading={loading} imgMap={imgMap} onAdd={handleAdd} />

      {regulators.length > 0 && (
        <div>
          <p className="text-xs font-black text-muted-foreground uppercase tracking-wider mb-3">Added ({regulators.length})</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {regulators.map(r => (
              <RegulatorCard key={r._id} item={r} imgMap={imgMap} onSave={handleSave} onRemove={handleRemove} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
