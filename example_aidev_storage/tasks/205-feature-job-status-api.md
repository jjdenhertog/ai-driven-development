---
id: "205"
name: "feature-job-status-api"
type: "feature"
dependencies: ["100", "201"]
estimated_lines: 250
priority: "high"
---

# Feature: Job Status and Download API

## Overview
Implement API endpoints for checking job status, retrieving logs, and downloading completed render files. This enables external services to monitor and retrieve their render outputs.

Creating task because concept states at lines 274-277: "GET /api/jobs/:id - Check job status" and lines 278-281: "GET /api/jobs/:id/download - Download completed file"

## User Stories
- As an external service, I want to check job status so I can monitor progress
- As an external service, I want to download completed files so I can use the rendered output

## Technical Requirements
- GET /api/jobs/:id endpoint for status
- GET /api/jobs/:id/download for file download
- API token authentication required
- Progress percentage in status response
- Streaming file download for large files
- Proper error responses for invalid jobs
- Log retrieval in status response

## Acceptance Criteria
- [ ] Status endpoint returns job details
- [ ] Progress updates reflected in response
- [ ] Logs included for failed jobs
- [ ] Download endpoint streams files
- [ ] Only completed jobs allow download
- [ ] API token validates ownership
- [ ] 404 for non-existent jobs
- [ ] Proper content headers for downloads
- [ ] Rate limiting prevents abuse

## Testing Requirements

### Test Coverage Target
- API endpoints: 100% coverage
- Authentication: 100% coverage
- File streaming: 90% coverage

### Required Test Types
- **Unit Tests**: Status formatting, auth checks
- **Integration Tests**: Full API flows
- **E2E Tests**: External service integration

### Test Scenarios
#### Happy Path
- [ ] Status returns accurate data
- [ ] Download streams file successfully
- [ ] Progress updates correctly

#### Error Handling
- [ ] Invalid job ID returns 404
- [ ] Unauthorized access returns 401
- [ ] Incomplete job prevents download
- [ ] Missing file handled gracefully

## Implementation Notes
- Use streaming for large file downloads
- Include ETag for caching
- Set proper MIME types
- Log download requests
- Handle partial content requests

## API Specifications

```typescript
// GET /api/jobs/:id
interface JobStatusResponse {
  id: string;
  status: JobStatus;
  progress: number;
  projectPath: string;
  outputPath: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  logs?: string;
  error?: string;
  downloadUrl?: string;
}

// GET /api/jobs/:id/download
// Returns: File stream with headers:
// - Content-Type: video/mp4 or image/jpeg
// - Content-Disposition: attachment; filename="output.mp4"
// - Content-Length: filesize
```

## Examples to Reference
- `.aidev-worktree/preferences/api.md` for API patterns
- Node.js streaming documentation

## Documentation Links
- [Next.js Streaming](https://nextjs.org/docs/app/building-your-application/routing/route-handlers#streaming)
- [HTTP Range Requests](https://developer.mozilla.org/en-US/docs/Web/HTTP/Range_requests)

## Potential Gotchas
- Large files need streaming
- File paths need validation
- Download tracking required
- Concurrent downloads impact

## Out of Scope
- Partial file downloads
- Preview generation
- Transcoding options
- Batch downloads
- Download resumption

## Testing Notes
- Mock file system for tests
- Test large file handling
- Verify auth on all endpoints
- Test streaming behavior