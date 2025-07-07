# API Patterns Guide

This guide contains detailed API patterns and conventions from mypreferences/api.md

## Custom Middleware Helper Pattern

```typescript
// Always use this pattern for protected routes
async function withAuth(
  request: NextRequest,
  handler: (req: NextRequest, session: any) => Promise<NextResponse>
) {
  const session = await getServerSession(authOptions);
  
  if (!session) 
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  return handler(request, session);
}

// Role-based authorization
async function withRole(
  request: NextRequest,
  requiredRole: string,
  handler: (req: NextRequest, session: any) => Promise<NextResponse>
) {
  const session = await getServerSession(authOptions);
  
  if (!session)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  if (session.user.role !== requiredRole)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  
  return handler(request, session);
}
```

## Centralized Error Handler with Sentry

```typescript
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
  
  if (error instanceof z.ZodError)
    return NextResponse.json({ 
      error: 'Validation failed',
      details: error.errors 
    }, { status: 400 });
  
  if (error instanceof Error)
    return NextResponse.json({ error: error.message }, { status: 400 });
  
  return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
}
```

## Response Format Standards

```typescript
// ✅ Good - Direct data response
return NextResponse.json(user);
return NextResponse.json({ users, total });

// ❌ Avoid - Unnecessary wrapping
return NextResponse.json({ success: true, data: user });

// Standard responses by operation
// GET
return NextResponse.json(resource);

// POST
return NextResponse.json(newResource, { status: 201 });

// PUT
return NextResponse.json(updatedResource);

// DELETE
return NextResponse.json({ deleted: true });
// OR
return new NextResponse(null, { status: 204 });
```

## Caching with Redis and Prisma

```typescript
export async function getCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 300 // 5 minutes default
): Promise<T> {
  const cached = await redis.get(key);
  if (cached)
    return JSON.parse(cached);
  
  const data = await fetcher();
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
```

## Cache Invalidation Patterns

```typescript
// After mutations, always invalidate relevant caches
export async function invalidateUserCache(userId?: string) {
  const keys = ['users:*'];
  
  if (userId) {
    keys.push(`user:${userId}`);
    keys.push(`users:${userId}:*`);
  }
  
  for (const pattern of keys) {
    const matchingKeys = await redis.keys(pattern);
    if (matchingKeys.length > 0)
      await redis.del(...matchingKeys);
  }
}

// In mutation endpoints
await invalidateUserCache(user.id);
```

## Rate Limiting Implementation

```typescript
export async function rateLimit(
  identifier: string,
  limit: number = 10,
  window: number = 60
): Promise<{ success: boolean; remaining: number }> {
  const key = `rate_limit:${identifier}`;
  const current = await redis.incr(key);
  
  if (current === 1)
    await redis.expire(key, window);
  
  return {
    success: current <= limit,
    remaining: Math.max(0, limit - current)
  };
}

// Usage in API route
export async function POST(request: NextRequest) {
  const ip = request.ip || 'unknown';
  const { success, remaining } = await rateLimit(`api:users:${ip}`, 5, 60);
  
  if (!success)
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
  
  // Continue with request...
}
```

## Pagination Pattern

```typescript
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

## File Upload Pattern

```typescript
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file)
      throw new Error('No file provided');
    
    // Validate file
    if (file.size > 5 * 1024 * 1024) // 5MB limit
      throw new Error('File too large');
    
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