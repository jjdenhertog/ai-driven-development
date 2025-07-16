---
id: "206"
name: "feature-slack-notifications"
type: "feature"
dependencies: ["002", "004", "202"]
estimated_lines: 200
priority: "medium"
---

# Feature: Slack Notification System

## Overview
Implement Slack notification system to send direct messages to users when their render jobs complete or fail. Also send admin alerts for system errors.

Creating task because concept states at lines 115-124: "Notification System: Simple Slack Integration" and line 29: "@slack/webhook - Slack notifications"

## User Stories
- As a user, I want Slack notifications when my renders complete so I know when to download
- As an admin, I want alerts for system errors so I can respond quickly

## Technical Requirements
- Slack Web API integration for direct messages
- Send notifications on job completion/failure
- Admin channel alerts for system errors
- Graceful handling of delivery failures
- User Slack ID configuration in profile
- Notification preferences (global only)
- No retry mechanism (fail silently)

## Acceptance Criteria
- [ ] Slack client configured with bot token
- [ ] Job completion sends user notification
- [ ] Job failure sends user notification
- [ ] System errors alert admin channel
- [ ] Missing Slack ID skips notification
- [ ] Delivery failures logged but ignored
- [ ] Notification includes job details
- [ ] Admin alerts include error context
- [ ] Rate limiting prevents spam

## Testing Requirements

### Test Coverage Target
- Notification service: 90% coverage
- Message formatting: 100% coverage
- Error handling: 95% coverage

### Required Test Types
- **Unit Tests**: Message formatting, user lookup
- **Integration Tests**: Slack API mocking
- **E2E Tests**: Notification flow

### Test Scenarios
#### Happy Path
- [ ] Completion notification sent
- [ ] Failure notification sent
- [ ] Admin alert delivered

#### Error Handling
- [ ] Missing Slack ID handled
- [ ] API failures logged
- [ ] Invalid tokens caught

## Implementation Notes
- Use Slack Web API, not webhooks
- Format messages with blocks
- Include actionable links
- Respect rate limits
- Log all attempts

## Notification Implementation

```typescript
// lib/notifications/slack.ts
class SlackNotificationService {
  async notifyJobComplete(job: Job) {
    const user = await getUser(job.userId);
    if (!user.slackUserId) return;
    
    await slack.chat.postMessage({
      channel: user.slackUserId,
      text: `Render complete: ${job.projectPath}`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `✅ *Render Complete*\n${job.projectPath}`
          }
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: { type: 'plain_text', text: 'Download' },
              url: `${APP_URL}/jobs/${job.id}/download`
            }
          ]
        }
      ]
    });
  }
  
  async alertAdmin(error: Error, context: any) {
    await slack.chat.postMessage({
      channel: ADMIN_CHANNEL,
      text: `System error: ${error.message}`,
      blocks: [/* error details */]
    });
  }
}
```

## Examples to Reference
- Slack Block Kit documentation
- Slack API message formatting

## Documentation Links
- [Slack Web API](https://api.slack.com/web)
- [Slack Block Kit](https://api.slack.com/block-kit)
- [Slack Node SDK](https://slack.dev/node-slack-sdk/)

## Potential Gotchas
- User IDs differ from usernames
- Rate limits are strict
- Bot needs chat:write scope
- DMs require user ID not username

## Out of Scope
- Email notifications
- In-app notifications
- Notification preferences
- Retry mechanisms
- Webhook support

## Testing Notes
- Mock Slack client
- Test message formatting
- Verify error handling
- Test rate limiting