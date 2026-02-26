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
            className="sm:max-w-md flex flex-col p-0"
        >
            <div className="flex flex-col max-h-[60vh] -m-6 mt-0">
                <div className="px-6 pb-4 shrink-0 border-b">
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

                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
                    {filtered.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No matching customers found.
                        </div>
                    ) : (
                        filtered.map(c => (
                            <div
                                key={c._id}
                                onClick={() => handleSelect(c)}
                                className="flex justify-between items-center p-3 rounded-lg border hover:border-primary hover:bg-primary/5 cursor-pointer transition-colors"
                            >
                                <div>
                                    <div className="font-bold text-slate-800">{c.name}</div>
                                    <div className="text-sm font-medium text-slate-500">{c.phone}</div>
                                </div>
                                <div className="text-xs font-bold px-2 py-1 bg-slate-100 text-slate-600 rounded">
                                    Select
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </Modal>
    );
};
