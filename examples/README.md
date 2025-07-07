# Code Examples - Preferred Patterns

This directory contains examples demonstrating the coding patterns and conventions used in this project. These examples serve as reference implementations for AI assistants and developers.

## Component Examples

### UserCard.tsx
Demonstrates:
- Arrow function component with `React.FC<Props>`
- Readonly interface properties
- useCallback for all event handlers
- useMemo for computed values
- 2-line if statements without braces
- Material-UI with sx prop
- Proper TypeScript typing

### BTextField.tsx
Demonstrates:
- B-prefixed custom UI component pattern
- Extending MUI components
- Prop spreading with cleanup
- Built-in validation patterns
- Custom event handling (onPressEnter)
- Computed properties with useMemo

## API Route Examples

### users-route.ts
Demonstrates:
- Zod schema validation (ALWAYS required)
- Proper error handling with status codes
- Redis caching implementation
- NextAuth session checking
- Rate limiting pattern
- Consistent error response format
- TypeScript type inference from Zod

## Hook Examples

### useUsers.ts
Demonstrates:
- TanStack Query for server state
- Query key factory pattern
- Optimistic updates
- Error handling with notistack
- Prefetching strategy
- Filtered/computed data with useMemo
- Proper loading states

## Store Examples

### useAppStore.ts
Demonstrates:
- Zustand with middleware (devtools, persist, immer)
- State and actions organization
- Selective persistence
- Selector patterns
- Helper functions
- Feature-specific stores

## Key Patterns to Follow

1. **Always use readonly** for interface properties
2. **No return types** when TypeScript can infer
3. **useCallback for every event handler**
4. **useMemo for expensive computations and filtering**
5. **2-line if statements** without braces
6. **Minimal documentation** - code should be self-explanatory
7. **Zod validation** in all API routes
8. **TanStack Query** for server state, not useState
9. **Material-UI** for all UI components
10. **Co-locate tests** with components (when requested)

## Technology Stack Reminders

- **UI**: Material-UI (MUI) only
- **State**: Zustand (client), TanStack Query (server)
- **Forms**: React Hook Form + Zod (complex), useState (simple)
- **Database**: Prisma with MySQL
- **Caching**: Redis
- **Auth**: NextAuth.js
- **Testing**: Vitest (only when requested)

## Important Notes

- Never import GSAP (it's manually added)
- Only create test files when explicitly requested
- Use provided linting commands, not direct tsc
- Server Components by default, 'use client' only when needed
- Always validate with Zod in API routes