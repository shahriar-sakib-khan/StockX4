import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuthStore, User } from '../stores/auth.store';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

interface LoginData {
  identifier: string;
  password: string;
}

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { setAuth, clearAuth, isAuthenticated } = useAuthStore();

  const register = async (data: RegisterData) => {
    setIsLoading(true);
    try {
      await api.post('auth/register', { json: data }).json<any>();
      toast.success('Account created successfully! Please log in.');
      navigate('/login');
      return { success: true };
    } catch (error: any) {
       console.error("Register error", error);
       // Safely unpack specific error message from backend if available
       const message = await error.response?.json().then((d: any) => d.error).catch(() => 'Registration failed');
       toast.error(message);
       throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (data: LoginData) => {
    setIsLoading(true);
    try {
      const res = await api.post('auth/login-unified', { json: data }).json<any>();
      console.log('Login successful:', res);

      if (res.selectionRequired && res.type === 'staff_selection') {
          // Handle multiple staff roles - for now we just toast or redirect to a selection page
          // This is rare per user request, but we should handle it
          toast.info("Multiple stores found. Please select a store.");
          // TODO: Implementation of selection page if needed
          return { selectionRequired: true, options: res.options };
      }

      const { user, accessToken, redirect } = res;

      // Determine which store to populate
      if (user.storeId || accessToken.includes('staff')) { // OR check res structure
          const { useStaffStore } = await import('../../staff/stores/staff.store');
          useStaffStore.getState().setAuth({
              _id: user.id || user._id,
              name: user.name,
              role: user.role,
              storeId: user.storeId
          }, accessToken);
      } else {
          setAuth(user, accessToken);
      }

      toast.success('Welcome back!');

      if (redirect) {
          navigate(redirect);
      } else {
          navigate(user.role === 'admin' ? '/admin' : '/dashboard');
      }
      return { success: true };
    } catch (error: any) {
        console.error("Login error", error);
        const errorData = await error.response?.json().catch(() => ({}));
        const message = errorData?.details || errorData?.error || 'Invalid credentials';
        toast.error(message);
        throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
      try {
          await api.post('auth/logout');
      } catch (e) {
          // ignore
      }
    clearAuth();
    localStorage.removeItem('store-setup-wizard');
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const uploadAvatar = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const updatedUser = await api.post('users/me/avatar', { body: formData }).json<User>();

      useAuthStore.getState().updateUser({ avatar: updatedUser.avatar });
      toast.success('Avatar updated');
    } catch (error) {
      console.error('Upload failed', error);
      toast.error('Failed to upload avatar');
    }
  };

  const deleteAvatar = async () => {
    try {
      await api.delete('users/me/avatar');
      useAuthStore.getState().updateUser({ avatar: undefined }); // Or empty string, depending on backend response
      toast.success('Avatar removed');
    } catch (error) {
      console.error('Delete failed', error);
      toast.error('Failed to remove avatar');
    }
  };

  const updateProfile = async (data: { name?: string; email?: string }) => {
    try {
      const updatedUser = await api.patch('users/me', { json: data }).json<User>();
      useAuthStore.getState().updateUser(updatedUser);
      toast.success('Profile updated');
    } catch (error) {
      console.error('Update failed', error);
      toast.error('Failed to update profile');
      throw error;
    }
  };

  const changePassword = async (data: { oldPassword: string; newPassword: string }) => {
    try {
      await api.put('users/me/password', { json: data });
      toast.success('Password changed successfully');
    } catch (error: any) {
      console.error('Password change failed', error);
      const message = await error.response?.json().then((d: any) => d.message).catch(() => 'Failed to change password');
      toast.error(message);
      throw error;
    }
  };

  const deleteAccount = async () => {
      try {
          await api.delete('users/me');
          clearAuth();
          toast.success("Account deleted");
          navigate('/');
      } catch (error) {
          console.error("Delete account failed", error);
          toast.error("Failed to delete account");
      }
  };

  return {
    login,
    register,
    logout,
    uploadAvatar,
    deleteAvatar,
    updateProfile,
    changePassword,
    deleteAccount,
    isAuthenticated,
    isLoading,
  };
};
