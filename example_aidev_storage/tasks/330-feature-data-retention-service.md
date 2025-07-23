---
id: "330"
name: "feature-data-retention-service"
type: "feature"
dependencies: ["300"]
estimated_lines: 100
priority: "medium"
---

# Feature: Data Retention Service

## Description
Create a scheduled service that automatically removes job records older than 7 days, maintaining system performance and storage.

## Acceptance Criteria
- [ ] Run cleanup daily at 2 AM
- [ ] Delete jobs older than 7 days
- [ ] Keep completed job count for stats
- [ ] Log cleanup operations
- [ ] Handle cleanup errors gracefully
- [ ] Don't delete any files (DB only)

## Implementation
```typescript
import cron from 'node-cron';

export class DataRetentionService {
  private jobRepository: JobRepository;
  
  constructor(jobRepository: JobRepository) {
    this.jobRepository = jobRepository;
  }
  
  start() {
    // Run daily at 2 AM
    cron.schedule('0 2 * * *', async () => {
      console.log('Starting data retention cleanup...');
      try {
        await this.cleanup();
      } catch (error) {
        console.error('Data retention cleanup failed:', error);
      }
    });
    
    console.log('Data retention service started');
  }
  
  async cleanup(): Promise<void> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    // Get jobs to delete
    const oldJobs = await this.jobRepository.findOlderThan(sevenDaysAgo);
    
    // Update user statistics before deletion
    for (const job of oldJobs) {
      await this.updateUserStats(job);
    }
    
    // Delete old jobs (DB records only, not files)
    const deletedCount = await this.jobRepository.deleteOlderThan(sevenDaysAgo);
    
    console.log(`Data retention: Deleted ${deletedCount} jobs older than 7 days`);
  }
  
  private async updateUserStats(job: Job) {
    // Increment historical counters before deletion
    // This maintains accurate lifetime statistics
  }
}
```

## Test Specifications
```yaml
unit_tests:
  - "Deletes jobs older than 7 days"
  - "Preserves jobs within 7 days"
  - "Updates statistics before deletion"
  - "Handles deletion errors"
  - "Runs on schedule"
  - "Does not delete files"
```

## Code Reuse
- Use JobRepository from task 300
- Apply cron scheduling patterns
- Use logging utilities
