---
id: "004"
name: "setup-database-prisma"
type: "feature"
dependencies: ["001", "002"]
estimated_lines: 250
priority: "high"
---

# Setup: Database with Prisma ORM

## Overview
Set up Prisma ORM with initial schema for the After Effects Render Manager, including models for users, jobs, and API tokens. Configure database connections and create initial migrations.

Creating task because concept states at line 18-19: "Database: SQLite/PostgreSQL with Prisma ORM" and line 328-332: "Database Entities: Users, Jobs, ApiTokens"

## User Stories
- As a developer, I want database models defined so that I can store application data
- As a system, I want to track render jobs with all their metadata in a structured way

## Technical Requirements
- Prisma ORM setup with PostgreSQL/SQLite support
- Schema models for Users, Jobs, and ApiTokens
- Database singleton pattern implementation
- Initial migration created
- Seed data for development
- Prisma Studio for database exploration

## Acceptance Criteria
- [ ] Prisma installed and configured
- [ ] Database schema created with all required models
- [ ] User model includes Google auth fields and macOS usernames array
- [ ] Job model includes all render job fields and status tracking
- [ ] ApiToken model for external service authentication
- [ ] Database singleton implemented in lib/prisma.ts
- [ ] Initial migration generated and applied
- [ ] Seed script created with sample data
- [ ] Prisma Studio accessible for development
- [ ] Database connection verified

## Testing Requirements

### Test Coverage Target
- Database utility functions: 80% coverage
- Model validations: 100% coverage

### Required Test Types
- **Unit Tests**: Database singleton, utility functions
- **Integration Tests**: Model CRUD operations
- **E2E Tests**: Database queries in API routes

### Test Scenarios
#### Happy Path
- [ ] Models create, read, update, delete successfully
- [ ] Relationships work correctly
- [ ] Unique constraints enforced

#### Error Handling
- [ ] Duplicate key errors handled
- [ ] Connection failures graceful
- [ ] Invalid data rejected

## Implementation Notes
- Follow Prisma singleton pattern from technology-stack.md
- Use JSON field for macOS usernames array
- Include proper indexes for performance
- Set up cascade deletes appropriately
- Use enums for job status and user roles

## Database Schema

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  image         String?
  role          Role      @default(USER)
  macUsernames  Json      @default("[]") // Array of strings
  slackUserId   String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  jobs          Job[]
}

model Job {
  id              String      @id @default(cuid())
  userId          String
  projectPath     String
  outputPath      String
  status          JobStatus   @default(PENDING)
  priority        Int         @default(0)
  nexrenderConfig Json
  logs            String?     @db.Text
  progress        Int         @default(0)
  error           String?
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  completedAt     DateTime?
  
  user            User        @relation(fields: [userId], references: [id])
  
  @@index([status, priority])
  @@index([projectPath])
}

model ApiToken {
  id          String    @id @default(cuid())
  token       String    @unique
  name        String    // "bravo" or "plugin"
  active      Boolean   @default(true)
  createdAt   DateTime  @default(now())
}

enum Role {
  USER
  ADMIN
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

## Examples to Reference
- `.aidev-worktree/preferences/technology-stack.md` for Prisma singleton pattern
- Standard Prisma schema patterns

## Documentation Links
- [Prisma Getting Started](https://www.prisma.io/docs/getting-started)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [Prisma with Next.js](https://www.prisma.io/nextjs)

## Potential Gotchas
- SQLite doesn't support arrays (use JSON field)
- PostgreSQL connection requires SSL in production
- Prisma generates types that must be regenerated after schema changes
- Migration files should be committed to version control

## Out of Scope
- Redis caching setup
- Database backup configuration
- Production database provisioning
- Query optimization
- Database monitoring

## Testing Notes
- Use test database for integration tests
- Reset database between test runs
- Mock Prisma client for unit tests
- Test transaction rollbacks