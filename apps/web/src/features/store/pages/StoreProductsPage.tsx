import { useProducts } from '@/features/product/hooks/useProducts';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Flame, Settings, Package, Plus } from 'lucide-react';

const typeIcon = (type: string) => {
  if (type === 'stove') return <Flame className="w-5 h-5 text-orange-500" />;
  if (type === 'regulator') return <Settings className="w-5 h-5 text-slate-500" />;
  return <Package className="w-5 h-5 text-primary" />;
};

const typeLabel = (type: string) =>
  type.charAt(0).toUpperCase() + type.slice(1);

const typeBadgeColor: Record<string, string> = {
  stove: 'bg-orange-100 text-orange-700 border-orange-200',
  regulator: 'bg-slate-100 text-slate-700 border-slate-200',
  pipe: 'bg-blue-100 text-blue-700 border-blue-200',
  accessory: 'bg-purple-100 text-purple-700 border-purple-200',
  other: 'bg-gray-100 text-gray-700 border-gray-200',
};

const ProductCard = ({ product }: { product: any }) => {
  const img = product.image;
  const stockColor = product.stock === 0 ? 'text-rose-600' : 'text-emerald-700';
  return (
    <div className="border-2 border-border hover:border-primary/40 bg-white rounded-2xl shadow-sm flex flex-col overflow-hidden transition-all group">
      {/* Image */}
      <div className="relative bg-slate-50 flex items-center justify-center border-b border-slate-100" style={{ minHeight: 140 }}>
        <span className={`absolute top-2 right-2 text-[10px] font-black px-2 py-0.5 rounded-full border ${typeBadgeColor[product.type] || typeBadgeColor.other}`}>
          {product.burnerCount ? `${product.burnerCount} Burner${Number(product.burnerCount) > 1 ? 's' : ''}` : product.size || typeLabel(product.type)}
        </span>
        {img ? (
          <img src={img} alt={product.name} className="h-28 object-contain p-2" />
        ) : (
          <div className="flex items-center justify-center h-28">{typeIcon(product.type)}</div>
        )}
      </div>

      <div className="flex flex-col gap-3 p-4 flex-1">
        <div>
          <p className="font-extrabold text-base text-slate-800 leading-tight">{product.name}</p>
          {product.modelNumber && <p className="text-xs text-muted-foreground font-mono mt-0.5">{product.modelNumber}</p>}
        </div>

        {/* Stock / Defect */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-emerald-50 rounded-xl border border-emerald-100 flex flex-col items-center justify-center py-2 shadow-sm">
            <span className="text-[9px] font-black text-emerald-600 uppercase tracking-wider">Stock</span>
            <span className={`text-3xl font-black ${stockColor} leading-none`}>{product.stock ?? 0}</span>
          </div>
          <div className="bg-rose-50 rounded-xl border border-rose-100 flex flex-col items-center justify-center py-2 shadow-sm">
            <span className="text-[9px] font-black text-rose-600 uppercase tracking-wider">Defect</span>
            <span className="text-3xl font-black text-rose-700 leading-none">{product.damagedStock ?? 0}</span>
          </div>
        </div>

        {/* Price tiers */}
        <div className="border border-slate-100 rounded-xl py-2 px-2 bg-slate-50 flex flex-col gap-1">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider text-center border-b border-slate-200 pb-1 mb-0.5">Price Tiers</span>
          <div className="flex items-center justify-between"><span className="text-[10px] font-black text-slate-400 uppercase">BUY</span><span className="text-sm font-black text-rose-500">৳{product.costPrice ?? 0}</span></div>
          <div className="flex items-center justify-between"><span className="text-[10px] font-black text-slate-400 uppercase">WSL</span><span className="text-sm font-black text-blue-600">৳{product.wholesalePrice ?? 0}</span></div>
          <div className="flex items-center justify-between"><span className="text-[10px] font-black text-slate-400 uppercase">RTL</span><span className="text-sm font-black text-emerald-600">৳{product.sellingPrice ?? 0}</span></div>
        </div>
      </div>
    </div>
  );
};

export const StoreProductsPage = () => {
  const { id: storeId } = useParams<{ id: string }>();
  const { data: products, isLoading } = useProducts(storeId);

  const grouped = (products || []).reduce((acc: Record<string, any[]>, p: any) => {
    acc[p.type] = acc[p.type] || [];
    acc[p.type].push(p);
    return acc;
  }, {});

  const typeOrder = ['stove', 'regulator', 'pipe', 'accessory', 'other'];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Products</h2>
          <p className="text-muted-foreground text-sm mt-0.5">Manage your store inventory and products.</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Product
        </Button>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center h-48 text-muted-foreground">Loading products…</div>
      )}

      {!isLoading && (!products || products.length === 0) && (
        <div className="bg-card border border-dashed border-border rounded-xl p-12 text-center flex flex-col items-center justify-center">
          <div className="bg-primary/10 p-4 rounded-full mb-4"><Package className="w-8 h-8 text-primary" /></div>
          <h3 className="text-lg font-semibold text-foreground">No Products Found</h3>
          <p className="text-muted-foreground max-w-sm mt-2 mb-6 text-sm">You haven't added any products yet. Use the button above or add them during store setup.</p>
          <Button variant="outline">Import Products</Button>
        </div>
      )}

      {!isLoading && products && products.length > 0 && (
        <div className="space-y-8">
          {typeOrder.filter(t => grouped[t]?.length > 0).map(type => (
            <div key={type}>
              <div className="flex items-center gap-2 mb-4">
                {typeIcon(type)}
                <h3 className="text-lg font-bold text-foreground">{typeLabel(type)}s</h3>
                <Badge variant="secondary" className="font-bold">{grouped[type].length}</Badge>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {grouped[type].map((p: any) => <ProductCard key={p._id} product={p} />)}
              </div>
            </div>
          ))}
          {/* Other types not in order */}
          {Object.keys(grouped).filter(t => !typeOrder.includes(t)).map(type => (
            <div key={type}>
              <div className="flex items-center gap-2 mb-4">
                {typeIcon(type)}
                <h3 className="text-lg font-bold text-foreground">{typeLabel(type)}s</h3>
                <Badge variant="secondary" className="font-bold">{grouped[type].length}</Badge>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {grouped[type].map((p: any) => <ProductCard key={p._id} product={p} />)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
