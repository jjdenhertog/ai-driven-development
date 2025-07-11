---
name: "Next.js Project Structure Guide"
description: "Defines the folder structure and file organization patterns for Next.js applications"
ai_instructions: |
  When organizing files in a Next.js project:
  1. Follow the feature-first organization pattern
  2. Keep related files together within feature directories
  3. Use proper naming conventions (PascalCase for components, camelCase for utils)
  4. Place shared components in /src/components, feature-specific in /src/features/[Feature]/components
  5. Always check file placement against the directory structure rules
---

# Next.js Project Structure Guide

<ai-context>
This guide defines how to organize files and directories in Next.js applications using the App Router. 
The structure promotes modularity, scalability, and clear separation of concerns through a feature-first approach.
AI should use this guide to determine where to place new files and how to organize code.
</ai-context>

## Overview
This guide defines the folder structure for Next.js applications using App Router. It uses a feature-first approach with clear separation of concerns, promoting modularity and scalability.

## Core Philosophy
- **Feature-First**: Organize code by business domain/feature
- **Domain Grouping**: Group related files by functional domain
- **Environment Clarity**: Clear distinction between client and server code
- **Consistent Naming**: Predictable file naming conventions
- **Progressive Enhancement**: Start simple, add complexity as needed

## Directory Structure

```
project-root/
├── app/                        # Next.js App Router
│   ├── (routes)/              # Route groups
│   │   └── [page]/           
│   │       └── page.tsx      
│   ├── api/                   # API routes
│   │   └── [endpoint]/       
│   │       └── route.ts      
│   └── layout.tsx            # Root layout
├── src/                        # Application source code
│   ├── components/            # Shared UI components
│   │   └── ui/               # Custom UI library (B-prefixed)
│   ├── features/             # Feature modules
│   │   └── [FeatureName]/    
│   │       ├── components/   
│   │       ├── hooks/        
│   │       ├── utils/        
│   │       ├── types/        
│   │       └── index.tsx     
│   ├── hooks/                # Shared React hooks
│   ├── layouts/              # Reusable layout components
│   ├── lib/                  # Core utilities and singletons
│   │   ├── prisma.ts        # Prisma client instance
│   │   ├── redis.ts         # Redis client instance
│   │   └── auth.ts          # NextAuth configuration
│   ├── providers/            # React context providers
│   ├── schemas/              # Zod validation schemas
│   │   └── [domain]/        # Domain-specific schemas
│   ├── services/             # API service layer
│   │   ├── client/          
│   │   └── server/          
│   ├── stores/               # Zustand state stores
│   │   ├── useAppStore.ts   # Global app store
│   │   └── [feature]/       # Feature-specific stores
│   ├── types/                # Global TypeScript types
│   │   └── [domain]/        
│   ├── utils/                # Shared utilities
│   │   ├── client/          
│   │   ├── server/          
│   │   └── shared/          
│   └── config/               # App configuration
├── e2e/                        # End-to-end tests
│   └── [feature]/             # Tests organized by feature
├── public/                     # Static assets
│   ├── img/                  
│   │   └── icons/           
│   └── fonts/               
├── prisma/                     # Database schema
├── styles/                     # Global styles
└── [config files]              # Root configuration
```

## File Placement Rules

<ai-rules>
- ALWAYS place page routes in /app directory following Next.js App Router conventions
- NEVER mix client and server code in the same file
- ALWAYS use 'use client' directive for interactive components
- PREFER co-locating tests with their source files
- ALWAYS organize features in self-contained modules under /src/features
</ai-rules>

### 1. Page Routes (`/app`)

<ai-decision-tree>
When creating a new page:
1. Is it a marketing page? → Place in app/(marketing)/
2. Is it a dashboard page? → Place in app/(dashboard)/
3. Is it an API route? → Place in app/api/
4. Does it need a specific layout? → Create layout.tsx in the directory
5. Does it have dynamic segments? → Use [param] syntax
</ai-decision-tree>

App Router page structure:

```
app/
├── (marketing)/              # Route group
│   ├── page.tsx             # /
│   ├── about/
│   │   └── page.tsx         # /about
│   └── layout.tsx           
├── (dashboard)/              # Route group
│   ├── settings/
│   │   └── page.tsx         # /settings
│   └── layout.tsx           
└── billing/
    └── [invoiceId]/
        └── page.tsx         # /billing/:invoiceId
```

**Route Groups**: Use parentheses to organize without affecting URLs

### 2. API Routes (`/app/api`)

```
app/api/
├── auth/
│   ├── login/
│   │   └── route.ts       # POST /api/auth/login
│   └── logout/
│       └── route.ts       
├── users/
│   ├── route.ts           # GET/POST /api/users
│   └── [id]/
│       └── route.ts       # GET/PUT/DELETE /api/users/:id
└── billing/
    └── [year_id]/
        └── route.ts
```

### 3. Components (`/src/components`)

<code-template name="shared-component">
// src/components/ComponentName.tsx
export const ComponentName = ({ prop1, prop2 }: Props) => {
    // Component logic
    return (
        <div>
            {/* Component JSX */}
        </div>
    );
};
</code-template>

<code-template name="ui-component">
// src/components/ui/BComponentName.tsx
'use client';

import { ComponentProps } from '@mui/material';

export const BComponentName = (props: ComponentProps) => {
    // Extended UI component logic
    return <MUIComponent {...props} />;
};
</code-template>

**Shared Components** (`/src/components/`)
- Reusable across multiple features
- No feature-specific business logic
- Example: `Button.tsx`, `Modal.tsx`, `Card.tsx`

**Custom UI Library** (`/src/components/ui/`)
- Brand-specific components prefixed with 'B'
- Extends third-party UI libraries
- Usually Client Components (interactive)
- Example: `BTextField.tsx`, `BCheckbox.tsx`, `BTiptap.tsx`

**Server vs Client Components**
- Components are Server Components by default
- Add `'use client'` directive for interactive components
- Server Components can fetch data directly
- Client Components handle user interactions

### 4. Features (`/src/features`)

<validation-schema>
Feature Directory Structure:
- ✅ /src/features/FeatureName/index.tsx (public exports)
- ✅ /src/features/FeatureName/components/ (feature components)
- ✅ /src/features/FeatureName/hooks/ (feature hooks)
- ✅ /src/features/FeatureName/utils/ (feature utilities)
- ✅ /src/features/FeatureName/types/ (feature types)
- ❌ /src/features/featureName/ (must be PascalCase)
- ❌ /src/features/FeatureName/pages/ (pages go in /app)
</validation-schema>

Each feature is a self-contained module:

```
src/features/Billing/
├── index.tsx              # Public exports
├── BillingDashboard.tsx   # Main component
├── components/            
│   ├── InvoiceList.tsx
│   └── PaymentForm.tsx
├── hooks/                 
│   └── useInvoices.ts
├── utils/                 
│   └── calculateTax.ts
├── types/                 
│   └── Invoice.ts
└── constants/             
    └── billingStatus.ts
```

**When to create a new feature:**
- Represents a distinct business domain
- Has multiple related components
- Contains domain-specific logic
- Has its own data models

### 5. Hooks (`/src/hooks`)

**Shared Hooks** (`/src/hooks/`)
- Generic functionality
- Used across features
- Example: `useDebounce.ts`, `useLocalStorage.ts`

**Feature Hooks** (`/src/features/[FeatureName]/hooks/`)
- Feature-specific logic
- Data fetching
- Example: `useInvoices.ts`, `usePaymentMethods.ts`

### 6. Utilities (`/src/utils`)

Organized by runtime environment:

```
src/utils/
├── client/                   # Browser-only
│   ├── dom/                 
│   ├── validation/          
│   └── storage/             
├── server/                   # Server-only
│   ├── billing/             
│   ├── mail/                
│   └── database/            
└── shared/                   # Universal
    ├── date/                
    ├── string/              
    └── converter/           
```

### 7. Types (`/src/types`)

Domain-based organization:

```
src/types/
├── api/                     
│   ├── request/            
│   └── response/           
├── billing/                
├── user/                   
└── common/                 
    ├── enums/              
    └── interfaces/         
```

### 8. Services (`/src/services`)

External interactions:

```
src/services/
├── client/                  # Client-side services
│   ├── analytics.ts        
│   └── storage.ts          
├── server/                  # Server-side services
│   ├── stripe/             
│   └── database/           
└── api/                     # API clients
    ├── users.ts            
    └── billing.ts          
```

### 9. State Management (`/src/stores`)

Zustand stores for client-side state:

```
src/stores/
├── useAppStore.ts          # Global app state
├── useAuthStore.ts         # Authentication state
└── features/               # Feature-specific stores
    ├── useCartStore.ts
    └── useBillingStore.ts
```

**Store Organization**:
- Global stores at root level
- Feature-specific stores in subdirectories
- Each store is a single file with related state and actions

### 10. Validation Schemas (`/src/schemas`)

Zod schemas for runtime validation:

```
src/schemas/
├── auth.ts                 # Authentication schemas
├── user.ts                 # User-related schemas
├── billing/                # Billing domain schemas
│   ├── invoice.ts
│   └── payment.ts
└── common.ts               # Shared validation rules
```

**Schema Organization**:
- Group by domain when multiple schemas exist
- Co-locate with API routes or forms that use them
- Export both schema and inferred types

### 11. Core Libraries (`/src/lib`)

Singleton instances and core configurations:

```
src/lib/
├── prisma.ts              # Prisma client singleton
├── redis.ts               # Redis client singleton
├── auth.ts                # NextAuth configuration
├── email.ts               # Email service setup
└── constants.ts           # App-wide constants
```

**Library Files**:
- Single instance configurations
- Third-party service setups
- Core utilities that need single initialization
- App-wide constants and enums

### 12. Tests

TDD with co-location pattern:

**Unit/Component Tests** - Co-located with code:
```
src/components/
├── Button.tsx
└── Button.test.tsx          # Test next to component

src/features/Billing/
├── BillingDashboard.tsx
├── BillingDashboard.test.tsx
└── hooks/
    ├── useInvoices.ts
    └── useInvoices.test.ts
```

**Alternative: __tests__ folders** - For multiple test files:
```
src/features/Billing/
└── __tests__/
    ├── BillingDashboard.test.tsx
    └── BillingDashboard.integration.test.tsx
```

**E2E Tests** - Separate directory:
```
e2e/
├── auth/
│   └── login.spec.ts
└── billing/
    └── invoice-flow.spec.ts
```

### 13. Providers (`/src/providers`)

Complex providers get their own directories:

```
src/providers/
├── Auth/
│   ├── AuthContext.tsx
│   ├── AuthProvider.tsx
│   └── types.ts
└── BSnackbarProvider.tsx   # Simple providers
```

### 14. Layouts (`/src/layouts`)

Reusable layout components:

```
src/layouts/
├── MainNav.tsx             
├── Sidebar.tsx             
└── Footer.tsx              
```

Layout files in App Router:
```
app/
├── layout.tsx              # Root layout
├── (marketing)/
│   └── layout.tsx         # Section layout
└── (dashboard)/
    └── layout.tsx         
```

### 15. Configuration (`/src/config`)

```
src/config/
├── app.ts                  # App settings
├── api.ts                  # API endpoints
├── features.ts             # Feature flags
└── theme.ts                # Theme config
```

**Environment Variables**: Root directory
- `.env.local`
- `.env.development`
- `.env.production`
- `.env.example`

**Test Configuration**: Root directory
- `vitest.config.ts`
- `playwright.config.ts`

## Special Patterns

### B-Prefixed Components
Custom UI components are prefixed with 'B':
- `BTextField`, `BCheckbox`, `BTiptap`
- Distinguishes from third-party components
- Located in `/src/components/ui/`

### Barrel Exports
Use index files for clean public APIs:
```typescript
// src/features/Billing/index.tsx
export { BillingDashboard } from './BillingDashboard';
export { useInvoices } from './hooks/useInvoices';
export type { Invoice } from './types';
```

### Private Folders
Use underscore prefix for non-route folders in `/app`:
- `_components` - Components used only in app directory
- `_utils` - App-specific utilities
- Prevents accidental routing

## Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `UserProfile.tsx` |
| Custom UI | PascalCase + B | `BTextField.tsx` |
| Hooks | camelCase + use | `useAuth.ts` |
| Utilities | camelCase | `formatDate.ts` |
| Types | PascalCase | `User.ts` |
| Enums | PascalCase + .enum | `UserRole.enum.ts` |
| API Routes | lowercase | `route.ts` |
| Features | PascalCase | `Billing/` |
| Tests | camelCase + .test/.spec | `Button.test.tsx` |
| E2E Tests | kebab-case + .spec | `login-flow.spec.ts` |

## Best Practices

<ai-rules>
- Feature modules should be self-contained and not import from other features
- Shared code goes in the appropriate shared directory (/components, /hooks, /utils)
- Use barrel exports (index.ts) to control the public API of features
- Keep the /app directory lean - only pages, layouts, and route handlers
- Co-locate tests with source files for better maintainability
- Use route groups in /app to organize without affecting URLs
- Prefer absolute imports using @ alias over relative imports
</ai-rules>

<ai-decision-tree>
Where should I place this file?

1. Is it a page or route?
   → YES: /app directory
   → NO: Continue to 2

2. Is it used by multiple features?
   → YES: Is it a component?
      → YES: /src/components
      → NO: Is it a hook?
         → YES: /src/hooks
         → NO: Is it a utility?
            → YES: /src/utils
            → NO: /src/lib or /src/types
   → NO: Continue to 3

3. Is it feature-specific?
   → YES: /src/features/[FeatureName]/[appropriate-subdirectory]
   → NO: Consider if it should be shared

4. Is it configuration or constants?
   → YES: /src/config
   → NO: Review the structure again
</ai-decision-tree>

1. **Feature Independence**: Features don't import from each other
2. **Progressive Complexity**: Add subdirect