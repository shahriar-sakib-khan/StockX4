import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState, useMemo } from "react";

interface POSCustomerModalProps {
    open: boolean;
    onClose: () => void;
    customers: any[];
    onSelect: (customer: any) => void;
}

export const POSCustomerModal = ({ open, onClose, customers, onSelect }: POSCustomerModalProps) => {
    const [search, setSearch] = useState("");

    const filtered = useMemo(() => {
        if (!search) return customers;
        const s = search.toLowerCase();
        return customers.filter(c =>
            c.name?.toLowerCase().includes(s) ||
            c.phone?.includes(s) ||
            c.ownerName?.toLowerCase().includes(s)
        );
    }, [customers, search]);

    const handleSelect = (c: any) => {
        onSelect(c);
        onClose();
    };

    return (
        <Modal
            isOpen={open}
            onClose={onClose}
            title="Select Customer"
            className="sm:max-w-md p-0"
        >
            <div className="space-y-4">
                <div className="sticky top-0 bg-white pb-4 shrink-0 border-b z-10">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by name or phone..."
                            className="pl-9"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    {filtered.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No matching customers found.
                        </div>
                    ) : (
                        filtered.map(c => {
                            const cylinderCount = c.dueCylinders?.reduce((sum: number, d: any) => sum + d.quantity, 0) || 0;
                            return (
                                <div
                                    key={c._id}
                                    onClick={() => handleSelect(c)}
                                    className="flex justify-between items-center p-3 rounded-lg border hover:border-primary hover:bg-primary/5 cursor-pointer transition-colors"
                                >
                                    <div className="flex-1 min-w-0 pr-4">
                                        <div className="font-bold text-slate-800 truncate">{c.name}</div>
                                        <div className="text-sm font-medium text-slate-500 truncate">{c.phone}</div>
                                    </div>

                                    <div className="flex items-center gap-3 shrink-0 mr-4">
                                        {c.totalDue > 0 && (
                                            <div className="text-right">
                                                <div className="text-[10px] font-bold text-red-400 uppercase leading-none">Due</div>
                                                <div className="text-sm font-black text-red-600 leading-tight">৳{c.totalDue}</div>
                                            </div>
                                        )}
                                        {cylinderCount > 0 && (
                                            <div className="text-right border-l pl-3 border-slate-100">
                                                <div className="text-[10px] font-bold text-amber-500 uppercase leading-none">Cyl</div>
                                                <div className="text-sm font-black text-amber-600 leading-tight">{cylinderCount}</div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="text-xs font-bold px-3 py-1.5 bg-slate-100 text-slate-600 rounded-md hover:bg-primary hover:text-white transition-colors shrink-0">
                                        Select
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
