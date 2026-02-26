import { Check, AlertTriangle } from 'lucide-react';

interface SetupBrandCardProps {
  brand: any;
  isSelected: boolean;
  hasData: boolean;
  onToggle: (brand: any) => void;
}

export const SetupBrandCard = ({ brand, isSelected, hasData, onToggle }: SetupBrandCardProps) => {
  return (
    <div
      onClick={() => onToggle(brand)}
      className={`relative cursor-pointer rounded-xl border-2 p-4 flex flex-col items-center justify-center transition-all ${
        isSelected ? 'border-primary bg-primary/5 shadow-sm' : 'border-border hover:border-primary/50'
      }`}
    >
      {isSelected && (
        <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-0.5">
          <Check size={14} />
        </div>
      )}
      {hasData && (
        <div className="absolute top-2 left-2 bg-amber-100 text-amber-700 rounded-full p-0.5" title="Has data in Step 3">
          <AlertTriangle size={12} />
        </div>
      )}
      <div className="h-12 w-full flex items-center justify-center mb-2">
        {brand.logo ? (
          <img src={brand.logo} alt={brand.name} className="max-h-full max-w-full object-contain" />
        ) : (
          <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center font-bold text-muted-foreground">
            {brand.name.substring(0, 2)}
          </div>
        )}
      </div>
      <span className="text-sm font-medium text-center">{brand.name}</span>
    </div>
  );
};
