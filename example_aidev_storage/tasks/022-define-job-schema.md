---
id: "022"
name: "define-job-schema"
type: "feature"
dependencies: ["021-define-user-schema"]
estimated_lines: 120
priority: "critical"
---

# Database: Define Job Schema

## Overview
Create the Job model in Prisma schema to store render job information, including status tracking, file paths, and execution details.

## User Stories
- As a user, I want my render jobs stored so that I can track their progress
- As a system, I need job data persisted so that jobs survive restarts

## Technical Requirements
- Comprehensive job status tracking
- File path storage with validation
- Priority system support
- Nexrender configuration storage
- Progress tracking fields

## Acceptance Criteria
- [ ] Job model defined with all required fields
- [ ] Status enum includes all states
- [ ] Relations to User model established
- [ ] Indexes for query performance
- [ ] JSON fields for flexible data

## Testing Requirements

### Test Coverage Target
- Schema validation and job lifecycle

### Required Test Types (if testing infrastructure exists)
- **Unit Tests**: Job creation and updates
- **Integration Tests**: Status transitions

### Test Scenarios
#### Happy Path
- [ ] Job created with valid data
- [ ] Status transitions work correctly
- [ ] File paths stored properly

#### Error Handling
- [ ] Invalid status rejected
- [ ] Required fields enforced
- [ ] JSON validation works

## Implementation Notes
Define Job model with:
```prisma
model Job {
  id              String    @id @default(cuid())
  userId          String
  user            User      @relation(fields: [userId], references: [id])
  
  // Job details
  projectName     String
  outputName      String
  templatePath    String
  dataPath        String
  outputPath      String
  
  // Status tracking
  status          JobStatus @default(PENDING)
  priority        Int       @default(5)
  progress        Int       @default(0)
  
  // Execution details
  nexrenderJobId  String?
  nexrenderConfig Json?
  errorMessage    String?
  logs            String?   @db.Text
  
  // Timing
  queuedAt        DateTime  @default(now())
  startedAt       DateTime?
  completedAt     DateTime?
  estimatedTime   Int?      // seconds
  actualTime      Int?      // seconds
  
  // Auto-cancellation
  autoCancelAt    DateTime?
  cancelledReason String?
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  @@index([userId])
  @@index([status])
  @@index([priority, queuedAt])
  @@index([autoCancelAt])
}

enum JobStatus {
  PENDING
  VALIDATING
  QUEUED
  RENDERING
  COMPLETED
  FAILED
  CANCELLED
}
```

## Code Reuse
- Use standard timestamp patterns
- Follow existing enum conventions

## Examples to Reference
- Job queue patterns from similar systems

## Documentation Links
- [Prisma Enums](https://www.prisma.io/docs/concepts/components/prisma-schema/data-model#enums)
- [Prisma JSON Fields](https://www.prisma.io/docs/concepts/components/prisma-schema/data-types#json)

## Potential Gotchas
- SQLite doesn't have native JSON type
- Text fields need explicit length with @db.Text
- Enum changes require migration

## Out of Scope
- Job templates
- Render presets
- Cost tracking

## Testing Notes
- Test all status transitions
- Verify JSON field storage
- Check index performance