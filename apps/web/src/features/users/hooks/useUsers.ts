import { useState, useCallback } from 'react';
import { api } from '../../../lib/api';
import { toast } from 'sonner';

export interface User {
  _id: string; // MongoDB ID
  name: string;
  email: string;
  role: 'user' | 'admin';
  avatar?: string;
}

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await api.get('users').json<User[]>();
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users', error);
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateUserRole = async (userId: string, newRole: 'user' | 'admin') => {
    try {
      await api.patch(`users/${userId}/role`, { json: { role: newRole } });
      toast.success(`User role updated to ${newRole}`);
      // Optimistic update or refetch
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
    } catch (error) {
       console.error('Failed to update role', error);
       toast.error('Failed to update user role');
    }
  };

  const getUserById = async (id: string) => {
      return await api.get(`users/${id}`).json<User>();
  };

  const adminResetPassword = async (id: string, newPassword: string) => {
      await api.patch(`users/${id}/password`, { json: { newPassword } });
  };

  const deleteUser = async (id: string) => {
      await api.delete(`users/${id}`);
      setUsers(prev => prev.filter(u => u._id !== id));
      toast.success('User deleted successfully');
  };

  return {
    users,
    isLoading,
    fetchUsers,
    updateUserRole,
    getUserById,
    adminResetPassword,
    deleteUser
  };
};
