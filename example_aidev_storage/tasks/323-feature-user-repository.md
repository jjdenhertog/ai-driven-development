---
id: "323"
name: "feature-user-repository"
type: "feature"
dependencies: ["021", "100"]
estimated_lines: 150
priority: "high"
---

# Feature: User Repository Extension

## Description
Extend the user repository with methods for profile management, macOS username operations, and job statistics.

## Acceptance Criteria
- [ ] Find user by macOS username
- [ ] Update macOS usernames array
- [ ] Update Slack user ID
- [ ] Get user job statistics
- [ ] Auto-create user on first login
- [ ] Set all users as admin initially

## Component Specifications
```yaml
repository:
  UserRepository:
    methods:
      - findByMacUsername(username: string): Promise<User  < /dev/null |  null>
      - updateMacUsernames(userId: string, usernames: string[]): Promise<User>
      - updateSlackId(userId: string, slackId: string | null): Promise<User>
      - getJobStats(userId: string): Promise<UserStats>
      - createFromGoogle(profile: GoogleProfile): Promise<User>
    
    interfaces:
      UserStats:
        totalJobs: number
        jobsByStatus: Record<JobStatus, number>
        last7Days: number
      
      GoogleProfile:
        email: string
        name: string
        image: string
```

## Implementation Notes
```typescript
// Find by macOS username (array contains)
async findByMacUsername(username: string): Promise<User | null> {
  return prisma.user.findFirst({
    where: {
      macUsernames: {
        has: username
      }
    }
  });
}

// Auto-create with admin role
async createFromGoogle(profile: GoogleProfile): Promise<User> {
  return prisma.user.create({
    data: {
      ...profile,
      role: 'ADMIN', // Everyone starts as admin
      macUsernames: []
    }
  });
}
```

## Test Specifications
```yaml
unit_tests:
  - "Finds user by macOS username"
  - "Updates username array"
  - "Calculates job statistics"
  - "Creates user with admin role"
  - "Handles empty username arrays"
```

## Code Reuse
- Use Prisma client from task 100
- Extend User model from task 021
- Apply repository patterns
