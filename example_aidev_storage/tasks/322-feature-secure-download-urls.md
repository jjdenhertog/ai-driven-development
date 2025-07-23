---
id: "322"
name: "feature-secure-download-urls"
type: "feature"
dependencies: ["307"]
estimated_lines: 100
priority: "medium"
---

# Feature: Secure Download URL Generator

## Description
Create a service to generate time-limited secure URLs for job output downloads without requiring API tokens.

## Acceptance Criteria
- [ ] Generate signed URLs with expiration
- [ ] Validate URL signature and expiry
- [ ] Include job ID in signed data
- [ ] URLs expire after 1 hour
- [ ] Prevent URL tampering
- [ ] Work with streaming endpoint

## Implementation
```yaml
service:
  SecureUrlService:
    methods:
      - generateDownloadUrl(jobId: string): string
      - validateUrl(url: string): { valid: boolean, jobId?: string }
    
    url_format:
      /api/jobs/:id/download?key=SIGNED_KEY&expires=TIMESTAMP
```

## Signing Implementation
```typescript
import crypto from 'crypto';

const generateDownloadUrl = (jobId: string): string => {
  const expires = Date.now() + 3600000; // 1 hour
  const data = `${jobId}:${expires}`;
  const signature = crypto
    .createHmac('sha256', process.env.URL_SIGNING_SECRET\!)
    .update(data)
    .digest('hex');
  
  const key = Buffer.from(`${data}:${signature}`).toString('base64url');
  return `/api/jobs/${jobId}/download?key=${key}`;
};

const validateUrl = (key: string): { valid: boolean, jobId?: string } => {
  try {
    const decoded = Buffer.from(key, 'base64url').toString();
    const [jobId, expires, signature] = decoded.split(':');
    
    // Check expiry
    if (Date.now() > parseInt(expires)) {
      return { valid: false };
    }
    
    // Verify signature
    const expectedSig = crypto
      .createHmac('sha256', process.env.URL_SIGNING_SECRET\!)
      .update(`${jobId}:${expires}`)
      .digest('hex');
    
    return {
      valid: signature === expectedSig,
      jobId: signature === expectedSig ? jobId : undefined
    };
  } catch {
    return { valid: false };
  }
};
```

## Test Specifications
```yaml
unit_tests:
  - "Generates valid signed URLs"
  - "URLs expire after 1 hour"
  - "Validates genuine URLs"
  - "Rejects tampered URLs"
  - "Rejects expired URLs"
```

## Code Reuse
- Integrate with download endpoint
- Use environment secrets
- Apply URL utilities
