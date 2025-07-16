---
id: "201"
name: "feature-job-submission-api"
type: "feature"
dependencies: ["100", "101", "004", "200"]
estimated_lines: 500
priority: "critical"
---

# Feature: Job Submission API

## Overview
Implement the core API endpoint for submitting render jobs, including file validation, queue management, and nexrender job creation. This is the primary interface for external services to submit After Effects render jobs.

Creating task because concept states at lines 209-228: "Job Submission via API" and line 269-273: "POST /api/jobs - Submit new render job"

## User Stories
- As an external service, I want to submit render jobs via API so that I can automate video generation
- As the system, I want to validate files exist before accepting jobs so that rendering doesn't fail

## Technical Requirements
- POST /api/jobs endpoint with API token authentication
- File existence and stability validation
- Automatic cancellation of duplicate jobs
- Nexrender job specification creation
- Priority-based queue insertion
- Webhook callback support
- Comprehensive input validation with Zod

## Acceptance Criteria
- [ ] POST /api/jobs endpoint implemented
- [ ] API token authentication working
- [ ] File validation checks (existence, age, size stability)
- [ ] macOS username to user mapping functional
- [ ] Duplicate path jobs auto-cancelled
- [ ] Job queued with correct priority
- [ ] Nexrender job config validated
- [ ] Response includes job ID and status URL
- [ ] Validation errors return helpful messages
- [ ] File path conversion (macOS to Windows) works

## Testing Requirements

### Test Coverage Target
- API endpoint: 100% coverage
- Validation logic: 100% coverage
- Queue management: 90% coverage

### Required Test Types
- **Unit Tests**: Validation functions, path conversion, queue logic
- **Integration Tests**: Full API flow with database
- **E2E Tests**: External service submission flow

### Test Scenarios
#### Happy Path
- [ ] Valid job submission creates job record
- [ ] File validation passes for valid files
- [ ] Job queued in correct priority order

#### Error Handling
- [ ] Missing API token returns 401
- [ ] Invalid token returns 401
- [ ] Missing file returns validation error
- [ ] Invalid nexrender config rejected
- [ ] Unknown macOS username rejected

#### Edge Cases
- [ ] Duplicate job submission cancels previous
- [ ] File size changes during validation
- [ ] Concurrent submissions handled properly

## Implementation Notes
- Follow API pattern from task 100
- Validate against nexrender job specification
- Implement retry logic for file checks
- Use transaction for job creation and cancellation
- Log all validation steps

## API Specification

```typescript
// POST /api/jobs
interface SubmitJobRequest {
  projectPath: string;      // Windows path to .aep file
  saveTimestamp: number;    // When file was saved
  macUsername: string;      // For user identification
  priority?: number;        // Job priority (default: 0)
  webhookUrl?: string;      // Optional callback URL
  nexrenderJob: {
    job: NexrenderJobConfig;
    template: NexrenderTemplate;
    assets?: NexrenderAsset[];
    subtitles?: SubtitleConfig;
    actions?: ActionConfig;
  };
}

interface SubmitJobResponse {
  jobId: string;
  status: JobStatus;
  statusUrl: string;
  position: number;
}
```

## Examples to Reference
- `.aidev-worktree/concept/nexrender-job-specification.md` for job structure
- `.aidev-worktree/preferences/api.md` for API patterns
- `.aidev-worktree/examples/api/products-route.ts` for route structure

## Documentation Links
- [Next.js Route Handlers](https://nextjs.org/docs/app/api-reference/file-conventions/route)
- [Zod Validation](https://zod.dev/)
- [Prisma Transactions](https://www.prisma.io/docs/concepts/components/prisma-client/transactions)

## Potential Gotchas
- Windows path validation differs from Unix
- File system checks can be slow
- Dropbox sync delays may affect validation
- Transaction isolation for queue operations

## Out of Scope
- Batch job submission
- Job templates
- Asset upload handling
- Direct nexrender integration
- Job scheduling

## Testing Notes
- Mock file system for tests
- Test with various nexrender configs
- Verify transaction rollback
- Test concurrent submissions