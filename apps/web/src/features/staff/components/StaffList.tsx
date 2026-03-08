import { useStaffList, useDeleteStaff } from '../hooks/useStaff';
import { PaySalaryModal } from './PaySalaryModal';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { useStaffStore } from '../stores/staff.store';
import { Button } from '@/components/ui/button';
import { Plus, User, BadgeCheck, Pencil, Trash2, Banknote, ShieldCheck, Copy, Crown, LayoutDashboard } from 'lucide-react';
import { useState } from 'react';
import { AddStaffModal } from './AddStaffModal';
import { EditStaffModal } from './EditStaffModal';
import { StaffDetailsModal } from './StaffDetailsModal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';

export const StaffList = ({ storeId }: { storeId: string }) => {
  const { user } = useAuthStore();
  const { staff: staffUser } = useStaffStore();
  
  // Logged in user role identification
  const loggedInRole = staffUser?.role || (user ? 'owner' : null);
  const isManagement = loggedInRole === 'owner' || loggedInRole === 'manager';

  const { data, isLoading, error } = useStaffList(storeId);
  const deleteStaff = useDeleteStaff();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<any>(null);
  const [deletingStaff, setDeletingStaff] = useState<any>(null);
  const [payingStaff, setPayingStaff] = useState<any>(null);
  const [selectedStaffDetails, setSelectedStaffDetails] = useState<any>(null);

  if (isLoading) return <div className="text-muted-foreground">Loading staff...</div>;
  if (error) return <div className="text-destructive">Failed to load staff</div>;

  const staff = data?.staff || [];

  const handleDelete = () => {
    if (!deletingStaff) return;
    deleteStaff.mutate({ storeId, staffId: deletingStaff._id }, {
        onSuccess: () => {
            toast.success('Staff member deleted');
            setDeletingStaff(null);
        },
        onError: () => {
            toast.error('Failed to delete staff');
        }
    });
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-foreground flex items-center">
            <LayoutDashboard className="w-5 h-5 mr-2 text-primary" />
            Staff Members
        </h3>
        <Button onClick={() => setIsAddModalOpen(true)} size="sm" className="rounded-xl">
            <Plus className="w-4 h-4 mr-2" />
            Add Staff
        </Button>
      </div>

      {staff.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center bg-muted/20 rounded-xl border border-dashed border-border group hover:bg-muted/30 transition-colors">
            <div className="bg-muted p-4 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
                <User className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg">No staff members found</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {staff.map((member: any) => {
                const isMemberOwner = member.role === 'owner';
                const isMemberManager = member.role === 'manager';

                return (
                    <div
                        key={member._id}
                        onClick={() => setSelectedStaffDetails(member)}
                        className={cn(
                            "group relative overflow-hidden border-2 rounded-2xl hover:shadow-2xl transition-all duration-500 cursor-pointer flex flex-col h-full bg-white",
                            isMemberOwner ? "border-rose-200 shadow-rose-100/50" : "border-slate-100 shadow-slate-100/30"
                        )}
                    >
                        {/* Header Area */}
                        <div className={cn(
                            "relative h-40 w-full p-6 flex flex-col justify-end overflow-hidden",
                            isMemberOwner ? "bg-rose-50" : isMemberManager ? "bg-purple-50" : "bg-slate-50"
                        )}>
                             {/* Decorative Background Icon */}
                             {isMemberOwner ? <Crown className="absolute -right-6 -top-6 w-32 h-32 text-rose-200/40 rotate-12" /> :
                              isMemberManager ? <ShieldCheck className="absolute -right-6 -top-6 w-32 h-32 text-purple-200/40 rotate-12" /> :
                              <User className="absolute -right-6 -top-6 w-32 h-32 text-slate-200/40 rotate-12" />
                             }

                            <div className="relative z-10">
                                <span className={cn(
                                    "inline-flex items-center px-3 py-1 rounded-lg text-[12px] font-black uppercase tracking-tighter mb-2 border shadow-sm",
                                    isMemberOwner ? "bg-rose-100 text-rose-700 border-rose-200" :
                                    isMemberManager ? "bg-purple-100 text-purple-700 border-purple-200" :
                                    "bg-blue-100 text-blue-700 border-blue-200"
                                )}>
                                    {isMemberOwner ? <Crown className="w-3.5 h-3.5 mr-1.5" /> : 
                                     isMemberManager ? <BadgeCheck className="w-3.5 h-3.5 mr-1.5" /> : null}
                                    {isMemberOwner ? 'Store Owner' : member.role}
                                </span>
                                
                                <h4 className="font-black text-3xl leading-none tracking-tight text-slate-900 group-hover:scale-[1.02] transition-transform origin-left truncate">
                                    {member.name}
                                </h4>
                            </div>

                            {/* Top Actions */}
                            <div className="absolute top-4 right-4 flex gap-2 z-20">
                                <Button
                                    variant="secondary"
                                    size="icon"
                                    className="h-9 w-9 bg-white/90 hover:bg-white shadow-sm rounded-xl border border-slate-200"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingStaff(member);
                                    }}
                                >
                                    <Pencil className="w-4 h-4 text-slate-700" />
                                </Button>
                                {!isMemberOwner && (
                                    <Button
                                        variant="destructive"
                                        size="icon"
                                        className="h-9 w-9 shadow-sm rounded-xl"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setDeletingStaff(member);
                                        }}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Card Body */}
                        <div className="p-6 flex-1 flex flex-col">
                            <div
                                className="flex items-center gap-3 bg-slate-50 hover:bg-slate-100 px-4 py-3 rounded-xl transition-all cursor-copy group/id border border-slate-100 mb-6"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigator.clipboard.writeText(member.contact);
                                    toast.success('Copied to clipboard');
                                }}
                            >
                                <div className="flex flex-col flex-1 truncate pt-0.5">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Contact Details</span>
                                    <span className="font-black text-slate-700 truncate text-sm">{member.contact}</span>
                                </div>
                                <Copy className="w-4 h-4 text-slate-400 opacity-0 group-hover/id:opacity-100 transition-opacity" />
                            </div>

                            {isMemberOwner ? (
                                <div className="mt-auto pt-6 border-t border-dashed border-rose-200 flex flex-col items-center justify-center p-6 bg-rose-50/50 rounded-2xl border border-rose-100 relative overflow-hidden group/owner">
                                     <Crown className="mb-3 w-8 h-8 text-rose-500 animate-pulse" />
                                     <span className="text-base font-black text-rose-900 leading-none">Owner Privileges</span>
                                     <span className="text-xs text-rose-600/80 font-bold mt-2 text-center">Full Administrative control enabled for this store.</span>
                                </div>
                            ) : (isManagement) ? (
                                <div className="mt-auto pt-6 border-t border-dashed border-slate-200">
                                    <div className="flex justify-between items-end mb-4 group/salary">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Monthly Salary</span>
                                            <span className="font-black text-2xl text-slate-900 leading-none tracking-tight">৳{member.salary || 0}</span>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className={cn(
                                                "text-[10px] font-black uppercase tracking-widest leading-none mb-1",
                                                (member.salaryDue || 0) > 0 ? "text-rose-500" : "text-emerald-500"
                                            )}>
                                                {(member.salaryDue || 0) > 0 ? 'DUE SALARY' : 'PAID UP'}
                                            </span>
                                            <span className={cn(
                                                "font-black text-3xl leading-none",
                                                (member.salaryDue || 0) > 0 ? "text-rose-600" : "text-emerald-600"
                                            )}>
                                                ৳{Math.abs(member.salaryDue || 0)}
                                            </span>
                                        </div>
                                    </div>

                                    <Button
                                        className="w-full h-12 bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 rounded-xl font-black uppercase tracking-tighter active:scale-[0.98]"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setPayingStaff(member);
                                        }}
                                    >
                                        <Banknote className="w-5 h-5 mr-3" />
                                        Pay Salary
                                    </Button>
                                </div>
                            ) : null}
                            
                            <div className="mt-4 flex justify-center">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    Joined {new Date(member.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                                </span>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
      )}

      {isAddModalOpen && <AddStaffModal storeId={storeId} onClose={() => setIsAddModalOpen(false)} />}

      {editingStaff && (
        <EditStaffModal
            storeId={storeId}
            staff={editingStaff}
            onClose={() => setEditingStaff(null)}
        />
      )}

      {payingStaff && (
        <PaySalaryModal
            storeId={storeId}
            staff={payingStaff}
            onClose={() => setPayingStaff(null)}
        />
      )}

      {selectedStaffDetails && (
          <StaffDetailsModal
            storeId={storeId}
            staff={selectedStaffDetails}
            onClose={() => setSelectedStaffDetails(null)}
          />
      )}

      <ConfirmDialog
        isOpen={!!deletingStaff}
        onClose={() => setDeletingStaff(null)}
        onConfirm={handleDelete}
        title="Delete Staff Member"
        description={`Are you sure you want to delete ${deletingStaff?.name}? This action cannot be undone.`}
        variant="destructive"
      />
    </div>
  );
};
