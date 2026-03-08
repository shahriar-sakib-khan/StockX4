import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/button';
import { Info, ChevronRight } from 'lucide-react';
import { AllocatedDue } from '../stores/pos.types';

interface DueCylinderModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    items: AllocatedDue[];
    maxTotal?: number;
    onConfirm: (allocated: AllocatedDue[]) => void;
    mode: 'ALLOCATE' | 'SETTLE';
}

export const DueCylinderModal = ({
    isOpen,
    onClose,
    title,
    description,
    items,
    maxTotal,
    onConfirm,
    mode,
    confirmLabel
}: DueCylinderModalProps & { confirmLabel?: string }) => {
    const [localItems, setLocalItems] = useState<AllocatedDue[]>([]);

    useEffect(() => {
        if (isOpen) {
            setLocalItems(JSON.parse(JSON.stringify(items))); // Deep clone for local editing
        }
    }, [isOpen, items]);

    const currentTotalAllocated = localItems.reduce((acc, b) => acc + (b.selectedQty || 0), 0);
    const isConfirmDisabled = mode === 'ALLOCATE'
        ? currentTotalAllocated !== maxTotal
        : false; // Always allow Done for settlement even if none selected (decided not to)

    const handleUpdateQty = (idx: number, delta: number) => {
        const newArr = [...localItems];
        const item = newArr[idx];
        const newQty = (item.selectedQty || 0) + delta;

        if (delta > 0) {
            if (newQty > item.maxQty) return;
            if (mode === 'ALLOCATE' && maxTotal !== undefined && currentTotalAllocated >= maxTotal) return;
        } else {
            if (newQty < 0) return;
        }

        newArr[idx] = { ...item, selectedQty: newQty };
        setLocalItems(newArr);
    };

    const handleConfirm = () => {
        onConfirm(localItems);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            className="max-w-md"
            footer={
                <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={onClose} className="font-bold uppercase tracking-wider text-xs">
                        Cancel
                    </Button>
                    <Button
                        disabled={isConfirmDisabled}
                        onClick={handleConfirm}
                        className={`px-8 font-black uppercase tracking-widest text-xs shadow-md transition-all duration-300 ${
                            !isConfirmDisabled
                                ? (mode === 'SETTLE' ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-primary hover:bg-primary/90 text-white')
                                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                    >
                        {confirmLabel || (mode === 'ALLOCATE' ? 'Confirm Allocation' : 'Complete Settlement')} <ChevronRight className="ml-2 w-4 h-4" />
                    </Button>
                </div>
            }
        >
            <div className="space-y-4">
                <div className={`${mode === 'SETTLE' ? 'bg-green-50 text-green-800 border-green-200' : 'bg-orange-50 text-orange-800 border-orange-200'} p-4 rounded-lg flex items-start gap-3 border`}>
                    <Info className="w-5 h-5 shrink-0 mt-0.5" />
                    <div>
                        <p className="font-semibold text-sm">{mode === 'ALLOCATE' ? 'Cylinder Mismatch' : 'Return Due Cylinders'}</p>
                        <p className="text-sm mt-1 opacity-90">
                            {description || (mode === 'ALLOCATE'
                                ? `${maxTotal} cylinder(s) will be kept as DUE. Please select which ones.`
                                : 'Select which due cylinders are being returned now.')}
                        </p>
                    </div>
                </div>

                <div className="space-y-3 mt-4 pr-2 scrollbar-thin">
                    {localItems.map((brand, idx) => (
                        <div key={brand.productId + idx} className="flex items-center justify-between p-3 border rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-3">
                                {brand.image ? (
                                    <img src={brand.image} alt={brand.brandName} className="w-12 h-12 object-contain mix-blend-multiply drop-shadow-sm" />
                                ) : (
                                    <div className="w-12 h-12 bg-slate-200 rounded-lg flex items-center justify-center text-[10px] text-slate-400 font-bold uppercase">No Img</div>
                                )}
                                <div>
                                    <div className="font-bold text-slate-800 leading-tight">{brand.brandName}</div>
                                    <div className="flex gap-1 mt-1">
                                        {brand.size && <span className="text-[10px] font-black bg-blue-100 text-blue-700 px-2 py-0.5 rounded border border-blue-200">{brand.size}</span>}
                                        {brand.regulator && <span className="text-[10px] font-black bg-amber-100 text-amber-700 px-2 py-0.5 rounded border border-amber-200">{brand.regulator}</span>}
                                    </div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase mt-1">
                                        {mode === 'ALLOCATE' ? `Available: ${brand.maxQty}` : `Owed: ${brand.maxQty}`}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 bg-white rounded-lg p-1 border shadow-sm">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-slate-500 hover:text-red-500 hover:bg-red-50"
                                    onClick={() => handleUpdateQty(idx, -1)}
                                    disabled={brand.selectedQty === 0}
                                >-</Button>
                                <span className={`w-8 text-center font-black text-lg ${brand.selectedQty > 0 ? 'text-primary' : 'text-slate-300'}`}>
                                    {brand.selectedQty || 0}
                                </span>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-slate-500 hover:text-green-500 hover:bg-green-50"
                                    onClick={() => handleUpdateQty(idx, 1)}
                                    disabled={brand.selectedQty === brand.maxQty || (mode === 'ALLOCATE' && maxTotal !== undefined && currentTotalAllocated >= maxTotal)}
                                >+</Button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex items-center justify-between px-2 pt-2">
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Selected</span>
                            <span className={`text-xl font-black ${mode === 'ALLOCATE' && currentTotalAllocated !== maxTotal ? 'text-amber-500' : 'text-green-600'}`}>
                                {currentTotalAllocated} {maxTotal !== undefined && mode === 'ALLOCATE' && `/ ${maxTotal}`}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
};
