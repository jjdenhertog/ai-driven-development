---
id: "300"
name: "feature-job-repository"
type: "feature"
dependencies: ["022", "100"]
estimated_lines: 200
priority: "critical"
---

# Feature: Job Repository Layer

## Description
Create a comprehensive job repository that handles all database operations for job management including CRUD operations, status updates, and queries.

## Acceptance Criteria
- [ ] Create JobRepository class with all CRUD methods
- [ ] Implement job status transition logic
- [ ] Add methods for queue queries (pending, active)
- [ ] Include priority-based sorting
- [ ] Handle auto-cancellation for duplicate paths
- [ ] Add 7-day retention cleanup method
- [ ] Include transaction support for status changes

## Component Specifications
```yaml
repository:
  JobRepository:
    methods:
      - create(data: CreateJobDto): Promise<Job>
      - findById(id: string): Promise<Job  < /dev/null |  null>
      - findByUser(userId: string): Promise<Job[]>
      - findPending(): Promise<Job[]>
      - findActive(): Promise<Job | null>
      - updateStatus(id: string, status: JobStatus): Promise<Job>
      - cancelByPath(path: string, excludeId?: string): Promise<number>
      - boostPriority(id: string, newPriority: number): Promise<Job>
      - cleanup7DaysOld(): Promise<number>
      - getQueueDepth(): Promise<number>
```

## Test Specifications
```yaml
unit_tests:
  - "Creates job with all required fields"
  - "Updates job status with validation"
  - "Finds pending jobs ordered by priority DESC"
  - "Cancels jobs with same project path"
  - "Cleans up jobs older than 7 days"
  - "Handles concurrent status updates"
  - "Validates status transitions"
```

## Code Reuse
- Use Prisma client from task 100
- Apply error handling patterns from task 101
- Use Job schema from task 022
