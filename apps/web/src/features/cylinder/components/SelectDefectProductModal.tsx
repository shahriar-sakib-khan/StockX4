import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/input";
import { Search, Flame, Settings, Plus } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

interface SelectDefectProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    inventory: any[];
    category: 'stove' | 'regulator';
    onSelect: (item: any) => void;
}

export const SelectDefectProductModal = ({ isOpen, onClose, inventory, category, onSelect }: SelectDefectProductModalProps) => {
    const [search, setSearch] = useState("");

    const filteredInventory = inventory.filter((item: any) => {
        if (item.category !== category) return false;
        if (search && !item.brandName?.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    const isStove = category === 'stove';

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Select a ${isStove ? 'Stove' : 'Regulator'} to Record Defect`}
        >
            <div className="flex flex-col h-[60vh] md:h-[500px]">
                <p className="text-sm text-muted-foreground mb-4 shrink-0">
                    Choose an item from your current stock to log a defective quantity.
                </p>

                <div className="relative shrink-0 mb-6">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder={`Search ${isStove ? 'stoves' : 'regulators'}...`}
                        className="pl-9 bg-muted/50 border-slate-200 h-10"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        autoFocus
                    />
                </div>

                <div className="flex-1 overflow-y-auto min-h-0 pr-2 scrollbar-thin scrollbar-thumb-muted-foreground/20 space-y-2">
                    {filteredInventory.length === 0 ? (
                        <div className="text-center p-8 text-muted-foreground bg-slate-50 rounded-xl border border-dashed">
                            No items found in your current inventory matching that search.
                        </div>
                    ) : (
                        filteredInventory.map((item: any) => {
                            const variantLabel = isStove ? `${item.variant?.burners} Burner` : `${item.variant?.size}`;
                            const displayImage = item.variant?.cylinderImage;

                            return (
                                <div
                                    key={item._id}
                                    onClick={() => onSelect(item)}
                                    className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-expense hover:bg-expense/5 transition-all cursor-pointer group bg-white shadow-sm hover:shadow"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-center p-1 relative shrink-0">
                                            {displayImage ? (
                                                <img src={displayImage} alt={item.brandName} className="w-full h-full object-contain" />
                                            ) : (
                                                <div className="text-slate-300">
                                                    {isStove ? <Flame className="w-6 h-6" /> : <Settings className="w-6 h-6" />}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-800 flex items-center gap-2">
                                                {item.brandName}
                                                <Badge variant="secondary" className="text-[10px] py-0 px-1.5 font-bold uppercase tracking-wider bg-slate-100 text-slate-600">
                                                    {variantLabel}
                                                </Badge>
                                            </h4>
                                            <div className="flex items-center gap-3 mt-1 text-sm font-medium">
                                                <span className="text-income">Stock: {item.counts?.full || 0}</span>
                                                <span className="text-slate-300">|</span>
                                                <span className="text-expense">Defect: {item.counts?.defected || 0}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-expense/10 flex items-center justify-center text-slate-400 group-hover:text-expense transition-colors shrink-0">
                                         <Plus className="w-4 h-4" />
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </Modal>
    );
};
