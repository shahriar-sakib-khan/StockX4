import { X, AlertTriangle } from 'lucide-react';

interface CylinderSizeSelectorProps {
  activeSizes: string[];
  activeSize: string;
  sortedSizes: string[];
  customSizeInput: string;
  setCustomSizeInput: (val: string) => void;
  toggleSize: (size: string) => void;
  requestDeleteSize: (size: string) => void;
  addCustomSize: () => void;
  hasDataForSize: (size: string) => boolean;
}

export const CylinderSizeSelector = ({
  activeSizes,
  activeSize,
  sortedSizes,
  customSizeInput,
  setCustomSizeInput,
  toggleSize,
  requestDeleteSize,
  addCustomSize,
  hasDataForSize
}: CylinderSizeSelectorProps) => {
  return (
      <div className="border rounded-xl p-4 bg-muted/20 space-y-3">
        <p className="text-xs font-black text-muted-foreground uppercase tracking-wider">Select Cylinder Sizes</p>
        <div className="flex flex-wrap items-center gap-2">
          {sortedSizes.map(size => {
            const active = activeSize === size;
            const hasData = hasDataForSize(size);
            return (
              <div key={size} className="flex items-stretch rounded-lg shadow-sm overflow-hidden relative">
                {hasData && (
                  <div className="absolute top-0 right-0 p-0.5">
                    <AlertTriangle className="w-3 h-3 text-amber-500 fill-amber-100" />
                  </div>
                )}
                <button
                  onClick={() => toggleSize(size)}
                  className={`px-4 py-2 sm:py-1.5 min-h-[48px] sm:min-h-0 text-sm font-bold transition-all border-y border-l ${
                    active
                      ? 'bg-orange-500 text-white border-orange-500'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {size}
                </button>
                <button
                  onClick={() => requestDeleteSize(size)}
                  disabled={activeSizes.length === 1}
                  className={`px-2 flex items-center justify-center min-h-[48px] sm:min-h-0 transition-all border-y border-r ${
                    active
                      ? 'bg-orange-600 text-white border-orange-600 hover:bg-orange-700 disabled:opacity-50'
                      : 'bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200 hover:text-slate-600 disabled:opacity-50'
                  }`}
                  title="Remove size from store"
                >
                  <X size={14} strokeWidth={3} />
                </button>
              </div>
            );
          })}

          {/* Custom size input */}
          <div className="flex items-stretch min-h-[48px] sm:h-[34px] ml-0 sm:ml-2 mt-2 sm:mt-0 w-full sm:w-auto">
            <input
              type="text"
              inputMode="decimal"
              value={customSizeInput}
              onChange={e => {
                // Allow only numbers and a single decimal point
                const val = e.target.value.replace(/[^0-9.]/g, '');
                if (val.split('.').length > 2) return;
                setCustomSizeInput(val);
              }}
              onKeyDown={e => e.key === 'Enter' && addCustomSize()}
              placeholder="e.g. 22.5"
              className="flex-1 sm:w-28 rounded-l-lg border border-slate-200 bg-white px-3 text-sm font-bold focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
            />
            <button
              onClick={addCustomSize}
              className="px-6 sm:px-3 rounded-r-lg bg-orange-500 text-white border-y border-r border-orange-500 text-sm font-black uppercase tracking-widest hover:bg-orange-600 transition"
            >
              + Add
            </button>
          </div>
        </div>
      </div>
  );
};
