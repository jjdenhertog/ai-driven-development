---
id: "207"
name: "feature-job-management-api"
type: "feature"
dependencies: ["100", "200", "201"]
estimated_lines: 300
priority: "high"
---

# Feature: Job Management API Endpoints

## Overview
Implement administrative API endpoints for job management including cancellation and priority boosting. These allow admins to control individual jobs in the queue.

Creating task because concept states at line 282-284: "DELETE /api/jobs/:id - Cancel job (admin only)" and line 286-289: "PATCH /api/jobs/:id/priority - Boost priority (admin only)"

## User Stories
- As an admin, I want to cancel jobs via API so I can stop problematic renders
- As an admin, I want to boost job priority so urgent jobs complete first

## Technical Requirements
- DELETE /api/jobs/:id for job cancellation
- PATCH /api/jobs/:id/priority for priority changes
- Admin authentication required
- Graceful cancellation of running jobs
- Queue reordering on priority change
- Audit logging for admin actions

## Acceptance Criteria
- [ ] Cancel endpoint stops running jobs
- [ ] Cancel updates job status to CANCELLED
- [ ] Priority boost moves job up in queue
- [ ] Only admins can access endpoints
- [ ] Running jobs cannot change priority
- [ ] Cancelled jobs free up queue
- [ ] Actions logged with admin user
- [ ] Proper error messages returned

## Testing Requirements

### Test Coverage Target
- API endpoints: 100% coverage
- Authorization: 100% coverage
- Business logic: 95% coverage

### Required Test Types
- **Unit Tests**: Priority logic, cancellation flow
- **Integration Tests**: Full API with database
- **E2E Tests**: Admin job management flow

### Test Scenarios
#### Happy Path
- [ ] Job cancels successfully
- [ ] Priority updates correctly
- [ ] Queue reorders properly

#### Error Handling
- [ ] Non-admin access denied
- [ ] Invalid job ID handled
- [ ] Completed job can't cancel

## Implementation Notes
- Kill nexrender process for running jobs
- Use database transaction for priority changes
- Emit WebSocket events for UI updates
- Clean up temporary files on cancel

## API Specifications

```typescript
// DELETE /api/jobs/:id
// Headers: Admin session required
// Returns: 
{
  success: true,
  message: "Job cancelled successfully"
}

// PATCH /api/jobs/:id/priority
// Headers: Admin session required
// Body:
{
  priority: number // New priority value
}
// Returns:
{
  success: true,
  job: UpdatedJob,
  newPosition: number
}

// Implementation
async function cancelJob(jobId: string) {
  const job = await getJob(jobId);
  
  if (job.status === 'RENDERING') {
    // Kill nexrender process
    await killProcess(job.processId);
  }
  
  await updateJobStatus(jobId, 'CANCELLED');
  await cleanupJobFiles(jobId);
}
```

## Examples to Reference
- `.aidev-worktree/preferences/api.md` for API patterns
- Admin authentication patterns

## Documentation Links
- [Process Management in Node.js](https://nodejs.org/api/child_process.html#child_processkillsignal)

## Potential Gotchas
- Process might not die immediately
- Priority changes need queue lock
- Orphaned processes possible
- File cleanup may fail

## Out of Scope
- Bulk job operations
- Job pausing/resuming
- Priority scheduling algorithms
- Undo functionality

## Testing Notes
- Mock process killing
- Test queue consistency
- Verify cleanup happens
- Check audit logs