// Example component demonstrating sx prop pattern (PRIMARY approach)
import { memo, useCallback, useMemo } from 'react';
import { Box, Typography, List, ListItem, ListItemButton, Paper } from '@mui/material';

interface Props {
  readonly title: string;
  readonly items: readonly string[];
  readonly onItemClick?: (item: string) => void;
}

export const ExampleComponent = memo(({ title, items, onItemClick }: Props) => {
  const handleItemClick = useCallback((item: string) => {
    if (onItemClick)
      onItemClick(item);
  }, [onItemClick]);

  const sortedItems = useMemo(() => {
    return [...items].sort();
  }, [items]);

  // Memoized styles using sx prop pattern
  const styles = useMemo(() => ({
    container: {
      p: 2,
      bgcolor: 'background.paper',
      borderRadius: 1,
      boxShadow: 1,
    },
    title: {
      mb: 2,
      color: 'primary.main',
    },
    empty: {
      textAlign: 'center',
      p: 4,
      color: 'text.secondary',
    },
    listItem: {
      '&:hover': {
        bgcolor: 'action.hover',
      },
      '&[aria-selected="true"]': {
        bgcolor: 'primary.main',
        color: 'primary.contrastText',
        '&:hover': {
          bgcolor: 'primary.dark',
        },
      },
    },
  }), []);

  if (!items.length)
    return <Box sx={styles.empty}>No items</Box>;

  return (
    <Paper sx={styles.container}>
      <Typography variant="h5" sx={styles.title}>
        {title}
      </Typography>
      <List>
        {sortedItems.map((item) => (
          <ListItem key={item} disablePadding>
            <ListItemButton 
              onClick={() => handleItemClick(item)}
              sx={styles.listItem}
            >
              {item}
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
});