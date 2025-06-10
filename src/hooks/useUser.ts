import { useQuery } from '@tanstack/react-query';
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
  const { data: user, isLoading: loading, error, refetch } = useQuery<User>({
    queryKey: ['user'],
    queryFn: async () => {
      const response = await axiosInstance.get(apiRoutes.user);
      return response.data;
    },
  });

  const isAdmin = (): boolean => user?.role === 'admin';
  const isPentester = (): boolean => user?.role === 'pentester';
  const isClient = (): boolean => user?.role === 'client';

  return { 
    user: user || null,
    loading,
    error: error ? 'Failed to fetch user data' : null,
    isAdmin,
    isPentester,
    isClient,
    refetch
  };
}