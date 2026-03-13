import { X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  align?: 'center' | 'top';
}

export const Modal = ({ isOpen, onClose, title, children, footer, className, align = 'center' }: ModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);

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

  if (!isOpen) return null;

  return createPortal(
    <div
        className={`fixed inset-0 z-[9999] flex justify-center sm:p-4 bg-black/50 backdrop-blur-sm overflow-y-auto ${align === 'top' ? 'items-start sm:pt-20' : 'items-center'}`}
        onClick={onClose}
    >
      <div
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        className={`bg-white text-card-foreground border-x-0 sm:border border-border sm:rounded-[2rem] w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col h-full sm:h-auto sm:max-h-[85vh] md:max-h-[95vh] ${className || 'max-w-md'}`}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 md:p-6 border-b border-border shrink-0">
          <h3 className="text-sm sm:text-lg md:text-xl font-black leading-none tracking-tight uppercase">{title}</h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors p-1.5 sm:p-2 rounded-xl hover:bg-slate-100 active:scale-95"
          >
            <X className="size-4 sm:size-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-8 min-h-0">
          {children}
        </div>

        {/* Sticky Footer */}
        {footer && (
          <div className="p-4 sm:p-6 border-t border-border bg-slate-50/50 sm:rounded-b-[2rem] shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
