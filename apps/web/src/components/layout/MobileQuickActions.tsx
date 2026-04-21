import { Plus, ShoppingCart, Receipt, X } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { AddExpenseModal } from '@/features/pos/components/AddExpenseModal';

export const MobileQuickActions = () => {
    const { id } = useParams<{ id: string }>();
    const [isOpen, setIsOpen] = useState(false);
    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

    if (!id) return null;

    // Strictly typed Framer Motion Animation Variants
    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                staggerDirection: -1,
            }
        }
    };

    const itemVariants: Variants = {
        hidden: { y: 20, opacity: 0, scale: 0.8 },
        visible: { 
            y: 0, 
            opacity: 1, 
            scale: 1,
            transition: { type: "spring", stiffness: 350, damping: 25 }
        },
        exit: { y: 20, opacity: 0, scale: 0.8, transition: { duration: 0.2 } }
    };

    return (
        <>
            <AnimatePresence>
                {/* Frosted Glass Backdrop */}
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
                        onClick={() => setIsOpen(false)}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {/* Staggered Actions Menu */}
                {isOpen && (
                    <motion.div 
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        className="fixed right-6 bottom-40 z-[101] flex flex-col items-end gap-4"
                    >
                        {/* Sale Action */}
                        <motion.div variants={itemVariants} className="flex items-center gap-4">
                            <span className="bg-background/90 backdrop-blur-md px-4 py-2 rounded-xl text-sm font-semibold shadow-sm text-foreground border border-border/50">
                                New Sale
                            </span>
                            <Link 
                                to={`/stores/${id}/pos`}
                                onClick={() => setIsOpen(false)}
                                className="w-14 h-14 bg-primary rounded-full flex items-center justify-center text-primary-foreground shadow-xl active:scale-90 transition-transform"
                            >
                                <ShoppingCart size={22} strokeWidth={2.5} />
                            </Link>
                        </motion.div>

                        {/* Expense Action */}
                        <motion.div variants={itemVariants} className="flex items-center gap-4">
                            <span className="bg-background/90 backdrop-blur-md px-4 py-2 rounded-xl text-sm font-semibold shadow-sm text-foreground border border-border/50">
                                New Expense
                            </span>
                            <button 
                                onClick={() => {
                                    setIsExpenseModalOpen(true);
                                    setIsOpen(false);
                                }}
                                className="w-14 h-14 bg-destructive rounded-full flex items-center justify-center text-destructive-foreground shadow-xl active:scale-90 transition-transform"
                            >
                                <Receipt size={22} strokeWidth={2.5} />
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main FAB Toggle */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                animate={{ 
                    rotate: isOpen ? 135 : 0,
                    backgroundColor: isOpen ? 'hsl(var(--foreground))' : 'hsl(var(--primary))',
                    color: isOpen ? 'hsl(var(--background))' : 'hsl(var(--primary-foreground))'
                }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="fixed right-6 bottom-24 z-[102] w-14 h-14 rounded-full flex items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.12)] active:scale-90"
            >
                <Plus size={28} strokeWidth={2.5} />
            </motion.button>

            {/* Modals */}
            {isExpenseModalOpen && (
                <AddExpenseModal isOpen={true} onClose={() => setIsExpenseModalOpen(false)} />
            )}
        </>
    );
};