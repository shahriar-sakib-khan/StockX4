
import { useParams } from 'react-router-dom';
import { StaffList } from '@/features/staff/components/StaffList';
import { useQuery } from '@tanstack/react-query';
import { storeApi } from '../api/store.api';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Copy, ExternalLink, QrCode } from 'lucide-react';
import QRCode from 'react-qr-code';
import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';

export const StoreStaffPage = () => {
  const { id } = useParams<{ id: string }>();
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  // Fetch store to get the slug
  const { data: storeData } = useQuery({
    queryKey: ['store', id],
    queryFn: () => storeApi.get(id!),
    enabled: !!id,
  });

  const store = storeData?.store;
  const loginUrl = store ? `${window.location.origin}/staff/login?store=${store.slug}` : '';

  const copyLink = () => {
    if (!loginUrl) return;
    navigator.clipboard.writeText(loginUrl);
    toast.success('Login link copied to clipboard');
  };

  if (!id) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Staff Members</h2>
            <p className="text-muted-foreground">Manage access and permissions for your store staff.</p>
          </div>

          {store && (
             <div className="flex items-center gap-2">
                 <Button variant="outline" size="sm" onClick={copyLink}>
                     <Copy className="w-4 h-4 mr-2" />
                     Copy Login Link
                 </Button>

                 <Button variant="outline" size="sm" onClick={() => setIsQRModalOpen(true)}>
                    <QrCode className="w-4 h-4 mr-2" />
                    Show QR Code
                 </Button>

                 <Modal
                    isOpen={isQRModalOpen}
                    onClose={() => setIsQRModalOpen(false)}
                    title="Store Login QR Code"
                 >
                        <div className="flex flex-col items-center justify-center p-6 space-y-4">
                            <div className="bg-white p-4 rounded-xl border border-gray-200">
                                <QRCode value={loginUrl} size={200} />
                            </div>
                            <p className="text-sm text-center text-muted-foreground">
                                Scan this to open the Staff Login page automatically.
                            </p>
                            <code className="text-xs bg-muted p-2 rounded break-all text-center">
                                {store.slug}
                            </code>
                        </div>
                 </Modal>
             </div>
          )}
      </div>

      {store && (
        <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full text-blue-600 dark:text-blue-400">
                    <ExternalLink className="w-5 h-5" />
                </div>
                <div>
                    <h4 className="font-medium text-blue-900 dark:text-blue-100">Store Login Portal</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                        Staff should login at: <span className="font-mono font-bold">{loginUrl}</span>
                    </p>
                </div>
            </div>
        </div>
      )}

      <StaffList storeId={id} />
    </div>
  );
};
