import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, X, AlertTriangle } from 'lucide-react';
import { storeApi } from '@/features/store/api/store.api';
import { useStoreSizes, sortSizes } from '@/features/store/hooks/useStoreSizes';
import { useInventory } from '@/features/cylinder/hooks/useCylinders';
import { inventoryApi, storeProductApi } from '@/features/cylinder/api/cylinder.api';
import { toast } from 'sonner';

interface Props {
  storeId: string;
  open: boolean;
  onClose: () => void;
}

export const EditStoreSizesModal = ({ storeId, open, onClose }: Props) => {
  const queryClient = useQueryClient();
  const { sizes, archivedSizes, isLoading: sizesLoading } = useStoreSizes(storeId);
  const { data: inventoryData } = useInventory(storeId);

  const [localSizes, setLocalSizes] = useState<string[]>([]);
  const [localArchived, setLocalArchived] = useState<string[]>([]);
  const [customInput, setCustomInput] = useState('');
  const [sizeToDelete, setSizeToDelete] = useState<string | null>(null);
  const [sizeToRestore, setSizeToRestore] = useState<string | null>(null);
  const [confirmText, setConfirmText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isCheckingStats, setIsCheckingStats] = useState(false);
  const [deleteStats, setDeleteStats] = useState<{ cylinders: number, brands: number, transactions: number } | null>(null);
  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');

  const [isOpenInitialized, setIsOpenInitialized] = useState(false);

  useEffect(() => {
    if (open && !sizesLoading && !isOpenInitialized) {
      setLocalSizes([...sizes]);
      setLocalArchived([...(archivedSizes || [])]);
      setSizeToRestore(null);
      setConfirmText('');
      setCustomInput('');
      setDeleteStats(null);
      setActiveTab('active');
      setIsOpenInitialized(true);
    }
  }, [open, sizes, sizesLoading, isOpenInitialized, archivedSizes]);

  useEffect(() => {
    if (!open) {
      setIsOpenInitialized(false);
    }
  }, [open]);

  // hasDataForSize is obsolete now because we rely on backend accurate statistics

  const addSize = (valOverride?: string) => {
    const val = valOverride || customInput.trim();
    if (!val) return;
    const num = parseFloat(val);
    if (isNaN(num) || num <= 0) return;
    const withKg = `${num}kg`;

    if (localArchived.includes(withKg)) {
      setSizeToRestore(withKg);
      setCustomInput('');
      return;
    }

    if (!localSizes.includes(withKg)) {
      setLocalSizes(prev => sortSizes([...prev, withKg]));
    }
    setCustomInput('');
  };

  const handleRestore = async (startNew: boolean) => {
    if (!sizeToRestore) return;

    if (startNew) {
      setIsRestoring(true);
      try {
        await storeProductApi.archiveCylinderSize(storeId, sizeToRestore);
      } catch (err) {
        toast.error("Failed to archive old records.");
      }
      setIsRestoring(false);
    }

    setLocalArchived(prev => prev.filter(s => s !== sizeToRestore));
    setLocalSizes(prev => sortSizes([...prev, sizeToRestore]));
    setSizeToRestore(null);
  };

  const requestDelete = async (size: string) => {
    if (localSizes.length <= 1) {
      toast.error("You must have at least one size.");
      return;
    }

    setIsCheckingStats(true);
    try {
      const { stats } = await inventoryApi.getSizeStats(storeId, size);

      if (stats.cylinders > 0 || stats.transactions > 0 || stats.brands > 0) {
        setDeleteStats(stats);
        setSizeToDelete(size);
        setConfirmText('');
      } else {
        // Immediate clean delete if no data footprint exists
        confirmDelete(size, false);
      }
    } catch (err) {
      toast.error("Failed to check size statistics");
    } finally {
      setIsCheckingStats(false);
    }
  };

  const confirmDelete = (size: string, requireArchive: boolean = true) => {
    setLocalSizes(prev => prev.filter(s => s !== size));
    if (requireArchive && !localArchived.includes(size)) {
        setLocalArchived(prev => sortSizes([...prev, size]));
    }
    setSizeToDelete(null);
    setDeleteStats(null);
  };

  const handleSave = async () => {
    if (localSizes.length === 0) {
      toast.error("Store must have at least one cylinder size.");
      return;
    }

    setIsSaving(true);
    try {
      await storeApi.update(storeId, { cylinderSizes: localSizes, archivedCylinderSizes: localArchived });
      await queryClient.invalidateQueries({ queryKey: ['store', storeId] });
      toast.success("Store sizes updated successfully");
      onClose();
    } catch (err) {
      toast.error("Failed to update store sizes");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={open} onClose={onClose} title="Manage Store Sizes">
      <div className="space-y-6">
        <p className="text-sm text-muted-foreground">
          Configure the cylinder sizes available in your store. These sizes will appear as filters in your inventory and POS.
        </p>

        {/* Tabs Navigation */}
        <div className="flex border-b">
          <button
            className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'active' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-slate-800'}`}
            onClick={() => { setActiveTab('active'); setSizeToDelete(null); setSizeToRestore(null); }}
          >
            Active Sizes ({localSizes.length})
          </button>
          <button
            className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'archived' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-slate-800'}`}
            onClick={() => { setActiveTab('archived'); setSizeToDelete(null); setSizeToRestore(null); }}
          >
            Archived Sizes ({localArchived.length})
          </button>
        </div>

        {activeTab === 'active' && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2 p-4 border rounded-xl bg-slate-50 min-h-[80px] items-start">
              {localSizes.map(size => {
                return (
                  <Badge
                    key={size}
                    variant="secondary"
                    className="px-3 py-1.5 text-sm font-bold bg-white border shadow-sm relative pr-8 group"
                  >
                    {size}
                    <button
                      onClick={() => requestDelete(size)}
                      disabled={isCheckingStats}
                      className="absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full text-muted-foreground hover:bg-rose-100 hover:text-rose-600 transition-colors disabled:opacity-50"
                    >
                      <X size={14} />
                    </button>
                  </Badge>
                );
              })}
            </div>

            {/* Hide input if any warning/interjection pane is active */}
            {!sizeToDelete && !sizeToRestore && (
              <div className="flex gap-2">
                <Input
                  value={customInput}
                  onChange={e => setCustomInput(e.target.value)}
                  placeholder="e.g. 22.5"
                  onKeyDown={e => e.key === 'Enter' && addSize()}
                  className="font-mono"
                  type="number"
                  step="0.5"
                  min="0"
                />
                <Button type="button" variant="secondary" onClick={() => addSize()} className="shrink-0 bg-slate-100">
                  <Plus className="w-4 h-4 mr-2" /> Add Size
                </Button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'archived' && (
          <div className="space-y-4">
            {localArchived.length === 0 ? (
              <div className="flex items-center justify-center p-8 border border-dashed rounded-xl bg-slate-50 text-muted-foreground text-sm">
                No archived sizes to display.
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 p-4 border rounded-xl bg-slate-50 min-h-[80px] items-start">
                {localArchived.map(size => (
                  <Badge key={size} variant="outline" className="px-3 py-1.5 text-sm font-medium bg-white cursor-pointer hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-colors" onClick={() => addSize(size)}>
                    {size} <Plus size={14} className="ml-2 text-muted-foreground" />
                  </Badge>
                ))}
              </div>
            )}
          </div>
        )}

        {sizeToDelete && deleteStats && (
          <div className="p-4 rounded-xl border-2 border-amber-200 bg-amber-50 relative mt-4">
            <button onClick={() => setSizeToDelete(null)} className="absolute top-2 right-2 text-amber-500 hover:text-amber-700">
              <X size={16} />
            </button>
            <div className="flex gap-3">
              <div className="mt-0.5 text-amber-600"><AlertTriangle size={20} /></div>
              <div>
                <h4 className="font-bold text-amber-800 text-sm">Active Inventory Exists</h4>
                <p className="text-xs text-amber-700 mt-1 mb-3">
                  You have <strong>{deleteStats.cylinders}</strong> cylinders of <strong>{deleteStats.brands}</strong> brands and <strong>{deleteStats.transactions}</strong> transaction records related to this size. Deleting this size tag will archive it to preserve those records, hiding them from future UI menus.
                  <br /><br />
                  Please type <strong>{sizeToDelete}</strong> below to confirm.
                </p>
                <div className="flex gap-2">
                  <Input
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder={`Type "${sizeToDelete}"`}
                    className="h-8 text-xs w-32 border-amber-300 focus-visible:ring-amber-500 bg-white"
                  />
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={confirmText !== sizeToDelete}
                    onClick={() => confirmDelete(sizeToDelete)}
                    className="h-8 text-xs bg-red-600 hover:bg-red-700"
                  >
                    Remove tag
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setSizeToDelete(null)} className="h-8 text-xs border-amber-300 text-amber-800 hover:bg-amber-100">
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {sizeToRestore && (
          <div className="p-4 rounded-xl border-2 border-blue-200 bg-blue-50 relative mt-4">
            <button onClick={() => setSizeToRestore(null)} className="absolute top-2 right-2 text-blue-500 hover:text-blue-700">
              <X size={16} />
            </button>
            <div className="flex gap-3">
              <div className="mt-0.5 text-blue-600"><AlertTriangle size={20} /></div>
              <div>
                <h4 className="font-bold text-blue-800 text-sm">Restore Archived Size</h4>
                <p className="text-xs text-blue-700 mt-1 mb-3">
                  The size <strong>{sizeToRestore}</strong> was previously used in this store. Do you want to restore all its historical legacy stock, or generate new empty tags with 0 counts? Or start fresh with 0 counts by permanently archiving the old product variants?
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => handleRestore(false)} disabled={isRestoring} className="h-8 text-xs bg-blue-600 hover:bg-blue-700">
                    Restore Records
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleRestore(true)} disabled={isRestoring} className="h-8 text-xs border-blue-300 text-blue-800 hover:bg-blue-100">
                    {isRestoring ? 'Resetting...' : 'Start New (0 counts)'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>Cancel</Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Sizes'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
