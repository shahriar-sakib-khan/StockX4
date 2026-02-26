import { useStaffList, useDeleteStaff } from '../hooks/useStaff';
import { PaySalaryModal } from './PaySalaryModal';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { Button } from '@/components/ui/button';
import { Plus, User, BadgeCheck, Pencil, Trash2, Banknote } from 'lucide-react';
import { useState } from 'react';
import { AddStaffModal } from './AddStaffModal';
import { EditStaffModal } from './EditStaffModal';
import { StaffDetailsModal } from './StaffDetailsModal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { toast } from 'sonner';

export const StaffList = ({ storeId }: { storeId: string }) => {
  const { user } = useAuthStore();
  const isOwner = !!user; // Only owners have the user object in auth store

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
            <User className="w-5 h-5 mr-2 text-primary" />
            Staff Members
        </h3>
        <Button onClick={() => setIsAddModalOpen(true)} size="sm">
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
            <p className="text-muted-foreground max-w-sm mt-1">
                Get started by adding your first staff member to manage this store.
            </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {staff.map((member: any) => (
                <div
                    key={member._id}
                    onClick={() => setSelectedStaffDetails(member)}
                    className="group relative overflow-hidden bg-white border border-slate-200 rounded-xl hover:shadow-lg transition-all duration-300 hover:border-primary/50 cursor-pointer"
                >
                    {/* Header Image / Pattern */}
                    <div className="relative h-32 w-full overflow-hidden bg-slate-100">
                        {member.image ? (
                            <img
                                src={member.image}
                                alt={member.name}
                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center bg-slate-50 relative overflow-hidden">
                                <User className="h-16 w-16 text-slate-200 absolute -bottom-4 -right-4 rotate-12" />
                                <div className="z-10 h-12 w-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-bold text-lg border-2 border-white shadow-sm">
                                    {member.name.substring(0, 2).toUpperCase()}
                                </div>
                            </div>
                        )}
                        {/* Gradient Removed */}

                        {/* Overlay Info */}
                        <div className="absolute bottom-3 left-4 right-4 text-slate-900">
                            <h4 className="font-black text-3xl leading-none tracking-tight truncate">{member.name}</h4>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border border-slate-200 backdrop-blur-sm ${
                                    member.role === 'manager'
                                        ? 'bg-purple-100 text-purple-700'
                                        : 'bg-blue-100 text-blue-700'
                                }`}>
                                    {member.role === 'manager' && <BadgeCheck className="w-3 h-3 mr-1" />}
                                    {member.role}
                                </span>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded border border-slate-200 backdrop-blur-sm ${
                                    member.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                }`}>
                                    {member.isActive ? 'Active' : 'Banned'}
                                </span>
                            </div>
                        </div>

                        {/* Top Actions */}
                        <div className="absolute top-2 right-2 flex gap-1 z-10 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                            <Button
                                variant="secondary"
                                size="icon"
                                className="h-7 w-7 bg-white/90 hover:bg-white shadow-sm rounded-full"
                                onClick={() => setEditingStaff(member)}
                            >
                                <Pencil className="w-3.5 h-3.5 text-slate-700" />
                            </Button>
                            <Button
                                variant="destructive"
                                size="icon"
                                className="h-7 w-7 shadow-sm rounded-full"
                                onClick={() => setDeletingStaff(member)}
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-4">
                        {member.phone && (
                            <div className="flex items-center text-sm text-slate-600 mb-2">
                                <span className="mr-2">📞</span>
                                {member.phone}
                            </div>
                        )}
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span className="font-mono bg-slate-100 px-2 py-1 rounded">ID: {member.staffId}</span>
                            <span className="text-xs">Joined {new Date(member.createdAt).toLocaleDateString()}</span>
                        </div>

                        {(isOwner || member.role === 'manager') && (
                            <div className="pt-3 border-t border-dashed border-slate-200">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Monthly Salary</span>
                                    <span className="font-bold text-lg text-slate-800">৳{member.salary || 0}</span>
                                </div>
                                <div className="flex justify-between items-center mb-4 relative group/due">
                                     <div className="flex flex-col">
                                         <span className={`text-xs font-bold uppercase tracking-wider ${(member.salaryDue || 0) < 0 ? 'text-green-600' : (member.salaryDue || 0) > 0 ? 'text-red-500' : 'text-slate-500'}`}>
                                            {(member.salaryDue || 0) < 0 ? 'Overpaid Salary' : 'Due Salary'}
                                         </span>
                                         <span className="text-[10px] text-muted-foreground font-medium">
                                            {(() => {
                                                const now = new Date();
                                                const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
                                                const daysLeft = Math.ceil((nextMonth.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                                                return `Due in ${daysLeft} days`;
                                            })()}
                                         </span>
                                     </div>
                                     <span className={`font-extrabold text-2xl ${(member.salaryDue || 0) < 0 ? 'text-green-600' : (member.salaryDue || 0) > 0 ? 'text-red-600' : 'text-slate-400'}`}>
                                        ৳{Math.abs(member.salaryDue || 0)}
                                     </span>
                                </div>

                                <Button
                                    className="w-full h-9 bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setPayingStaff(member);
                                    }}
                                >
                                    <Banknote className="w-4 h-4 mr-2" />
                                    Pay Salary
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            ))}
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
