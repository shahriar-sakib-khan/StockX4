import { CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Step1StoreInfo } from './setup/Step1StoreInfo';
import { Step2BrandSelection } from './setup/Step2BrandSelection';
import { Step3CylinderSetup } from './setup/Step3CylinderSetup';
import { Step4StoveSetup } from './setup/Step4StoveSetup';
import { Step5RegulatorSetup } from './setup/Step5RegulatorSetup';
import { Step6StaffSetup } from './setup/Step6StaffSetup';
import { Step7VehicleSetup } from './setup/Step7VehicleSetup';
import { useSetupWizard } from '../hooks/useSetupWizard';

const STEPS = [
  { id: 1, label: 'Store Info' },
  { id: 2, label: 'Brands' },
  { id: 3, label: 'Cylinders' },
  { id: 4, label: 'Stoves' },
  { id: 5, label: 'Regulators' },
  { id: 6, label: 'Staff' },
  { id: 7, label: 'Vehicles' },
];

export const SetupWizardPage = () => {
  const {
    initializing, currentStep, createdStoreId, setupPayload,
    submitting, stepHasItem, markItemAdded,
    updatePayload, goToStep, nextStep, prevStep, goToDashboard,
    isStepValid, canNavigateTo,
  } = useSetupWizard();

  if (initializing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-muted-foreground" size={32} />
      </div>
    );
  }

  const storeExists = !!createdStoreId;
  const isStepDone = (id: number) => currentStep > id || (id <= 3 && storeExists);
  const step3Label = storeExists ? 'Save & Continue →' : 'Create Store & Continue →';

  return (
    <div className="w-full py-8 px-4">
      <div className="w-full max-w-4xl mx-auto space-y-8">

        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold text-foreground">Set up your Store</h1>
          <p className="text-sm text-muted-foreground">
            {storeExists
              ? 'Your store is ready! Configure any step or go to your dashboard.'
              : 'Complete all 3 mandatory steps to create your store.'}
          </p>
        </div>

        {/* Step Tracker */}
        <div className="flex items-center justify-start sm:justify-center gap-1 overflow-x-auto pb-4 px-2 no-scrollbar snap-x">
          {STEPS.map((step, i) => {
            const isActive = currentStep === step.id;
            const isDone   = isStepDone(step.id);
            const canNav   = canNavigateTo(step.id);
            return (
              <div key={step.id} className="flex items-center shrink-0">
                <button
                  disabled={!canNav}
                  onClick={() => { if (canNav) goToStep(step.id); }}
                  className={`flex flex-col items-center justify-center rounded-xl transition-all text-center px-3 py-2 min-w-[60px] ${
                    isActive ? 'bg-primary text-primary-foreground shadow-md scale-105' :
                    isDone   ? 'bg-primary/10 text-primary' :
                    'bg-muted text-muted-foreground opacity-60'
                  }`}
                >
                  {isDone && !isActive
                    ? <CheckCircle2 size={18} className="mb-0.5" />
                    : <span className="text-base font-bold leading-none">{step.id}</span>}
                  <span className="text-[10px] font-medium mt-0.5 truncate max-w-[56px]">{step.label}</span>
                </button>
                {i < STEPS.length - 1 && (
                  <div className={`w-4 h-0.5 shrink-0 mx-0.5 ${isDone ? 'bg-primary' : 'bg-border'}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Step Content */}
        <div className="bg-card border rounded-2xl shadow-sm p-6 md:p-8">
          {currentStep === 1 && <Step1StoreInfo payload={setupPayload} updatePayload={updatePayload} />}
          {currentStep === 2 && <Step2BrandSelection payload={setupPayload} updatePayload={updatePayload} />}
          {currentStep === 3 && <Step3CylinderSetup payload={{ ...setupPayload, cylinderSizes: setupPayload.cylinderSizes }} updatePayload={updatePayload} />}
          {currentStep === 4 && createdStoreId && <Step4StoveSetup storeId={createdStoreId} onItemAdded={markItemAdded} />}
          {currentStep === 5 && createdStoreId && <Step5RegulatorSetup storeId={createdStoreId} onItemAdded={markItemAdded} />}
          {currentStep === 6 && createdStoreId && <Step6StaffSetup storeId={createdStoreId} onItemAdded={markItemAdded} />}
          {currentStep === 7 && createdStoreId && <Step7VehicleSetup storeId={createdStoreId} onItemAdded={markItemAdded} />}
        </div>

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4">
          <Button 
            variant="outline" 
            onClick={prevStep} 
            disabled={currentStep === 1 || submitting} 
            className="w-full sm:w-auto h-14 sm:h-10 order-2 sm:order-1 font-bold shadow-sm"
          >
            ← Back
          </Button>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto order-1 sm:order-2">
            {currentStep > 3 && currentStep < 7 && (
              <Button 
                variant="ghost" 
                onClick={nextStep} 
                className="w-full sm:w-auto h-14 sm:h-10 text-muted-foreground font-bold hover:text-foreground hover:bg-slate-100 rounded-xl"
              >
                {stepHasItem[currentStep] ? 'Next Step →' : 'Skip Step'}
              </Button>
            )}

            {currentStep <= 6 && (
              <Button
                onClick={nextStep}
                disabled={!isStepValid() || submitting}
                className={`w-full sm:w-auto h-14 sm:h-10 font-bold rounded-xl shadow-md transition-all active:scale-95 ${
                  currentStep === 3 ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg' : ''
                }`}
              >
                {submitting && <Loader2 size={16} className="mr-2 animate-spin" />}
                {currentStep === 3 ? step3Label : 'Next Step →'}
              </Button>
            )}

            {currentStep === 7 && (
              <Button 
                onClick={goToDashboard} 
                className="w-full sm:w-auto h-14 sm:h-10 bg-green-600 hover:bg-green-700 text-white font-black uppercase tracking-widest shadow-lg rounded-xl transition-all active:scale-95"
              >
                All Done — Go to Dashboard 🎉
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
