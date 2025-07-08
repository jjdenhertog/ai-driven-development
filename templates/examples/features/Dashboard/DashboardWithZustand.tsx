'use client';

import { useEffect, useMemo, useCallback } from 'react';
import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  Card, 
  CardContent,
  IconButton,
  Skeleton,
  Chip,
  LinearProgress,
  Alert,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Refresh as RefreshIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { enqueueSnackbar } from 'notistack';
import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

// Dashboard-specific Zustand store with all middleware
interface DashboardFilters {
  dateRange: 'today' | 'week' | 'month' | 'year';
  department: string | null;
  status: 'all' | 'active' | 'pending' | 'completed';
}

interface DashboardState {
  // State
  filters: DashboardFilters;
  refreshInterval: number | null;
  selectedMetric: string | null;
  expandedCards: string[];
  
  // Actions
  setDateRange: (range: DashboardFilters['dateRange']) => void;
  setDepartment: (dept: string | null) => void;
  setStatus: (status: DashboardFilters['status']) => void;
  setRefreshInterval: (interval: number | null) => void;
  selectMetric: (metric: string | null) => void;
  toggleCardExpanded: (cardId: string) => void;
  resetFilters: () => void;
}

const useDashboardStore = create<DashboardState>()(
  devtools(
    subscribeWithSelector(
      immer((set) => ({
        // Initial state
        filters: {
          dateRange: 'month',
          department: null,
          status: 'all',
        },
        refreshInterval: null,
        selectedMetric: null,
        expandedCards: [],
        
        // Actions with Immer
        setDateRange: (range) => set((state) => {
          state.filters.dateRange = range;
        }),
        
        setDepartment: (dept) => set((state) => {
          state.filters.department = dept;
        }),
        
        setStatus: (status) => set((state) => {
          state.filters.status = status;
        }),
        
        setRefreshInterval: (interval) => set((state) => {
          state.refreshInterval = interval;
        }),
        
        selectMetric: (metric) => set((state) => {
          state.selectedMetric = metric;
        }),
        
        toggleCardExpanded: (cardId) => set((state) => {
          const index = state.expandedCards.indexOf(cardId);
          if (index >= 0) {
            state.expandedCards.splice(index, 1);
          } else {
            state.expandedCards.push(cardId);
          }
        }),
        
        resetFilters: () => set((state) => {
          state.filters = {
            dateRange: 'month',
            department: null,
            status: 'all',
          };
          state.selectedMetric = null;
        }),
      }))
    ),
    { name: 'DashboardStore' }
  )
);

// Subscribe to filter changes
useDashboardStore.subscribe(
  (state) => state.filters,
  (filters) => {
    console.log('Dashboard filters changed:', filters);
  }
);

// Types for dashboard data
interface MetricData {
  readonly id: string;
  readonly label: string;
  readonly value: number;
  readonly change: number;
  readonly trend: 'up' | 'down' | 'stable';
  readonly color: string;
}

interface ChartData {
  readonly labels: string[];
  readonly datasets: Array<{
    readonly label: string;
    readonly data: number[];
  }>;
}

interface DashboardData {
  readonly metrics: MetricData[];
  readonly chart: ChartData;
  readonly recentActivity: Array<{
    readonly id: string;
    readonly type: string;
    readonly description: string;
    readonly timestamp: string;
  }>;
}

// API function
async function fetchDashboardData(filters: DashboardFilters): Promise<DashboardData> {
  const params = new URLSearchParams({
    dateRange: filters.dateRange,
    ...(filters.department && { department: filters.department }),
    ...(filters.status !== 'all' && { status: filters.status }),
  });
  
  const response = await fetch(`/api/dashboard?${params}`);
  if (!response.ok) throw new Error('Failed to fetch dashboard data');
  
  return response.json();
}

export const DashboardWithZustand = () => {
  const queryClient = useQueryClient();
  
  // Zustand store selectors
  const filters = useDashboardStore((state) => state.filters);
  const refreshInterval = useDashboardStore((state) => state.refreshInterval);
  const selectedMetric = useDashboardStore((state) => state.selectedMetric);
  const expandedCards = useDashboardStore((state) => state.expandedCards);
  const { 
    setDateRange, 
    toggleCardExpanded, 
    setRefreshInterval,
    selectMetric,
  } = useDashboardStore();
  
  // Memoized styles
  const styles = useMemo(() => ({
    root: {
      p: 3,
      bgcolor: 'background.default',
      minHeight: '100vh',
    },
    header: {
      mb: 3,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    metricCard: {
      p: 2,
      cursor: 'pointer',
      transition: 'all 0.3s',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: 3,
      },
    },
    selectedMetric: {
      borderColor: 'primary.main',
      borderWidth: 2,
      borderStyle: 'solid',
    },
    expandedCard: {
      height: 'auto',
      minHeight: 200,
    },
    chartPaper: {
      p: 3,
      height: 400,
      position: 'relative',
    },
    activityItem: {
      p: 2,
      borderBottom: 1,
      borderColor: 'divider',
      '&:last-child': {
        borderBottom: 0,
      },
      '&:hover': {
        bgcolor: 'action.hover',
      },
    },
  }), []);
  
  // Fetch dashboard data with React Query
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['dashboard', filters],
    queryFn: () => fetchDashboardData(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: refreshInterval,
  });
  
  // Set up auto-refresh
  useEffect(() => {
    if (refreshInterval) {
      const interval = setInterval(() => {
        refetch();
        enqueueSnackbar('Dashboard refreshed', { variant: 'info' });
      }, refreshInterval);
      
      return () => clearInterval(interval);
    }
  }, [refreshInterval, refetch]);
  
  // Handlers
  const handleMetricClick = useCallback((metricId: string) => {
    selectMetric(metricId === selectedMetric ? null : metricId);
    toggleCardExpanded(metricId);
  }, [selectedMetric, selectMetric, toggleCardExpanded]);
  
  const handleRefresh = useCallback(() => {
    refetch();
    enqueueSnackbar('Refreshing dashboard...', { variant: 'info' });
  }, [refetch]);
  
  const getMetricStyles = useCallback((metric: MetricData) => ({
    ...styles.metricCard,
    ...(selectedMetric === metric.id && styles.selectedMetric),
    ...(expandedCards.includes(metric.id) && styles.expandedCard),
    borderLeft: `4px solid ${metric.color}`,
  }), [styles, selectedMetric, expandedCards]);
  
  if (error) {
    return (
      <Box sx={styles.root}>
        <Alert severity="error">Failed to load dashboard data</Alert>
      </Box>
    );
  }
  
  return (
    <Box sx={styles.root}>
      {/* Header */}
      <Box sx={styles.header}>
        <Typography variant="h4">Dashboard</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {(['today', 'week', 'month', 'year'] as const).map((range) => (
            <Chip
              key={range}
              label={range.charAt(0).toUpperCase() + range.slice(1)}
              onClick={() => setDateRange(range)}
              color={filters.dateRange === range ? 'primary' : 'default'}
              variant={filters.dateRange === range ? 'filled' : 'outlined'}
            />
          ))}
          <IconButton onClick={handleRefresh}>
            <RefreshIcon />
          </IconButton>
          <IconButton>
            <FilterListIcon />
          </IconButton>
        </Box>
      </Box>
      
      {/* Loading state */}
      {isLoading && <LinearProgress sx={{ mb: 2 }} />}
      
      {/* Metrics Grid */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Grid item xs={12} sm={6} md={3} key={i}>
                <Card>
                  <CardContent>
                    <Skeleton height={60} />
                    <Skeleton />
                  </CardContent>
                </Card>
              </Grid>
            ))
          : data?.metrics.map((metric) => (
              <Grid item xs={12} sm={6} md={3} key={metric.id}>
                <Card 
                  sx={getMetricStyles(metric)}
                  onClick={() => handleMetricClick(metric.id)}
                >
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom>
                      {metric.label}
                    </Typography>
                    <Typography variant="h4">
                      {metric.value.toLocaleString()}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      {metric.trend === 'up' ? (
                        <TrendingUpIcon color="success" />
                      ) : metric.trend === 'down' ? (
                        <TrendingDownIcon color="error" />
                      ) : null}
                      <Typography
                        variant="body2"
                        color={metric.trend === 'up' ? 'success.main' : 'error.main'}
                        sx={{ ml: 0.5 }}
                      >
                        {metric.change > 0 ? '+' : ''}{metric.change}%
                      </Typography>
                    </Box>
                    {expandedCards.includes(metric.id) && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2">
                          Additional details for {metric.label}...
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
      </Grid>
      
      {/* Chart and Activity */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={styles.chartPaper}>
            <Typography variant="h6" gutterBottom>
              Performance Overview
            </Typography>
            {isLoading ? (
              <Skeleton variant="rectangular" height={300} />
            ) : (
              <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography color="text.secondary">
                  Chart would be rendered here using your preferred library
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ height: 400, overflow: 'auto' }}>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="h6">Recent Activity</Typography>
            </Box>
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <Box key={i} sx={styles.activityItem}>
                    <Skeleton />
                    <Skeleton width="60%" />
                  </Box>
                ))
              : data?.recentActivity.map((activity) => (
                  <Box key={activity.id} sx={styles.activityItem}>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(activity.timestamp).toLocaleString()}
                    </Typography>
                    <Typography variant="body1">
                      {activity.description}
                    </Typography>
                    <Chip 
                      label={activity.type} 
                      size="small" 
                      sx={{ mt: 0.5 }}
                    />
                  </Box>
                ))}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};