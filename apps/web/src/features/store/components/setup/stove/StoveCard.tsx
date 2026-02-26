import { useState, useEffect } from 'react';
import { EditableNumField, EditablePriceField } from '../shared/SetupFormFields';

export interface StoveForm {
  name: string;
  modelNumber: string;
  burnerCount: '1' | '2' | '3' | '4';
  stock: number;
  damagedStock: number;
  costPrice: number;
  wholesalePrice: number;
  sellingPrice: number;
  image: string;
}

export interface SavedStove extends StoveForm { _id: string; productId?: string; }

export const StoveCard = ({
  item, imgMap, onSave, onRemove,
}: {
  item: SavedStove;
  imgMap: Record<string, string>;
  onSave: (id: string, fields: Partial<StoveForm>) => void;
  onRemove: (id: string) => void;
}) => {
  const [local, setLocal] = useState(item);
  useEffect(() => setLocal(item), [item]);

  const handleBlur = () => {
    const changed = Object.keys(local).some(k => (local as any)[k] !== (item as any)[k]);
    if (changed) {
      onSave(item._id, {
        name: local.name, modelNumber: local.modelNumber,
        stock: local.stock, damagedStock: local.damagedStock,
        costPrice: local.costPrice, wholesalePrice: local.wholesalePrice, sellingPrice: local.sellingPrice
      });
    }
  };

  const setField = (k: keyof StoveForm, v: any) => setLocal(p => ({ ...p, [k]: v }));
  const img = item.image || imgMap[item.burnerCount] || '';

  return (
    <div className="border-2 border-orange-200 bg-white rounded-2xl shadow-md flex flex-col overflow-hidden hover:border-orange-400 transition-all">
      <div className="relative bg-slate-50 flex items-center justify-center p-3 border-b border-slate-100" style={{ minHeight: 160 }}>
        <span className="absolute top-2 right-2 bg-orange-100 text-orange-700 text-[10px] font-black px-2 py-0.5 rounded-full">
          {item.burnerCount} Burner{Number(item.burnerCount) > 1 ? 's' : ''}
        </span>
        <img src={img} alt={item.name} className="h-36 object-contain" />
      </div>

      <div className="flex flex-col gap-3 p-4 flex-1">
        <div className="flex flex-col gap-0.5">
          <input value={local.name} onChange={e => setField('name', e.target.value)} onBlur={handleBlur}
            className="font-extrabold text-lg text-slate-800 leading-tight bg-transparent border-b border-transparent hover:border-slate-200 focus:border-primary outline-none transition-colors w-full p-0 m-0"
            placeholder="Product Name" />
          <input value={local.modelNumber} onChange={e => setField('modelNumber', e.target.value)} onBlur={handleBlur}
            className="text-xs text-muted-foreground font-mono bg-transparent border-b border-transparent hover:border-slate-200 focus:border-primary outline-none transition-colors w-full p-0 m-0"
            placeholder="Model Number" />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-emerald-50 rounded-xl border border-emerald-100 py-2 px-1 flex flex-col items-center justify-center shadow-sm">
            <EditableNumField label="STOCK" value={local.stock} color="text-emerald-700"
              onChange={v => setField('stock', v)} onBlur={handleBlur} />
          </div>
          <div className="bg-rose-50 rounded-xl border border-rose-100 py-2 px-1 flex flex-col items-center justify-center shadow-sm">
            <EditableNumField label="DEFECT" value={local.damagedStock} color="text-rose-600"
              onChange={v => setField('damagedStock', v)} onBlur={handleBlur} />
          </div>
        </div>

        <div className="border border-slate-100 rounded-xl py-2 px-1 bg-slate-50 flex flex-col gap-1">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider text-center border-b border-slate-200 pb-1 mb-0.5">Price Tiers</span>
          <EditablePriceField label="BUY" value={local.costPrice} color="text-rose-500" onChange={v => setField('costPrice', v)} onBlur={handleBlur} />
          <EditablePriceField label="WSL" value={local.wholesalePrice} color="text-blue-600" onChange={v => setField('wholesalePrice', v)} onBlur={handleBlur} />
          <EditablePriceField label="RTL" value={local.sellingPrice} color="text-emerald-600" onChange={v => setField('sellingPrice', v)} onBlur={handleBlur} />
        </div>

        <button onClick={() => onRemove(item._id)} className="text-xs font-semibold text-rose-400 hover:text-rose-600 transition-colors text-center mt-auto">
          🗑 Remove
        </button>
      </div>
    </div>
  );
};
