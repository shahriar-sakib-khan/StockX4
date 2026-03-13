import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { InfoTooltip } from './shared/InfoTooltip';

interface Step1Props {
  payload: {
    name: string;
    code: string;
    location: string;
  };
  updatePayload: (data: Partial<{ name: string; code: string; location: string }>) => void;
}

export const Step1StoreInfo = ({ payload, updatePayload }: Step1Props) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">
          Store Details
          <InfoTooltip content="Provide basic store details. These will be used for your shop identity and printed on invoices." />
        </h2>
        <p className="text-muted-foreground">Enter the basic details for your new store. (Mandatory)</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="storeName">Store Name <span className="text-destructive">*</span></Label>
          <Input
            id="storeName"
            placeholder="e.g. Dhaka Enterprise"
            value={payload.name}
            onChange={(e) => updatePayload({ name: e.target.value })}
            className="h-14 sm:h-12"
            autoFocus
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="storeLocation">Location / Address <span className="text-destructive">*</span></Label>
          <Input
            id="storeLocation"
            placeholder="e.g. 123 Main Street, Dhaka"
            value={payload.location}
            onChange={(e) => updatePayload({ location: e.target.value })}
            className="h-14 sm:h-12"
          />
        </div>

      </div>
    </div>
  );
};
