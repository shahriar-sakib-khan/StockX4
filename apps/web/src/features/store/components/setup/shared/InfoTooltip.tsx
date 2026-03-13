import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Info, X } from 'lucide-react';

interface InfoTooltipProps {
  content: string;
}

export const InfoTooltip = ({ content }: InfoTooltipProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPos({
        top: rect.top - 8, // place above the button
        left: rect.left + rect.width / 2,
      });
    }
  }, [isOpen]);

  return (
    <span className="relative inline-block ml-1.5 align-middle">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-primary outline-none focus:ring-2 focus:ring-primary/20"
        aria-label="Show information"
      >
        <Info size={18} strokeWidth={2.5} />
      </button>

      {isOpen && createPortal(
        <>
          {/* Backdrop to close on click outside */}
          <div 
            className="fixed inset-0 z-[9998]" 
            onClick={() => setIsOpen(false)}
          />
          
          {pos && (
            <div
              className="fixed z-[9999] w-64 p-3 bg-slate-800 text-white text-xs rounded-xl shadow-xl animate-in fade-in zoom-in-95 duration-200"
              style={{
                top: pos.top,
                left: pos.left,
                transform: 'translate(-50%, -100%)',
              }}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="font-bold text-[10px] uppercase tracking-widest text-slate-400">Quick Guide</span>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-0.5 hover:bg-white/10 rounded-md transition-colors"
                >
                  <X size={12} />
                </button>
              </div>
              <p className="leading-relaxed font-medium">{content}</p>
              {/* Arrow */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-800" />
            </div>
          )}
        </>,
        document.body
      )}
    </span>
  );
};
