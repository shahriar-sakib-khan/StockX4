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
      <div className="flex flex-wrap gap-1.5 w-full sm:w-fit bg-muted/30 p-1.5 rounded-xl border border-border/40 animate-pulse">
        <div className="flex-1 sm:flex-none sm:w-20 h-8 bg-muted/50 rounded-lg" />
        <div className="flex-1 sm:flex-none sm:w-16 h-8 bg-muted/50 rounded-lg" />
        <div className="flex-1 sm:flex-none sm:w-16 h-8 bg-muted/50 rounded-lg" />
      </div>
    );
  }

  const sortedSizes = sortSizes(sizes);

  return (
    // w-full on mobile to utilize space, w-fit on desktop to stay compact
    <div className="flex flex-wrap items-center gap-1.5 bg-muted/40 p-1.5 rounded-xl w-full sm:w-fit border border-border/50 shadow-inner">
      
      <button
        type="button"
        onClick={() => onSizeChange(null)}
        // flex-1 forces buttons to share space equally on mobile, preventing awkward empty gaps
        className={`flex-1 sm:flex-none px-4 py-1.5 text-[11px] sm:text-xs font-bold rounded-lg transition-all duration-300 outline-none active:scale-95 ${
          activeSize === null
            ? 'bg-primary text-primary-foreground shadow-[0_4px_10px_rgba(var(--primary),0.3)]'
            : 'bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground'
        }`}
      >
        All Weights
      </button>

      {sortedSizes.map(size => {
        const isSelected = activeSize === size;
        return (
          <button
            key={size}
            type="button"
            onClick={() => onSizeChange(size)}
            className={`flex-1 sm:flex-none px-4 py-1.5 text-[11px] sm:text-xs font-bold rounded-lg transition-all duration-300 outline-none active:scale-95 ${
              isSelected
                ? 'bg-primary text-primary-foreground shadow-[0_4px_10px_rgba(var(--primary),0.3)]'
                : 'bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground'
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
          // ml-auto pushes it to the far right if it wraps to a new line on mobile
          className="flex-1 sm:flex-none px-3 py-1.5 ml-auto sm:ml-1 rounded-lg text-[11px] sm:text-xs font-bold border border-dashed border-border/60 text-muted-foreground hover:bg-muted/80 hover:text-foreground flex items-center justify-center gap-1.5 transition-all active:scale-95"
          title="Edit Store Sizes"
        >
          <Settings size={13} strokeWidth={2.5} />
          Edit
        </button>
      )}
    </div>
  );
};