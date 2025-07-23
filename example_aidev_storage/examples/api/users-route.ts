import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';
import { z } from 'zod';

// Always define Zod schemas for validation
const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
  role: z.enum(['admin', 'user', 'guest']).default('user'),
  active: z.boolean().default(true),
});

const updateUserSchema = createUserSchema.partial();

// Type inference from Zod schema
type CreateUserInput = z.infer<typeof createUserSchema>;
type UpdateUserInput = z.infer<typeof updateUserSchema>;

// GET /api/users - List all users with caching
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Try cache first
    const cached = await redis.get('users:all');
    if (cached)
      return NextResponse.json(JSON.parse(cached));

    // Fetch from database
    const users = await prisma.user.findMany({
      where: { active: true },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        createdAt: true,
      },
    });

    // Cache for 5 minutes
    await redis.setex('users:all', 300, JSON.stringify(users));

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/users - Create new user
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Only admins can create users
    if (session.user.role !== 'admin')
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await request.json();
    const validatedData = createUserSchema.parse(body);

    // Check if email already exists
    const existing = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existing)
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 });

    // Create user
    const user = await prisma.user.create({
      data: {
        ...validatedData,
        createdBy: session.user.id,
      },
    });

    // Invalidate cache
    await redis.del('users:all');

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError)
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });

    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Helper function for rate limiting
async function checkRateLimit(identifier: string) {
  const key = `rate_limit:api:users:${identifier}`;
  const count = await redis.incr(key);
  
  if (count === 1)
    await redis.expire(key, 60);
  
  return count <= 10; // 10 requests per minute
}