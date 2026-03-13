import { X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  side?: 'right' | 'left';
}

export const Sheet = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  footer, 
  className,
  side = 'right'
}: SheetProps) => {
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const slideVariants = {
    hidden: { x: side === 'right' ? '100%' : '-100%' },
    visible: { x: 0 },
    exit: { x: side === 'right' ? '100%' : '-100%' }
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div key="sheet-overlay" className="fixed inset-0 z-[9999] flex">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Sheet Content */}
          <motion.div
            ref={sheetRef}
            variants={slideVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={cn(
              "absolute inset-y-0 flex flex-col bg-white text-card-foreground shadow-2xl overflow-hidden w-full sm:max-w-xl",
              side === 'right' ? 'right-0' : 'left-0',
              className
            )}
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border shrink-0 bg-white">
              <h3 className="text-lg sm:text-xl font-black leading-none tracking-tight uppercase text-slate-800">
                {title}
              </h3>
              <button
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-xl hover:bg-slate-100 active:scale-95"
              >
                <X className="size-5 sm:size-6" />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 min-h-0 bg-white">
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="p-4 sm:p-8 border-t border-border bg-slate-50 shrink-0">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};
