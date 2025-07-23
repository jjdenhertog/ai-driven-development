---
id: "306"
name: "feature-job-status-api"
type: "feature"
dependencies: ["300", "023"]
estimated_lines: 100
priority: "high"
---

# Feature: Job Status API Endpoint

## Description
Implement GET /api/jobs/:id endpoint to check job status, progress, and retrieve logs.

## Acceptance Criteria
- [ ] Validate API token
- [ ] Return job status and progress
- [ ] Include render logs if available
- [ ] Provide output URL when completed
- [ ] Handle non-existent job IDs
- [ ] Filter logs for security

## API Specification
```yaml
endpoint:
  method: GET
  path: /api/jobs/:id
  headers:
    - X-API-Token: string (required)
  
  responses:
    200:
      id: string
      status: JobStatus
      progress: number # 0-100
      priority: number
      createdAt: string
      startedAt?: string
      completedAt?: string
      logs: string[]
      outputUrl?: string # Only if completed
      error?: string # Only if failed
    
    401:
      error: "Invalid API token"
    
    404:
      error: "Job not found"
```

## Test Specifications
```yaml
api_tests:
  - "Returns job status for valid ID"
  - "Includes progress percentage"
  - "Shows logs for active jobs"
  - "Provides output URL when complete"
  - "Returns 404 for missing job"
  - "Validates API token"
```

## Code Reuse
- Use JobRepository from task 300
- Use API error patterns
- Use response utilities
