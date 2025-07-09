---
id: "100"
name: "pattern-error-handling"
type: "pattern"
dependencies: ["001-setup-nextjs-project"]
estimated_lines: 200
priority: "high"
---

# Pattern: Global Error Handling

## Overview
Establish a consistent error handling pattern across the application including error boundaries for React components, API error responses, and centralized error logging.

## Technical Requirements
- Create custom error classes for different error types
- Implement React error boundary component
- Define standardized API error response format
- Create error logging utility
- Set up user-friendly error pages
- Implement automatic error recovery where possible

## Acceptance Criteria
- [ ] Custom error classes created for validation, auth, and system errors
- [ ] Global error boundary catches and displays React errors gracefully
- [ ] API routes return consistent error format
- [ ] Errors are logged with appropriate context
- [ ] 404 and 500 error pages created
- [ ] Validation errors include field-specific messages

## Implementation Notes

### 1. Create Error Classes
Create `lib/errors.ts`:
```typescript
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code: string,
    public isOperational = true
  ) {
    super(message)
    Object.setPrototypeOf(this, AppError.prototype)
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public fields?: Record<string, string>) {
    super(message, 400, 'VALIDATION_ERROR')
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401, 'AUTH_ERROR')
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, 'NOT_FOUND')
  }
}
```

### 2. Create Error Boundary
Create `components/error-boundary.tsx`:
```typescript
"use client"

import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
    // Log to error reporting service
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="error-container">
          <h2>Something went wrong</h2>
          <details>
            <summary>Error details</summary>
            <pre>{this.state.error?.message}</pre>
          </details>
        </div>
      )
    }

    return this.props.children
  }
}
```

### 3. API Error Handler
Create `lib/api-error-handler.ts`:
```typescript
import { NextResponse } from 'next/server'
import { AppError } from './errors'

export function handleApiError(error: unknown) {
  console.error('API Error:', error)

  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: {
          message: error.message,
          code: error.code,
          ...(error instanceof ValidationError && error.fields && {
            fields: error.fields
          })
        }
      },
      { status: error.statusCode }
    )
  }

  // Handle Prisma errors
  if (error instanceof Error && error.message.includes('P2002')) {
    return NextResponse.json(
      {
        error: {
          message: 'A record with this value already exists',
          code: 'DUPLICATE_ERROR'
        }
      },
      { status: 409 }
    )
  }

  // Generic error
  return NextResponse.json(
    {
      error: {
        message: 'An unexpected error occurred',
        code: 'INTERNAL_ERROR'
      }
    },
    { status: 500 }
  )
}
```

### 4. Create Error Pages
- `app/error.tsx` - Client error boundary
- `app/not-found.tsx` - 404 page
- `app/api/[...]/route.ts` - Wrap handlers with try-catch

### 5. Error Recovery Strategies
- File validation: Retry with exponential backoff
- Render failures: Automatic retry up to 3 times
- Network errors: Show retry button to user
- Database errors: Log and alert admin

## Examples to Reference
- Next.js error handling documentation
- React error boundaries guide
- REST API error response standards

## Documentation Links
- [Next.js Error Handling](https://nextjs.org/docs/app/building-your-application/routing/error-handling)
- [React Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)

## Out of Scope
- External error monitoring service integration
- Detailed error analytics
- Error recovery UI components