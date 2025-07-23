---
id: "305"
name: "feature-job-submission-api"
type: "feature"
dependencies: ["301", "302", "023"]
estimated_lines: 200
priority: "critical"
---

# Feature: Job Submission API Endpoint

## Description
Implement the POST /api/jobs endpoint that accepts render job submissions, validates the request, and queues the job for processing.

## Acceptance Criteria
- [ ] Validate API token in X-API-Token header
- [ ] Match macOS username to user account
- [ ] Validate file existence and stability
- [ ] Auto-cancel previous jobs for same path
- [ ] Create job with numeric priority
- [ ] Return job ID and status URL
- [ ] Handle validation errors gracefully

## API Specification
```yaml
endpoint:
  method: POST
  path: /api/jobs
  headers:
    - X-API-Token: string (required)
  
  request_body:
    projectPath: string # Windows format path
    timestamp: string # ISO 8601 format
    macUsername: string # macOS username
    priority: number # 1-1000, default 100
    nexrenderConfig: object # Nexrender job JSON
    callbackUrl?: string # Optional webhook
  
  responses:
    201:
      jobId: string
      status: string
      statusUrl: string
      message: string
    
    400:
      error: string
      details: string[]
    
    401:
      error: "Invalid API token"
    
    404:
      error: "User not found for username"
```

## Implementation
```typescript
export async function POST(request: Request) {
  // 1. Validate API token
  // 2. Parse request body
  // 3. Find user by macOS username
  // 4. Validate file at projectPath
  // 5. Cancel existing jobs for same path
  // 6. Create new job
  // 7. Return success response
}
```

## Test Specifications
```yaml
api_tests:
  - "Accepts valid job submission"
  - "Rejects invalid API token"
  - "Validates required fields"
  - "Finds user by macOS username"
  - "Cancels duplicate path jobs"
  - "Returns proper status URL"
  - "Handles file validation errors"
```

## Code Reuse
- Use API error handler from task 101
- Use response utility from task 102
- Use file validation from task 302
- Use job queue service from task 301
