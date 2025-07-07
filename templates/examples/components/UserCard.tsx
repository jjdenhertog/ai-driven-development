import { useCallback, useMemo } from 'react';
import { Card, CardContent, Typography, Button, Box, Chip } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';

interface UserCardProps {
  readonly user: User;
  readonly onEdit?: (userId: string) => void;
  readonly onDelete?: (userId: string) => void;
  readonly showActions?: boolean;
}

interface User {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly role: 'admin' | 'user' | 'guest';
  readonly active: boolean;
  readonly createdAt: Date;
}

export const UserCard: React.FC<UserCardProps> = ({ user, onEdit, onDelete, showActions = true }) => {
  // Always use useCallback for event handlers
  const handleEdit = useCallback(() => {
    onEdit?.(user.id);
  }, [user.id, onEdit]);

  const handleDelete = useCallback(() => {
    if (confirm(`Delete user ${user.name}?`))
      onDelete?.(user.id);
  }, [user.id, user.name, onDelete]);

  // Use useMemo for computed values
  const roleColor = useMemo(() => {
    switch (user.role) {
      case 'admin': return 'error';
      case 'user': return 'primary';
      case 'guest': return 'default';
    }
  }, [user.role]);

  // Example of 2-line if without braces
  if (!user.active)
    return null;

  return (
    <Card sx={{ mb: 2, '&:hover': { boxShadow: 3 } }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" gutterBottom>
              {user.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {user.email}
            </Typography>
            <Chip 
              label={user.role} 
              color={roleColor} 
              size="small" 
              sx={{ mt: 1 }}
            />
          </Box>
          
          {showActions && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button 
                size="small" 
                startIcon={<Edit />}
                onClick={handleEdit}
              >
                Edit
              </Button>
              <Button 
                size="small" 
                color="error"
                startIcon={<Delete />}
                onClick={handleDelete}
              >
                Delete
              </Button>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};