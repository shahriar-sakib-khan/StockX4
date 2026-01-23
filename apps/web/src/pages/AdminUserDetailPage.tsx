import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUsers, User } from '../features/users/hooks/useUsers';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/button';
import { ArrowLeft, Shield, Mail, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export const AdminUserDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getUserById, adminResetPassword, deleteUser } = useUsers();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
       getUserById(id)
         .then(setUser)
         .catch(() => toast.error("Failed to load user"))
         .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) return (
      <div className="flex h-[50vh] items-center justify-center text-muted-foreground">
          Loading...
      </div>
  );

  if (!user) return (
      <div className="text-center py-20 text-muted-foreground">
          User not found
      </div>
  );

  return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Button
            variant="ghost"
            onClick={() => navigate('/admin')}
            className="flex items-center text-muted-foreground hover:text-foreground mb-4 pl-0 hover:bg-transparent"
        >
            <ArrowLeft size={20} className="mr-2" /> Back to Users
        </Button>

        <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
            <div className="flex items-start justify-between">
                <div className="flex items-center space-x-6">
                    <Avatar src={user.avatar} alt={user.name} size="xl" />
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">{user.name}</h1>
                        <p className="text-muted-foreground flex items-center mt-1">
                            <Mail size={16} className="mr-2" /> {user.email}
                        </p>
                        <div className="flex items-center mt-3 space-x-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                                user.role === 'admin'
                                ? 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400'
                                : 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400'
                            } uppercase tracking-wider`}>
                                {user.role}
                            </span>
                            <span className="text-muted-foreground text-xs font-mono bg-muted px-2 py-1 rounded border border-border">
                                ID: {user._id}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Reset Password Zone */}
        <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
            <h3 className="text-xl font-bold text-foreground mb-4 flex items-center">
                <Shield className="mr-3 text-destructive" /> Admin Danger Zone
            </h3>
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6">
                <h4 className="text-lg font-medium text-destructive mb-2">Force Password Reset</h4>
                <p className="text-sm text-destructive/80 mb-6">
                    This will immediately override the users current password. They will need to use this new password to login.
                </p>

                <form onSubmit={async (e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const newPass = formData.get('newPassword') as string;
                    if (!newPass) return;

                    try {
                        await adminResetPassword(user._id, newPass);
                        toast.success("Password reset successfully");
                        (e.target as HTMLFormElement).reset();
                    } catch {
                        toast.error("Failed to reset password");
                    }
                }} className="flex items-end gap-4">
                    <div className="flex-1">
                        <label className="block text-xs font-medium text-destructive mb-1.5 uppercase tracking-wide">New Permanent Password</label>
                        <input
                            name="newPassword"
                            type="text"
                            placeholder="Enter new password..."
                            className="w-full bg-background border border-destructive/30 rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-destructive placeholder-destructive/40 font-mono"
                        />
                    </div>
                    <Button type="submit" variant="destructive" className="shrink-0">
                        Reset Password
                    </Button>
                </form>
            </div>
        </div>
      </div>
  );
};
