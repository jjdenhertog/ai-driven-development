# Performance Patterns Guide

This guide contains advanced performance optimization patterns from mypreferences/components.md

## useMemo Guidelines

### When to Use useMemo

1. **Expensive Computations**
2. **Reference Equality for Objects/Arrays**
3. **Computed Values in Dependency Arrays**
4. **Filtering and Sorting Operations**
5. **Context Values to Prevent Cascading Re-renders**
6. **Derived State from Props or Other State**

### Filtering and Sorting Operations

Always memoize filter and sort operations, especially on large datasets:

```typescript
// ✅ Good - Memoized filtering
export function ProductList({ products, searchTerm, filters }) {
  const filteredProducts = useMemo(() => {
    return products
      .filter(product => {
        // Check search term
        if (searchTerm && !product.name.toLowerCase().includes(searchTerm.toLowerCase()))
          return false;
        
        // Check price range
        if (filters.minPrice && product.price < filters.minPrice)
          return false;
        
        if (filters.maxPrice && product.price > filters.maxPrice)
          return false;
        
        // Check category
        if (filters.category && product.category !== filters.category)
          return false;
        
        return true;
      });
  }, [products, searchTerm, filters]);

  // ✅ Good - Memoized sorting
  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts];
    
    switch (filters.sortBy) {
      case 'price-asc':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return sorted.sort((a, b) => b.price - a.price);
      case 'name':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'rating':
        return sorted.sort((a, b) => b.rating - a.rating);
      default:
        return sorted;
    }
  }, [filteredProducts, filters.sortBy]);

  return (
    <div>
      {sortedProducts.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

// ❌ Bad - Recalculates on every render
export function BadProductList({ products, searchTerm }) {
  // This runs on EVERY render, even if products and searchTerm haven't changed
  const filtered = products.filter(p => 
    p.name.includes(searchTerm)
  );
  
  return <>{/* render */}</>;
}
```

## Context Value Memoization

Always memoize context values to prevent all consumers from re-rendering:

```typescript
// ✅ Good - Memoized context value
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState<string[]>([]);

  const login = useCallback(async (credentials: Credentials) => {
    setLoading(true);
    try {
      const response = await authService.login(credentials);
      setUser(response.user);
      setPermissions(response.permissions);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
    setPermissions([]);
  }, []);

  // ✅ Memoize the entire context value
  const contextValue = useMemo(() => ({
    user,
    loading,
    permissions,
    login,
    logout,
    isAuthenticated: !!user,
    hasPermission: (permission: string) => permissions.includes(permission)
  }), [user, loading, permissions, login, logout]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// ❌ Bad - Creates new object on every render
export function BadAuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  
  // This creates a new object reference every time BadAuthProvider renders
  // causing ALL consumers to re-render
  return (
    <AuthContext.Provider value={{
      user,
      setUser,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
}
```

## React.memo Usage

Apply React.memo to:
- Pure presentational components
- Components that re-render frequently
- Components with expensive render logic

```typescript
// ✅ Good - Memoized list item
export const ListItem = React.memo<ListItemProps>(({ item, onSelect }) => {
  return (
    <Card onClick={() => onSelect(item.id)}>
      <CardContent>{item.name}</CardContent>
    </Card>
  );
});

// ✅ Good - Custom comparison
export const DataGrid = React.memo<DataGridProps>(
  ({ data, columns }) => {
    // Complex rendering logic
  },
  (prevProps, nextProps) => {
    // Custom comparison logic
    return prevProps.data.length === nextProps.data.length &&
           prevProps.columns.length === nextProps.columns.length;
  }
);
```

## Render Props Pattern

Use render props when you need flexible rendering of complex content:

```typescript
// ✅ Good - Flexible rendering
<BAutocomplete
  renderOption={(option, props) => (
    <li {...props}>
      <Avatar src={option.avatar} />
      {option.label}
    </li>
  )}
  renderInput={(params) => (
    <TextField {...params} label="Select user" />
  )}
/>

// ✅ Good - Tree with multiple node types
<Tree 
  render={(node, options) => {
    switch (node.data.type) {
      case "folder":
        return <TreeNodeFolder node={node} {...options} />;
      case "version":
        return <TreeNodeVersion node={node} {...options} />;
    }
  }}
/>
```

## Error Boundary Pattern

Wrap features with error boundaries:

```typescript
interface ErrorBoundaryProps {
  readonly children: ReactNode;
  readonly fallback?: ComponentType<{ error: Error }>;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, { error: Error | null }> {
  state = { error: null };
  
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  
  render() {
    if (this.state.error) {
      const Fallback = this.props.fallback || DefaultErrorFallback;
      return <Fallback error={this.state.error} />;
    }
    
    return this.props.children;
  }
}

// Usage
<ErrorBoundary>
  <FeatureComponent />
</ErrorBoundary>
```

## Code Splitting

Use dynamic imports for:
- Route-based splitting
- Heavy components (charts, editors)
- Modal content

```typescript
// ✅ Good - Route splitting
const FlightEditor = dynamic(
  () => import('@/features/Flights/FlightEditor'),
  { 
    loading: () => <ComponentLoader />,
    ssr: false 
  }
);

// ✅ Good - Modal splitting
const [showModal, setShowModal] = useState(false);

const ConfigModal = useMemo(() => {
  if (!showModal) return null;
  
  return dynamic(
    () => import('./ConfigModal'),
    { loading: () => <ComponentLoader dialog /> }
  );
}, [showModal]);
```

## Server vs Client Components Decision Tree

### Use Server Components When:
- Fetching data from APIs
- Accessing backend resources directly
- Using server-only packages
- Rendering static content
- No interactivity needed

### Use Client Components When:
- Using state or effects
- Handling user interactions
- Using browser APIs
- Using third-party client libraries
- Subscribing to data changes

### Migration Pattern:
```typescript
// Server Component (default)
async function ProductList() {
  const products = await getProducts(); // Direct DB access
  return <ProductGrid products={products} />;
}

// Client Component (add directive)
'use client';
function ProductGrid({ products }) {
  const [filter, setFilter] = useState('');
  // Interactive filtering logic
}
```

## When NOT to Use useMemo

Avoid over-optimization:

```typescript
// ❌ Bad - Simple calculations don't need memoization
const doubled = useMemo(() => number * 2, [number]);

// ✅ Good - Just calculate directly
const doubled = number * 2;

// ❌ Bad - Creating new objects/arrays that are passed down immediately
const style = useMemo(() => ({ color: 'red' }), []);

// ✅ Good - Define outside component or use constant
const STYLE = { color: 'red' };

// ❌ Bad - Memoizing primitives
const isEven = useMemo(() => number % 2 === 0, [number]);

// ✅ Good - Direct calculation
const isEven = number % 2 === 0;
```

## List Component Abstractions

Generic list with flexible rendering:

```typescript
interface ListProps<T> {
  readonly items: ReadonlyArray<T>;
  readonly renderItem: (item: T, index: number) => ReactNode;
  readonly keyExtractor: (item: T, index: number) => string;
  readonly emptyState?: ReactNode;
  readonly loading?: boolean;
}

export function List<T>({ items, renderItem, keyExtractor, emptyState, loading }: ListProps<T>) {
  if (loading) return <ListSkeleton />;
  if (items.length === 0) return <>{emptyState || <EmptyState />}</>;
  
  return (
    <Box>
      {items.map((item, index) => (
        <Box key={keyExtractor(item, index)}>
          {renderItem(item, index)}
        </Box>
      ))}
    </Box>
  );
}
```