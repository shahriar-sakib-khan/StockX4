import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Eye, EyeOff, Users } from 'lucide-react';
import { StaffCard, type Role, type StaffData } from './staff/StaffCard';
import { Field, inputCls } from './shared/SetupFormFields';
import { InfoTooltip } from './shared/InfoTooltip';


export const Step6StaffSetup = ({ storeId, onItemAdded }: { storeId: string; onItemAdded?: () => void }) => {
  const [form, setForm] = useState({ name: '', contact: '', password: '', role: 'staff' as Role, salary: '' });
  const [localStaff, setLocalStaff] = useState<StaffData[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Fetch existing staff (owner record auto-created during store setup)
  const { data } = useQuery({
    queryKey: ['staff', storeId],
    queryFn: () => api.get(`stores/${storeId}/staff`).json<{ staff: any[] }>(),
    staleTime: 0,
  });

  useEffect(() => {
    if (data?.staff) {
      setLocalStaff(data.staff.map((s: any) => ({ _id: s._id, name: s.name, contact: s.contact, role: s.role, salary: s.salary ?? 0 })));
    }
  }, [data]);

  const set = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));

  const handleAdd = async () => {
    if (!form.name.trim() || !form.contact.trim() || !form.password.trim()) {
      toast.error('Name, contact, and password are required'); return;
    }
    // Guard: unique contact per store
    const dupContact = localStaff.find(s => s.contact.trim().toLowerCase() === form.contact.trim().toLowerCase());
    if (dupContact) { toast.error(`A staff member with contact "${form.contact}" already exists`); return; }

    setLoading(true);
    try {
      const res = await api.post(`stores/${storeId}/staff`, {
        json: {
          name: form.name,
          contact: form.contact,
          password: form.password,
          role: form.role,
          salary: Number(form.salary) || 0,
          salaryDue: 0,
        },
      }).json<{ staff: any }>();
      setLocalStaff(p => [...p, { _id: res.staff._id, name: form.name, contact: form.contact, role: form.role, salary: Number(form.salary) || 0 }]);
      setForm({ name: '', contact: '', password: '', role: 'staff', salary: '' });
      toast.success('Staff member added');
      onItemAdded?.();
    } catch (e: any) {
      const msg = await e?.response?.json?.().catch(() => null);
      const errText = Array.isArray(msg?.error) ? msg.error[0]?.message : msg?.error;
      toast.error(errText || 'Failed to add staff');
    } finally {
      setLoading(false);
    }
  };

  const updateStaffSave = async (id: string, fields: Partial<StaffData>) => {
    try {
      await api.patch(`stores/${storeId}/staff/${id}`, { json: fields });
      setLocalStaff(p => p.map(s => s._id === id ? { ...s, ...fields } : s));
    } catch (e) {
      toast.error('Failed to update staff');
    }
  };

  const deleteStaff = async (id: string) => {
    try {
      await api.delete(`stores/${storeId}/staff/${id}`);
      setLocalStaff(p => p.filter(s => s._id !== id));
      toast.success('Staff removed');
    } catch (e) {
      toast.error('Failed to remove staff');
    }
  };

  const ownerCard = localStaff.find(s => s.role === 'owner');
  const otherStaff = localStaff.filter(s => s.role !== 'owner');

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Add Staff Members <span className="text-base font-normal text-muted-foreground">(Optional)</span>
          <InfoTooltip content="Register your employees to track their sales performance and delivery activities." />
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Create logins for your store staff. An owner account has been auto-created.</p>
      </div>

      {/* Owner card always shown */}
      {ownerCard && (
        <div className="space-y-2">
          <p className="text-xs font-black text-amber-500 uppercase tracking-wider">Store Owner</p>
          <div className="max-w-xs">
            <StaffCard s={ownerCard} />
          </div>
        </div>
      )}

      {/* Form */}
      <div className="border rounded-xl p-5 bg-muted/20 space-y-4">
        <p className="text-sm font-semibold text-slate-600 flex items-center gap-1.5"><Users className="w-4 h-4" /> New Staff Member</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-2">
          <Field label="Full Name *">
            <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Rahim Mia" className={inputCls} />
          </Field>
          <Field label="Role">
            <select value={form.role} onChange={e => set('role', e.target.value as Role)} className={inputCls}>
              <option value="manager">Manager</option>
              <option value="staff">Staff</option>
              <option value="driver">Driver</option>
            </select>
          </Field>

          <Field label="Phone / Email *">
            <input value={form.contact} onChange={e => set('contact', e.target.value)} placeholder="01XXXXXXXXX or email@example.com" className={inputCls} />
          </Field>
          <Field label="Password *">
            <div className="relative">
              <input type={showPassword ? "text" : "password"} value={form.password} onChange={e => set('password', e.target.value)} placeholder="Min. 6 characters" className={inputCls} />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </Field>

          <Field label="Monthly Salary (৳)">
            <input type="number" min={0} value={form.salary} onChange={e => set('salary', e.target.value)} placeholder="0" className={inputCls} />
          </Field>
        </div>
        <button
          onClick={handleAdd}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-5 py-3 sm:py-2.5 w-full sm:w-auto min-h-[48px] rounded-lg bg-primary text-primary-foreground text-sm font-bold shadow hover:opacity-90 transition disabled:opacity-50"
        >
          {loading ? '…' : '+ Add Staff Member'}
        </button>
      </div>

      {/* Other staff cards */}
      {otherStaff.length > 0 && (
        <div>
          <p className="text-xs font-black text-muted-foreground uppercase tracking-wider mb-3">Staff ({otherStaff.length})</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {otherStaff.map((s, i) => (
              <StaffCard key={s._id || i} s={s} onSave={updateStaffSave} onRemove={deleteStaff} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
