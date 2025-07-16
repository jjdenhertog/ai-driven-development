// app/api/products/route.ts
// Example API route following your preferences: Zod validation, Redis caching, proper error handling

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';
import { z } from 'zod';
import * as Sentry from '@sentry/nextjs';

// Zod schemas for validation (always define before component/handler)
const createProductSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional(),
  price: z.number().positive('Price must be positive'),
  stock: z.number().int().min(0, 'Stock cannot be negative'),
  category: z.enum(['electronics', 'clothing', 'food', 'books', 'other']),
  tags: z.array(z.string()).optional(),
  active: z.boolean().default(true),
});

const updateProductSchema = createProductSchema.partial();

const queryParamsSchema = z.object({
  page: z.coerce.number().int().min(0).default(0),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  category: z.enum(['electronics', 'clothing', 'food', 'books', 'other']).optional(),
  sortBy: z.enum(['name', 'price', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Type inference from schemas
type CreateProductInput = z.infer<typeof createProductSchema>;
type UpdateProductInput = z.infer<typeof updateProductSchema>;
type QueryParams = z.infer<typeof queryParamsSchema>;

// Custom error handler following your patterns
function handleError(error: unknown): NextResponse {
  console.error('API Error:', error);
  
  // Sentry integration
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

// Helper for rate limiting (following your Redis patterns)
async function checkRateLimit(identifier: string): Promise<{ success: boolean; remaining: number }> {
  const key = `rate_limit:api:products:${identifier}`;
  const count = await redis.incr(key);
  
  if (count === 1) {
    await redis.expire(key, 60); // 1 minute window
  }
  
  const limit = 30; // 30 requests per minute
  return {
    success: count <= limit,
    remaining: Math.max(0, limit - count),
  };
}

// Caching helper (following your Redis patterns)
async function getCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 300 // 5 minutes default
): Promise<T> {
  try {
    const cached = await redis.get(key);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (error) {
    console.warn('Cache read error:', error);
  }
  
  const data = await fetcher();
  
  try {
    await redis.setex(key, ttl, JSON.stringify(data));
  } catch (error) {
    console.warn('Cache write error:', error);
  }
  
  return data;
}

// Cache invalidation helper
async function invalidateProductCache(productId?: string) {
  const keys: string[] = ['products:*'];
  
  if (productId) {
    keys.push(`product:${productId}`);
  }
  
  for (const pattern of keys) {
    const matchingKeys = await redis.keys(pattern);
    if (matchingKeys.length > 0) {
      await redis.del(...matchingKeys);
    }
  }
}

// GET /api/products - List products with caching and pagination
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const params = queryParamsSchema.parse({
      page: searchParams.get('page'),
      pageSize: searchParams.get('pageSize'),
      search: searchParams.get('search'),
      category: searchParams.get('category'),
      sortBy: searchParams.get('sortBy'),
      sortOrder: searchParams.get('sortOrder'),
    });

    // Build cache key
    const cacheKey = `products:${JSON.stringify(params)}`;

    // Try to get from cache
    const cachedResult = await getCachedData(
      cacheKey,
      async () => {
        // Build where clause
        const where: any = { active: true };
        
        if (params.search) {
          where.OR = [
            { name: { contains: params.search, mode: 'insensitive' } },
            { description: { contains: params.search, mode: 'insensitive' } },
          ];
        }
        
        if (params.category) {
          where.category = params.category;
        }

        // Execute queries in parallel
        const [products, total] = await Promise.all([
          prisma.product.findMany({
            where,
            take: params.pageSize,
            skip: params.page * params.pageSize,
            orderBy: { [params.sortBy]: params.sortOrder },
            select: {
              id: true,
              name: true,
              description: true,
              price: true,
              stock: true,
              category: true,
              tags: true,
              active: true,
              createdAt: true,
              updatedAt: true,
            },
          }),
          prisma.product.count({ where }),
        ]);

        return {
          products,
          pagination: {
            page: params.page,
            pageSize: params.pageSize,
            total,
            totalPages: Math.ceil(total / params.pageSize),
          },
        };
      },
      300 // 5 minutes cache
    );

    return NextResponse.json(cachedResult);
  } catch (error) {
    return handleError(error);
  }
}

// POST /api/products - Create new product
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting
    const { success, remaining } = await checkRateLimit(session.user.id);
    if (!success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': new Date(Date.now() + 60000).toISOString(),
          },
        }
      );
    }

    // Only admins can create products
    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = createProductSchema.parse(body);

    // Check for duplicate name
    const existing = await prisma.product.findFirst({
      where: { 
        name: validatedData.name,
        active: true,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Product with this name already exists' },
        { status: 409 }
      );
    }

    // Create product with audit fields
    const product = await prisma.product.create({
      data: {
        ...validatedData,
        createdBy: session.user.id,
        updatedBy: session.user.id,
      },
    });

    // Invalidate cache
    await invalidateProductCache();

    // Log activity (following your patterns)
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'CREATE_PRODUCT',
        entityType: 'product',
        entityId: product.id,
        metadata: { productName: product.name },
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}

// PUT /api/products - Bulk update products
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admins can bulk update
    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    
    // Validate bulk update data
    const bulkUpdateSchema = z.object({
      ids: z.array(z.string()).min(1, 'At least one ID required'),
      data: updateProductSchema,
    });
    
    const { ids, data } = bulkUpdateSchema.parse(body);

    // Use transaction for bulk update
    const updated = await prisma.$transaction(async (tx) => {
      // Verify all products exist
      const products = await tx.product.findMany({
        where: { id: { in: ids } },
      });

      if (products.length !== ids.length) {
        throw new Error('Some products not found');
      }

      // Update all products
      const updatePromises = ids.map(id =>
        tx.product.update({
          where: { id },
          data: {
            ...data,
            updatedBy: session.user.id,
            updatedAt: new Date(),
          },
        })
      );

      return Promise.all(updatePromises);
    });

    // Invalidate cache
    await invalidateProductCache();

    return NextResponse.json({
      updated: updated.length,
      products: updated,
    });
  } catch (error) {
    return handleError(error);
  }
}

// Example of a specific product route handler
// app/api/products/[id]/route.ts would handle individual product operations