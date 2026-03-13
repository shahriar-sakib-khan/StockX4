import { Field, inputCls } from '../shared/SetupFormFields';
import type { RegForm } from './RegulatorCard';

interface RegulatorAddFormProps {
  form: RegForm;
  set: <K extends keyof RegForm>(k: K, v: RegForm[K]) => void;
  loading: boolean;
  imgMap: Record<string, string>;
  onAdd: () => void;
}

export const RegulatorAddForm = ({ form, set, loading, imgMap, onAdd }: RegulatorAddFormProps) => {
  // Derive preview from imgMap at render time — imgMap loads async so we cannot store in form state
  const previewImg = imgMap[form.size] || '';

  const handleSizeChange = (v: string) => {
    set('size', v as '22mm' | '20mm');
  };

  return (
    <div className="border rounded-xl p-5 bg-muted/20 space-y-4">
      <div className="flex items-start gap-4">
        {/* Image preview — auto-updates as imgMap loads */}
        <div className="w-20 h-20 shrink-0 bg-white border rounded-xl flex items-center justify-center overflow-hidden">
          {previewImg
            ? <img src={previewImg} alt={`${form.size} regulator`} className="w-full h-full object-contain" />
            : <span className="text-xs text-muted-foreground text-center px-1">⚙️<br/>{form.size}</span>
          }
        </div>
        <p className="text-sm font-bold text-slate-600 flex items-center gap-1.5 pt-1">⚙️ New Regulator</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Product Name *">
          <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Generic 22mm Regulator" className={inputCls} />
        </Field>
        <Field label="Regulator Type">
          <select value={form.size} onChange={e => handleSizeChange(e.target.value)} className={inputCls}>
            <option value="22mm">22mm</option>
            <option value="20mm">20mm</option>
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
        {loading ? '…' : '+ Add Regulator'}
      </button>
    </div>
  );
};
