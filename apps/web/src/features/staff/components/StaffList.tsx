import { useStaffList, useDeleteStaff } from '../hooks/useStaff';
import { Button } from '@/components/ui/button';
import { Plus, User, BadgeCheck, Pencil, Trash2, MoreHorizontal } from 'lucide-react';
import { useState } from 'react';
import { AddStaffModal } from './AddStaffModal';
import { EditStaffModal } from './EditStaffModal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { toast } from 'sonner';

export const StaffList = ({ storeId }: { storeId: string }) => {
  const { data, isLoading, error } = useStaffList(storeId);
  const deleteStaff = useDeleteStaff();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<any>(null);
  const [deletingStaff, setDeletingStaff] = useState<any>(null);

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {staff.map((member: any) => (
                <div key={member._id} className="group relative bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-lg transition-all duration-300 hover:border-primary/20">
                    <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-blue-600 hover:bg-blue-50"
                            onClick={() => setEditingStaff(member)}
                        >
                            <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            onClick={() => setDeletingStaff(member)}
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>

                    <div className="flex flex-col items-center text-center">
                        <div className="relative mb-4">
                            {member.image ? (
                                <img
                                    src={member.image}
                                    alt={member.name}
                                    className="h-20 w-20 rounded-full object-cover border-4 border-background shadow-md group-hover:scale-105 transition-transform duration-300"
                                />
                            ) : (
                                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 border-4 border-background shadow-md flex items-center justify-center text-primary text-2xl font-bold group-hover:scale-105 transition-transform duration-300">
                                    {member.name.substring(0, 2).toUpperCase()}
                                </div>
                            )}
                            <div className={`absolute bottom-1 right-1 h-5 w-5 rounded-full border-4 border-card ${member.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                        </div>

                        <h4 className="font-bold text-lg text-foreground mb-1">{member.name}</h4>
                        <span className="text-sm font-mono text-muted-foreground bg-muted/50 px-2 py-1 rounded-md mb-3">
                            {member.staffId}
                        </span>

                        <div className="flex items-center gap-2 mb-4">
                             <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                                member.role === 'manager'
                                    ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800'
                                    : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800'
                            }`}>
                                {member.role === 'manager' && <BadgeCheck className="w-3 h-3 mr-1" />}
                                {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                            </span>
                        </div>

                        <div className="w-full pt-4 border-t border-border flex justify-between items-center text-sm text-muted-foreground">
                            <span>Status</span>
                            <span className={member.isActive ? "text-green-600 font-medium" : "text-gray-500"}>
                                {member.isActive ? "Active" : "banned"}
                            </span>
                        </div>
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
