'use client';

import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { enqueueSnackbar } from 'notistack';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  IconButton,
  Chip,
  Typography,
  Box,
  Skeleton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Email as EmailIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { BTextField } from './BTextField';
import { useAppStore } from '../stores/useAppStore';

// Following your API patterns with Zod types
interface User {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly role: 'admin' | 'user' | 'guest';
  readonly active: boolean;
  readonly createdAt: string;
  readonly lastLogin: string | null;
}

interface UsersResponse {
  readonly users: User[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
}

// Query keys following your pattern
const queryKeys = {
  users: (page: number, pageSize: number, search: string) => 
    ['users', { page, pageSize, search }] as const,
  user: (id: string) => ['users', id] as const,
};

export const UsersDataTableSx = () => {
  // Local state for table controls
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // Zustand store usage
  const theme = useAppStore(state => state.theme);
  const addNotification = useAppStore(state => state.addNotification);
  
  const queryClient = useQueryClient();

  // Memoized styles using sx prop pattern
  const tableStyles = useMemo(() => ({
    paper: {
      width: '100%',
      overflow: 'hidden',
      bgcolor: 'background.paper',
    },
    header: {
      p: 2,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: 1,
      borderColor: 'divider',
    },
    searchField: {
      width: { xs: '100%', sm: 300 },
    },
    tableRow: {
      '&:hover': {
        bgcolor: 'action.hover',
      },
      '&[data-active="false"]': {
        opacity: 0.6,
      },
    },
    deleteMenuItem: {
      color: 'error.main',
      '&:hover': {
        bgcolor: 'error.main',
        color: 'error.contrastText',
        '& .MuiListItemIcon-root': {
          color: 'error.contrastText',
        },
      },
    },
  }), []);

  // Fetch users with caching (following your TanStack Query patterns)
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.users(page, pageSize, search),
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        ...(search && { search }),
      });
      
      const response = await fetch(`/api/users?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      
      return response.json() as Promise<UsersResponse>;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });

  // Delete user mutation
  const deleteMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete user');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      enqueueSnackbar('User deleted successfully', { variant: 'success' });
      handleCloseMenu();
    },
    onError: (error: Error) => {
      enqueueSnackbar(error.message, { variant: 'error' });
    },
  });

  // Toggle user status mutation with optimistic update
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ userId, active }: { userId: string; active: boolean }) => {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update user status');
      }
      
      return response.json();
    },
    onMutate: async ({ userId, active }) => {
      // Optimistic update following your patterns
      await queryClient.cancelQueries({ queryKey: ['users'] });
      
      const previousData = queryClient.getQueryData<UsersResponse>(
        queryKeys.users(page, pageSize, search)
      );
      
      if (previousData) {
        queryClient.setQueryData<UsersResponse>(
          queryKeys.users(page, pageSize, search),
          {
            ...previousData,
            users: previousData.users.map(user =>
              user.id === userId ? { ...user, active } : user
            ),
          }
        );
      }
      
      return { previousData };
    },
    onError: (err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          queryKeys.users(page, pageSize, search),
          context.previousData
        );
      }
      enqueueSnackbar('Failed to update user status', { variant: 'error' });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  // Memoized filtered data for search
  const filteredUsers = useMemo(() => {
    if (!data?.users) return [];
    
    // Client-side filtering if search is too short for API
    if (search.length > 0 && search.length < 3) {
      return data.users.filter(user =>
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    return data.users;
  }, [data?.users, search]);

  // Event handlers with useCallback
  const handleChangePage = useCallback((event: unknown, newPage: number) => {
    setPage(newPage);
  }, []);

  const handleChangeRowsPerPage = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setPageSize(parseInt(event.target.value, 10));
    setPage(0);
  }, []);

  const handleOpenMenu = useCallback((event: React.MouseEvent<HTMLElement>, user: User) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  }, []);

  const handleCloseMenu = useCallback(() => {
    setAnchorEl(null);
    setSelectedUser(null);
  }, []);

  const handleDeleteUser = useCallback(() => {
    if (selectedUser) {
      deleteMutation.mutate(selectedUser.id);
    }
  }, [selectedUser, deleteMutation]);

  const handleToggleStatus = useCallback(() => {
    if (selectedUser) {
      toggleStatusMutation.mutate({
        userId: selectedUser.id,
        active: !selectedUser.active,
      });
      handleCloseMenu();
    }
  }, [selectedUser, toggleStatusMutation, handleCloseMenu]);

  // Role chip color helper
  const getRoleColor = useCallback((role: User['role']) => {
    switch (role) {
      case 'admin':
        return 'error';
      case 'user':
        return 'primary';
      case 'guest':
        return 'default';
    }
  }, []);

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error">Failed to load users</Typography>
      </Box>
    );
  }

  return (
    <Paper sx={tableStyles.paper}>
      <Box sx={tableStyles.header}>
        <Typography variant="h5">Users Management</Typography>
        <BTextField
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search users..."
          size="small"
          sx={tableStyles.searchField}
        />
      </Box>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Last Login</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              // Loading skeletons
              Array.from({ length: pageSize }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton /></TableCell>
                  <TableCell><Skeleton /></TableCell>
                  <TableCell><Skeleton width={60} /></TableCell>
                  <TableCell><Skeleton width={80} /></TableCell>
                  <TableCell><Skeleton /></TableCell>
                  <TableCell><Skeleton width={40} /></TableCell>
                </TableRow>
              ))
            ) : (
              filteredUsers.map((user) => (
                <TableRow 
                  key={user.id}
                  sx={tableStyles.tableRow}
                  data-active={user.active}
                >
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={user.role}
                      size="small"
                      color={getRoleColor(user.role)}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.active ? 'Active' : 'Inactive'}
                      size="small"
                      color={user.active ? 'success' : 'default'}
                      variant={user.active ? 'filled' : 'outlined'}
                    />
                  </TableCell>
                  <TableCell>
                    {user.lastLogin 
                      ? new Date(user.lastLogin).toLocaleDateString()
                      : 'Never'
                    }
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={(e) => handleOpenMenu(e, user)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={data?.total || 0}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={pageSize}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25, 50]}
        sx={{ borderTop: 1, borderColor: 'divider' }}
      />

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={() => console.log('Edit user:', selectedUser)}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit User</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={handleToggleStatus}>
          <ListItemIcon>
            {selectedUser?.active ? (
              <BlockIcon fontSize="small" />
            ) : (
              <CheckCircleIcon fontSize="small" />
            )}
          </ListItemIcon>
          <ListItemText>
            {selectedUser?.active ? 'Deactivate' : 'Activate'}
          </ListItemText>
        </MenuItem>
        
        <MenuItem onClick={() => console.log('Send email to:', selectedUser)}>
          <ListItemIcon>
            <EmailIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Send Email</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={handleDeleteUser} sx={tableStyles.deleteMenuItem}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete User</ListItemText>
        </MenuItem>
      </Menu>
    </Paper>
  );
};