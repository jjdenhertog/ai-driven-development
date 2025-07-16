---
id: "101"
name: "pattern-error-handling"
type: "pattern"
dependencies: ["001", "003"]
estimated_lines: 250
priority: "high"
---

# Pattern: Global Error Handling

## Overview
Implement comprehensive error handling patterns including React error boundaries, API error responses, async error catching, and user-friendly error messages. This ensures graceful failure handling throughout the application.

Creating task because concept states at line 379-386: "Error Handling Philosophy" with multiple error categories, and pattern will be used in: API routes (line 381-386), validation errors (line 381), render crashes (line 382), system errors (line 385).

## User Stories
- As a user, I want to see helpful error messages when something goes wrong
- As a developer, I want consistent error handling so debugging is easier
- As a system admin, I want errors logged properly for monitoring

## Technical Requirements
- Global error boundary for React components
- Consistent API error response format
- Async error handling utilities
- User-friendly error messages
- Error logging with Sentry integration
- Development vs production error details
- Retry mechanisms for transient failures

## Acceptance Criteria
- [ ] Global error boundary component created
- [ ] API error response utilities implemented
- [ ] Async try-catch wrapper utilities
- [ ] Error translation for user messages
- [ ] Sentry error reporting configured
- [ ] Development error details preserved
- [ ] Retry logic for specific error types
- [ ] Error recovery UI components
- [ ] Comprehensive error type definitions

## Testing Requirements

### Test Coverage Target
- Error boundary: 100% coverage
- Error utilities: 100% coverage
- Retry mechanisms: 90% coverage

### Required Test Types
- **Unit Tests**: Error formatters, retry logic, error predicates
- **Component Tests**: Error boundary UI, error recovery flows
- **Integration Tests**: End-to-end error handling

### Test Scenarios
#### Happy Path
- [ ] Errors caught and displayed properly
- [ ] Retry mechanisms work on transient failures
- [ ] Error boundaries reset successfully

#### Error Handling
- [ ] Nested errors handled correctly
- [ ] Async errors caught properly
- [ ] Network errors retry appropriately
- [ ] Unknown errors logged to Sentry

## Implementation Notes
- Follow error categories from concept specification
- Implement automatic retry with exponential backoff
- Preserve stack traces in development
- Sanitize error messages in production
- Include correlation IDs for tracking

## Pattern Structure

```typescript
// components/ErrorBoundary.tsx
export class ErrorBoundary extends React.Component {
  static getDerivedStateFromError(error: Error)
  componentDidCatch(error: Error, errorInfo: ErrorInfo)
}

// lib/errors/api-errors.ts
export class ValidationError extends ApiError
export class AuthenticationError extends ApiError
export class NotFoundError extends ApiError
export class RateLimitError extends ApiError

// lib/errors/handlers.ts
export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  options?: ErrorHandlingOptions
): Promise<T>

// lib/errors/retry.ts
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions
): Promise<T>

// Error categories from concept
enum ErrorCategory {
  VALIDATION = 'validation',     // Return immediately
  TEMPORARY = 'temporary',       // Retry with backoff
  FATAL = 'fatal',              // Mark failed, notify
  SYSTEM = 'system'             // Alert admin
}
```

## Examples to Reference
- `.aidev-worktree/preferences/technology-stack.md` for Sentry configuration
- Standard Next.js error handling patterns
- React Error Boundary documentation

## Documentation Links
- [React Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [Next.js Error Handling](https://nextjs.org/docs/app/building-your-application/routing/error-handling)
- [Sentry Next.js Guide](https://docs.sentry.io/platforms/javascript/guides/nextjs/)

## Potential Gotchas
- Error boundaries don't catch async errors
- Server component errors need special handling
- Some errors shouldn't be retried
- Stack traces can leak sensitive info

## Out of Scope
- Custom error tracking system
- Error analytics dashboard
- A/B testing error messages
- Localized error messages
- Error replay functionality

## Testing Notes
- Simulate various error types
- Test error boundary reset
- Verify Sentry integration
- Check retry limit enforcement