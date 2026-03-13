import { Field, inputCls } from '../shared/SetupFormFields';
import type { StoveForm } from './StoveCard';

interface StoveAddFormProps {
  form: StoveForm;
  set: <K extends keyof StoveForm>(k: K, v: StoveForm[K]) => void;
  loading: boolean;
  imgMap: Record<string, string>;
  onAdd: () => void;
}

export const StoveAddForm = ({ form, set, loading, imgMap, onAdd }: StoveAddFormProps) => {
  // Derive preview from imgMap at render time — imgMap loads async so we cannot store in form state
  const previewImg = imgMap[form.burnerCount] || '';

  const handleBurnerChange = (v: string) => {
    set('burnerCount', v as '1' | '2' | '3' | '4');
  };

  return (
    <div className="border rounded-xl p-5 bg-muted/20 space-y-4">
      <div className="flex items-start gap-4">
        {/* Image preview — auto-updates as imgMap loads */}
        <div className="w-20 h-20 shrink-0 bg-white border rounded-xl flex items-center justify-center overflow-hidden">
          {previewImg
            ? <img src={previewImg} alt={`${form.burnerCount}-burner stove`} className="w-full h-full object-contain" />
            : <span className="text-xs text-muted-foreground text-center px-1">🔥<br/>{form.burnerCount}B</span>
          }
        </div>
        <p className="text-sm font-bold text-orange-500 flex items-center gap-1.5 pt-1">🔥 New Stove</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Field label="Product Name *">
          <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Walton 2-Burner" className={inputCls} />
        </Field>
        <Field label="Model Number">
          <input value={form.modelNumber} onChange={e => set('modelNumber', e.target.value)} placeholder="e.g. WGS-B2" className={inputCls} />
        </Field>
        <Field label="Burners">
          <select value={form.burnerCount} onChange={e => handleBurnerChange(e.target.value)} className={inputCls}>
            {(['1', '2', '3', '4'] as const).map(n => <option key={n} value={n}>{n} Burner{Number(n) > 1 ? 's' : ''}</option>)}
          </select>
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Stock">
          <input type="number" min={0} value={form.stock} onChange={e => set('stock', Math.max(0, Number(e.target.value)))} className={inputCls} />
        </Field>
        <Field label="Defected Stock">
          <input type="number" min={0} value={form.damagedStock} onChange={e => set('damagedStock', Math.max(0, Number(e.target.value)))} className={inputCls} />
        </Field>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Field label="Buying Price (৳)">
          <input type="number" min={0} value={form.costPrice} onChange={e => set('costPrice', Math.max(0, Number(e.target.value)))} className={inputCls} />
        </Field>
        <Field label="Wholesale Price (৳)">
          <input type="number" min={0} value={form.wholesalePrice} onChange={e => set('wholesalePrice', Math.max(0, Number(e.target.value)))} className={inputCls} />
        </Field>
        <Field label="Retail Price (৳)">
          <input type="number" min={0} value={form.sellingPrice} onChange={e => set('sellingPrice', Math.max(0, Number(e.target.value)))} className={inputCls} />
        </Field>
      </div>
      <button onClick={onAdd} disabled={loading}
        className="flex items-center justify-center gap-2 px-5 py-3 sm:py-2.5 w-full sm:w-auto min-h-[48px] rounded-lg bg-primary text-primary-foreground text-sm font-bold shadow hover:opacity-90 transition disabled:opacity-50">
        {loading ? '…' : '+ Add Stove'}
      </button>
    </div>
  );
};
