---
id: "209"
name: "feature-data-retention"
type: "feature"
dependencies: ["004", "202"]
estimated_lines: 200
priority: "medium"
---

# Feature: Automatic Data Retention and Cleanup

## Overview
Implement automatic cleanup of old job records and associated data after 7 days to prevent database growth and maintain system performance.

Creating task because concept states at line 137-146: "Data Retention - Job history: 7 days then auto-delete"

## User Stories
- As a system admin, I want old jobs cleaned up automatically so the database doesn't grow indefinitely
- As the system, I want to remove old data so performance remains optimal

## Technical Requirements
- Scheduled cleanup job running daily
- Delete jobs older than 7 days
- Clean up associated logs and temporary files
- Preserve output files (user responsibility)
- Run during low-activity periods
- Database cascade deletes configured
- Cleanup job monitoring

## Acceptance Criteria
- [ ] Scheduled job runs daily at 3 AM
- [ ] Jobs older than 7 days deleted
- [ ] Associated logs removed with jobs
- [ ] Temporary render files cleaned
- [ ] Output files remain untouched
- [ ] Cleanup logged for audit
- [ ] Database constraints maintained
- [ ] Performance impact minimal

## Testing Requirements

### Test Coverage Target
- Cleanup logic: 100% coverage
- Scheduling: 90% coverage
- Edge cases: 95% coverage

### Required Test Types
- **Unit Tests**: Date calculations, deletion logic
- **Integration Tests**: Database cleanup with relations
- **E2E Tests**: Scheduled job execution

### Test Scenarios
#### Happy Path
- [ ] Old jobs deleted correctly
- [ ] Recent jobs preserved
- [ ] Cascade deletes work

#### Error Handling
- [ ] Handles missing files gracefully
- [ ] Database errors don't crash
- [ ] Partial cleanup recovered

## Implementation Notes
- Use node-cron for scheduling
- Batch deletions for performance
- Transaction for consistency
- Monitor execution time
- Alert on failures

## Implementation Details

```typescript
// lib/jobs/cleanup.ts
import cron from 'node-cron';
import { prisma } from '@/lib/prisma';

export function initializeCleanupJob() {
  // Run daily at 3 AM
  cron.schedule('0 3 * * *', async () => {
    console.log('Starting job cleanup...');
    
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 7);
      
      // Delete old jobs (cascade will handle relations)
      const result = await prisma.job.deleteMany({
        where: {
          createdAt: {
            lt: cutoffDate
          }
        }
      });
      
      console.log(`Deleted ${result.count} old jobs`);
      
      // Clean up orphaned temp files
      await cleanupTempFiles(cutoffDate);
      
      // Log cleanup completion
      await logCleanup(result.count);
      
    } catch (error) {
      console.error('Cleanup job failed:', error);
      await notifyAdminError('Data cleanup failed', error);
    }
  });
}

// Cleanup temporary files
async function cleanupTempFiles(before: Date) {
  const tempDir = process.env.TEMP_DIR || '/tmp/nexrender';
  // Implementation to scan and delete old temp files
}
```

## Examples to Reference
- Database cascade delete patterns
- Scheduled job best practices

## Documentation Links
- [node-cron](https://www.npmjs.com/package/node-cron)
- [Prisma Delete Operations](https://www.prisma.io/docs/concepts/components/prisma-client/crud#delete)

## Potential Gotchas
- Time zone considerations
- Large deletion performance
- File system permissions
- Cascade delete failures

## Out of Scope
- Configurable retention period
- Archival before deletion
- Selective retention rules
- Manual cleanup triggers
- Backup before cleanup

## Testing Notes
- Test with time mocking
- Verify cascade behavior
- Check file cleanup
- Monitor performance