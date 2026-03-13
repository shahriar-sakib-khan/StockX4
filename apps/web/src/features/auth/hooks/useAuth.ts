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
       toast.error(error.message || 'Registration failed');
       throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (data: LoginData) => {
    setIsLoading(true);
    try {
      const res = await api.post('auth/login', { json: data }).json<any>();

      if (res.selectionRequired && res.type === 'staff_selection') {
          // Handle multiple staff roles - for now we just toast or redirect to a selection page
          // This is rare per user request, but we should handle it
          toast.info("Multiple stores found. Please select a store.");
          // TODO: Implementation of selection page if needed
          return { selectionRequired: true, options: res.options };
      }

      const { user, accessToken, redirect } = res;

      // Determine which store to populate based on server-provided user data
      if (user.storeId || user.role === 'staff' || user.role === 'manager' || user.role === 'driver') {
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
        toast.error(error.message || 'Invalid credentials');
        throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const googleLogin = async (credential: string) => {
    setIsLoading(true);
    try {
      const res = await api.post('auth/google', { json: { credential } }).json<any>();
      const { user, accessToken, redirect } = res;

      if (user.storeId || user.role === 'staff' || user.role === 'manager' || user.role === 'driver') {
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

      toast.success('Signed in with Google!');
      if (redirect) {
          navigate(redirect);
      } else {
          navigate(user.role === 'admin' ? '/admin' : '/dashboard');
      }
      return { success: true };
    } catch (error: any) {
        console.error("Google Login error", error);
        toast.error('Google sign-in failed');
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
      toast.error(error.message || 'Failed to change password');
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
    googleLogin,
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
