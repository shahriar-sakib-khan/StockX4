import { Settings } from 'lucide-react';
import { useStoreSizes, sortSizes } from '@/features/store/hooks/useStoreSizes';

interface InventoryFilterStripProps {
  storeId: string;
  activeSize: string | null;
  onSizeChange: (size: string | null) => void;
  onEditSizesClick?: () => void;
}

export const InventoryFilterStrip = ({ storeId, activeSize, onSizeChange, onEditSizesClick }: InventoryFilterStripProps) => {
  const { sizes, isLoading } = useStoreSizes(storeId);

  if (isLoading) {
    return (
      <div className="flex gap-2 animate-pulse overflow-hidden w-full h-9">
        <div className="w-16 h-full bg-muted rounded-full" />
        <div className="w-20 h-full bg-muted rounded-full" />
        <div className="w-20 h-full bg-muted rounded-full" />
      </div>
    );
  }

  const sortedSizes = sortSizes(sizes);

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide py-1">
      <button
        type="button"
        onClick={() => onSizeChange(null)}
        className={`shrink-0 px-6 py-3 rounded-full text-sm font-black border transition-all active:scale-95 ${
          activeSize === null
            ? 'bg-primary text-primary-foreground border-primary shadow-md ring-2 ring-primary/20'
            : 'bg-card text-slate-600 border-slate-200 hover:bg-muted hover:text-foreground'
        }`}
      >
        All
      </button>

      {sortedSizes.map(size => {
        const isSelected = activeSize === size;
        return (
          <button
            key={size}
            type="button"
            onClick={() => onSizeChange(size)}
            className={`shrink-0 px-6 py-3 rounded-full text-sm font-black border transition-all active:scale-95 ${
              isSelected
                ? 'bg-primary text-primary-foreground border-primary shadow-md ring-2 ring-primary/20'
                : 'bg-card text-slate-600 border-slate-200 hover:bg-muted hover:text-foreground'
            }`}
          >
            {size}
          </button>
        );
      })}

      {onEditSizesClick && (
        <button
          type="button"
          onClick={onEditSizesClick}
          className="shrink-0 px-4 py-3 ml-2 rounded-full text-sm font-bold border border-dashed border-slate-300 text-slate-500 hover:bg-slate-50 hover:text-slate-800 flex items-center gap-1.5 transition-all active:scale-95"
          title="Edit Store Sizes"
        >
          <Settings size={16} />
          Edit
        </button>
      )}
    </div>
  );
};
