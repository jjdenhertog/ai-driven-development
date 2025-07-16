---
name: "API Design Standards"
category: "backend"
version: "1.0.0"
dependencies: ["technology-stack", "folder-structure", "testing"]
tags: ["api", "rest", "nextjs", "routes", "validation", "error-handling"]
priority: "critical"
ai-instructions:
  - "ALWAYS use App Router pattern (/app/api/) for API routes"
  - "NEVER use next-connect - use native Next.js route handlers"
  - "MUST validate all inputs with Zod schemas before processing"
  - "MUST use centralized error handling with handleError function"
  - "ALWAYS return consistent error format: { error: string }"
  - "PREFER direct JSON responses without unnecessary wrappers"
---

# API Design Standards

This document defines the API design patterns and conventions used across our Next.js applications. These standards align with our technology stack and emphasize native Next.js patterns.

<ai-context>
This preference file defines how to structure and implement API routes in Next.js App Router. 
All API routes must follow these patterns for consistency and maintainability.
</ai-context>

## Framework & Router Configuration

<ai-rules category="routing">
  <rule id="api-location" priority="critical">
    <condition>Creating any API route</condition>
    <action>Place in /app/api/ directory with route.ts filename</action>
    <validation>Path matches: ^/app/api/.*/route\.ts$</validation>
    <example>/app/api/users/route.ts</example>
  </rule>
  
  <rule id="router-pattern" priority="critical">
    <condition>Implementing route handlers</condition>
    <action>Export named functions (GET, POST, PUT, DELETE)</action>
    <validation>No default export, only named HTTP method exports</validation>
  </rule>
  
  <rule id="no-next-connect" priority="critical">
    <condition>Setting up API routes</condition>
    <action>Use native Next.js handlers, NOT next-connect</action>
    <validation>No import from 'next-connect'</validation>
  </rule>
</ai-rules>

### Next.js App Router API Routes
- **Location**: `/app/api/` (App Router pattern)
- **Router**: Native Next.js route handlers (NO next-connect)
- **Error Handling**: Custom error handler function with consistent format

### Basic Route Template

<code-template id="api-route-basic">
  <description>Basic API route with authentication and error handling</description>
  <use-when>Creating any authenticated API endpoint</use-when>
  <variables>
    <var name="RESOURCE_NAME" type="string" example="user" />
    <var name="RESOURCE_TYPE" type="string" example="User" />
    <var name="SCHEMA_NAME" type="string" example="userSchema" />
  </variables>
  <imports>
    <import>import { NextRequest, NextResponse } from 'next/server';</import>
    <import>import { getServerSession } from 'next-auth';</import>
    <import>import { authOptions } from '@/lib/auth';</import>
    <import>import { prisma } from '@/lib/prisma';</import>
    <import>import { z } from 'zod';</import>
    <import>import { ${SCHEMA_NAME} } from '@/schemas/${RESOURCE_NAME}';</import>
  </imports>
</code-template>

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Custom middleware helper
async function withAuth(
    request: NextRequest,
    handler: (req: NextRequest, session: any) => Promise<NextResponse>
) {
    const session = await getServerSession(authOptions);
    
    if (!session) {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        );
    }
    
    return handler(request, session);
}

// Custom error handler
function handleError(error: unknown): NextResponse {
    console.error('API Error:', error);
    
    if (error instanceof z.ZodError) {
        return NextResponse.json(
            { error: 'Validation failed', details: error.errors },
            { status: 400 }
        );
    }
    
    if (error instanceof Error) {
        return NextResponse.json(
            { error: error.message },
            { status: 400 }
        );
    }
    
    return NextResponse.json(
        { error: 'Internal Server Error' },
        { status: 500 }
    );
}

// GET /api/resources
export async function GET(request: NextRequest) {
    return withAuth(request, async (req, session) => {
        try {
            const resources = await prisma.resource.findMany({
                where: { userId: session.user.id },
                orderBy: { createdAt: 'desc' }
            });
            
            return NextResponse.json(resources);
        } catch (error) {
            return handleError(error);
        }
    });
}

// POST /api/resources
export async function POST(request: NextRequest) {
    return withAuth(request, async (req, session) => {
        try {
            const body = await req.json();
            
            // ALWAYS validate with Zod
            const validatedData = resourceSchema.parse(body);
            
            const resource = await prisma.resource.create({
                data: {
                    ...validatedData,
                    userId: session.user.id
                }
            });
            
            // Clear cache after mutations
            await invalidateResourceCache();
            
            return NextResponse.json(resource, { status: 201 });
        } catch (error) {
            return handleError(error);
        }
    });
}

// PUT /api/resources
export async function PUT(request: NextRequest) {
    return withAuth(request, async (req, session) => {
        try {
            const body = await req.json();
            const { id, ...data } = body;
            
            const validatedData = updateResourceSchema.parse(data);
            
            const resource = await prisma.resource.update({
                where: { id, userId: session.user.id },
                data: validatedData
            });
            
            await invalidateResourceCache();
            
            return NextResponse.json(resource);
        } catch (error) {
            return handleError(error);
        }
    });
}

// DELETE /api/resources
export async function DELETE(request: NextRequest) {
    return withAuth(request, async (req, session) => {
        try {
            const { searchParams } = new URL(req.url);
            const id = searchParams.get('id');
            
            if (!id) {
                throw new Error('Resource ID required');
            }
            
            await prisma.resource.delete({
                where: { id, userId: session.user.id }
            });
            
            await invalidateResourceCache();
            
            return NextResponse.json({ deleted: true });
        } catch (error) {
            return handleError(error);
        }
    });
}
```

## Route Naming Conventions

### URL Structure
- **RESTful resource-based paths**: `/api/users`, `/api/products`, `/api/orders`
- **Nested resources**: `/api/users/[userId]/orders/[orderId]/items`
- **Dynamic segments**: Use folders with square brackets `[param]/route.ts`
- **Special routes**:
  - `/api/auth/[...nextauth]/route.ts` for NextAuth
  - `/api/webhooks/*` for external webhooks
  - `/api/public/*` for unauthenticated endpoints

### Naming Rules
- **Collections**: Plural nouns (`users`, `products`, `orders`)
- **Single resources**: Accessed via dynamic route segments
- **Actions**: Avoid action-based URLs; use HTTP methods instead
- **Case**: Lowercase with hyphens for multi-word resources

### File Organization
```
/app/api/
├── users/
│   ├── route.ts              # GET all, POST new
│   └── [userId]/
│       ├── route.ts          # GET one, PUT, DELETE
│       └── orders/
│           └── route.ts      # Nested resource operations
├── auth/
│   └── [...nextauth]/
│       └── route.ts          # NextAuth handler
└── webhooks/
    └── stripe/
        └── route.ts          # Webhook handlers
```

## Request/Response Standards

<ai-rules category="response-format">
  <rule id="direct-json" priority="high">
    <condition>Returning successful response data</condition>
    <action>Return data directly without success wrapper</action>
    <validation>Response does not contain { success: true, data: ... }</validation>
    <good>return NextResponse.json(user);</good>
    <bad>return NextResponse.json({ success: true, data: user });</bad>
  </rule>
  
  <rule id="error-format" priority="critical">
    <condition>Returning error response</condition>
    <action>Use consistent { error: string } format</action>
    <validation>All errors have 'error' property with string message</validation>
    <example>{ error: "User not found" }</example>
  </rule>
</ai-rules>

### Response Format
Responses should be direct JSON without unnecessary wrappers:

```typescript
// ✓ Good - Direct data response
return NextResponse.json(user);
return NextResponse.json({ users, total });

// ✗ Avoid - Unnecessary wrapping
return NextResponse.json({ success: true, data: user });
```

### Success Responses
```typescript
// GET - Return resource directly
return NextResponse.json(resource);

// POST - Return created resource with 201 status
return NextResponse.json(newResource, { status: 201 });

// PUT - Return updated resource
return NextResponse.json(updatedResource);

// DELETE - Simple confirmation
return NextResponse.json({ deleted: true });
// OR just status
return new NextResponse(null, { status: 204 });

// Operations with side effects
return NextResponse.json({ ok: true });
```

### Request Validation with Zod

<ai-rules category="validation">
  <rule id="zod-validation" priority="critical">
    <condition>Processing request body or query params</condition>
    <action>ALWAYS validate with Zod schema before use</action>
    <validation>Schema.parse() called before data usage</validation>
  </rule>
  
  <rule id="schema-location" priority="high">
    <condition>Creating validation schemas</condition>
    <action>Place in /lib/schemas/ or /schemas/ directory</action>
    <validation>Import path includes 'schemas'</validation>
  </rule>
</ai-rules>

<code-template id="zod-schema-basic">
  <description>Basic Zod schema for request validation</description>
  <variables>
    <var name="MODEL_NAME" type="string" example="User" />
    <var name="FIELD_NAME" type="string" example="email" />
  </variables>
  <template>
const create${MODEL_NAME}Schema = z.object({
    name: z.string().min(1, 'Name is required').max(100),
    email: z.string().email('Invalid email format'),
    role: z.enum(['admin', 'user', 'guest']),
    ${FIELD_NAME}: z.string().optional()
});

export type Create${MODEL_NAME}Input = z.infer<typeof create${MODEL_NAME}Schema>;
  </template>
</code-template>

```typescript
// Define schema with Zod
const createUserSchema = z.object({
    name: z.string().min(1).max(100),
    email: z.string().email(),
    role: z.enum(['admin', 'user', 'guest']),
    age: z.number().min(18).optional()
});

// Validate in route handler
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validatedData = createUserSchema.parse(body);
        
        // Use validatedData safely
        const user = await prisma.user.create({
            data: validatedData
        });
        
        return NextResponse.json(user, { status: 201 });
    } catch (error) {
        return handleError(error);
    }
}
```

## Error Response Standards

### Error Response Format
Always return errors with consistent structure:
```typescript
{
    error: "Error message string"
}

// With validation details
{
    error: "Validation failed",
    details: [
        {
            path: ["email"],
            message: "Invalid email format"
        }
    ]
}
```

### Centralized Error Handler with Sentry
```typescript
// utils/api/handleError.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import * as Sentry from '@sentry/nextjs';

export function handleError(error: unknown): NextResponse {
    console.error('API Error:', error);
    
    // Add Sentry context
    Sentry.withScope((scope) => {
        scope.setLevel('error');
        scope.setContext('error_details', {
            type: error?.constructor?.name,
            message: error instanceof Error ? error.message : 'Unknown error',
        });
        Sentry.captureException(error);
    });
    
    if (error instanceof z.ZodError) {
        return NextResponse.json(
            { 
                error: 'Validation failed',
                details: error.errors 
            },
            { status: 400 }
        );
    }
    
    if (error instanceof Error) {
        return NextResponse.json(
            { error: error.message },
            { status: 400 }
        );
    }
    
    return NextResponse.json(
        { error: 'Internal Server Error' },
        { status: 500 }
    );
}
```

### Status Codes
- **200**: Success (GET, PUT)
- **201**: Created (POST)
- **204**: No Content (DELETE)
- **400**: Client errors (validation, bad request)
- **401**: Unauthenticated
- **403**: Unauthorized (authenticated but no permission)
- **404**: Resource not found
- **500**: Server errors (avoid exposing details)

## Type Safety Standards

### Response Type Definitions
Export response types for use with React Query:

```typescript
// app/api/users/types.ts
import { User, Prisma } from '@prisma/client';

export type GetUsersResponse = User[];

export type GetUserResponse = Prisma.UserGetPayload<{
    include: { 
        profile: true,
        posts: {
            select: {
                id: true,
                title: true,
                published: true
            }
        }
    }
}>;

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
```

### Type Organization
```
/app/api/              # API routes
/lib/schemas/          # Zod schemas
/lib/types/            # Shared types
/prisma/               # Prisma schema and types
```

### Using Types in Client Components
```typescript
'use client';

import { useQuery } from '@tanstack/react-query';
import type { GetUsersResponse } from '@/app/api/users/types';

export function UsersList() {
    const { data: users } = useQuery<GetUsersResponse>({
        queryKey: ['users'],
        queryFn: async () => {
            const response = await fetch('/api/users');
            if (!response.ok) throw new Error('Failed to fetch');
            return response.json();
        }
    });
    
    // TypeScript knows users is User[] | undefined
}
```

## Authentication & Authorization

### NextAuth.js Integration
```typescript
// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

// Protect routes with middleware
async function withAuth(
    request: NextRequest,
    handler: (req: NextRequest, session: any) => Promise<NextResponse>
) {
    const session = await getServerSession(authOptions);
    
    if (!session) {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        );
    }
    
    return handler(request, session);
}

// Role-based authorization
async function withRole(
    request: NextRequest,
    requiredRole: string,
    handler: (req: NextRequest, session: any) => Promise<NextResponse>
) {
    const session = await getServerSession(authOptions);
    
    if (!session) {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        );
    }
    
    if (session.user.role !== requiredRole) {
        return NextResponse.json(
            { error: 'Forbidden' },
            { status: 403 }
        );
    }
    
    return handler(request, session);
}
```

## Pagination Standards

### Page-Based Pagination
```typescript
// API implementation
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get('page') || '0');
    const pageSize = Number(searchParams.get('pageSize') || '20');
    
    const [items, total] = await Promise.all([
        prisma.resource.findMany({
            take: pageSize,
            skip: page * pageSize,
            orderBy: { createdAt: 'desc' }
        }),
        prisma.resource.count()
    ]);
    
    return NextResponse.json({
        items,
        pagination: {
            page,
            pageSize,
            total,
            totalPages: Math.ceil(total / pageSize)
        }
    });
}
```

## File Upload Patterns

### Multipart Form Handling
```typescript
// app/api/upload/route.ts
export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        
        if (!file) {
            throw new Error('No file provided');
        }
        
        // Validate file
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            throw new Error('File too large');
        }
        
        // Convert to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        // Upload to S3 or save locally
        const url = await uploadToS3(buffer, file.name);
        
        return NextResponse.json({
            filename: file.name,
            url,
            size: file.size
        });
    } catch (error) {
        return handleError(error);
    }
}
```

## Performance Patterns

### Redis Caching with Prisma
```typescript
// lib/cache.ts
import { redis } from '@/lib/redis';

export async function getCachedData<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = 300 // 5 minutes default
): Promise<T> {
    // Try cache first
    const cached = await redis.get(key);
    if (cached) {
        return JSON.parse(cached);
    }
    
    // Fetch fresh data
    const data = await fetcher();
    
    // Cache it
    await redis.setex(key, ttl, JSON.stringify(data));
    
    return data;
}

// Usage in API route
export async function GET(request: NextRequest) {
    try {
        const users = await getCachedData(
            'users:all',
            () => prisma.user.findMany({
                where: { active: true },
                orderBy: { createdAt: 'desc' }
            }),
            600 // 10 minutes
        );
        
        return NextResponse.json(users);
    } catch (error) {
        return handleError(error);
    }
}

// Cache invalidation
export async function invalidateUserCache() {
    const keys = await redis.keys('users:*');
    if (keys.length > 0) {
        await redis.del(...keys);
    }
}
```

### Rate Limiting
```typescript
// middleware/rateLimit.ts
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

// Usage in API route
export async function POST(request: NextRequest) {
    const ip = request.ip || 'unknown';
    const { success, remaining } = await rateLimit(`api:users:${ip}`, 5, 60);
    
    if (!success) {
        return NextResponse.json(
            { error: 'Rate limit exceeded' },
            { 
                status: 429,
                headers: {
                    'X-RateLimit-Remaining': remaining.toString(),
                    'X-RateLimit-Reset': new Date(Date.now() + 60000).toISOString()
                }
            }
        );
    }
    
    // Continue with request...
}
```

## Middleware Patterns

### Reusable Middleware Functions
```typescript
// lib/api/middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

export const middleware = {
    // Authentication check
    auth: async (request: NextRequest) => {
        const session = await getServerSession(authOptions);
        if (!session) {
            throw new Error('Unauthorized');
        }
        return session;
    },
    
    // Rate limiting
    rateLimit: async (request: NextRequest, key: string) => {
        const count = await redis.incr(key);
        await redis.expire(key, 60); // 1 minute window
        
        if (count > 100) { // 100 requests per minute
            throw new Error('Rate limit exceeded');
        }
    },
    
    // Validation
    validate: <T>(schema: z.ZodSchema<T>, data: unknown): T => {
        return schema.parse(data);
    },
    
    // CORS
    cors: (request: NextRequest, response: NextResponse) => {
        response.headers.set('Access-Control-Allow-Origin', '*');
        response.headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        return response;
    }
};
```

## Environment Variables

### Naming Convention
- **Client-visible**: `NEXT_PUBLIC_*`
- **Server-only**: Standard names without prefix
- **Required variables**:
  ```env
  # Authentication
  NEXTAUTH_URL=
  NEXTAUTH_SECRET=
  
  # Database
  DATABASE_URL=
  
  # Redis
  REDIS_URL=
  
  # External Services
  AWS_ACCESS_KEY_ID=
  AWS_SECRET_ACCESS_KEY=
  AWS_S3_BUCKET=
  
  # Sentry
  SENTRY_DSN=
  NEXT_PUBLIC_SENTRY_DSN=
  
  # OAuth Providers
  GOOGLE_CLIENT_ID=
  GOOGLE_CLIENT_SECRET=
  ```

## Migration Notes

When migrating from `next-connect` to native Next.js handlers:

1. **Replace router pattern**: Use individual export functions (GET, POST, etc.)
2. **Update middleware**: Create custom wrapper functions instead of `.use()`
3. **Error handling**: Use try/catch with centralized error handler
4. **Request parsing**: Use `request.json()` instead of `req.body`
5. **Query params**: Use `new URL(request.url).searchParams`
6. **Response format**: Use `NextResponse.json()` instead of `res.json()`

## Examples Repository

Reference implementations:
- **Basic CRUD**: `/app/api/users/route.ts`
- **Nested resources**: `/app/api/users/[userId]/orders/route.ts`
- **File uploads**: `/app/api/upload/route.ts`
- **Webhooks**: `/app/api/webhooks/stripe/route.ts`
- **Public endpoints**: `/app/api/public/health/route.ts`

<validation-schema for="api-route">
  <check id="file-location">
    <pattern>^/app/api/.*/route\.ts$</pattern>
    <message>API routes must be in /app/api/ with route.ts filename</message>
  </check>
  
  <check id="exports">
    <pattern>export (async )?function (GET|POST|PUT|DELETE|PATCH)</pattern>
    <message>Must export named HTTP method functions</message>
  </check>
  
  <check id="imports">
    <required>NextRequest, NextResponse from 'next/server'</required>
    <forbidden>next-connect</forbidden>
  </check>
  
  <check id="validation">
    <pattern>\.parse\(|\.safeParse\(</pattern>
    <message>Must use Zod validation for request data</message>
  </check>
  
  <check id="error-handling">
    <pattern>handleError|catch</pattern>
    <message>Must handle errors with try/catch or error handler</message>
  </check>
</validation-schema>

<ai-decision-tree id="api-implementation">
  <question>Does the endpoint need authentication?</question>
  <yes>
    <question>Does it need role-based access?</question>
    <yes>
      <answer>Use withRole middleware</answer>
      <template>api-route-with-role</template>
    </yes>
    <no>
      <answer>Use withAuth middleware</answer>
      <template>api-route-basic</template>
    </no>
  </yes>
  <no>
    <question>Is it a webhook endpoint?</question>
    <yes>
      <answer>Place in /app/api/webhooks/</answer>
      <template>webhook-route</template>
    </yes>
    <no>
      <answer>Place in /app/api/public/</answer>
      <template>public-route</template>
    </no>
  </no>
</ai-decision-tree>