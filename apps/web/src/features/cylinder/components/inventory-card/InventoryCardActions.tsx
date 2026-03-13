import { Button } from "@/components/ui/button";
import { PackagePlus } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface InventoryCardActionsProps {
    item: any;
    storeId: string;
    onRestock: (item: any) => void;
}

export const InventoryCardActions = ({ item, storeId, onRestock }: InventoryCardActionsProps) => {
    const navigate = useNavigate();
    return (
        <div className="flex items-center gap-2 mt-auto pt-1 shrink-0">
            <Button
                onClick={() => onRestock(item)}
                size="lg"
                className="flex-1 h-12 text-sm font-black bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm shadow-primary/30 hover:shadow-md transition-all active:scale-95"
            >
                <PackagePlus className="w-5 h-5 mr-2" />
                Restock Item
            </Button>
        </div>
    );
};
