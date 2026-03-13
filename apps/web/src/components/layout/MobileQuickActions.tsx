import { Plus, ShoppingCart, Receipt, X } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AddExpenseModal } from '@/features/pos/components/AddExpenseModal';

export const MobileQuickActions = () => {
    const { id } = useParams<{ id: string }>();
    const [isOpen, setIsOpen] = useState(false);
    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

    if (!id) return null;

    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] animate-in fade-in duration-200"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Actions Menu */}
            <div className={`fixed right-6 bottom-24 z-[101] flex flex-col items-end gap-3 transition-all duration-300 ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}>
                {/* Sale Action */}
                <div className="flex items-center gap-3">
                    <span className="bg-white px-3 py-1.5 rounded-lg text-xs font-black shadow-lg text-slate-700 uppercase tracking-wider">New Sale</span>
                    <Link 
                        to={`/stores/${id}/pos`}
                        onClick={() => setIsOpen(false)}
                        className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-xl hover:scale-105 active:scale-95 transition-all"
                    >
                        <ShoppingCart size={24} />
                    </Link>
                </div>

                {/* Expense Action */}
                <div className="flex items-center gap-3">
                    <span className="bg-white px-3 py-1.5 rounded-lg text-xs font-black shadow-lg text-slate-700 uppercase tracking-wider">New Expense</span>
                    <button 
                        onClick={() => {
                            setIsExpenseModalOpen(true);
                            setIsOpen(false);
                        }}
                        className="w-14 h-14 bg-rose-500 rounded-2xl flex items-center justify-center text-white shadow-xl hover:scale-105 active:scale-95 transition-all"
                    >
                        <Receipt size={24} />
                    </button>
                </div>
            </div>

            {/* Main FAB */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed right-6 bottom-24 z-[102] w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-500 active:scale-90 ${isOpen ? 'bg-slate-900 text-white rotate-45' : 'bg-primary text-white'}`}
            >
                {isOpen ? <X size={28} /> : <Plus size={28} strokeWidth={3} />}
            </button>

            {/* Modals */}
            {isExpenseModalOpen && (
                <AddExpenseModal isOpen={true} onClose={() => setIsExpenseModalOpen(false)} />
            )}
        </>
    );
};
