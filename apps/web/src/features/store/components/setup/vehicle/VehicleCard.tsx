import { useState, useEffect } from 'react';
import { Trash2, Truck } from 'lucide-react';

export interface VehicleData {
  _id?: string;
  licensePlate: string;
  vehicleModel: string;
  driverName: string;
  driverPhone: string;
}

export const emptyForm: VehicleData = { licensePlate: '', vehicleModel: '', driverName: '', driverPhone: '' };

export const VehicleCard = ({ v, onSave, onRemove }: { v: VehicleData; onSave: (id: string, data: Partial<VehicleData>) => void; onRemove: (id: string) => void }) => {
  const [local, setLocal] = useState(v);
  useEffect(() => setLocal(v), [v]);

  const handleBlur = () => {
    if (local.licensePlate !== v.licensePlate || local.vehicleModel !== v.vehicleModel || local.driverName !== v.driverName || local.driverPhone !== v.driverPhone) {
      onSave(v._id!, { licensePlate: local.licensePlate, vehicleModel: local.vehicleModel, driverName: local.driverName, driverPhone: local.driverPhone });
    }
  };

  return (
    <div className="border-2 border-border hover:border-primary/40 bg-white rounded-xl p-4 flex items-start gap-3 shadow-sm transition-all group relative">
      <div className="w-12 h-12 rounded-xl bg-slate-700 flex items-center justify-center shrink-0 shadow mt-1">
        <Truck className="w-6 h-6 text-white" />
      </div>
      <div className="flex-1 min-w-0 flex flex-col gap-1 pr-6">
        <input
          value={local.licensePlate}
          onChange={e => setLocal({...local, licensePlate: e.target.value})}
          onBlur={handleBlur}
          placeholder="License Plate"
          className="font-black text-lg text-slate-800 font-mono tracking-wide leading-none bg-transparent border-b border-transparent hover:border-slate-300 focus:border-primary outline-none transition-all w-full p-0 m-0 min-h-[48px]"
        />
        <input
          value={local.vehicleModel}
          onChange={e => setLocal({...local, vehicleModel: e.target.value})}
          onBlur={handleBlur}
          placeholder="Vehicle Model"
          className="text-base text-muted-foreground font-black bg-transparent border-b border-transparent hover:border-slate-300 focus:border-primary outline-none transition-all w-full p-0 m-0 min-h-[48px]"
        />
        <div className="mt-2 pt-2 border-t border-slate-100 flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <span className="text-xs">👤</span>
            <input
              value={local.driverName}
              onChange={e => setLocal({...local, driverName: e.target.value})}
              onBlur={handleBlur}
              placeholder="Driver Name"
              className="text-sm font-black text-slate-700 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-primary outline-none transition-all w-full p-0 m-0 min-h-[48px]"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs">📞</span>
            <input
              value={local.driverPhone}
              onChange={e => setLocal({...local, driverPhone: e.target.value.replace(/\D/g, '')})}
              onBlur={handleBlur}
              placeholder="Driver Phone"
              className="text-sm font-black text-muted-foreground bg-transparent border-b border-transparent hover:border-slate-300 focus:border-primary outline-none transition-all w-full p-0 m-0 min-h-[48px]"
            />
          </div>
        </div>
      </div>
      <button
        onClick={() => onRemove(v._id!)}
        className="absolute top-2 right-2 text-rose-400 hover:text-rose-600 min-w-[48px] min-h-[48px] flex items-center justify-center"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};
