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
        className={`fixed inset-0 z-[9999] flex justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto ${align === 'top' ? 'items-start pt-20' : 'items-center'}`}
        onClick={onClose} // Close on backdrop click
    >
      <div
        ref={modalRef}
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking content
        className={`bg-white text-card-foreground border border-border rounded-xl w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[95vh] ${className || 'max-w-md'}`}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border shrink-0">
          <h3 className="text-xl font-semibold leading-none tracking-tight">{title}</h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg hover:bg-muted"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 min-h-0">
          {children}
        </div>

        {/* Sticky Footer */}
        {footer && (
          <div className="p-6 border-t border-border bg-slate-50/50 rounded-b-xl shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
