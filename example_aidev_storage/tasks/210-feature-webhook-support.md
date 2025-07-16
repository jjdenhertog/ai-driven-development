---
id: "210"
name: "feature-webhook-support"
type: "feature"
dependencies: ["201", "202"]
estimated_lines: 150
priority: "low"
---

# Feature: Webhook Callback Support

## Overview
Implement optional webhook callbacks that notify external services when render jobs complete. This allows integration with external workflows and automation systems.

Creating task because concept states at lines 321-325: "Webhook Support - POST /callback-url - Optional webhook on job completion"

## User Stories
- As an external service, I want webhook notifications so I can automate post-render workflows
- As a developer, I want reliable webhook delivery so integrations work consistently

## Technical Requirements
- Optional webhook URL per job submission
- POST request on job completion/failure
- Standardized payload format
- Basic retry mechanism (3 attempts)
- Timeout handling (5 seconds)
- Webhook validation on submission
- Success/failure logging

## Acceptance Criteria
- [ ] Webhook URL accepted in job submission
- [ ] Valid URL format enforced
- [ ] Callback sent on completion
- [ ] Callback sent on failure
- [ ] Payload includes all job details
- [ ] Retries on network failure
- [ ] Timeouts prevent hanging
- [ ] Webhook failures don't affect job

## Testing Requirements

### Test Coverage Target
- Webhook logic: 95% coverage
- Retry mechanism: 100% coverage
- Payload formatting: 100% coverage

### Required Test Types
- **Unit Tests**: URL validation, payload formatting
- **Integration Tests**: Webhook delivery flow
- **E2E Tests**: Full job with webhook

### Test Scenarios
#### Happy Path
- [ ] Webhook delivers successfully
- [ ] Correct payload sent
- [ ] Status 200 accepted

#### Error Handling
- [ ] Network errors retry
- [ ] Timeout handled gracefully
- [ ] Invalid URLs rejected

## Implementation Notes
- Use fetch with timeout wrapper
- Implement exponential backoff
- Queue webhooks for reliability
- Log all attempts
- Don't block job completion

## Webhook Implementation

```typescript
// Webhook payload structure
interface WebhookPayload {
  jobId: string;
  status: 'completed' | 'failed';
  projectPath: string;
  outputPath?: string;
  error?: string;
  completedAt: string;
  renderTime: number;
  downloadUrl?: string;
}

// Webhook delivery
async function sendWebhook(job: Job) {
  if (!job.webhookUrl) return;
  
  const payload: WebhookPayload = {
    jobId: job.id,
    status: job.status === 'COMPLETED' ? 'completed' : 'failed',
    projectPath: job.projectPath,
    outputPath: job.outputPath,
    error: job.error,
    completedAt: job.completedAt.toISOString(),
    renderTime: job.completedAt - job.createdAt,
    downloadUrl: job.status === 'COMPLETED' 
      ? `${APP_URL}/api/jobs/${job.id}/download`
      : undefined
  };
  
  // Retry with exponential backoff
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await fetch(job.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Render-Manager-Event': 'job.complete'
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(5000)
      });
      
      if (response.ok) {
        console.log(`Webhook delivered: ${job.webhookUrl}`);
        break;
      }
    } catch (error) {
      if (attempt === 3) {
        console.error(`Webhook failed after 3 attempts: ${job.webhookUrl}`);
      } else {
        await sleep(Math.pow(2, attempt) * 1000);
      }
    }
  }
}
```

## Examples to Reference
- Standard webhook patterns
- HTTP retry strategies

## Documentation Links
- [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [AbortSignal.timeout()](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal/timeout)

## Potential Gotchas
- URL validation complexity
- Timeout handling cross-platform
- Webhook loops possible
- Large payloads may fail

## Out of Scope
- Webhook signing/HMAC
- Custom headers configuration
- Webhook event types
- Delivery guarantees
- Webhook UI management

## Testing Notes
- Mock external endpoints
- Test timeout scenarios
- Verify retry delays
- Check payload format