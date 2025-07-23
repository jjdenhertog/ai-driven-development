---
id: "101"
name: "create-api-error-handler"
type: "pattern"
dependencies: ["004-install-core-dependencies"]
estimated_lines: 100
priority: "critical"
---

# Pattern: API Error Handler

## Description
Create a reusable error handling pattern for all API routes that provides consistent error responses and optional Sentry integration.

## Pattern Requirements
- Consistent error response format
- Proper HTTP status codes
- Error logging capability
- TypeScript type safety
- Sentry integration ready
- Development vs production behavior

## Implementation
Create a 80-100 line pattern that demonstrates:
```typescript
// utils/api-errors.ts
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public details?: any
  ) {
    super(message)
  }
}

export function handleApiError(error: unknown): NextResponse {
  // Pattern implementation for error handling
  // Includes Sentry reporting in production
  // Returns consistent error format
}
```

## Test Specifications
```yaml
pattern_tests:
  - scenario: "Validation error"
    input: "ApiError(400, 'Invalid input')"
    expected_status: 400
    expected_body: { error: "Invalid input", code: "BAD_REQUEST" }
  
  - scenario: "Not found error"
    input: "ApiError(404, 'Resource not found')"
    expected_status: 404
    expected_body: { error: "Resource not found", code: "NOT_FOUND" }
  
  - scenario: "Unknown error"
    input: "new Error('Unexpected')"
    expected_status: 500
    expected_body: { error: "Internal server error", code: "INTERNAL_ERROR" }
    
  - scenario: "Prisma error"
    input: "PrismaClientKnownRequestError"
    expected_status: 400
    expected_body: { error: "Database error", code: "DATABASE_ERROR" }
```

## Usage Examples
Show 3+ places this pattern will be used:
1. `/api/auth/login` - Handle authentication errors
2. `/api/jobs/[id]` - Handle job not found
3. `/api/admin/users` - Handle permission errors
4. All API routes for consistent error handling

## Code Reuse
- Import in every API route handler
- Wrap route logic in try/catch
- Use as: `catch (error) { return handleApiError(error) }`

## Documentation Links
- [Next.js Error Handling](https://nextjs.org/docs/app/building-your-application/routing/error-handling)
- [Sentry Next.js](https://docs.sentry.io/platforms/javascript/guides/nextjs/)

## Potential Gotchas
- Different error details in dev vs production
- Sentry needs proper initialization
- Some errors shouldn't be logged

## Testing Notes
- Test all error types
- Verify Sentry integration
- Check error format consistency