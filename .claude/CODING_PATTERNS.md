# Comprehensive Coding Patterns Reference

This guide consolidates all coding patterns from mypreferences/writing-style.md and other preferences.

## Naming Conventions

### Variables
```typescript
// camelCase for regular variables
const userName = 'John';
const isActive = true;
const hasPermission = false;
const canEdit = false;
const shouldRender = true;

// Plural for collections
const users = [];
const files = [];

// UPPER_SNAKE_CASE for environment variables and enum-like objects
const API_KEY = process.env.API_KEY;
const MAX_FILE_SIZE = 1024 * 1024 * 5; // 5MB

export const ActivityTypes = {
  CLIENT_CREATE: 40,
  FLIGHT_CREATE: 30
};
```

### Functions
```typescript
// camelCase, verb-based, descriptive
const fetchUserData = async () => {};
const calculateTotal = (items) => {};
const formatBytes = (bytes: number, decimals: number = 2) => {};

// Event handlers with 'on' prefix
const onChange = () => {};
const onMouseOver = useCallback(() => {}, []);

// Hooks with 'use' prefix
const useAuth = () => {};
const useConfig = () => {};
```

### Types and Interfaces
```typescript
// PascalCase, no prefixes
// Use interface for object shapes
interface UserData {
  id: string;
  name: string;
}

interface Props {
  title: string;
  isActive?: boolean;
}

// Use type for unions, intersections, and aliases
type Status = "active" | "inactive" | "pending";
type ID = string | number;
type PartialUser = Partial<UserData>;
```

## Component Patterns

### Component Style
```typescript
// Arrow function with const
export const HomePage = ({ title, content }: Props) => {
  // Hooks first
  const [state, setState] = useState('');
  const mounted = useRef(false);
  
  // Callbacks with useCallback
  const handleClick = useCallback(() => {
    // handler logic
  }, []);
  
  // Effects
  useEffect(() => {
    // effect logic
  }, []);
  
  // Early returns
  if (!title) return null;
  
  // Main render
  return <div>{content}</div>;
};
```

### B-Prefixed Components
```typescript
// B-prefix only when extending library components
export const BTextField = (props: Props) => {
  // Extends @mui/TextField
};
```

### Component Categories

#### Container Components
**Purpose:** Handle data fetching, state management, and business logic.
```typescript
export default function FlightConfigurator({ flightId }: Props) {
  // Data fetching
  const [loading, setLoading] = useState(true);
  const { load: loadComponents, components } = useComponents();
  
  // Business logic
  useEffect(() => {
    loadComponents().finally(() => setLoading(false));
  }, [flightId]);
  
  // Render presentational components
  return (
    <ConfiguratorLayout>
      <ComponentList components={components} />
    </ConfiguratorLayout>
  );
}
```

#### Presentational Components
**Purpose:** Display UI based on props, no business logic.
```typescript
export const UserCard: React.FC<Props> = ({ user, onEdit }) => {
  // Only UI logic
  const handleClick = useCallback(() => {
    onEdit(user.id);
  }, [user.id, onEdit]);
  
  return <Card onClick={handleClick}>{user.name}</Card>;
};
```

#### Layout Components
**Purpose:** Define page structure and common UI patterns.
```typescript
export type MainLayoutProps = {
  readonly children: React.ReactNode;
  readonly button?: React.ReactNode;
  readonly showBreadcrumbs?: boolean;
};

export function MainLayout({ children, button, showBreadcrumbs = true }: MainLayoutProps) {
  return (
    <Box>
      {showBreadcrumbs && <Breadcrumbs />}
      <Container>{children}</Container>
      {button && <FloatingActionButton>{button}</FloatingActionButton>}
    </Box>
  );
}
```

#### Provider Components
**Purpose:** Provide global state and functionality through context.
```typescript
interface ProviderProps {
  readonly children: React.ReactNode;
}

export function ThemeProvider({ children }: ProviderProps) {
  const [theme, setTheme] = useState<Theme>('light');
  
  const value = useMemo(() => ({ theme, setTheme }), [theme]);
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

## Function Patterns

### Utility Functions
```typescript
// Named function with export
export function filterUnique(val: any, index: number, array: any[]) {
  return array.indexOf(val) === index;
}

// Parameters on one line
export function processData(id: string, config: Config, options: Options) {}

// Default values inline
const formatBytes = (bytes: number, decimals: number = 2) => {};
```

### Return Patterns
```typescript
// Early returns without braces
if (!session) return;
if (typeof window === "undefined") return null;

// Multi-line conditions without braces
if (!origin || origin === 'center') 
  return defaults;

// No explicit return types (let TypeScript infer)
function calculateSum(a: number, b: number) {
  return a + b;
}
```

## TypeScript Usage

### Type Inference
```typescript
// Let TypeScript infer when obvious
const [loading, setLoading] = useState(false);  // NOT useState<boolean>(false)
const [name, setName] = useState('');           // NOT useState<string>('')

// Add types only when necessary
const [user, setUser] = useState<User | null>(null);  // Type needed here

// Use @ts-ignore over casting
// @ts-ignore
element.style.webkitClipPath = clipPath;
// NOT: (element.style as any).webkitClipPath = clipPath;
```

### Interface vs Type Usage
```typescript
// Interfaces for object shapes and contracts
interface UserData {
  id: string;
  name: string;
  email?: string;
}

interface Props {
  readonly label?: string;
  readonly onChange: (val: string) => void;
}

// Types for everything else
type Status = "active" | "inactive" | "pending";
type ID = string | number;
type UserWithStatus = UserData & { status: Status };
```

## State Management Patterns

### Functional Updates
```typescript
// Functional updates when using previous state
setState(prev => ({
  ...prev,
  layers: prev.layers.map(layer => {
    if (layer.id !== targetId) return layer;
    return { ...layer, ...updates };
  })
}));

// Direct updates otherwise
setLoading(true);
setName('John');
```

## Error Handling Patterns

```typescript
// API route error handling
try {
  const data = await fetchData();
  return NextResponse.json(data);
} catch (error) {
  if (error instanceof z.ZodError)
    return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
  
  return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
}

// Component error handling
try {
  await saveData();
  enqueueSnackbar('Saved successfully');
} catch (error) {
  enqueueSnackbar('Failed to save', { variant: 'error' });
}
```

## Import Organization

```typescript
// 1. React/Next imports
import { useState, useCallback, useMemo } from 'react';
import { NextRequest, NextResponse } from 'next/server';

// 2. Third-party libraries
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';

// 3. Internal imports
import { prisma } from '@/lib/prisma';
import { UserCard } from '@/components/UserCard';

// 4. Types
import type { User, UserProfile } from '@/types';
```

## Props Patterns

### Props Documentation
```typescript
export type FileUploaderProps = {
  /** Maximum file size in MB. Default: 5 */
  readonly maxFileSize?: number;
  
  /** Allow multiple file selection. Default: false */
  readonly allowMultiple?: boolean;
  
  /** Callback fired when upload completes */
  readonly onComplete?: (files: UploadedFile[]) => void;
  
  /** Accepted file types (MIME types or extensions) */
  readonly accept?: string | string[];
};
```

### Default Props Pattern
```typescript
// Use destructuring with defaults for optional props
export function FileUploader(props: FileUploaderProps) {
  const {
    maxFileSize = 5,
    allowMultiple = false,
    label = "Select files",
    errors = [],
    onComplete
  } = props;
}

// Object defaults
export function BSelect(props: BSelectProps) {
  const { 
    box = {},  // Empty object default
    mb = 1,    // Numeric default
    variant = "outlined" // String default
  } = props;
}
```

### Props Spreading Pattern
```typescript
// Clean custom props before spreading
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

### Children Composition
```typescript
// Use children for flexible content composition
export type MainLayoutProps = {
  readonly children: React.ReactNode;
  readonly button?: React.ReactNode;
  readonly extraNavigation?: ReactNode;
};

// Provider pattern
interface ErrorProviderProps {
  readonly children?: React.ReactNode | React.ReactNode[];
}
```

## Conditional Rendering

### Pattern Priority
1. **Early returns** for invalid states
2. **&& operator** for simple conditions
3. **Ternary operator** for either/or rendering
4. **Helper functions** for complex logic

```typescript
// 1. Early return for invalid state
if (!data) {
  return <EmptyState />
}

// 2. && for optional rendering
return (
  <Card>
    {title && <CardHeader>{title}</CardHeader>}
    <CardContent>{content}</CardContent>
    {actions && <CardActions>{actions}</CardActions>}
  </Card>
)

// 3. Ternary for loading states
return loading ? (
  <Box p={3}>
    <CircularProgress />
  </Box>
) : (
  <DataGrid data={data} />
)

// 4. Extract complex conditions
const renderContent = () => {
  if (error) return <ErrorMessage error={error} />
  if (loading) return <Skeleton />
  if (!data) return <EmptyState />
  return <DataDisplay data={data} />
}

return <Container>{renderContent()}</Container>
```

### Anti-patterns to Avoid
```typescript
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

## Testing Patterns (Only When Requested)

```typescript
// Co-located test file
// UserCard.test.tsx next to UserCard.tsx

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

describe('UserCard', () => {
  it('renders user information', () => {
    render(<UserCard user={mockUser} />);
    expect(screen.getByText(mockUser.name)).toBeInTheDocument();
  });
});
```

## Package.json Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:studio": "prisma studio",
    "db:generate": "prisma generate"
  }
}
```

## Special Notes

### GSAP
```typescript
// Never import GSAP - it's manually added
// ❌ import gsap from 'gsap';
// ✅ Use global gsap object
```

### Testing
```typescript
// Only create test files when explicitly requested
// Don't proactively add tests
```

### Linting Commands
```bash
# Use only these commands
npm run lint <file>
npm run lint:fix <file>
npm run type-check <file>

# Don't use direct tsc commands
# ❌ tsc --noEmit
```

## Anti-Patterns to Avoid

1. ❌ Don't use 'use client' unnecessarily - prefer Server Components
2. ❌ Don't import client-only code in Server Components
3. ❌ Don't use window/document without checking if client-side
4. ❌ Don't skip TypeScript types - use 'unknown' over 'any'
5. ❌ Don't ignore hydration warnings
6. ❌ Don't fetch data in useEffect when Server Components work
7. ❌ Don't hardcode values that should be environment variables
8. ❌ Don't forget loading and error states
9. ❌ Don't create deeply nested ternaries
10. ❌ Don't mix styling approaches in the same component