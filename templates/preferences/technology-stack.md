---
name: "Technology Stack & Implementation Guide"
description: "Defines the core technology choices and implementation patterns for Next.js applications"
ai_instructions: |
  When implementing features:
  1. Use the exact technology stack specified - no substitutions
  2. Follow the singleton patterns for Prisma and Redis
  3. Use React Context API for state management, NOT Redux or Zustand
  4. Always use TanStack Query for data fetching, not SWR or custom hooks
  5. Implement proper error handling with Sentry
---

# Technology Stack & Implementation Guide

<ai-context>
This guide defines the EXACT technology choices for Next.js applications. These are not suggestions -
they are requirements. AI must use these specific technologies and follow the implementation patterns
shown. No substitutions or alternatives should be suggested unless explicitly asked.
</ai-context>

This guide defines the technology choices and implementation patterns for Next.js applications.

## Project Configuration

<ai-rules>
- ALWAYS use Next.js 15.x with App Router
- ALWAYS use TypeScript, never plain JavaScript
- ALWAYS use npm as package manager
- ALWAYS use Node.js 20.x or later
- NEVER suggest alternative frameworks or tools
</ai-rules>

### Core Setup
- **Framework**: Next.js 15.x with App Router
- **Language**: TypeScript 5.x
- **Package Manager**: npm
- **Node Version**: 20.x

### Essential Dependencies

<validation-schema>
Required Dependencies:
- ✅ @mui/material (UI framework)
- ✅ @tanstack/react-query (data fetching)
- ✅ prisma + @prisma/client (database ORM)
- ✅ next-auth (authentication)
- ✅ react-hook-form + zod (forms)
- ✅ notistack (notifications)
- ❌ Redux/Zustand (use Context API)
- ❌ SWR (use TanStack Query)
- ❌ Tailwind CSS (use MUI)
- ❌ Mongoose (use Prisma)
</validation-schema>
```json
{
  "@mui/material": "latest",
  "@mui/lab": "latest",
  "@mui/icons-material": "latest",
  "next": "latest",
  "react": "latest",
  "react-dom": "latest",
  "typescript": "latest",
  "@prisma/client": "latest",
  "prisma": "latest",
  "next-auth": "latest",
  "notistack": "latest",
  "@tanstack/react-query": "latest",
  "react-hook-form": "latest",
  "@hookform/resolvers": "latest",
  "zod": "latest",
  "redis": "latest",
  "@sentry/nextjs": "latest",
  "@types/node": "latest",
  "@types/react": "latest",
  "@types/react-dom": "latest"
}
```

**Note**: Use latest stable versions. The AI should check for any breaking changes or compatibility issues when installing.

## Technology Stack Overview

### UI Framework: Material-UI
```typescript
import { Button, TextField, Box } from '@mui/material';
import { LoadingButton } from '@mui/lab';

// sx prop for styling
<Box sx={{ 
    display: 'flex', 
    gap: 1,
    color: 'primary.main'
}}>

// Theme configuration
const theme = createTheme({
    cssVariables: true,
    palette: {
        mode: 'dark',
        primary: { main: '#5c6bc0' },
        secondary: { main: '#f50057' }
    }
})
```

### State Management: Context API + Server Components
Use React Context API for client-side state management and Server Components for data fetching.

<code-template name="context-provider">
```typescript
// contexts/AppContext.tsx - Main app context
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AppState {
    user: User | null;
    sidebarOpen: boolean;
    theme: 'light' | 'dark';
}

interface AppContextType extends AppState {
    setUser: (user: User | null) => void;
    toggleSidebar: () => void;
    setTheme: (theme: 'light' | 'dark') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [theme, setTheme] = useState<'light' | 'dark'>('dark');

    // Load persisted theme from localStorage
    useEffect(() => {
        const savedTheme = localStorage.getItem('app-theme') as 'light' | 'dark' | null;
        if (savedTheme) {
            setTheme(savedTheme);
        }
    }, []);

    // Persist theme changes
    useEffect(() => {
        localStorage.setItem('app-theme', theme);
    }, [theme]);

    const toggleSidebar = () => {
        setSidebarOpen(prev => !prev);
    };

    const value: AppContextType = {
        user,
        sidebarOpen,
        theme,
        setUser,
        toggleSidebar,
        setTheme,
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
}

export function useAppContext() {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext must be used within AppProvider');
    }
    return context;
}

// Usage in components
export function MyComponent() {
    const { user, theme, toggleSidebar } = useAppContext();
    
    return (
        <div>
            <button onClick={toggleSidebar}>Toggle Sidebar</button>
            <p>Current theme: {theme}</p>
        </div>
    );
}
```
</code-template>

### Data Fetching: React Query (TanStack Query)
See [State Management Guide](state-management.md) for comprehensive patterns.

### Forms: React Hook Form with Zod

<ai-rules>
- ALWAYS define Zod schemas before the component
- ALWAYS use zodResolver for form validation
- ALWAYS use Controller for MUI components
- NEVER use uncontrolled inputs
- ALWAYS handle loading states with LoadingButton
</ai-rules>

<code-template name="form-with-validation">
```typescript
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';

// Schema MUST be defined before the component
const userFormSchema = z.object({
    name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
    email: z.string().email('Invalid email address'),
    role: z.enum(['admin', 'user', 'guest']),
    age: z.number().min(18, 'Must be 18 or older').optional(),
});

type UserFormData = z.infer<typeof userFormSchema>;

export const UserForm = ({ onSuccess }: { onSuccess?: () => void }) => {
    const createUser = useCreateUser();
    
    const { 
        control,
        handleSubmit, 
        formState: { errors, isSubmitting },
        reset
    } = useForm<UserFormData>({
        resolver: zodResolver(userFormSchema),
        defaultValues: {
            name: '',
            email: '',
            role: 'user'
        }
    });

    const onSubmit = async (data: UserFormData) => {
        await createUser.mutateAsync(data);
        reset();
        onSuccess?.();
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Controller
                name="name"
                control={control}
                render={({ field }) => (
                    <BTextField
                        {...field}
                        label="Name"
                        error={!!errors.name}
                        helperText={errors.name?.message}
                        fullWidth
                        margin="normal"
                        required
                    />
                )}
            />
            
            <LoadingButton
                type="submit"
                loading={isSubmitting || createUser.isPending}
                variant="contained"
                fullWidth
                sx={{ mt: 2 }}
            >
                Create User
            </LoadingButton>
        </form>
    );
}
```
</code-template>

### Database: Prisma with MySQL & Redis

<code-template name="prisma-singleton">
```typescript
// lib/prisma.ts - Singleton pattern
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
        ? ['query', 'error', 'warn'] 
        : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}

// lib/redis.ts - Redis client setup
import { createClient } from 'redis';

const globalForRedis = globalThis as unknown as {
    redis: ReturnType<typeof createClient> | undefined
};

export const redis = globalForRedis.redis ?? createClient({
    url: process.env.REDIS_URL,
});

if (process.env.NODE_ENV !== 'production') {
    globalForRedis.redis = redis;
}

redis.on('error', (err) => console.error('Redis Client Error', err));

if (!redis.isOpen) {
    redis.connect();
}
```
</code-template>

### Authentication: NextAuth.js
```typescript
// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

// lib/auth.ts
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import { compare } from 'bcryptjs';

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        CredentialsProvider({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }
                
                const user = await prisma.user.findUnique({
                    where: { email: credentials.email }
                });
                
                if (!user || !await compare(credentials.password, user.password)) {
                    return null;
                }
                
                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role
                };
            }
        })
    ],
    session: {
        strategy: 'jwt'
    },
    pages: {
        signIn: '/auth/signin',
        error: '/auth/error',
    }
};
```

### Notifications: Notistack
```typescript
// Layout or _app.tsx
import { SnackbarProvider } from 'notistack';

<SnackbarProvider 
    maxSnack={3}
    anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
    }}
>
    {children}
</SnackbarProvider>

// Usage
import { enqueueSnackbar } from 'notistack';

enqueueSnackbar('User created successfully!', { variant: 'success' });
```

### Error Tracking: Sentry
```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    environment: process.env.NODE_ENV,
});
```

## Test-Driven Development (TDD)

### Testing Stack
- **Test Runner**: Vitest
- **Testing Library**: React Testing Library
- **E2E Testing**: Playwright
- **Mocking**: Vitest's built-in mocking capabilities

### Testing Dependencies
```json
{
  "vitest": "latest",
  "@testing-library/react": "latest",
  "@testing-library/user-event": "latest",
  "@testing-library/jest-dom": "latest",
  "@vitejs/plugin-react": "latest",
  "jsdom": "latest",
  "@vitest/coverage-v8": "latest",
  "@vitest/ui": "latest",
  "msw": "latest",
  "playwright": "latest"
}
```

### Vitest Configuration
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
    plugins: [react(), tsconfigPaths()],
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./src/test/setup.ts'],
        coverage: {
            reporter: ['text', 'json', 'html'],
            exclude: [
                'node_modules/',
                'src/test/',
                '**/*.d.ts',
                '**/*.config.*',
                '**/mockData.ts'
            ]
        }
    }
});
```

### Testing Patterns
See individual files for testing examples:
- Component testing patterns in [Component Patterns Guide](component-patterns.md)
- API route testing in [API Design Standards](api-standards.md)

## Common Implementation Patterns

### Server Component with Client-Side Interactions
```typescript
// app/users/page.tsx - Server Component
async function UsersPage() {
    const initialUsers = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 50
    });

    return (
        <div>
            <h1>Users</h1>
            <UsersList initialData={initialUsers} />
        </div>
    );
}

// app/users/UsersList.tsx - Client Component
'use client';

export function UsersList({ initialData }: { initialData: User[] }) {
    const { data: users } = useQuery({
        queryKey: ['users'],
        queryFn: fetchUsers,
        initialData,
    });

    const [showForm, setShowForm] = useState(false);

    return (
        <>
            <Button onClick={() => setShowForm(true)}>
                Add User
            </Button>
            
            {showForm && (
                <UserForm onSuccess={() => setShowForm(false)} />
            )}
            
            <UserTable users={users} />
        </>
    );
}
```

### Performance Patterns

#### Caching with Redis
```typescript
export async function getCachedData<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = 300
): Promise<T> {
    const cached = await redis.get(key);
    if (cached) {
        return JSON.parse(cached);
    }
    
    const data = await fetcher();
    await redis.setex(key, ttl, JSON.stringify(data));
    
    return data;
}
```

#### Rate Limiting
```typescript
export async function rateLimit(
    identifier: string, 
    limit: number = 10, 
    window: number = 60
): Promise<{ success: boolean; remaining: number }> {
    const key = `rate_limit:${identifier}`;
    const current = await redis.incr(key);
    
    if (current === 1) {
        await redis.expire(key, window);
    }
    
    return {
        success: current <= limit,
        remaining: Math.max(0, limit - current)
    };
}
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

## Technology Preferences Summary

<ai-decision-tree>
Which technology should I use for...

1. UI Components?
   → Material-UI (MUI) - NO alternatives

2. State Management?
   → Server state: TanStack Query
   → Client state: React Context API
   → Form state: React Hook Form

3. Database?
   → ORM: Prisma with MySQL
   → Caching: Redis

4. Authentication?
   → NextAuth.js - NO alternatives

5. Styling?
   → MUI sx prop (primary)
   → CSS Modules (when needed)

6. Testing?
   → Vitest + React Testing Library
   → Playwright for E2E
</ai-decision-tree>

When building Next.js applications, use these specific technologies:

1. **State Management** - React Context API for client state, Server Components for server state
2. **Form Handling** - React Hook Form with Zod validation
3. **Data Fetching** - React Query (TanStack Query) for client-side
4. **Router** - App Router with Server Components
5. **UI Framework** - Material-UI (MUI) only
6. **API Routes** - Native Next.js route handlers
7. **Database** - Prisma with MySQL hosted on Digital Ocean
8. **Caching** - Redis for caching and rate limiting
9. **Authentication** - NextAuth.js
10. **Error Tracking** - Sentry
11. **Validation** - Zod schemas
12. **Styling** - MUI sx prop + CSS Modules for complex layouts
13. **Notifications** - Notistack
14. **Testing** - Vitest + React Testing Library

## Loading States
```typescript
// With React Query
const { isLoading, isFetching } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
});

if (isLoading) return <ContentLoader />;

// Loading button for actions
<LoadingButton 
    loading={mutation.isPending} 
    onClick={handleClick}
    variant="contained"
>
    Save
</LoadingButton>

// Skeleton loading
{isLoading ? (
    <>
        <Skeleton variant="text" width={200} height={40} />
        <Skeleton variant="rectangular" width="100%" height={200} />
    </>
) : (
    <DataContent data={data} />
)}
```

## Error Handling
```typescript
// Global error handling with React Query
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: (failureCount, error: any) => {
                if (error.status >= 400 && error.status < 500) return false;
                return failureCount < 2;
            },
        },
        mutations: {
            onError: (error: any) => {
                enqueueSnackbar(
                    error.message || 'Something went wrong. Please try again.', 
                    { variant: 'error' }
                );
            },
        },
    },
});

// API error responses
export function handleError(error: unknown): NextResponse {
    console.error('API Error:', error);
    
    Sentry.captureException(error);
    
    if (error instanceof z.ZodError) {
        return NextResponse.json(
            { error: 'Validation failed', details: error.errors },
            { status: 400 }
        );
    }
    
    return NextResponse.json(
        { error: 'Internal Server Error' },
        { status: 500 }
    );
}
```

This guide provides the foundation for building consistent, performant Next.js applications with our preferred technology stack.