---
id: "320"
name: "feature-user-profile-api"
type: "feature"
dependencies: ["021", "101", "200"]
estimated_lines: 150
priority: "high"
---

# Feature: User Profile API Endpoints

## Description
Create API endpoints for user profile management including retrieving profile data and updating macOS usernames and Slack ID.

## Acceptance Criteria
- [ ] Get user profile with stats
- [ ] Update macOS usernames array
- [ ] Update Slack user ID
- [ ] Validate username format (A-z only)
- [ ] Return job statistics
- [ ] Require authenticated session

## API Specifications
```yaml
endpoints:
  - method: GET
    path: /api/user/profile
    auth: Session required
    response:
      200:
        id: string
        email: string
        name: string
        image: string
        role: "USER"  < /dev/null |  "ADMIN"
        macUsernames: string[]
        slackUserId: string | null
        statistics:
          totalJobs: number
          jobsByStatus:
            completed: number
            failed: number
            cancelled: number
          last7Days: number
        createdAt: string
  
  - method: PUT
    path: /api/user/mac-usernames
    auth: Session required
    body:
      usernames: string[] # Array of macOS usernames
    response:
      200:
        message: "Usernames updated"
        usernames: string[]
      400:
        error: "Invalid username format"
        details: string[]
  
  - method: PUT
    path: /api/user/slack-id
    auth: Session required
    body:
      slackUserId: string | null
    response:
      200:
        message: "Slack ID updated"
        slackUserId: string | null
```

## Username Validation
```typescript
const validateUsername = (username: string): boolean => {
  return /^[A-Za-z]+$/.test(username);
};

const validateUsernames = (usernames: string[]): string[] => {
  const errors: string[] = [];
  usernames.forEach((username, index) => {
    if (\!validateUsername(username)) {
      errors.push(`Username at index ${index} contains invalid characters`);
    }
  });
  return errors;
};
```

## Test Specifications
```yaml
api_tests:
  - "Returns user profile with stats"
  - "Updates macOS usernames"
  - "Validates username format"
  - "Updates Slack ID"
  - "Requires authentication"
  - "Calculates statistics correctly"
```

## Code Reuse
- Use Prisma User model
- Apply auth middleware
- Use validation utilities
