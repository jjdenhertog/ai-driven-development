import { useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { enqueueSnackbar } from 'notistack';

interface User {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly role: 'admin' | 'user' | 'guest';
  readonly active: boolean;
  readonly createdAt: string;
}

interface UseUsersOptions {
  readonly enabled?: boolean;
  readonly filterActive?: boolean;
  readonly searchTerm?: string;
}

// Query key factory
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters: UseUsersOptions) => [...userKeys.lists(), filters] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
};

// Fetch function
async function fetchUsers(filters: UseUsersOptions) {
  const params = new URLSearchParams();
  
  if (filters.filterActive !== undefined)
    params.append('active', filters.filterActive.toString());
  
  if (filters.searchTerm)
    params.append('search', filters.searchTerm);

  const response = await fetch(`/api/users?${params}`);
  if (!response.ok) throw new Error('Failed to fetch users');
  
  return response.json();
}

// Main hook
export function useUsers(options: UseUsersOptions = {}) {
  const queryClient = useQueryClient();
  const { filterActive = true, searchTerm = '', enabled = true } = options;

  // Query for fetching users
  const query = useQuery<User[]>({
    queryKey: userKeys.list({ filterActive, searchTerm }),
    queryFn: () => fetchUsers({ filterActive, searchTerm }),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Create user mutation
  const createMutation = useMutation({
    mutationFn: async (data: Omit<User, 'id' | 'createdAt'>) => {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create user');
      }
      
      return response.json();
    },
    onSuccess: (newUser) => {
      // Update cache optimistically
      queryClient.setQueryData<User[]>(
        userKeys.list({ filterActive, searchTerm }), 
        (old) => old ? [...old, newUser] : [newUser]
      );
      
      // Invalidate all user queries
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      
      enqueueSnackbar('User created successfully', { variant: 'success' });
    },
    onError: (error: Error) => {
      enqueueSnackbar(error.message || 'Failed to create user', { variant: 'error' });
    },
  });

  // Update user mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: Partial<User> & { id: string }) => {
      const response = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) throw new Error('Failed to update user');
      return response.json();
    },
    onSuccess: (updatedUser) => {
      // Update specific user in cache
      queryClient.setQueryData(userKeys.detail(updatedUser.id), updatedUser);
      
      // Update user in lists
      queryClient.setQueriesData<User[]>(
        { queryKey: userKeys.lists() },
        (old) => old?.map(user => user.id === updatedUser.id ? updatedUser : user)
      );
      
      enqueueSnackbar('User updated successfully', { variant: 'success' });
    },
    onError: () => {
      enqueueSnackbar('Failed to update user', { variant: 'error' });
    },
  });

  // Delete user mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete user');
      return id;
    },
    onSuccess: (deletedId) => {
      // Remove from cache
      queryClient.setQueriesData<User[]>(
        { queryKey: userKeys.lists() },
        (old) => old?.filter(user => user.id !== deletedId)
      );
      
      enqueueSnackbar('User deleted successfully', { variant: 'success' });
    },
    onError: () => {
      enqueueSnackbar('Failed to delete user', { variant: 'error' });
    },
  });

  // Memoized filtered data
  const filteredUsers = useMemo(() => {
    if (!query.data) return [];
    
    return query.data.filter(user => {
      if (filterActive && !user.active) return false;
      
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        return user.name.toLowerCase().includes(search) || 
               user.email.toLowerCase().includes(search);
      }
      
      return true;
    });
  }, [query.data, filterActive, searchTerm]);

  // Prefetch function
  const prefetchUser = useCallback((id: string) => {
    queryClient.prefetchQuery({
      queryKey: userKeys.detail(id),
      queryFn: async () => {
        const response = await fetch(`/api/users/${id}`);
        if (!response.ok) throw new Error('Failed to fetch user');
        return response.json();
      },
      staleTime: 10 * 1000, // 10 seconds
    });
  }, [queryClient]);

  return {
    // Query state
    users: filteredUsers,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    
    // Mutations
    createUser: createMutation.mutate,
    updateUser: updateMutation.mutate,
    deleteUser: deleteMutation.mutate,
    
    // Loading states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    
    // Utils
    prefetchUser,
  };
}