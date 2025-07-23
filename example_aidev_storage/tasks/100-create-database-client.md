---
id: "100"
name: "create-database-client"
type: "pattern"
dependencies: ["020-setup-prisma-sqlite"]
estimated_lines: 50
priority: "critical"
---

# Pattern: Database Client Singleton

## Description
Create a reusable Prisma client singleton pattern that ensures only one database connection is used throughout the application.

## Pattern Requirements
- Single database instance in development
- Single database instance in production
- Prevent connection leaks
- TypeScript type safety
- Hot reload support in development

## Implementation
Create a 30-50 line pattern that demonstrates:
```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

declare global {
  var prisma: PrismaClient | undefined
}

export const prisma = global.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma
}
```

## Test Specifications
```yaml
pattern_tests:
  - scenario: "Development environment"
    condition: "Multiple imports"
    expected: "Same instance returned"
  
  - scenario: "Production environment"
    condition: "Server restart"
    expected: "New instance created"
  
  - scenario: "Hot reload"
    condition: "Code change in dev"
    expected: "Reuses existing connection"
```

## Usage Examples
Show 3+ places this pattern will be used:
1. `/api/auth/[...nextauth]` - User authentication queries
2. `/api/jobs` - Job CRUD operations
3. `/api/admin/stats` - Dashboard statistics
4. Any service that needs database access

## Code Reuse
- This becomes the standard import for all database operations
- Used by all API routes and server components
- Imported as: `import { prisma } from '@/lib/prisma'`

## Documentation Links
- [Prisma Best Practices](https://www.prisma.io/docs/guides/database/troubleshooting-orm/help-articles/nextjs-prisma-client-dev-practices)

## Potential Gotchas
- Global variable needed for hot reload
- Different behavior in dev vs production
- Connection limits in production

## Testing Notes
- Verify singleton behavior
- Test hot reload doesn't create multiple connections
- Ensure proper TypeScript types