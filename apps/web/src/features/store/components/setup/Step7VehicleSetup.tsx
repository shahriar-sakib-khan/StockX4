import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Truck } from 'lucide-react';
import { VehicleCard, type VehicleData, emptyForm } from './vehicle/VehicleCard';
import { Field, inputCls } from './shared/SetupFormFields';




export const Step7VehicleSetup = ({ storeId, onItemAdded }: { storeId: string; onItemAdded?: () => void }) => {
  const [form, setForm] = useState<VehicleData>(emptyForm);
  const [vehicles, setVehicles] = useState<VehicleData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const res = await api.get('vehicles', { headers: { 'x-store-id': storeId } }).json<{ vehicles: any[] }>();
        const existing = res.vehicles.map(v => ({
            _id: v._id,
            licensePlate: v.licensePlate,
            vehicleModel: v.vehicleModel || '',
            driverName: v.driverName || '',
            driverPhone: v.driverPhone || '',
        }));
        setVehicles(existing);
      } catch (err) {
        console.error('Failed to load existing vehicles', err);
      }
    };
    if (storeId) fetchVehicles();
  }, [storeId]); // Run exactly once when storeId is available

  const set = (k: keyof VehicleData, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleAdd = async () => {
    if (!form.licensePlate.trim()) { toast.error('License plate is required'); return; }

    // Guard: same licensePlate + vehicleModel (normalized) already exists
    const normalizedModel = form.vehicleModel.trim();
    const dup = vehicles.find(v =>
      v.licensePlate.trim().toLowerCase() === form.licensePlate.trim().toLowerCase() &&
      (v.vehicleModel?.trim() || '') === normalizedModel
    );
    if (dup) { toast.error(`A vehicle with plate "${form.licensePlate}"${normalizedModel ? ` (${normalizedModel})` : ''} already exists`); return; }

    setLoading(true);
    try {
      const res = await api.post('vehicles', {
        json: {
          licensePlate: form.licensePlate,
          vehicleModel: form.vehicleModel,
          driverName: form.driverName,
          driverPhone: form.driverPhone,
        },
        headers: { 'x-store-id': storeId },
      }).json<{ vehicle: any }>();
      setVehicles(p => [...p, { _id: res.vehicle?._id, ...form }]);
      setForm(emptyForm);
      toast.success('Vehicle added');
      onItemAdded?.();
    } catch (e: any) {
      const msg = await e?.response?.json?.().catch(() => null);
      const errText = Array.isArray(msg?.error) ? msg.error[0]?.message : msg?.error;
      toast.error(errText || 'Failed to add vehicle');
    } finally {
      setLoading(false);
    }
  };

  const updateVehicleSave = async (id: string, fields: Partial<VehicleData>) => {
    try {
      await api.put(`vehicles/${id}`, { json: fields, headers: { 'x-store-id': storeId } });
      setVehicles(p => p.map(v => v._id === id ? { ...v, ...fields } : v));
    } catch (e) {
      toast.error('Failed to update vehicle');
    }
  };

  const deleteVehicle = async (id: string) => {
    try {
      await api.delete(`vehicles/${id}`, { headers: { 'x-store-id': storeId } });
      setVehicles(p => p.filter(v => v._id !== id));
      toast.success('Vehicle removed');
    } catch (e) {
      toast.error('Failed to remove vehicle');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Add Delivery Vehicles <span className="text-base font-normal text-muted-foreground">(Optional)</span></h2>
        <p className="text-sm text-muted-foreground mt-1">Register your delivery fleet. You can add more vehicles later from the Vehicles page.</p>
      </div>

      <div className="border rounded-xl p-5 bg-muted/20 space-y-4">
        <p className="text-sm font-semibold text-slate-600 flex items-center gap-1.5"><Truck className="w-4 h-4" /> New Vehicle</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="License Plate *">
            <input value={form.licensePlate} onChange={e => set('licensePlate', e.target.value)} placeholder="e.g. Dhaka-Ma-1234" className={inputCls} />
          </Field>
          <Field label="Vehicle Model">
            <input value={form.vehicleModel} onChange={e => set('vehicleModel', e.target.value)} placeholder="e.g. Tata Ace" className={inputCls} />
          </Field>
          <Field label="Driver Name">
            <input value={form.driverName} onChange={e => set('driverName', e.target.value)} placeholder="Driver's name" className={inputCls} />
          </Field>
          <Field label="Driver Phone">
            <input
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              value={form.driverPhone}
              onChange={e => set('driverPhone', e.target.value.replace(/\D/g, ''))}
              placeholder="01XXXXXXXXX"
              className={inputCls}
            />
          </Field>
        </div>
        <button
          onClick={handleAdd}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-bold shadow hover:opacity-90 transition disabled:opacity-50"
        >
          {loading ? '…' : '+ Add Vehicle'}
        </button>
      </div>

      {vehicles.length > 0 && (
        <div>
          <p className="text-xs font-black text-muted-foreground uppercase tracking-wider mb-3">Added ({vehicles.length})</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {vehicles.map((v, i) => (
              <VehicleCard key={v._id || i} v={v} onSave={updateVehicleSave} onRemove={deleteVehicle} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
