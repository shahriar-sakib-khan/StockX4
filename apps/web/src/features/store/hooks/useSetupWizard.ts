import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { storeApi } from '@/features/store/api/store.api';
import { brandApi } from '@/features/brand/api/brand.api';
import { api } from '@/lib/api';
import type { SetupCylinderState } from '../components/setup/Step3CylinderSetup';

const LS_KEY = 'store-setup-wizard';

export const defaultPayload = () => ({
  name: '',
  code: '',
  location: '',
  brandIds: [] as string[],
  cylinders: [] as SetupCylinderState[],
  cylinderSizes: [] as string[],
});

export type WizardPayload = ReturnType<typeof defaultPayload>;
type Draft = { step: number; storeId: string | null };

const readDraft = (): Draft | null => {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || 'null'); } catch { return null; }
};
const saveDraft = (d: Draft) => {
  try { localStorage.setItem(LS_KEY, JSON.stringify(d)); } catch {}
};
const clearDraft = () => {
  try { localStorage.removeItem(LS_KEY); } catch {}
};

export const useSetupWizard = () => {
  const navigate = useNavigate();
  const [initializing, setInitializing]   = useState(true);
  const [currentStep, setCurrentStep]     = useState(1);
  const [createdStoreId, setCreatedStoreId] = useState<string | null>(null);
  const [setupPayload, setSetupPayload]   = useState<WizardPayload>(defaultPayload());
  const [submitting, setSubmitting]       = useState(false);
  const [stepHasItem, setStepHasItem]     = useState<Record<number, boolean>>({});

  const markItemAdded = () => setStepHasItem(prev => ({ ...prev, [currentStep]: true }));

  // -- On mount: detect existing store, hydrate from DB, or restore draft --
  useEffect(() => {
    (async () => {
      try {
        const { stores } = await storeApi.list();

        if (stores.length > 0) {
          // If the user already has at least one fully setup store, lock out the Setup Wizard entirely
          // and redirect them to the proper dashboard or portal.
          if (stores.some((s: any) => s.isSetupComplete)) {
             toast.info("Store setup is already complete.");
             if (stores.length === 1) {
                navigate(`/stores/${stores[0]._id}/dashboard`, { replace: true });
             } else {
                navigate('/stores', { replace: true });
             }
             return;
          }

          // Exactly one incomplete store exists — hydrate steps 1-3 from DB
          const existing = stores[0];
          setCreatedStoreId(existing._id);

          const [brandsRes, inventoryRes] = await Promise.all([
            brandApi.getStoreBrands(existing._id),
            api.get('inventory', { headers: { 'x-store-id': existing._id } }).json<{ inventory: any[] }>(),
          ]);

          const activeBrandIds: string[] = brandsRes.brands
            .filter((b: any) => b.isActive)
            .map((b: any) => (b.globalBrandId?._id || b.globalBrandId || '').toString())
            .filter(Boolean);

          const storeBrandToGlobal = new Map<string, string>();
          brandsRes.brands.forEach((b: any) => {
            const sbId = (b._id || '').toString();
            const gbId = (b.globalBrandId?._id || b.globalBrandId || '').toString();
            if (sbId && gbId) storeBrandToGlobal.set(sbId, gbId);
          });

          const cylinders: SetupCylinderState[] = inventoryRes.inventory
            .filter((item: any) => item.product?.category === 'cylinder')
            .map((item: any) => {
              const details = item.product?.details || {};
              const globalBrandId = storeBrandToGlobal.get((details.brandId || '').toString()) || '';
              if (!globalBrandId) return null;
              return {
                brandId: globalBrandId,
                size: details.size || '12kg',
                regulatorType: details.regulatorType || '22mm',
                counts: { packaged: item.counts?.full || 0, refill: 0, empty: item.counts?.empty || 0, defected: item.counts?.defected || 0 },
                prices: {
                  packaged: { buying: item.prices?.buyingPriceFull || 0, retail: item.prices?.retailPriceFull || 0, wholesale: item.prices?.wholesalePriceFull || 0 },
                  refill:   { buying: item.prices?.buyingPriceGas  || 0, retail: item.prices?.retailPriceGas  || 0, wholesale: item.prices?.wholesalePriceGas  || 0 },
                },
              } as SetupCylinderState;
            })
            .filter(Boolean) as SetupCylinderState[];

          setSetupPayload({ name: existing.name || '', location: existing.location || '', code: existing.code || '', brandIds: activeBrandIds, cylinders, cylinderSizes: (existing as any).cylinderSizes || ['12kg'] });

          // Restore step from draft if it belongs to this store, else start at step 4
          const draft = readDraft();
          setCurrentStep(draft && draft.storeId === existing._id ? draft.step : 4);

        } else {
          // No store yet — force start at step 1 to prevent empty payloads
          setCurrentStep(1);
        }
      } catch {
        // ignore — user starts fresh
      } finally {
        setInitializing(false);
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updatePayload = (data: Partial<WizardPayload>) => {
    setSetupPayload(prev => ({ ...prev, ...data }));
  };

  const goToStep = (step: number) => {
    setCurrentStep(step);
    saveDraft({ step, storeId: createdStoreId });
  };

  const isStepValid = (step = currentStep) => {
    if (step === 1) return setupPayload.name.trim().length >= 3 && setupPayload.location.trim().length > 0;
    if (step === 2) return setupPayload.brandIds.length > 0;
    return true;
  };

  const handleFinishMandatory = async () => {
    setSubmitting(true);
    try {
      const res = await storeApi.setup({
        name: setupPayload.name,
        location: setupPayload.location,
        code: setupPayload.code || undefined,
        brandIds: setupPayload.brandIds,
        cylinders: setupPayload.cylinders.map(c => ({ ...c })),
        cylinderSizes: setupPayload.cylinderSizes,
      });
      setCreatedStoreId(res.store._id);
      saveDraft({ step: 4, storeId: res.store._id });
      toast.success(createdStoreId ? 'Store updated!' : 'Store created! Continue with optional setup.');
      goToStep(4);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save store. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const nextStep = () => {
    if (!isStepValid()) return;
    if (currentStep === 3) { handleFinishMandatory(); return; }
    goToStep(Math.min(currentStep + 1, 7));
  };

  const prevStep = () => goToStep(Math.max(currentStep - 1, 1));

  const goToDashboard = () => {
    clearDraft();
    navigate(createdStoreId ? `/stores/${createdStoreId}/dashboard` : '/stores', { replace: true });
  };

  const canNavigateTo = (stepId: number) =>
    !!createdStoreId || stepId <= currentStep;

  return {
    initializing, currentStep, createdStoreId, setupPayload,
    submitting, stepHasItem, markItemAdded,
    updatePayload, goToStep, nextStep, prevStep, goToDashboard,
    isStepValid, canNavigateTo,
  };
};
