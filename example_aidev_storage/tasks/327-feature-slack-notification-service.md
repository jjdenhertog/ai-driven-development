---
id: "327"
name: "feature-slack-notification-service"
type: "feature"
dependencies: ["006"]
estimated_lines: 150
priority: "medium"
---

# Feature: Slack Notification Service

## Description
Create a service to send Slack notifications for job events including start, completion, and failure messages to users and admin channel.

## Acceptance Criteria
- [ ] Send direct messages to users via Slack ID
- [ ] Send admin notifications to channel
- [ ] Handle missing Slack IDs gracefully
- [ ] Silently ignore delivery failures
- [ ] Format messages with job details
- [ ] Support different message types

## Component Specifications
```yaml
service:
  SlackNotificationService:
    methods:
      - notifyJobStarted(job: Job, user: User): Promise<void>
      - notifyJobCompleted(job: Job, user: User): Promise<void>
      - notifyJobFailed(job: Job, user: User, error: string): Promise<void>
      - notifyAdmin(message: string, level: 'info'  < /dev/null |  'error'): Promise<void>
    
    configuration:
      SLACK_BOT_TOKEN: string
      SLACK_ADMIN_CHANNEL: string
    
    message_formats:
      job_started: "🚀 Render started for {projectName}"
      job_completed: "✅ Render completed for {projectName}"
      job_failed: "❌ Render failed for {projectName}: {error}"
```

## Implementation
```typescript
import { WebClient } from '@slack/web-api';

class SlackNotificationService {
  private slack: WebClient;
  
  constructor() {
    this.slack = new WebClient(process.env.SLACK_BOT_TOKEN);
  }
  
  async notifyJobStarted(job: Job, user: User): Promise<void> {
    if (\!user.slackUserId) return;
    
    try {
      await this.slack.chat.postMessage({
        channel: user.slackUserId,
        text: `🚀 Render started for ${this.getProjectName(job.projectPath)}`,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Render Started*\nProject: ${this.getProjectName(job.projectPath)}\nPriority: ${job.priority}`
            }
          }
        ]
      });
    } catch (error) {
      // Silently ignore failures
      console.error('Slack notification failed:', error);
    }
  }
  
  private getProjectName(path: string): string {
    return path.split('\\').pop() || path;
  }
}
```

## Test Specifications
```yaml
unit_tests:
  - "Sends job started notification"
  - "Sends completion notification"
  - "Sends failure notification with error"
  - "Skips if no Slack ID"
  - "Handles API errors silently"
  - "Formats project names correctly"
```

## Code Reuse
- Use environment variables
- Apply error handling patterns
- Use job/user types
