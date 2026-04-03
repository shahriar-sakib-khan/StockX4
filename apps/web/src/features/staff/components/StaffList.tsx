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
    <div className="bg-white border border-slate-200 rounded-2xl p-3 sm:p-5 md:p-6 shadow-sm">
      <div className="flex flex-row justify-between items-center mb-4 sm:mb-6 gap-3 sm:gap-4">
        <h3 className="text-lg sm:text-xl md:text-2xl font-black text-slate-800 flex items-center uppercase tracking-tight leading-none">
            <LayoutDashboard className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 mr-2 text-indigo-500" />
            Staff
        </h3>
        <Button onClick={() => setIsAddModalOpen(true)} size="lg" className="h-9 sm:h-11 md:h-12 px-4 sm:px-6 rounded-lg sm:rounded-xl bg-slate-900 text-white font-black uppercase tracking-widest text-[8px] sm:text-[10px] md:text-xs shadow-lg shadow-slate-200 active:scale-[0.98]">
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
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
                            "group relative overflow-hidden border border-slate-200 rounded-2xl md:rounded-3xl hover:shadow-2xl transition-all duration-500 cursor-pointer flex flex-col h-full bg-white active:scale-[0.98]",
                            isMemberOwner ? "border-rose-200 shadow-rose-100/50" : "hover:border-indigo-200 shadow-slate-100/30"
                        )}
                    >
                        {/* Header Area */}
                        <div className={cn(
                            "relative h-24 sm:h-32 md:h-40 w-full p-4 sm:p-5 md:p-6 flex flex-col justify-end overflow-hidden",
                            isMemberOwner ? "bg-rose-50" : isMemberManager ? "bg-purple-50" : "bg-slate-50"
                        )}>
                             {/* Decorative Background Icon */}
                             {isMemberOwner ? <Crown className="absolute -right-4 -top-4 w-28 h-28 sm:w-32 sm:h-32 text-rose-200/40 rotate-12" /> :
                              isMemberManager ? <ShieldCheck className="absolute -right-4 -top-4 w-28 h-28 sm:w-32 sm:h-32 text-purple-200/40 rotate-12" /> :
                              <User className="absolute -right-4 -top-4 w-28 h-28 sm:w-32 sm:h-32 text-slate-200/40 rotate-12" />
                             }
 
                            <div className="relative z-10">
                                 <span className={cn(
                                     "inline-flex items-center px-2 py-0.5 rounded-md text-[8px] sm:text-[10px] font-black uppercase tracking-tighter mb-1 border shadow-sm",
                                     isMemberOwner ? "bg-rose-100 text-rose-700 border-rose-200" :
                                     isMemberManager ? "bg-purple-100 text-purple-700 border-purple-200" :
                                     "bg-blue-100 text-blue-700 border-blue-200"
                                 )}>
                                     {isMemberOwner ? <Crown className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 mr-1" /> : 
                                      isMemberManager ? <BadgeCheck className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 mr-1" /> : null}
                                     {isMemberOwner ? 'Store Owner' : member.role}
                                 </span>
                                 
                                 <h4 className="font-black text-lg sm:text-2xl md:text-3xl leading-none tracking-tight text-slate-900 group-hover:scale-[1.02] transition-transform origin-left truncate uppercase">
                                     {member.name}
                                 </h4>
                            </div>

                            {/* Top Actions */}
                             <div className="absolute top-2.5 right-2.5 sm:top-4 sm:right-4 flex gap-1.5 sm:gap-2 z-20">
                                 <Button
                                     variant="secondary"
                                     size="icon"
                                     className="h-7 w-7 sm:h-9 sm:w-9 bg-white/95 hover:bg-white shadow-sm rounded-lg sm:rounded-xl border border-slate-200"
                                     onClick={(e) => {
                                         e.stopPropagation();
                                         setEditingStaff(member);
                                     }}
                                 >
                                     <Pencil className="w-3.5 h-3.5 text-slate-700" />
                                 </Button>
                                {!isMemberOwner && (
                                     <Button
                                         variant="destructive"
                                         size="icon"
                                         className="h-7 w-7 sm:h-9 sm:w-9 shadow-md shadow-rose-100 rounded-lg sm:rounded-xl"
                                         onClick={(e) => {
                                             e.stopPropagation();
                                             setDeletingStaff(member);
                                         }}
                                     >
                                         <Trash2 className="w-3.5 h-3.5" />
                                     </Button>
                                )}
                            </div>
                        </div>

                        {/* Card Body */}
                         <div className="p-3.5 sm:p-5 md:p-6 flex-1 flex flex-col">
                             <div
                                 className="flex items-center gap-2 sm:gap-3 bg-slate-50 hover:bg-slate-100 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl transition-all cursor-copy group/id border border-slate-100 mb-4 sm:mb-5"
                                 onClick={(e) => {
                                     e.stopPropagation();
                                     navigator.clipboard.writeText(member.contact);
                                     toast.success('Copied to clipboard');
                                 }}
                             >
                                 <div className="flex flex-col flex-1 truncate pt-0.5">
                                     <span className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Contact Details</span>
                                     <span className="font-black text-slate-700 truncate text-[11px] sm:text-sm">{member.contact}</span>
                                 </div>
                                 <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                                     <Copy className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-slate-400" />
                                 </div>
                             </div>

                            {isMemberOwner ? (
                                <div className="mt-auto pt-6 border-t border-dashed border-rose-200 flex flex-col items-center justify-center p-6 bg-rose-50/50 rounded-2xl border border-rose-100 relative overflow-hidden group/owner">
                                     <Crown className="mb-3 w-8 h-8 text-rose-500 animate-pulse" />
                                     <span className="text-base font-black text-rose-900 leading-none">Owner Privileges</span>
                                     <span className="text-xs text-rose-600/80 font-bold mt-2 text-center">Full Administrative control enabled for this store.</span>
                                </div>
                            ) : (isManagement) ? (
                                 <div className="mt-auto pt-4 sm:pt-6 border-t border-dashed border-slate-200">
                                     <div className="flex flex-col gap-2 sm:gap-3 mb-3 sm:mb-4">
                                         {/* Monthly salary — always shown */}
                                         <div className="flex justify-between items-center">
                                             <span className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Monthly</span>
                                             <span className="font-black text-base sm:text-xl text-slate-900 leading-none tracking-tight">৳{member.salary?.toLocaleString() || 0}</span>
                                         </div>

                                         {/* Due / Paid in Advance — ALWAYS SHOWN */}
                                         <div className={cn(
                                             "flex justify-between items-center p-2.5 sm:p-3 rounded-xl border-2",
                                             (member.salaryDue || 0) > 0
                                                 ? "bg-rose-50 border-rose-100"
                                                 : (member.salaryDue || 0) < 0
                                                     ? "bg-emerald-50 border-emerald-100"
                                                     : "bg-slate-50 border-slate-100" // Zero due
                                         )}>
                                             <span className={cn(
                                                 "text-[8px] sm:text-[10px] font-black uppercase tracking-widest leading-none",
                                                 (member.salaryDue || 0) > 0 ? "text-rose-500" : (member.salaryDue || 0) < 0 ? "text-emerald-500" : "text-slate-400"
                                             )}>
                                                 {(member.salaryDue || 0) > 0 ? 'Salary Due' : (member.salaryDue || 0) < 0 ? 'Paid in Advance' : 'Due'}
                                             </span>
                                             <span className={cn(
                                                 "font-black text-lg sm:text-2xl leading-none",
                                                 (member.salaryDue || 0) > 0 ? "text-rose-600" : (member.salaryDue || 0) < 0 ? "text-emerald-600" : "text-slate-500"
                                             )}>
                                                 ৳{Math.abs(member.salaryDue || 0).toLocaleString()}
                                             </span>
                                         </div>
                                     </div>

                                     <Button
                                         className="w-full h-12 md:h-14 bg-emerald-600 text-white hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 rounded-xl sm:rounded-2xl font-black uppercase tracking-tighter active:scale-[0.98] text-[10px] sm:text-xs md:text-sm"
                                         onClick={(e) => {
                                             e.stopPropagation();
                                             setPayingStaff(member);
                                         }}
                                     >
                                         <Banknote className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
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
            onEdit={() => {
                setSelectedStaffDetails(null);
                setEditingStaff(selectedStaffDetails);
            }}
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
