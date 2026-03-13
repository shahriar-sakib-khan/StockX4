import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { SetupCylinderState } from '../Step3CylinderSetup';

const CountBox = ({ label, value, bg, border, labelColor, valueColor, onChange }: {
  label: string; value: number; bg: string; border: string; labelColor: string; valueColor: string;
  onChange: (v: number) => void;
}) => (
  <div className={`${bg} rounded-lg py-2 px-1 flex flex-col items-center justify-center text-center ${border} border min-w-0 shadow-sm flex-1 h-full min-h-[48px] sm:min-h-0`}>
    <span className={`text-[9px] sm:text-[10px] font-black ${labelColor} uppercase tracking-wider truncate w-full text-center mb-0.5`}>{label}</span>
    <input
      type="number" min={0} value={value === 0 ? '' : value} placeholder="0"
      onChange={e => onChange(Math.max(0, Number(e.target.value) || 0))}
      className={`w-full text-center text-2xl sm:text-4xl font-black ${valueColor} leading-none bg-transparent border-none outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
    />
  </div>
);

const PriceRow = ({ label, value, valueColor, onChange }: {
  label: string; value: number; valueColor: string; onChange: (v: number) => void;
}) => (
  <div className="flex items-center justify-between w-full px-1 gap-1 min-h-[48px] sm:min-h-0">
    <span className="text-[11px] sm:text-xs font-black text-slate-400 uppercase tracking-wide shrink-0">{label}</span>
    <div className="flex items-center gap-0.5 min-w-0">
      <span className={`text-base sm:text-lg font-black ${valueColor} shrink-0`}>৳</span>
      <input
        type="number" min={0} value={value === 0 ? '' : value} placeholder="0"
        onChange={e => onChange(Math.max(0, Number(e.target.value) || 0))}
        className={`min-w-0 w-full text-right text-base sm:text-lg font-black ${valueColor} bg-transparent border-none outline-none border-b border-dashed border-slate-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
      />
    </div>
  </div>
);

export const CylinderSetupCard = ({ brand, globalSize, activeGlobalSizes, regulatorType, onToggleRegulator, getRecord, onUpdate }: {
  brand: any; globalSize: string; activeGlobalSizes: string[]; regulatorType: '22mm' | '20mm';
  onToggleRegulator: (t: '22mm' | '20mm') => void;
  getRecord: (size: string, regType: '22mm' | '20mm') => SetupCylinderState;
  onUpdate: (size: string, regType: '22mm' | '20mm', path: string[], value: number) => void;
}) => {
  const [localSize, setLocalSize] = useState(globalSize);

  useEffect(() => {
    setLocalSize(globalSize);
  }, [globalSize]);

  const record22 = getRecord(localSize, '22mm');
  const record20 = getRecord(localSize, '20mm');
  const activeRecord = regulatorType === '22mm' ? record22 : record20;

  const upCount = (key: keyof typeof activeRecord.counts, val: number) => onUpdate(localSize, regulatorType, ['counts', key], val);
  const upPrice = (type: 'packaged' | 'refill', key: 'buying' | 'retail' | 'wholesale', val: number) => onUpdate(localSize, regulatorType, ['prices', type, key], val);

  // Auto-fill: when buying price changes, set wholesale = buying+20, retail = buying+50
  const upBuyingWithAutoFill = (type: 'packaged' | 'refill', val: number) => {
    onUpdate(localSize, regulatorType, ['prices', type, 'buying'], val);
    onUpdate(localSize, regulatorType, ['prices', type, 'wholesale'], val + 20);
    onUpdate(localSize, regulatorType, ['prices', type, 'retail'], val + 50);
  };
  const cylinderImage = brand.cylinderImage || 'https://placehold.co/150x300/f5f5f5/999?text=' + localSize;

  return (
    <Card className="overflow-hidden border-2 border-border hover:border-primary/40 transition-all duration-300 bg-white dark:bg-card shadow-sm">
      <div className="p-4 flex flex-col gap-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b pb-3 border-slate-100 dark:border-border gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 sm:w-14 h-12 sm:h-14 rounded-xl bg-slate-100 dark:bg-muted flex items-center justify-center border overflow-hidden shrink-0 p-1 shadow-sm">
              {brand.logo
                ? <img src={brand.logo} alt={brand.name} className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal" />
                : <span className="text-base sm:text-lg font-black text-muted-foreground">{brand.name.substring(0, 2).toUpperCase()}</span>}
            </div>
            <div>
              <h3 className="font-extrabold text-lg sm:text-xl leading-none text-slate-800 dark:text-foreground tracking-tight">{brand.name}</h3>
              <div className="flex items-center flex-wrap gap-2 mt-2 sm:mt-1.5">
                <select
                  className="text-xs font-black px-2 py-0.5 h-12 sm:h-8 bg-slate-100 text-slate-800 border-slate-300 rounded-lg outline-none ring-0 border min-w-[70px]"
                  value={localSize}
                  onChange={(e) => setLocalSize(e.target.value)}
                >
                  {activeGlobalSizes.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <Badge className={`text-xs font-black border-0 px-3 py-1 flex items-center h-12 sm:h-8 rounded-lg ${regulatorType === '22mm' ? 'bg-orange-100 text-orange-600' : 'bg-yellow-100 text-yellow-600'}`}>
                  {regulatorType}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex gap-1 w-full sm:w-auto">
            {(['22mm', '20mm'] as const).map(t => (
              <button key={t} onClick={() => onToggleRegulator(t)}
                className={`text-xs font-black px-3 py-2 sm:py-1.5 flex-1 sm:flex-none h-12 sm:h-auto rounded-lg border-2 transition-all ${regulatorType === t ? (t === '22mm' ? 'bg-orange-500 text-white border-orange-500' : 'bg-yellow-400 text-yellow-900 border-yellow-400') : 'bg-muted text-muted-foreground border-border hover:border-primary/40'}`}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Counts + Image */}
        <div className="flex flex-col sm:flex-row gap-3 items-center sm:items-stretch">
          <div className="w-full sm:w-20 shrink-0 flex items-center justify-center">
            <img src={cylinderImage} alt={`${brand.name} ${localSize}`} className="h-16 sm:h-24 object-contain" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          </div>
          <div className="grid grid-cols-4 sm:flex gap-1.5 sm:gap-2 w-full flex-1">
            <CountBox label="PKG"  value={activeRecord.counts.packaged} bg="bg-green-50"  border="border-green-200" labelColor="text-green-600"  valueColor="text-green-700"  onChange={v => upCount('packaged', v)} />
            <CountBox label="RFL"  value={activeRecord.counts.refill}   bg="bg-cyan-50"   border="border-cyan-200"  labelColor="text-cyan-600"   valueColor="text-cyan-700"   onChange={v => upCount('refill', v)} />
            <CountBox label="EMTY" value={activeRecord.counts.empty}    bg="bg-slate-50"  border="border-slate-200" labelColor="text-slate-500"  valueColor="text-slate-600"  onChange={v => upCount('empty', v)} />
            <CountBox label="DFCT" value={activeRecord.counts.defected} bg="bg-red-50"    border="border-red-200"   labelColor="text-red-500"    valueColor="text-red-600"    onChange={v => upCount('defected', v)} />
          </div>
        </div>

        {/* Prices */}
        <div className="flex gap-3">
          <div className="flex-1 min-w-0 text-center px-1 py-1.5 bg-white dark:bg-card border border-green-100 rounded-lg shadow-sm flex flex-col justify-center overflow-hidden">
            <span className="text-[10px] font-black text-green-600 uppercase block tracking-wider mb-1 border-b border-green-100 pb-0.5">Packaged</span>
            <PriceRow label="Buy"   value={activeRecord.prices.packaged.buying}    valueColor="text-rose-500"    onChange={v => upBuyingWithAutoFill('packaged', v)} />
            <PriceRow label="Whsle" value={activeRecord.prices.packaged.wholesale} valueColor="text-blue-600"    onChange={v => upPrice('packaged', 'wholesale', v)} />
            <PriceRow label="Retail" value={activeRecord.prices.packaged.retail}   valueColor="text-emerald-600" onChange={v => upPrice('packaged', 'retail', v)} />
          </div>
          <div className="flex-1 min-w-0 text-center px-1 py-1.5 bg-white dark:bg-card border border-cyan-100 rounded-lg shadow-sm flex flex-col justify-center overflow-hidden">
            <span className="text-[10px] font-black text-cyan-600 uppercase block tracking-wider mb-1 border-b border-cyan-100 pb-0.5">Refill</span>
            <PriceRow label="Buy"   value={activeRecord.prices.refill.buying}    valueColor="text-rose-500"    onChange={v => upBuyingWithAutoFill('refill', v)} />
            <PriceRow label="Whsle" value={activeRecord.prices.refill.wholesale} valueColor="text-blue-600"    onChange={v => upPrice('refill', 'wholesale', v)} />
            <PriceRow label="Retail" value={activeRecord.prices.refill.retail}   valueColor="text-emerald-600" onChange={v => upPrice('refill', 'retail', v)} />
          </div>
        </div>
      </div>
    </Card>
  );
};
