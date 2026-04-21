import { useStaffList, useDeleteStaff } from '../hooks/useStaff';
import { PaySalaryModal } from './PaySalaryModal';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { useStaffStore } from '../stores/staff.store';
import { Button } from '@/components/ui/button';
import { Plus, User, Pencil, Trash2, Banknote, ShieldCheck, Copy, Crown, Users, Phone } from 'lucide-react';
import { useState } from 'react';
import { AddStaffModal } from './AddStaffModal';
import { EditStaffModal } from './EditStaffModal';
import { StaffDetailsModal } from './StaffDetailsModal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { toast } from 'sonner';
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

  if (isLoading) return <div className="text-slate-400 p-8 text-center font-bold uppercase tracking-widest text-xs animate-pulse">Loading team...</div>;
  if (error) return <div className="text-rose-500 p-8 text-center font-bold uppercase tracking-widest text-xs">Failed to load team</div>;

  const staff = data?.staff || [];

  const handleDelete = () => {
    if (!deletingStaff) return;
    deleteStaff.mutate({ storeId, staffId: deletingStaff._id }, {
        onSuccess: () => {
            toast.success('Team member removed');
            setDeletingStaff(null);
        },
        onError: () => {
            toast.error('Failed to remove member');
        }
    });
  };

  return (
    <div className="w-full pb-12">
        
      {/* === DASHBOARD HEADER === */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8 gap-4 px-1">
        <div className="flex flex-col gap-1">
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight uppercase">
                Staff Members
            </h3>
            <p className="text-[11px] sm:text-xs font-bold text-slate-500">
                Manage access and permissions for your team.
            </p>
        </div>
        <Button 
            onClick={() => setIsAddModalOpen(true)} 
            className="w-full sm:w-auto h-11 sm:h-12 px-5 sm:px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest text-[10px] sm:text-[11px] shadow-md transition-all active:scale-95"
        >
            <Plus className="w-4 h-4 mr-1.5 sm:mr-2" /> Add Staff
        </Button>
      </div>

      {/* === EMPTY STATE === */}
      {staff.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white rounded-3xl border border-slate-200 shadow-sm">
            <div className="bg-slate-50 p-4 rounded-full mb-4 border border-slate-100">
                <Users className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="font-bold text-lg text-slate-800 tracking-tight">No team members found</h3>
            <p className="text-sm text-slate-500 mt-1">Get started by adding your first staff member.</p>
        </div>
      ) : (
          
        /* === STAFF CARDS (Colored Enterprise UI) === */
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-5">
            {staff.map((member: any) => {
                const isMemberOwner = member.role === 'owner';
                const isMemberManager = member.role === 'manager';

                return (
                    <div
                        key={member._id}
                        onClick={() => setSelectedStaffDetails(member)}
                        className={cn(
                            "group relative flex flex-col bg-white border border-t-4 rounded-2xl p-5 hover:shadow-lg transition-all duration-300 cursor-pointer active:scale-[0.99] min-h-[200px] overflow-hidden",
                            isMemberOwner 
                                ? "border-slate-200 border-t-rose-500 hover:border-rose-300 bg-gradient-to-b from-rose-50/60 to-white" 
                                : isMemberManager 
                                    ? "border-slate-200 border-t-indigo-500 hover:border-indigo-300 bg-gradient-to-b from-indigo-50/60 to-white" 
                                    : "border-slate-200 border-t-sky-400 hover:border-sky-300 bg-gradient-to-b from-sky-50/50 to-white"
                        )}
                    >
                        {/* Top Row: Avatar, Role, and Actions */}
                        <div className="flex items-start justify-between mb-4">
                            {/* Avatar */}
                            <div className="relative shrink-0">
                                <div className={cn(
                                    "w-12 h-12 rounded-full border-2 flex items-center justify-center overflow-hidden shadow-sm",
                                    isMemberOwner ? "bg-rose-100 border-white text-rose-500" :
                                    isMemberManager ? "bg-indigo-100 border-white text-indigo-500" :
                                    "bg-sky-100 border-white text-sky-500"
                                )}>
                                    {member.image ? <img src={member.image} alt="" className="w-full h-full object-cover" /> : <User className="w-5 h-5" />}
                                </div>
                                {isMemberOwner && (
                                    <div className="absolute -bottom-1 -right-1 bg-rose-500 text-white p-1 rounded-full border-2 border-white shadow-sm">
                                        <Crown className="w-2.5 h-2.5" />
                                    </div>
                                )}
                            </div>

                            {/* Role Badge & Actions */}
                            <div className="flex items-center gap-2">
                                <span className={cn(
                                    "px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border shadow-sm",
                                    isMemberOwner ? "bg-white text-rose-700 border-rose-100" :
                                    isMemberManager ? "bg-white text-indigo-700 border-indigo-100" :
                                    "bg-white text-sky-700 border-sky-100"
                                )}>
                                    {isMemberOwner ? 'Owner' : member.role}
                                </span>

                                <div className="flex items-center gap-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                                     <button 
                                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-white hover:shadow-sm rounded-md transition-all"
                                        onClick={(e) => { e.stopPropagation(); setEditingStaff(member); }}
                                     >
                                         <Pencil className="w-3.5 h-3.5" />
                                     </button>
                                     {!isMemberOwner && (
                                         <button 
                                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white hover:shadow-sm rounded-md transition-all"
                                            onClick={(e) => { e.stopPropagation(); setDeletingStaff(member); }}
                                         >
                                             <Trash2 className="w-3.5 h-3.5" />
                                         </button>
                                     )}
                                </div>
                            </div>
                        </div>

                        {/* Middle Row: Identity & Contact */}
                        <div className="flex flex-col mb-auto min-w-0">
                            {/* Single Line Name Lock */}
                            <h4 className="font-bold text-lg text-slate-900 truncate w-full tracking-tight">
                                {member.name}
                            </h4>
                            
                            {/* Sleek Hover-to-Copy Contact */}
                            <div 
                                className="flex items-center text-slate-500 hover:text-slate-700 mt-1.5 group/copy w-fit transition-colors"
                                onClick={(e) => { 
                                    e.stopPropagation(); 
                                    navigator.clipboard.writeText(member.contact); 
                                    toast.success('Contact copied!'); 
                                }}
                            >
                                <Phone className="w-3.5 h-3.5 mr-2 opacity-70" />
                                <span className="text-sm truncate">{member.contact}</span>
                                <Copy className="w-3.5 h-3.5 ml-2 opacity-0 group-hover/copy:opacity-100 text-slate-400 transition-opacity" />
                            </div>
                        </div>

                        {/* Bottom Row: Financials & Action */}
                        <div className="mt-5 pt-4 border-t border-slate-100/60">
                            {isMemberOwner ? (
                                 <div className="flex items-center gap-2 text-rose-600 py-1">
                                     <ShieldCheck className="w-4 h-4" />
                                     <span className="text-xs font-bold">Full Administrative Access</span>
                                 </div>
                            ) : isManagement ? (
                                 <div className="flex items-center justify-between gap-3">
                                     <div className="flex flex-col">
                                         <span className="text-[10px] text-slate-500 font-medium leading-none mb-1">Monthly Salary</span>
                                         <span className="text-sm font-bold text-slate-900 leading-none">৳{member.salary?.toLocaleString() || 0}</span>
                                     </div>
                                     <Button 
                                         size="sm" 
                                         variant={((member.salaryDue || 0) > 0) ? "default" : "secondary"}
                                         className={cn(
                                             "h-8 px-4 rounded-md font-bold text-xs transition-all",
                                             (member.salaryDue || 0) > 0 
                                                ? "bg-slate-900 text-white hover:bg-slate-800 shadow-sm" 
                                                : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm"
                                         )}
                                         onClick={(e) => { e.stopPropagation(); setPayingStaff(member); }}
                                     >
                                         <Banknote className="w-3.5 h-3.5 mr-2" /> 
                                         {(member.salaryDue || 0) > 0 ? 'Pay Due' : 'Pay Salary'}
                                     </Button>
                                 </div>
                            ) : (
                                <div className="flex items-center text-slate-400 py-1">
                                     <span className="text-xs font-medium">
                                         Joined {new Date(member.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                                     </span>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
      )}

      {/* === MODALS === */}
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
        title="Remove Team Member"
        description={`Are you sure you want to remove ${deletingStaff?.name}? This action cannot be undone.`}
        variant="destructive"
      />
    </div>
  );
};