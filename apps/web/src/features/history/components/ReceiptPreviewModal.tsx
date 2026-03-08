import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/button';
import { Download, X } from 'lucide-react';

interface ReceiptPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    imageUrl: string;
    title?: string;
}

export const ReceiptPreviewModal = ({ isOpen, onClose, imageUrl, title = "Receipt Preview" }: ReceiptPreviewModalProps) => {
    if (!imageUrl) return null;

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = `receipt-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title={title}
            className="max-w-4xl bg-slate-50/50"
        >
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 space-y-4">
                <div className="relative aspect-auto max-h-[70vh] overflow-auto rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center group">
                    <img 
                        src={imageUrl} 
                        alt="Receipt" 
                        className="max-w-full h-auto object-contain shadow-2xl rounded-lg"
                    />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button variant="outline" onClick={onClose} className="rounded-xl px-6">
                        Close
                    </Button>
                    <Button 
                        onClick={handleDownload}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-6 shadow-lg shadow-emerald-100 transition-all active:scale-95"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Download Image
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
