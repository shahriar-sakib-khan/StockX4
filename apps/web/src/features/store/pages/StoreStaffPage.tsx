
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
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Staff Members</h2>
            <p className="text-muted-foreground mt-1">Manage access and permissions for your store staff.</p>
          </div>

          {store && (
             <div className="flex items-center gap-2">
                 <Button variant="outline" className="h-9" onClick={copyLink}>
                     <Copy className="w-4 h-4 mr-2" />
                     Copy Login Link
                 </Button>

                 <Button variant="outline" className="h-9" onClick={() => setIsQRModalOpen(true)}>
                    <QrCode className="w-4 h-4 mr-2" />
                    Show QR Code
                 </Button>

                 <Modal
                    isOpen={isQRModalOpen}
                    onClose={() => setIsQRModalOpen(false)}
                    title="Store Login QR Code"
                 >
                        <div className="flex flex-col items-center justify-center p-6 space-y-4">
                            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                <QRCode value={loginUrl} size={200} />
                            </div>
                            <p className="text-sm text-center text-muted-foreground">
                                Scan this to open the Staff Login page automatically.
                            </p>
                            <div className="flex items-center gap-2 bg-muted/50 p-2 rounded-lg border w-full justify-center">
                                <code className="text-xs font-mono font-bold text-primary">
                                    {store.slug}
                                </code>
                            </div>
                        </div>
                 </Modal>
             </div>
          )}
      </div>

      {store && (
        <div className="relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-90 dark:opacity-80" />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />

            <div className="relative p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 rounded-2xl shadow-xl">
                <div className="flex items-start gap-4 text-white">
                    <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-inner">
                        <ExternalLink className="w-6 h-6 text-blue-100" />
                    </div>
                    <div>
                        <h4 className="text-xl font-bold text-white mb-1">Store Login Portal</h4>
                        <p className="text-blue-100 max-w-lg leading-relaxed">
                            Staff members can access their dashboard securely using the dedicated portal link below.
                        </p>
                    </div>
                </div>

                <div className="w-full md:w-auto bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-1.5 pl-4 flex items-center gap-2">
                    <span className="font-mono text-sm font-semibold text-blue-50 truncate max-w-[200px] md:max-w-xs">{loginUrl}</span>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={copyLink}
                        className="text-white hover:bg-white/20 hover:text-white shrink-0"
                    >
                        <Copy className="w-4 h-4" />
                    </Button>
                    <a
                        href={loginUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-white/20 text-white transition-colors"
                    >
                        <ExternalLink className="w-4 h-4" />
                    </a>
                </div>
            </div>
        </div>
      )}

      <StaffList storeId={id} />
    </div>
  );
};
