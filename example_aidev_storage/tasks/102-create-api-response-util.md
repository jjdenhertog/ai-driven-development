---
id: "102"
name: "create-api-response-util"
type: "pattern"
dependencies: ["001-init-nextjs-project"]
estimated_lines: 80
priority: "high"
---

# Pattern: API Response Utility

## Description
Create a utility for consistent API response formatting across all endpoints, including support for pagination and metadata.

## Pattern Requirements
- Consistent success response format
- TypeScript generics for type safety
- Pagination metadata support
- Optional meta fields
- NextResponse integration

## Implementation
Create a 60-80 line pattern that demonstrates:
```typescript
// utils/api-response.ts
interface ApiResponseOptions<T> {
  data: T
  meta?: {
    total?: number
    page?: number
    pageSize?: number
    [key: string]: any
  }
  status?: number
}

export function apiResponse<T>(options: ApiResponseOptions<T>): NextResponse {
  // Pattern implementation
  // Returns consistent success format
}
```

## Test Specifications
```yaml
pattern_tests:
  - scenario: "Simple data response"
    input: { data: { id: 1, name: "Test" } }
    expected_status: 200
    expected_body: { success: true, data: { id: 1, name: "Test" } }
  
  - scenario: "Array with pagination"
    input: 
      data: [{ id: 1 }, { id: 2 }]
      meta: { total: 10, page: 1, pageSize: 2 }
    expected_status: 200
    expected_body: 
      success: true
      data: [{ id: 1 }, { id: 2 }]
      meta: { total: 10, page: 1, pageSize: 2 }
  
  - scenario: "Empty response"
    input: { data: null }
    expected_status: 200
    expected_body: { success: true, data: null }
```

## Usage Examples
Show 3+ places this pattern will be used:
1. `/api/jobs` - Return list of jobs with pagination
2. `/api/users/me` - Return user profile data
3. `/api/admin/stats` - Return dashboard statistics
4. All successful API responses

## Code Reuse
- Import in all API route handlers
- Use for all successful responses
- Ensures consistent client-side parsing

## Documentation Links
- [Next.js Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

## Potential Gotchas
- Don't use for error responses
- Status defaults to 200
- Meta fields are optional

## Testing Notes
- Test with various data types
- Verify TypeScript inference works
- Check response headers