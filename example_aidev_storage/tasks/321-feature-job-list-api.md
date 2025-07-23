---
id: "321"
name: "feature-job-list-api"
type: "feature"
dependencies: ["300", "200"]
estimated_lines: 120
priority: "high"
---

# Feature: Job List API Endpoint

## Description
Create GET /api/jobs endpoint to retrieve paginated job list with filtering and sorting options.

## Acceptance Criteria
- [ ] Return jobs for authenticated user
- [ ] Admins can see all jobs
- [ ] Support status filtering
- [ ] Support cursor-based pagination
- [ ] Sort by date or priority
- [ ] Include user info in response

## API Specification
```yaml
endpoint:
  method: GET
  path: /api/jobs
  auth: Session required
  query:
    - status?: JobStatus | "all"
    - cursor?: string # For pagination
    - limit?: number # Default 50, max 100
    - sort?: "date" | "priority" # Default "date"
    - order?: "asc" | "desc" # Default "desc"
  
  response:
    200:
      jobs: Job[]
      nextCursor: string | null
      hasMore: boolean
      total: number
```

## Implementation
```typescript
// Cursor-based pagination for infinite scroll
const getJobs = async (params: JobQueryParams) => {
  const where = {
    ...(params.status \!== 'all' && { status: params.status }),
    ...(params.cursor && { id: { lt: params.cursor } }),
    ...(\!isAdmin && { userId: session.user.id })
  };
  
  const jobs = await prisma.job.findMany({
    where,
    take: params.limit + 1,
    orderBy: params.sort === 'priority' 
      ? [{ priority: 'desc' }, { createdAt: 'desc' }]
      : { createdAt: params.order },
    include: { user: true }
  });
  
  const hasMore = jobs.length > params.limit;
  if (hasMore) jobs.pop();
  
  return {
    jobs,
    nextCursor: jobs[jobs.length - 1]?.id || null,
    hasMore
  };
};
```

## Test Specifications
```yaml
api_tests:
  - "Returns user's jobs"
  - "Admins see all jobs"
  - "Filters by status"
  - "Paginates correctly"
  - "Sorts by date/priority"
```

## Code Reuse
- Use JobRepository methods
- Apply auth middleware
- Use cursor pagination pattern
