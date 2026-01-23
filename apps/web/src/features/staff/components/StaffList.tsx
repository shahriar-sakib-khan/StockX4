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
        <p className="text-muted-foreground text-center py-4">No staff added yet.</p>
      ) : (
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead>
                    <tr className="border-b border-border text-muted-foreground text-sm">
                        <th className="pb-3 pl-2">Name</th>
                        <th className="pb-3">Staff ID / Email</th>
                        <th className="pb-3">Role</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3 text-right pr-2">Actions</th>
                    </tr>
                </thead>
                <tbody className="text-foreground">
                    {staff.map((member: any) => (
                        <tr key={member._id} className="border-b border-border hover:bg-muted/50 transition-colors">
                            <td className="py-3 pl-2 font-medium text-foreground">{member.name}</td>
                            <td className="py-3 font-mono text-sm">{member.staffId}</td>
                            <td className="py-3 capitalize">
                                <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium border ${
                                    member.role === 'manager'
                                        ? 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800'
                                        : member.role === 'driver'
                                        ? 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800'
                                        : 'bg-secondary text-secondary-foreground border-border'
                                }`}>
                                    {member.role}
                                </span>
                            </td>
                            <td className="py-3">
                                {member.isActive ? (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-500/10 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-900">
                                        <BadgeCheck className="w-3 h-3 mr-1" />
                                        Active
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground border border-border">
                                        Inactive
                                    </span>
                                )}
                            </td>
                            <td className="py-3 text-right pr-2">
                                <div className="flex justify-end gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                                        onClick={() => setEditingStaff(member)}
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                        onClick={() => setDeletingStaff(member)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
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
