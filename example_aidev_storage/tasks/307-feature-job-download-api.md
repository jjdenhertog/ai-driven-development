---
id: "307"
name: "feature-job-download-api"
type: "feature"
dependencies: ["300", "023"]
estimated_lines: 120
priority: "high"
---

# Feature: Job Download API Endpoint

## Description
Implement GET /api/jobs/:id/download endpoint to stream completed render output files with secure access.

## Acceptance Criteria
- [ ] Validate API token or signed URL key
- [ ] Verify job is completed
- [ ] Stream file from Dropbox location
- [ ] Set proper content headers
- [ ] Handle missing output files
- [ ] Support range requests for large files

## API Specification
```yaml
endpoint:
  method: GET
  path: /api/jobs/:id/download
  query:
    - key?: string # Alternative to API token
  headers:
    - X-API-Token?: string # If no key provided
  
  responses:
    200:
      headers:
        Content-Type: video/mp4 or application/octet-stream
        Content-Disposition: attachment; filename="output.mp4"
        Content-Length: number
      body: File stream
    
    401:
      error: "Invalid authentication"
    
    404:
      error: "Job not found or not completed"
    
    410:
      error: "Output file no longer available"
```

## Implementation Notes
- Generate secure download URLs with time-limited keys
- Stream files directly without loading into memory
- Support partial content for video streaming

## Test Specifications
```yaml
api_tests:
  - "Streams completed job output"
  - "Validates authentication"
  - "Returns 404 for incomplete jobs"
  - "Handles missing output files"
  - "Sets correct content headers"
  - "Supports range requests"
```

## Code Reuse
- Use JobRepository from task 300
- Use file streaming utilities
- Apply security patterns
