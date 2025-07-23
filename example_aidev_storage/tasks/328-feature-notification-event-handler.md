---
id: "328"
name: "feature-notification-event-handler"
type: "feature"
dependencies: ["301", "327"]
estimated_lines: 80
priority: "medium"
---

# Feature: Notification Event Handler

## Description
Connect the job queue service events to the Slack notification service to automatically send notifications on job state changes.

## Acceptance Criteria
- [ ] Listen to job queue events
- [ ] Send notifications on job start
- [ ] Send notifications on completion
- [ ] Send notifications on failure
- [ ] Load user data for notifications
- [ ] Handle async notification sending

## Implementation
```typescript
// In job queue service initialization
export function initializeNotifications(
  queueService: JobQueueService,
  notificationService: SlackNotificationService,
  userRepository: UserRepository
) {
  queueService.on('jobStarted', async (job: Job) => {
    try {
      const user = await userRepository.findById(job.userId);
      if (user) {
        await notificationService.notifyJobStarted(job, user);
      }
    } catch (error) {
      // Log but don't fail job processing
      console.error('Failed to send start notification:', error);
    }
  });
  
  queueService.on('jobCompleted', async (job: Job) => {
    try {
      const user = await userRepository.findById(job.userId);
      if (user) {
        await notificationService.notifyJobCompleted(job, user);
      }
    } catch (error) {
      console.error('Failed to send completion notification:', error);
    }
  });
  
  queueService.on('jobFailed', async (job: Job, error: string) => {
    try {
      const user = await userRepository.findById(job.userId);
      if (user) {
        await notificationService.notifyJobFailed(job, user, error);
      }
      
      // Also notify admins of failures
      await notificationService.notifyAdmin(
        `Job ${job.id} failed: ${error}`,
        'error'
      );
    } catch (error) {
      console.error('Failed to send failure notification:', error);
    }
  });
}
```

## Test Specifications
```yaml
integration_tests:
  - "Sends notification on job start"
  - "Sends notification on completion"
  - "Sends notification on failure"
  - "Continues processing if notification fails"
  - "Notifies admin on failures"
```

## Code Reuse
- Use event emitter from queue service
- Use notification service
- Apply async error handling
