# Component Patterns Guide

This guide outlines our component architecture patterns, composition strategies, and best practices for building consistent, performant React components in our Next.js application.

## Table of Contents
1. [Component Philosophy](#component-philosophy)
2. [Composition Patterns](#composition-patterns)
3. [State Management Rules](#state-management-rules)
4. [Component Categories](#component-categories)
5. [Props Patterns](#props-patterns)
6. [Conditional Rendering](#conditional-rendering)
7. [Performance Optimization](#performance-optimization)
8. [Common Component Abstractions](#common-component-abstractions)

---

## Component Philosophy

Our component architecture follows these core principles:

- **Type Safety First**: All props use TypeScript with `readonly` modifiers
- **Controlled Components**: Form inputs are always controlled
- **Feature-Based Organization**: Components organized by feature with shared UI components
- **Composition Over Inheritance**: Use composition patterns for flexibility
- **Performance by Default**: Strategic use of `useCallback` and `useMemo`

## Composition Patterns

### 1. Render Props Pattern

Use render props when you need flexible rendering of complex content.

**When to use:**
- Custom list item rendering
- Flexible input components
- Tree structures with varying node types

**Example:**
```tsx
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
                return <TreeNodeFolder node={node} {...options} />
            case "version":
                return <TreeNodeVersion node={node} {...options} />
        }
    }}
/>
```

### 2. Prop Spreading with Cleanup

Always clean custom props before spreading to avoid DOM warnings.

**Pattern:**
```tsx
// ✅ Good - Clean custom props
export const BTextField = (props: BTextFieldProps) => {
    const textFieldProps = { ...props };
    delete textFieldProps.onPressEnter;
    delete textFieldProps.validation;
    
    return <TextField {...textFieldProps} />
}

// ❌ Bad - Spreading all props
export const BadTextField = (props: CustomProps) => {
    return <TextField {...props} /> // onPressEnter will cause DOM warning
}
```

### 3. Children Composition

Use children for flexible content composition in layout components.

**Pattern:**
```tsx
// ✅ Good - Flexible layout
export type MainLayoutProps = {
    readonly children: React.ReactNode
    readonly button?: React.ReactNode
    readonly extraNavigation?: ReactNode
}

// ✅ Good - Provider pattern
interface ErrorProviderProps {
    readonly children?: React.ReactNode | React.ReactNode[]
}
```

## State Management Rules

### When to Use Local State

Use `useState` for:
- Form input values
- UI state (open/closed, loading, hover)
- Temporary data before submission
- Component-specific state that doesn't need sharing

**Example:**
```tsx
// ✅ Good - UI state
const [focussed, setFocussed] = useState<boolean>(false)
const [error, setError] = useState<boolean>(false)

// ✅ Good - Form state
const [formData, setFormData] = useState<FormData>({
    name: '',
    email: ''
})
```

### When to Use Context

Create a context when:
- Data needs to be accessed by many components
- Prop drilling exceeds 2-3 levels
- Managing cross-cutting concerns (errors, auth, theme)

**Context Pattern:**
```tsx
// 1. Define context with noOp defaults
export const ErrorContext = createContext<ErrorContextType>({
    showError: () => {},
    showWarning: () => {},
})

// 2. Create provider with actual implementation
export function ErrorProvider({ children }: { children: ReactNode }) {
    const [errors, setErrors] = useState<Error[]>([])
    
    const showError = useCallback((message: string) => {
        setErrors(prev => [...prev, { message, type: 'error' }])
    }, [])
    
    return (
        <ErrorContext.Provider value={{ showError, showWarning }}>
            {children}
        </ErrorContext.Provider>
    )
}

// 3. Use with hook
export const useError = () => {
    const context = useContext(ErrorContext)
    if (!context) {
        throw new Error('useError must be used within ErrorProvider')
    }
    return context
}
```

### Prop Drilling Threshold

**2-3 Levels Maximum** before considering context or composition.

```tsx
// ✅ Good - 2 levels is acceptable
<Dashboard user={user}>
    <UserProfile user={user} />
</Dashboard>

// ⚠️ Warning - 3 levels, consider alternatives
<Dashboard user={user}>
    <ProfileSection user={user}>
        <UserAvatar user={user} />
    </ProfileSection>
</Dashboard>

// ❌ Bad - Too much drilling, use context
<App user={user}>
    <Dashboard user={user}>
        <ProfileSection user={user}>
            <UserDetails user={user}>
                <UserAvatar user={user} />
            </UserDetails>
        </ProfileSection>
    </Dashboard>
</App>
```

## Component Categories

### Container Components

**Purpose:** Handle data fetching, state management, and business logic.

**Characteristics:**
- Fetch data from APIs
- Manage complex state
- Provide data to children
- Handle side effects

**Example:**
```tsx
export default function FlightConfigurator({ flightId }: Props) {
    // Data fetching
    const [loading, setLoading] = useState(true)
    const { load: loadComponents, components } = useComponents()
    const { load: loadConfig, save: saveConfig } = useConfig(flightId)
    
    // Business logic
    useEffect(() => {
        Promise.all([
            loadComponents(),
            loadConfig()
        ]).finally(() => setLoading(false))
    }, [flightId])
    
    // Render presentational components
    return (
        <ConfiguratorContext.Provider value={contextValue}>
            <ConfiguratorLayout>
                <ComponentList components={components} />
                <ConfigPanel config={config} />
            </ConfiguratorLayout>
        </ConfiguratorContext.Provider>
    )
}
```

### Presentational Components

**Purpose:** Display UI based on props, no business logic.

**Characteristics:**
- Props-driven rendering
- No data fetching
- Emit events through callbacks
- Reusable across features

**Example:**
```tsx
export type BTextFieldProps = TextFieldProps & {
    readonly onPressEnter?: () => void
    readonly validation?: "name" | "email" | "phonenumber"
}

export const BTextField = (props: BTextFieldProps) => {
    const [error, setError] = useState(false)
    
    // Only UI logic
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && props.onPressEnter) {
            props.onPressEnter()
        }
    }, [props.onPressEnter])
    
    // Pure rendering
    return (
        <TextField
            {...props}
            error={error}
            onKeyDown={handleKeyDown}
        />
    )
}
```

### Layout Components

**Purpose:** Define page structure and common UI patterns.

**Example:**
```tsx
export type MainLayoutProps = {
    readonly children: React.ReactNode
    readonly button?: React.ReactNode
    readonly showBreadcrumbs?: boolean
}

export function MainLayout({ children, button, showBreadcrumbs = true }: MainLayoutProps) {
    return (
        <Box>
            <Navigation />
            {showBreadcrumbs && <Breadcrumbs />}
            <Container>
                {children}
            </Container>
            {button && (
                <FloatingActionButton>
                    {button}
                </FloatingActionButton>
            )}
        </Box>
    )
}
```

### Provider Components

**Purpose:** Provide global state and functionality through context.

**Pattern:**
```tsx
interface ProviderProps {
    readonly children: React.ReactNode
}

export function ThemeProvider({ children }: ProviderProps) {
    const [theme, setTheme] = useState<Theme>('light')
    
    const toggleTheme = useCallback(() => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light')
    }, [])
    
    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}
```

## Props Patterns

### Interface Definitions

Always use readonly props with proper TypeScript types.

**Pattern:**
```tsx
// ✅ Good - Readonly props with clear types
export type ComponentProps = {
    readonly id: string
    readonly name: string
    readonly onSelect?: (id: string) => void
    readonly options?: ReadonlyArray<Option>
}

// ✅ Good - Extending existing types
export type BTextFieldProps = TextFieldProps & {
    readonly onPressEnter?: () => void
    readonly validation?: "name" | "email" | "phonenumber"
}

// ❌ Bad - Mutable props
type BadProps = {
    items: Item[] // Should be readonly
    onChange: Function // Too generic
}
```

### Default Props Pattern

Use destructuring with defaults for optional props.

```tsx
// ✅ Good - Clear defaults
export function FileUploader(props: FileUploaderProps) {
    const {
        maxFileSize = 5,
        allowMultiple = false,
        label = "Select files",
        errors = [],
        onComplete
    } = props
}

// ✅ Good - Object defaults
export function BSelect(props: BSelectProps) {
    const { 
        box = {},  // Empty object default
        mb = 1,    // Numeric default
        variant = "outlined" // String default
    } = props
}
```

### Props Documentation

Document complex props with JSDoc comments.

```tsx
export type FileUploaderProps = {
    /** Maximum file size in MB. Default: 5 */
    readonly maxFileSize?: number
    
    /** Allow multiple file selection. Default: false */
    readonly allowMultiple?: boolean
    
    /** Callback fired when upload completes */
    readonly onComplete?: (files: UploadedFile[]) => void
    
    /** Accepted file types (MIME types or extensions) */
    readonly accept?: string | string[]
}
```

## Conditional Rendering

### Pattern Priority

1. **Early returns** for invalid states
2. **&& operator** for simple conditions
3. **Ternary operator** for either/or rendering
4. **Helper functions** for complex logic

### Examples

```tsx
// ✅ Good - Early return for invalid state
if (!data) {
    return <EmptyState />
}

// ✅ Good - && for optional rendering
return (
    <Card>
        {title && <CardHeader>{title}</CardHeader>}
        <CardContent>{content}</CardContent>
        {actions && <CardActions>{actions}</CardActions>}
    </Card>
)

// ✅ Good - Ternary for loading states
return loading ? (
    <Box p={3}>
        <CircularProgress />
    </Box>
) : (
    <DataGrid data={data} />
)

// ✅ Good - Extract complex conditions
const renderContent = () => {
    if (error) return <ErrorMessage error={error} />
    if (loading) return <Skeleton />
    if (!data) return <EmptyState />
    return <DataDisplay data={data} />
}

return <Container>{renderContent()}</Container>
```

### Anti-patterns to Avoid

```tsx
// ❌ Bad - Nested ternaries
return loading ? <Loader /> : error ? <Error /> : data ? <Data /> : <Empty />

// ❌ Bad - Complex logic in JSX
return (
    <div>
        {user && user.permissions && user.permissions.includes('admin') && 
         !user.suspended && feature.enabled && <AdminPanel />}
    </div>
)
```

## Performance Optimization

### useCallback Rules

Always use `useCallback` for:
- Event handlers passed as props
- Dependencies of other hooks
- Functions in dependency arrays

```tsx
// ✅ Good - Memoized event handlers
const handleChange = useCallback((value: string) => {
    setValue(value)
    if (onChange) {
        onChange(value)
    }
}, [onChange]) // Include all external dependencies

const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && onPressEnter) {
        onPressEnter()
    }
}, [onPressEnter])
```

### useMemo Guidelines

Use `useMemo` for:
- Expensive computations
- Reference equality for objects/arrays
- Computed values used in dependency arrays
- Filtering and sorting operations
- Context values to prevent cascading re-renders
- Derived state from props or other state

```tsx
// ✅ Good - Expensive computation
const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
        // Complex sorting logic
    })
}, [data, sortKey, sortDirection])

// ✅ Good - Object reference stability
const contextValue = useMemo(() => ({
    user,
    permissions,
    updateUser
}), [user, permissions, updateUser])
```

#### Filtering and Sorting Operations

Always memoize filter and sort operations, especially on large datasets:

```tsx
// ✅ Good - Memoized filtering
export function ProductList({ products, searchTerm, filters }) {
    const filteredProducts = useMemo(() => {
        return products
            .filter(product => {
                // Check search term
                if (searchTerm && !product.name.toLowerCase().includes(searchTerm.toLowerCase())) {
                    return false
                }
                // Check price range
                if (filters.minPrice && product.price < filters.minPrice) {
                    return false
                }
                if (filters.maxPrice && product.price > filters.maxPrice) {
                    return false
                }
                // Check category
                if (filters.category && product.category !== filters.category) {
                    return false
                }
                return true
            })
    }, [products, searchTerm, filters])

    // ✅ Good - Memoized sorting
    const sortedProducts = useMemo(() => {
        const sorted = [...filteredProducts]
        
        switch (filters.sortBy) {
            case 'price-asc':
                return sorted.sort((a, b) => a.price - b.price)
            case 'price-desc':
                return sorted.sort((a, b) => b.price - a.price)
            case 'name':
                return sorted.sort((a, b) => a.name.localeCompare(b.name))
            case 'rating':
                return sorted.sort((a, b) => b.rating - a.rating)
            default:
                return sorted
        }
    }, [filteredProducts, filters.sortBy])

    return (
        <div>
            {sortedProducts.map(product => (
                <ProductCard key={product.id} product={product} />
            ))}
        </div>
    )
}

// ❌ Bad - Recalculates on every render
export function BadProductList({ products, searchTerm }) {
    // This runs on EVERY render, even if products and searchTerm haven't changed
    const filtered = products.filter(p => 
        p.name.includes(searchTerm)
    )
    
    return <>{/* render */}</>
}
```

#### Memoizing Context Values

Always memoize context values to prevent all consumers from re-rendering:

```tsx
// ✅ Good - Memoized context value
export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const [permissions, setPermissions] = useState<string[]>([])

    const login = useCallback(async (credentials: Credentials) => {
        setLoading(true)
        try {
            const response = await authService.login(credentials)
            setUser(response.user)
            setPermissions(response.permissions)
        } finally {
            setLoading(false)
        }
    }, [])

    const logout = useCallback(async () => {
        await authService.logout()
        setUser(null)
        setPermissions([])
    }, [])

    // ✅ Memoize the entire context value
    const contextValue = useMemo(() => ({
        user,
        loading,
        permissions,
        login,
        logout,
        isAuthenticated: !!user,
        hasPermission: (permission: string) => permissions.includes(permission)
    }), [user, loading, permissions, login, logout])

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    )
}

// ❌ Bad - Creates new object on every render
export function BadAuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null)
    
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
    )
}
```

#### Expensive Computed Values

Memoize any computation that involves loops, complex calculations, or data transformations:

```tsx
// ✅ Good - Complex calculations memoized
export function Dashboard({ transactions, exchangeRates }) {
    // Calculate totals by currency
    const totalsByCurrency = useMemo(() => {
        const totals = new Map<string, number>()
        
        transactions.forEach(transaction => {
            const current = totals.get(transaction.currency) || 0
            totals.set(transaction.currency, current + transaction.amount)
        })
        
        return totals
    }, [transactions])

    // Convert all to base currency
    const totalInBaseCurrency = useMemo(() => {
        let total = 0
        
        totalsByCurrency.forEach((amount, currency) => {
            const rate = exchangeRates[currency] || 1
            total += amount * rate
        })
        
        return total
    }, [totalsByCurrency, exchangeRates])

    // Calculate statistics
    const statistics = useMemo(() => {
        const amounts = transactions.map(t => t.amount)
        const sorted = [...amounts].sort((a, b) => a - b)
        
        return {
            count: transactions.length,
            sum: amounts.reduce((a, b) => a + b, 0),
            average: amounts.reduce((a, b) => a + b, 0) / amounts.length,
            median: sorted[Math.floor(sorted.length / 2)],
            min: Math.min(...amounts),
            max: Math.max(...amounts)
        }
    }, [transactions])

    return (
        <div>
            <TotalDisplay total={totalInBaseCurrency} />
            <StatisticsPanel stats={statistics} />
            <CurrencyBreakdown totals={totalsByCurrency} />
        </div>
    )
}

// ✅ Good - Derived state memoized
export function SearchableTable({ data, columns }) {
    const [searchTerm, setSearchTerm] = useState('')
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })

    // Memoize search results
    const searchResults = useMemo(() => {
        if (!searchTerm) return data
        
        return data.filter(row => 
            columns.some(col => 
                String(row[col.key])
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase())
            )
        )
    }, [data, columns, searchTerm])

    // Memoize sorted results
    const sortedResults = useMemo(() => {
        if (!sortConfig.key) return searchResults
        
        return [...searchResults].sort((a, b) => {
            const aVal = a[sortConfig.key]
            const bVal = b[sortConfig.key]
            
            if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1
            if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1
            return 0
        })
    }, [searchResults, sortConfig])

    return (
        <div>
            <SearchInput value={searchTerm} onChange={setSearchTerm} />
            <Table data={sortedResults} onSort={setSortConfig} />
        </div>
    )
}
```

#### When NOT to Use useMemo

Avoid over-optimization with useMemo:

```tsx
// ❌ Bad - Simple calculations don't need memoization
const doubled = useMemo(() => number * 2, [number])

// ✅ Good - Just calculate directly
const doubled = number * 2

// ❌ Bad - Creating new objects/arrays that are passed down immediately
const style = useMemo(() => ({ color: 'red' }), [])

// ✅ Good - Define outside component or use constant
const STYLE = { color: 'red' }

// ❌ Bad - Memoizing primitives
const isEven = useMemo(() => number % 2 === 0, [number])

// ✅ Good - Direct calculation
const isEven = number % 2 === 0
```

### React.memo Usage

Apply `React.memo` to:
- Pure presentational components
- Components that re-render frequently
- Components with expensive render logic

```tsx
// ✅ Good - Memoized list item
export const ListItem = React.memo<ListItemProps>(({ item, onSelect }) => {
    return (
        <Card onClick={() => onSelect(item.id)}>
            <CardContent>{item.name}</CardContent>
        </Card>
    )
})

// ✅ Good - Custom comparison
export const DataGrid = React.memo<DataGridProps>(
    ({ data, columns }) => {
        // Complex rendering logic
    },
    (prevProps, nextProps) => {
        // Custom comparison logic
        return prevProps.data.length === nextProps.data.length &&
               prevProps.columns.length === nextProps.columns.length
    }
)
```

### Code Splitting

Use dynamic imports for:
- Route-based splitting
- Heavy components (charts, editors)
- Modal content

```tsx
// ✅ Good - Route splitting
const FlightEditor = dynamic(
    () => import('@/features/Flights/FlightEditor'),
    { 
        loading: () => <ComponentLoader />,
        ssr: false 
    }
)

// ✅ Good - Modal splitting
const [showModal, setShowModal] = useState(false)

const ConfigModal = useMemo(() => {
    if (!showModal) return null
    
    return dynamic(
        () => import('./ConfigModal'),
        { loading: () => <ComponentLoader dialog /> }
    )
}, [showModal])
```

## Common Component Abstractions

### List Components

**Pattern:** Generic list with flexible rendering

```tsx
interface ListProps<T> {
    readonly items: ReadonlyArray<T>
    readonly renderItem: (item: T, index: number) => ReactNode
    readonly keyExtractor: (item: T, index: number) => string
    readonly emptyState?: ReactNode
    readonly loading?: boolean
}

export function List<T>({ items, renderItem, keyExtractor, emptyState, loading }: ListProps<T>) {
    if (loading) return <ListSkeleton />
    if (items.length === 0) return <>{emptyState || <EmptyState />}</>
    
    return (
        <Box>
            {items.map((item, index) => (
                <Box key={keyExtractor(item, index)}>
                    {renderItem(item, index)}
                </Box>
            ))}
        </Box>
    )
}
```

### Form Components

**Pattern:** Controlled inputs with validation

```tsx
interface FormFieldProps {
    readonly name: string
    readonly value: string
    readonly error?: string
    readonly required?: boolean
    readonly disabled?: boolean
    readonly onChange: (name: string, value: string) => void
    readonly onBlur?: (name: string) => void
}

export function FormField({ name, value, error, onChange, onBlur, ...props }: FormFieldProps) {
    const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        onChange(name, e.target.value)
    }, [name, onChange])
    
    const handleBlur = useCallback(() => {
        onBlur?.(name)
    }, [name, onBlur])
    
    return (
        <TextField
            name={name}
            value={value}
            error={!!error}
            helperText={error}
            onChange={handleChange}
            onBlur={handleBlur}
            {...props}
        />
    )
}
```

### Modal Components

**Pattern:** Parent-controlled modals with loading states

```tsx
interface ModalProps {
    readonly open: boolean
    readonly onClose: () => void
    readonly title?: string
    readonly actions?: ReactNode
    readonly children: ReactNode
}

export function Modal({ open, onClose, title, actions, children }: ModalProps) {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            {title && <DialogTitle>{title}</DialogTitle>}
            <DialogContent>{children}</DialogContent>
            {actions && <DialogActions>{actions}</DialogActions>}
        </Dialog>
    )
}

// Usage with dynamic import
const EditModal = dynamic(
    () => import('./EditModal'),
    { loading: () => <ComponentLoader dialog /> }
)
```

### Error Boundary Pattern

Wrap features with error boundaries:

```tsx
interface ErrorBoundaryProps {
    readonly children: ReactNode
    readonly fallback?: ComponentType<{ error: Error }>
}

class ErrorBoundary extends Component<ErrorBoundaryProps, { error: Error | null }> {
    state = { error: null }
    
    static getDerivedStateFromError(error: Error) {
        return { error }
    }
    
    render() {
        if (this.state.error) {
            const Fallback = this.props.fallback || DefaultErrorFallback
            return <Fallback error={this.state.error} />
        }
        
        return this.props.children
    }
}

// Wrap features
<ErrorBoundary>
    <FeatureComponent />
</ErrorBoundary>
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
```tsx
// Server Component (default)
async function ProductList() {
    const products = await getProducts() // Direct DB access
    return <ProductGrid products={products} />
}

// Client Component (add directive)
'use client'
function ProductGrid({ products }) {
    const [filter, setFilter] = useState('')
    // Interactive filtering logic
}
```

## Summary

This guide represents our established patterns for building consistent, maintainable components. Key takeaways:

1. **Always use TypeScript** with readonly props
2. **Memoize callbacks** passed as props
3. **Use context** when prop drilling exceeds 2-3 levels
4. **Clean props** before spreading to DOM elements
5. **Prefer composition** over complex component hierarchies
6. **Optimize strategically** with React.memo and useMemo
7. **Split code** at route and modal boundaries

Follow these patterns to maintain consistency across the codebase and ensure optimal performance.