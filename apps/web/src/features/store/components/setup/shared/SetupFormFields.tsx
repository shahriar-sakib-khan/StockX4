/** Shared primitive form components used by Stove & Regulator Setup steps. */

export const EditableNumField = ({
  label, value, color, onChange, onBlur
}: { label: string; value: number; color: string; onChange: (v: number) => void; onBlur: () => void }) => (
  <div className="flex flex-col items-center gap-0.5 flex-1 min-w-0">
    <span className={`text-[10px] font-black uppercase tracking-wider ${color}`}>{label}</span>
    <input
      type="number" min={0}
      value={value === 0 ? '' : value}
      placeholder="0"
      onChange={e => onChange(Math.max(0, Number(e.target.value) || 0))}
      onBlur={onBlur}
      className={`w-full text-center text-2xl sm:text-3xl font-black ${color} bg-transparent border-none outline-none min-h-[48px] sm:min-h-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
    />
  </div>
);

export const EditablePriceField = ({
  label, value, color, onChange, onBlur
}: { label: string; value: number; color: string; onChange: (v: number) => void; onBlur: () => void }) => (
  <div className="flex items-center justify-between w-full px-1 gap-1">
    <span className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-wide shrink-0">{label}</span>
    <div className="flex items-center gap-0.5 min-w-0 flex-1 justify-end min-h-[48px] sm:min-h-0">
      <span className={`text-sm font-black ${color} shrink-0`}>৳</span>
      <input
        type="number" min={0}
        value={value === 0 ? '' : value}
        placeholder="0"
        onChange={e => onChange(Math.max(0, Number(e.target.value) || 0))}
        onBlur={onBlur}
        className={`min-w-0 w-full text-right text-sm font-black ${color} bg-transparent border-none outline-none border-b border-dashed border-slate-200 hover:border-slate-300 focus:border-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none transition-colors`}
      />
    </div>
  </div>
);

export const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">{label}</label>
    {children}
  </div>
);

export const inputCls = "w-full rounded-lg border border-input bg-background px-3 py-2.5 min-h-[48px] sm:min-h-0 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40";
