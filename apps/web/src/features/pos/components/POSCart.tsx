import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PosItem } from '../stores/pos.store';

interface POSCartProps {
  title: string;
  items: PosItem[];
  totalCount: number; // Item count or Subtotal? Wireframe says "total no of added cylinder".
  variant: 'selling' | 'returned';
}

export const POSCart = ({ title, items, totalCount, variant }: POSCartProps) => {
  const isSelling = variant === 'selling';
  const borderColor = isSelling ? 'border-green-200' : 'border-orange-200';
  const bgColor = isSelling ? 'bg-green-50/30' : 'bg-orange-50/30';
  const badgeVariant = isSelling ? 'success' : 'warning'; // Assuming custom variants or fallback

  const totalQuantity = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <Card className={`h-full flex flex-row items-center p-2 gap-4 border-2 ${borderColor} ${bgColor}`}>
      {/* Title & Total Badge */}
      <div className="flex flex-col items-center justify-center min-w-[100px] gap-1 p-2 border-r border-border/50">
        <span className="text-sm font-bold uppercase text-muted-foreground tracking-wider">{title}</span>
        <Badge variant="outline" className="text-lg px-3 py-1 bg-background">
          {totalQuantity}
        </Badge>
      </div>

      {/* Horizontal Scrollable Items */}
      <ScrollArea className="flex-1 whitespace-nowrap w-full">
        <div className="flex space-x-4 p-2">
          {items.length === 0 ? (
            <span className="text-muted-foreground text-sm italic">Empty Cart</span>
          ) : (
            items.map((item) => (
              <div key={item.productId} className="flex flex-col items-center bg-background border rounded-md p-2 min-w-[80px] shadow-sm">
                <span className="font-bold text-sm truncate max-w-[100px]">{item.name}</span>
                <span className="text-xs text-muted-foreground">{item.description}</span>
                <Badge className="mt-1" variant={isSelling ? 'default' : 'secondary'}>
                  x{item.quantity}
                </Badge>
              </div>
            ))
          )}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </Card>
  );
};
