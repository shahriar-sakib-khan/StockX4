import { useAuthStore } from '../features/auth/stores/auth.store';
import { useAuth } from '../features/auth/hooks/useAuth';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useUsers } from '../features/users/hooks/useUsers';
import { Shield, User as UserIcon, Trash2, ArrowUpRight, ArrowDownRight } from 'lucide-react';

import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Button } from '../components/ui/button';

export const AdminDashboardPage = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { users, isLoading, fetchUsers, updateUserRole, deleteUser } = useUsers();
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (user.role !== 'admin') {
      navigate('/dashboard');
    } else {
        fetchUsers();
    }
  }, [user, navigate, fetchUsers]);

  if (!user || user.role !== 'admin') return null;

  const adminUsers = users.filter(u => u.role === 'admin');
  const normalUsers = users.filter(u => u.role === 'user');

  return (
      <div className="space-y-8 max-w-6xl mx-auto">
        <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
                System Overview
            </h1>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span>System Operational</span>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Admin Users List */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center">
                <Shield className="mr-2 text-primary" /> Admins ({adminUsers.length})
            </h2>
            <div className="space-y-4">
                {adminUsers.map(admin => (
                    <div
                        key={admin._id}
                        className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border hover:border-primary/50 transition-colors"
                    >
                        <div className="cursor-pointer" onClick={() => navigate(`/admin/users/${admin._id}`)}>
                            <div className="flex items-center space-x-2">
                                <p className="font-medium text-foreground">{admin.name}</p>
                                {admin._id === user.id && (
                                     <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">YOU</span>
                                )}
                            </div>
                            <p className="text-sm text-muted-foreground">{admin.email}</p>
                        </div>
                        <div onClick={(e) => e.stopPropagation()}>
                        {admin._id !== user.id && ( // Prevent demoting self
                             <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateUserRole(admin._id, 'user')}
                                className="h-8 text-xs border-destructive/30 hover:border-destructive hover:text-destructive hover:bg-destructive/5"
                             >
                                <ArrowDownRight className="mr-1 h-3 w-3" />
                                Demote
                             </Button>
                        )}
                        </div>
                    </div>
                ))}
            </div>
          </div>

          {/* Normal Users List */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center">
                <UserIcon className="mr-2 text-blue-500" /> Users ({normalUsers.length})
            </h2>
            {isLoading && <p className="text-muted-foreground animate-pulse">Loading users...</p>}
            <div className="space-y-4">
                {normalUsers.map(normalUser => (
                    <div
                        key={normalUser._id}
                        className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                    >
                        <div className="cursor-pointer" onClick={() => navigate(`/admin/users/${normalUser._id}`)}>
                            <p className="font-medium text-foreground">{normalUser.name}</p>
                            <p className="text-sm text-muted-foreground">{normalUser.email}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                             <Button
                                 size="sm"
                                 variant="outline"
                                 onClick={(e) => {
                                     e.stopPropagation();
                                     updateUserRole(normalUser._id, 'admin');
                                 }}
                                 className="h-8 text-xs hover:border-primary hover:text-primary"
                             >
                                <ArrowUpRight className="mr-1 h-3 w-3" />
                                Promote
                             </Button>
                             <Button
                                 size="icon"
                                 variant="ghost"
                                 onClick={(e) => {
                                     e.stopPropagation();
                                     setUserToDelete(normalUser._id);
                                 }}
                                 className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                 title="Delete User"
                             >
                                <Trash2 className="h-4 w-4" />
                             </Button>
                        </div>
                    </div>
                ))}
                {!isLoading && normalUsers.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                        <p>No normal users found.</p>
                    </div>
                )}
            </div>
          </div>
        </div>

        <ConfirmDialog
            isOpen={!!userToDelete}
            onClose={() => setUserToDelete(null)}
            onConfirm={() => {
                if (userToDelete) {
                    deleteUser(userToDelete);
                    setUserToDelete(null);
                }
            }}
            title="Delete User?"
            description="Are you absolutely sure you want to delete this user? This action cannot be undone."
            confirmLabel="Delete User"
        />
      </div>
  );
};
