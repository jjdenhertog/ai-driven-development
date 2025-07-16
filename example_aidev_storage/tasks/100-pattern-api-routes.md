---
id: "100"
name: "pattern-api-routes"
type: "pattern"
dependencies: ["001", "004"]
estimated_lines: 300
priority: "high"
---

# Pattern: API Route Architecture

## Overview
Establish a consistent pattern for building API routes in Next.js App Router with proper error handling, validation, authentication, and response formatting. This pattern will be used across all API endpoints in the render manager.

Creating task because concept states multiple API endpoints at lines 269-320 and pattern will be used in: /api/jobs routes (lines 269-290), /api/system routes (lines 293-304), /api/user routes (lines 307-320).

## User Stories
- As a developer, I want consistent API patterns so that endpoints are predictable and maintainable
- As an API consumer, I want consistent error responses so that I can handle them properly

## Technical Requirements
- Zod schema validation for all inputs
- Consistent error response format
- Authentication middleware for protected routes
- Rate limiting capability
- Proper HTTP status codes
- TypeScript type safety throughout
- Request/response logging

## Acceptance Criteria
- [ ] Base API handler utilities created
- [ ] Authentication middleware implemented
- [ ] Validation middleware using Zod
- [ ] Error handling utilities with consistent format
- [ ] Rate limiting utility created
- [ ] Example API routes demonstrating patterns
- [ ] Type-safe request/response handling
- [ ] API documentation generated from schemas
- [ ] All utilities have proper tests

## Testing Requirements

### Test Coverage Target
- API utilities: 100% coverage
- Middleware functions: 100% coverage
- Example routes: 80% coverage

### Required Test Types
- **Unit Tests**: Validation functions, error formatters, auth checks
- **Integration Tests**: Complete API route flows
- **E2E Tests**: API endpoint accessibility

### Test Scenarios
#### Happy Path
- [ ] Valid requests processed successfully
- [ ] Authentication passes for valid tokens
- [ ] Validation accepts correct data

#### Error Handling
- [ ] Invalid input returns 400 with details
- [ ] Unauthorized requests return 401
- [ ] Rate limited requests return 429
- [ ] Server errors return 500 with safe message

## Implementation Notes
- Follow API patterns from `.aidev-worktree/preferences/api.md`
- Use Next.js App Router route handlers
- Implement proper CORS handling
- Include request ID for tracing
- Log all API calls for debugging

## Pattern Structure

```typescript
// lib/api/base-handler.ts
export function createApiHandler<TInput, TOutput>(config: {
  schema?: ZodSchema<TInput>;
  authenticate?: boolean | 'optional';
  rateLimit?: { window: number; max: number };
  handler: (req: ApiRequest<TInput>) => Promise<TOutput>;
})

// lib/api/errors.ts
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: any
  )
}

// lib/api/middleware.ts
export const authenticate = (required: boolean)
export const validateBody = (schema: ZodSchema)
export const rateLimit = (options: RateLimitOptions)

// Example usage in route
export const POST = createApiHandler({
  schema: createJobSchema,
  authenticate: true,
  rateLimit: { window: 60, max: 10 },
  handler: async (req) => {
    const job = await createJob(req.body);
    return { success: true, data: job };
  }
});
```

## Examples to Reference
- `.aidev-worktree/preferences/api.md` for API design patterns
- `.aidev-worktree/examples/api/products-route.ts` for route structure
- `.aidev-worktree/examples/api/users-route.ts` for authentication patterns

## Documentation Links
- [Next.js Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Zod Documentation](https://zod.dev/)
- [NextAuth.js API Routes](https://next-auth.js.org/getting-started/rest-api)

## Potential Gotchas
- App Router uses Web Request/Response APIs
- Middleware runs differently than Pages Router
- Type inference with Zod requires careful setup
- Rate limiting needs Redis for production

## Out of Scope
- GraphQL implementation
- WebSocket handling
- File upload patterns
- Streaming responses
- API versioning

## Testing Notes
- Mock authentication for tests
- Use supertest-like patterns
- Test rate limiting with time mocking
- Verify error response formats