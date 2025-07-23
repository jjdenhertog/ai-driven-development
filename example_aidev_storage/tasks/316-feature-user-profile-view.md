---
id: "316"
name: "feature-user-profile-view"
type: "feature"
dependencies: ["311", "021"]
estimated_lines: 200
priority: "medium"
---

# Feature: User Profile View

## Description
Create user profile interface for managing macOS usernames, Slack ID, and viewing personal job statistics.

## Acceptance Criteria
- [ ] Display Google account info
- [ ] Manage macOS usernames (add/remove)
- [ ] Update Slack user ID
- [ ] Show job statistics
- [ ] View API tokens (if any)
- [ ] Validate username format (A-z only)
- [ ] Save changes with confirmation

## Component Specifications
```yaml
components:
  ProfileView:
    sections:
      - AccountInfo: Google profile data
      - MacUsernames: List with add/remove
      - SlackIntegration: User ID field
      - Statistics: Job counts by status
      - ApiTokens: View assigned tokens
    
  MacUsernameManager:
    features:
      - List current usernames
      - Add new with validation
      - Remove with confirmation
      - No limit on count
      - Validate A-z only
    
  JobStatistics:
    displays:
      - Total jobs submitted
      - Jobs by status
      - Average render time
      - Last 7 days activity
```

## Validation Rules
```typescript
// Username validation
const isValidUsername = (username: string): boolean => {
  return /^[A-Za-z]+$/.test(username);
};
```

## Test Specifications
```yaml
component_tests:
  - "Displays user information"
  - "Adds valid macOS usernames"
  - "Rejects invalid usernames"
  - "Removes usernames"
  - "Updates Slack ID"
  - "Shows job statistics"
  - "Saves changes successfully"
```

## Code Reuse
- Use MUI form components
- Use existing user API
- Apply validation patterns
