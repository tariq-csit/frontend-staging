import { useState, useEffect } from 'react';
import axiosInstance from '@/lib/AxiosInstance';
import { apiRoutes } from '@/lib/routes';

export type UserRole = 'admin' | 'pentester' | 'client';

interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  profilePicture?: string;
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(apiRoutes.user);
      setUser(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch user data');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const isAdmin = (): boolean => user?.role === 'admin';
  const isPentester = (): boolean => user?.role === 'pentester';
  const isClient = (): boolean => user?.role === 'client';

  return { 
    user,
    loading,
    error,
    isAdmin,
    isPentester,
    isClient,
    refetch: fetchUser
  };
} 