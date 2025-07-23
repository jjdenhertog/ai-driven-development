---
id: "308"
name: "feature-job-management-apis"
type: "feature"
dependencies: ["301", "200"]
estimated_lines: 150
priority: "high"
---

# Feature: Job Management API Endpoints

## Description
Implement DELETE /api/jobs/:id for cancellation and PATCH /api/jobs/:id/priority for priority boosting (admin only).

## Acceptance Criteria
- [ ] Cancel endpoint requires admin session
- [ ] Priority boost requires admin session
- [ ] Can only cancel pending/active jobs
- [ ] Validate new priority is numeric
- [ ] Update queue after priority change
- [ ] Return confirmation responses

## API Specifications
```yaml
endpoints:
  - method: DELETE
    path: /api/jobs/:id
    auth: Admin session required
    responses:
      200:
        message: "Job cancelled successfully"
        jobId: string
      400:
        error: "Cannot cancel completed job"
      403:
        error: "Admin access required"
      404:
        error: "Job not found"
  
  - method: PATCH
    path: /api/jobs/:id/priority
    auth: Admin session required
    body:
      priority: number # 1-1000
    responses:
      200:
        message: "Priority updated"
        jobId: string
        oldPriority: number
        newPriority: number
      400:
        error: "Invalid priority value"
      403:
        error: "Admin access required"
```

## Test Specifications
```yaml
api_tests:
  - "Cancels pending jobs"
  - "Cancels active jobs"
  - "Rejects cancelling completed jobs"
  - "Updates job priority"
  - "Validates priority range"
  - "Requires admin authentication"
  - "Re-sorts queue after priority change"
```

## Code Reuse
- Use JobQueueService from task 301
- Use auth session check
- Apply admin role validation
