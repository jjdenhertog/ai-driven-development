---
id: "331"
name: "feature-webhook-callback-service"
type: "feature"
dependencies: ["301"]
estimated_lines: 100
priority: "low"
---

# Feature: Webhook Callback Service

## Description
Create a service to send webhook callbacks to external services when jobs complete, supporting the optional callbackUrl parameter.

## Acceptance Criteria
- [ ] Send POST request on job completion
- [ ] Include job status and output URL
- [ ] Retry failed webhooks (max 3 times)
- [ ] Timeout after 10 seconds
- [ ] Log webhook attempts
- [ ] Handle missing callback URLs

## Implementation
```typescript
import axios from 'axios';

export class WebhookService {
  async sendJobCompletion(job: Job, outputUrl: string): Promise<void> {
    if (\!job.callbackUrl) return;
    
    const payload = {
      jobId: job.id,
      status: job.status,
      completedAt: job.completedAt,
      outputUrl: outputUrl,
      error: job.error || null
    };
    
    try {
      await this.sendWithRetry(job.callbackUrl, payload);
      console.log(`Webhook sent successfully for job ${job.id}`);
    } catch (error) {
      console.error(`Webhook failed for job ${job.id}:`, error);
      // Don't throw - webhook failures shouldn't affect job processing
    }
  }
  
  private async sendWithRetry(
    url: string, 
    payload: any, 
    retries = 3
  ): Promise<void> {
    for (let i = 0; i < retries; i++) {
      try {
        await axios.post(url, payload, {
          timeout: 10000, // 10 seconds
          headers: {
            'Content-Type': 'application/json'
          }
        });
        return; // Success
      } catch (error) {
        if (i === retries - 1) throw error;
        // Wait before retry: 1s, 2s, 4s
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
      }
    }
  }
}
```

## Test Specifications
```yaml
unit_tests:
  - "Sends webhook on completion"
  - "Includes all required fields"
  - "Retries on failure"
  - "Respects timeout"
  - "Skips if no callback URL"
  - "Doesn't throw on failure"
```

## Code Reuse
- Use job completion events
- Apply retry patterns
- Use HTTP client utilities
