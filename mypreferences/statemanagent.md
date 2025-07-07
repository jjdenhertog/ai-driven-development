# State Management & Data Flow Guide

## Overview

This guide outlines our state management patterns and when to use different approaches. We use:
- **TanStack Query** for server state (data fetching, caching, synchronization)
- **React Context API** for global client state
- **useState/useReducer** for local component state
- **React Hook Form** for complex form state (optional)

## Core Principles

1. **Separate server and client state** - Use TanStack Query for server data, Context/useState for UI state
2. **Start with local state** - Use component state by default
3. **Elevate thoughtfully** - Only lift state when multiple components need it
4. **Type everything** - Use TypeScript for all state definitions
5. **Let TanStack Query handle server complexity** - Don't reinvent caching, refetching, or error handling

## State Categories

### 1. Local Component State

**When to use:**
- UI-only state (modals, dropdowns, hover states)
- Form inputs before submission (for simple forms)
- Temporary user interactions
- Component-specific data that doesn't need sharing

**Implementation:**
```typescript
// UI State
const [open, setOpen] = useState(false);
const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

// Temporary State
const [selectedItems, setSelectedItems] = useState<string[]>([]);

// Loading States (for non-server operations)
const [processing, setProcessing] = useState(false);
```

**Naming Conventions:**
- Boolean states: `show[Feature]`, `is[State]`, `has[Property]`
- Arrays: Use plural nouns (`items`, `users`, `templates`)
- Actions: Use present participle (`processing`, `validating`)

### 2. Server State (TanStack Query)

**When to use:**
- Any data fetched from APIs
- Data that needs caching
- Data that multiple components might request
- Operations that modify server data

**Setup:**
```typescript
// app.tsx or _app.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <YourApp />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

**Query Pattern (GET):**
```typescript
import { useQuery } from '@tanstack/react-query';
import { enqueueSnackbar } from 'notistack';

// Define query keys centrally
export const queryKeys = {
  clients: ['clients'] as const,
  client: (id: string) => ['clients', id] as const,
  clientFlights: (clientId: string) => ['clients', clientId, 'flights'] as const,
};

// Component usage
const ClientDetails = ({ clientId }: Props) => {
  const { data: client, isLoading, error } = useQuery({
    queryKey: queryKeys.client(clientId),
    queryFn: async () => {
      const response = await axios.get<Client>(`/api/clients/${clientId}`);
      return response.data;
    },
    onError: () => {
      enqueueSnackbar('Failed to load client', { variant: 'error' });
    },
  });

  if (isLoading) return <ContentLoader />;
  if (error) return <ErrorDisplay error={error} />;
  if (!client) return <div>Client not found</div>;
  
  return <ClientView client={client} />;
};
```

**Mutation Pattern (POST/PUT/DELETE):**
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';

const ClientForm = ({ client, onSuccess }: Props) => {
  const queryClient = useQueryClient();
  
  const updateClient = useMutation({
    mutationFn: async (data: ClientUpdate) => {
      const response = await axios.put(`/api/clients/${client.id}`, data);
      return response.data;
    },
    onSuccess: (updatedClient) => {
      // Update cache
      queryClient.setQueryData(
        queryKeys.client(client.id), 
        updatedClient
      );
      
      // Invalidate related queries
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.clients 
      });
      
      enqueueSnackbar('Client updated successfully');
      onSuccess?.(updatedClient);
    },
    onError: () => {
      enqueueSnackbar('Failed to update client', { variant: 'error' });
    },
  });

  const handleSubmit = (formData: ClientFormData) => {
    updateClient.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <LoadingButton 
        loading={updateClient.isPending}
        type="submit"
      >
        Save
      </LoadingButton>
    </form>
  );
};
```

**Optimistic Updates:**
```typescript
const toggleLike = useMutation({
  mutationFn: async ({ postId, liked }: ToggleLikeParams) => {
    const response = await axios.post('/api/posts/toggle-like', { postId, liked });
    return response.data;
  },
  // Optimistically update the cache
  onMutate: async ({ postId, liked }) => {
    // Cancel in-flight queries
    await queryClient.cancelQueries({ queryKey: ['posts', postId] });
    
    // Save current state
    const previousPost = queryClient.getQueryData(['posts', postId]);
    
    // Optimistically update
    queryClient.setQueryData(['posts', postId], (old: Post) => ({
      ...old,
      liked,
      likeCount: liked ? old.likeCount + 1 : old.likeCount - 1,
    }));
    
    return { previousPost };
  },
  // Rollback on error
  onError: (err, variables, context) => {
    if (context?.previousPost) {
      queryClient.setQueryData(
        ['posts', variables.postId], 
        context.previousPost
      );
    }
  },
  // Refetch after success or error
  onSettled: (data, error, { postId }) => {
    queryClient.invalidateQueries({ queryKey: ['posts', postId] });
  },
});
```

### 3. Global Client State (Context)

**When to use:**
- User preferences (theme, language)
- Authentication state
- Feature-specific shared state (selections, filters)
- Complex UI state (multi-step wizards)
- Application-wide utilities (modals, notifications)

**Implementation with Persistence:**
```typescript
// contexts/BillingContext.tsx
export const BillingContext = createContext<BillingContextType>({} as BillingContextType);

export const BillingProvider = ({ children }: Props) => {
  // Client state that needs persistence
  const [selectedYearId, setSelectedYearId] = useState<number>(() => {
    const stored = localStorage.getItem('billing_year');
    return stored ? parseInt(stored) : currentYear;
  });
  
  // UI state
  const [filterActive, setFilterActive] = useState(false);
  
  const setYearWithPersistence = useCallback((yearId: number) => {
    setSelectedYearId(yearId);
    localStorage.setItem('billing_year', yearId.toString());
  }, []);
  
  const value = useMemo(() => ({
    selectedYearId,
    setSelectedYear: setYearWithPersistence,
    filterActive,
    setFilterActive,
  }), [selectedYearId, setYearWithPersistence, filterActive]);
  
  return (
    <BillingContext.Provider value={value}>
      {children}
    </BillingContext.Provider>
  );
};
```

### 4. Form State Management

**Simple Forms - Local State:**
```typescript
const SimpleForm = ({ onSave }: Props) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  
  const isValid = name.length > 0 && email.includes('@');
  
  const mutation = useMutation({
    mutationFn: (data: FormData) => axios.post('/api/users', data),
    onSuccess: () => {
      enqueueSnackbar('User created');
      onSave();
    },
  });
  
  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      mutation.mutate({ name, email });
    }}>
      <BTextField
        value={name}
        onChange={(e) => setName(e.target.value)}
        label="Name"
      />
      <BTextField
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        label="Email"
      />
      <LoadingButton 
        loading={mutation.isPending} 
        disabled={!isValid}
        type="submit"
      >
        Save
      </LoadingButton>
    </form>
  );
};
```

**Complex Forms - React Hook Form (Optional):**
```typescript
import { useForm } from 'react-hook-form';

const ComplexForm = ({ initialData, onSave }: Props) => {
  const { register, handleSubmit, watch, formState: { errors, isValid } } = useForm({
    defaultValues: initialData,
    mode: 'onChange',
  });
  
  const mutation = useMutation({
    mutationFn: (data: FormData) => axios.put(`/api/users/${initialData.id}`, data),
    onSuccess: (data) => {
      queryClient.setQueryData(['users', initialData.id], data);
      enqueueSnackbar('Updated successfully');
      onSave(data);
    },
  });
  
  return (
    <form onSubmit={handleSubmit((data) => mutation.mutate(data))}>
      <TextField
        {...register('name', { required: 'Name is required' })}
        error={!!errors.name}
        helperText={errors.name?.message}
      />
      <TextField
        {...register('email', { 
          required: 'Email is required',
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: 'Invalid email address',
          }
        })}
        error={!!errors.email}
        helperText={errors.email?.message}
      />
      <LoadingButton
        loading={mutation.isPending}
        disabled={!isValid}
        type="submit"
      >
        Save
      </LoadingButton>
    </form>
  );
};
```

## Data Flow Patterns

### Server Data Flow with TanStack Query

```
Component requests data → TanStack Query checks cache
                           ↓ (cache miss)
                         Fetch from API
                           ↓
                         Update cache
                           ↓
                         Return to component
                           ↓
                         Background refetch (if stale)
```

### Props vs Context Decision Tree

```
Is the data needed by multiple components?
├─ NO → Use props
└─ YES → Is it server data?
    ├─ YES → Use TanStack Query (each component queries independently)
    └─ NO → Are components at different tree levels?
        ├─ NO → Use props (if only 1-2 levels)
        └─ YES → Use Context
```

## Query Key Conventions

Organize query keys hierarchically for easy invalidation:

```typescript
export const queryKeys = {
  // List queries
  clients: ['clients'] as const,
  flights: ['flights'] as const,
  
  // Detail queries
  client: (id: string) => ['clients', id] as const,
  flight: (id: string) => ['flights', id] as const,
  
  // Nested resources
  clientFlights: (clientId: string) => ['clients', clientId, 'flights'] as const,
  flightVersions: (flightId: string) => ['flights', flightId, 'versions'] as const,
  
  // With filters
  clientsFiltered: (filters: ClientFilters) => ['clients', { filters }] as const,
};
```

## Cache Management Strategies

### Invalidation Patterns

```typescript
// After updating a client
queryClient.invalidateQueries({ queryKey: ['clients'] }); // All client lists
queryClient.invalidateQueries({ queryKey: ['clients', clientId] }); // Specific client

// Invalidate multiple related queries
await Promise.all([
  queryClient.invalidateQueries({ queryKey: ['clients'] }),
  queryClient.invalidateQueries({ queryKey: ['flights'] }),
]);
```

### Prefetching

```typescript
// Prefetch on hover
const prefetchClient = (clientId: string) => {
  queryClient.prefetchQuery({
    queryKey: queryKeys.client(clientId),
    queryFn: () => fetchClient(clientId),
    staleTime: 10 * 1000, // Only prefetch if data is older than 10s
  });
};

// In component
<Link 
  to={`/clients/${client.id}`}
  onMouseEnter={() => prefetchClient(client.id)}
>
  {client.name}
</Link>
```

### Background Refetching

```typescript
// Configure per-query
const { data } = useQuery({
  queryKey: ['dashboard-stats'],
  queryFn: fetchDashboardStats,
  refetchInterval: 1000 * 60, // Refetch every minute
  refetchIntervalInBackground: true, // Continue when tab not focused
});
```

## Error Handling

### Global Error Configuration

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error.response?.status >= 400 && error.response?.status < 500) {
          return false;
        }
        return failureCount < 2;
      },
    },
    mutations: {
      onError: (error) => {
        enqueueSnackbar(
          error.response?.data?.message || 'An error occurred', 
          { variant: 'error' }
        );
      },
    },
  },
});
```

### Component-Level Error Handling

```typescript
const { data, error, refetch } = useQuery({
  queryKey: ['important-data'],
  queryFn: fetchImportantData,
  useErrorBoundary: (error) => error.response?.status >= 500,
});

if (error) {
  return (
    <ErrorDisplay 
      error={error}
      onRetry={() => refetch()}
    />
  );
}
```

## Performance Optimization

### Query Optimization

```typescript
// Select only needed data
const todoCount = useQuery({
  queryKey: ['todos'],
  queryFn: fetchTodos,
  select: (data) => data.length, // Only re-render when count changes
});

// Parallel queries
const results = useQueries({
  queries: [
    { queryKey: ['post', 1], queryFn: () => fetchPost(1) },
    { queryKey: ['post', 2], queryFn: () => fetchPost(2) },
    { queryKey: ['post', 3], queryFn: () => fetchPost(3) },
  ],
});

// Dependent queries
const { data: user } = useQuery({
  queryKey: ['user'],
  queryFn: fetchUser,
});

const { data: projects } = useQuery({
  queryKey: ['projects', user?.id],
  queryFn: () => fetchProjects(user.id),
  enabled: !!user?.id, // Only run when user ID is available
});
```

### State Updates without Refetching

```typescript
// Update single item in a list
const updateClientInCache = (clientId: string, updates: Partial<Client>) => {
  // Update the specific client
  queryClient.setQueryData<Client>(
    queryKeys.client(clientId),
    (old) => old ? { ...old, ...updates } : old
  );
  
  // Update in any lists containing this client
  queryClient.setQueriesData<Client[]>(
    { queryKey: ['clients'] },
    (old) => old?.map(client => 
      client.id === clientId ? { ...client, ...updates } : client
    )
  );
};
```

## Summary

1. **Use TanStack Query for all server state** - Never manage server data with useState
2. **Keep UI state local when possible** - Elevate only when necessary
3. **Use Context sparingly** - Only for truly global client state
4. **Let TanStack Query handle complexity** - Caching, refetching, and synchronization
5. **Optimize query keys** - Structure them hierarchically for easy invalidation
6. **Handle errors consistently** - Use global configuration with local overrides