
import { useAuthStore } from '../features/auth/stores/auth.store';
import { useAuth } from '../features/auth/hooks/useAuth';
import { Avatar } from '../components/ui/Avatar';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const ProfilePage = () => {
  const { user } = useAuthStore();
  const { uploadAvatar, deleteAvatar, updateProfile, changePassword } = useAuth();
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (file: File) => {
      setIsUploading(true);
      try {
          await uploadAvatar(file);
      } finally {
          setIsUploading(false);
      }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <div className="flex items-center space-x-6 mb-8">
          <div className="relative">
              <Avatar src={user?.avatar} alt={user?.name} size="xl" className={isUploading ? 'opacity-50' : ''} />
              {isUploading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
              )}
          </div>
          <div className="space-y-3">
             <div>
                <h3 className="text-2xl font-bold text-foreground mb-1">{user?.name}</h3>
                <p className="text-muted-foreground capitalize">{user?.role}</p>
             </div>

             <div className="flex space-x-3 items-center">
                <div className="relative">
                    <Button disabled={isUploading} variant="outline" className="relative cursor-pointer text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300">
                        {isUploading ? 'Uploading...' : 'Upload Photo'}
                        <input
                          type="file"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          accept="image/*"
                          disabled={isUploading}
                          onChange={(e) => {
                             const file = e.target.files?.[0];
                             if (file) handleUpload(file);
                          }}
                        />
                    </Button>
                </div>
                {user?.avatar && (
                   <Button
                      onClick={deleteAvatar}
                      variant="ghost"
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive border border-destructive/20"
                   >
                      Remove Photo
                   </Button>
                )}
             </div>
          </div>
        </div>

      </div>

      {/* Edit Profile & Password Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Update Profile */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <h3 className="text-xl font-bold text-foreground mb-4">Edit Profile</h3>
              <form onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  await updateProfile({
                      name: formData.get('name') as string,
                      email: formData.get('email') as string
                  });
              }} className="space-y-4">
                  <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Name</label>
                      <Input name="name" defaultValue={user?.name} required />
                  </div>
                  <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Email</label>
                      <Input name="email" defaultValue={user?.email} required type="email" />
                  </div>
                  <Button type="submit" className="w-full">
                      Save Changes
                  </Button>
              </form>
          </div>

          {/* Change Password */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <h3 className="text-xl font-bold text-foreground mb-4">Change Password</h3>
              <form onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const newPass = formData.get('newPassword') as string;
                  const confirmPass = formData.get('confirmPassword') as string;

                  if (newPass !== confirmPass) {
                      return toast.error("Passwords don't match");
                  }

                  await changePassword({
                      oldPassword: formData.get('oldPassword') as string,
                      newPassword: newPass
                  });
                  (e.target as HTMLFormElement).reset();
              }} className="space-y-4">
                  <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Current Password</label>
                      <Input type="password" name="oldPassword" required />
                  </div>
                  <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">New Password</label>
                      <Input type="password" name="newPassword" required />
                  </div>
                  <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Confirm New Password</label>
                      <Input type="password" name="confirmPassword" required />
                  </div>
                  <Button type="submit" variant="secondary" className="w-full">
                      Update Password
                  </Button>
              </form>
          </div>
      </div>
    </div>
  );
};
