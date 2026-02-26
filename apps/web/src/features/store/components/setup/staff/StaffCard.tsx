import { useState, useEffect } from 'react';
import { Crown, ShieldCheck, Truck, UserRound, Trash2 } from 'lucide-react';

export type Role = 'owner' | 'manager' | 'staff' | 'driver';

export interface StaffData {
  _id?: string;
  name: string;
  contact: string;
  role: Role;
  salary: number;
}

const ROLE_CONFIG: Record<Role, { label: string; bg: string; border: string; badge: string; icon: React.ReactNode }> = {
  owner:   { label: 'Owner',   bg: 'bg-amber-50',  border: 'border-amber-300',  badge: 'bg-amber-100 text-amber-700',   icon: <Crown className="w-5 h-5 text-amber-500" /> },
  manager: { label: 'Manager', bg: 'bg-blue-50',   border: 'border-blue-300',   badge: 'bg-blue-100 text-blue-700',     icon: <ShieldCheck className="w-5 h-5 text-blue-500" /> },
  staff:   { label: 'Staff',   bg: 'bg-slate-50',  border: 'border-slate-300',  badge: 'bg-slate-100 text-slate-700',   icon: <UserRound className="w-5 h-5 text-slate-500" /> },
  driver:  { label: 'Driver',  bg: 'bg-teal-50',   border: 'border-teal-300',   badge: 'bg-teal-100 text-teal-700',     icon: <Truck className="w-5 h-5 text-teal-500" /> },
};

export const StaffCard = ({ s, onSave, onRemove }: { s: StaffData, onSave?: (id: string, f: Partial<StaffData>) => void, onRemove?: (id: string) => void }) => {
  const cfg = ROLE_CONFIG[s.role] || ROLE_CONFIG.staff;
  const isOwner = s.role === 'owner';
  const [local, setLocal] = useState(s);
  useEffect(() => setLocal(s), [s]);

  const handleBlur = () => {
    if (onSave && !isOwner) {
      if (local.name !== s.name || local.contact !== s.contact || local.salary !== s.salary) {
        onSave(s._id!, { name: local.name, contact: local.contact, salary: local.salary });
      }
    }
  };

  return (
    <div className={`rounded-xl border-2 ${cfg.border} ${cfg.bg} p-4 flex flex-col gap-2 shadow-sm transition-all group relative`}>
      {onRemove && !isOwner && (
         <button onClick={() => onRemove(s._id!)} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 text-rose-400 hover:text-rose-600">
           <Trash2 className="w-4 h-4" />
         </button>
      )}
      <div className="flex items-center gap-2 pr-6">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${cfg.badge}`}>{cfg.icon}</div>
        <div className="min-w-0 flex-1 flex flex-col gap-0.5">
          <input
            value={local.name}
            onChange={e => setLocal({...local, name: e.target.value})}
            onBlur={handleBlur}
            readOnly={isOwner}
            className={`font-extrabold text-base text-slate-800 leading-tight truncate bg-transparent border-b border-transparent ${isOwner ? 'outline-none cursor-default' : 'hover:border-slate-300 focus:border-primary outline-none transition-colors'} w-full p-0 m-0`}
          />
          <div className="flex">
            <span className={`text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full ${cfg.badge}`}>{cfg.label}</span>
          </div>
        </div>
      </div>
      <div className="border-t border-slate-200 pt-2 space-y-1 flex flex-col gap-1">
        <input
            value={local.contact}
            onChange={e => setLocal({...local, contact: e.target.value})}
            onBlur={handleBlur}
            readOnly={isOwner}
            className={`text-xs text-muted-foreground font-mono bg-transparent border-b border-transparent ${isOwner ? 'outline-none cursor-default' : 'hover:border-slate-300 focus:border-primary outline-none transition-colors'} w-full p-0 m-0`}
        />
        {!isOwner && (
          <div className="flex items-end gap-0.5">
            <span className="text-base font-black text-emerald-600 mb-0.5">৳</span>
            <input
              type="number" min={0}
              value={local.salary === 0 ? '' : local.salary}
              placeholder="0"
              onChange={e => setLocal({...local, salary: Math.max(0, Number(e.target.value) || 0)})}
              onBlur={handleBlur}
              className="text-base font-black text-emerald-600 bg-transparent border-none outline-none border-b border-dashed border-slate-400 hover:border-slate-500 focus:border-emerald-600 w-20 p-0 m-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none text-right"
            />
            <span className="text-xs font-semibold text-muted-foreground mb-0.5 whitespace-nowrap">/mo</span>
          </div>
        )}
      </div>
    </div>
  );
};
