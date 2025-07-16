---
id: "204"
name: "feature-user-profile"
type: "feature"
dependencies: ["200", "004"]
estimated_lines: 300
priority: "medium"
---

# Feature: User Profile Management

## Overview
Implement user profile management allowing users to configure their macOS usernames for job association and Slack ID for notifications. This enables proper job ownership and notification delivery.

Creating task because concept states at lines 80-86: "Profile Management Features: Add/remove macOS usernames, Update Slack user ID" and lines 307-320: "User Management API endpoints"

## User Stories
- As a user, I want to add my macOS usernames so my jobs are properly associated
- As a user, I want to set my Slack ID so I receive render notifications

## Technical Requirements
- Profile page with user information display
- macOS username management (add/remove)
- Slack user ID configuration
- Personal job history view (7 days)
- Profile data validation
- Google account info display
- API endpoints for profile updates

## Acceptance Criteria
- [ ] Profile page displays Google account info
- [ ] macOS usernames can be added/removed
- [ ] Usernames stored as JSON array
- [ ] Slack ID can be updated
- [ ] Job history shows last 7 days
- [ ] Form validation prevents invalid data
- [ ] Changes save successfully
- [ ] Success notifications display
- [ ] Profile data persists across sessions

## Testing Requirements

### Test Coverage Target
- Profile components: 90% coverage
- API endpoints: 100% coverage
- Validation logic: 100% coverage

### Required Test Types
- **Unit Tests**: Validation functions, data transformations
- **Component Tests**: Profile form, username list
- **Integration Tests**: Profile update flow
- **E2E Tests**: Complete profile management

### Test Scenarios
#### Happy Path
- [ ] Profile loads with user data
- [ ] Username adds successfully
- [ ] Slack ID updates properly

#### Error Handling
- [ ] Duplicate usernames prevented
- [ ] Invalid Slack ID rejected
- [ ] API errors show notifications

#### Edge Cases
- [ ] Multiple usernames handled
- [ ] Empty username list allowed
- [ ] Special characters in usernames

## Implementation Notes
- Use React Hook Form for profile form
- Validate Slack user ID format
- Show job count per username
- Use optimistic updates for better UX
- Cache profile data with React Query

## Profile Components

```typescript
// Profile page structure
<UserProfile>
  <GoogleAccountInfo />
  <MacUsernamesSection>
    <UsernameList />
    <AddUsernameForm />
  </MacUsernamesSection>
  <SlackConfiguration />
  <JobHistoryPreview />
</UserProfile>

// API endpoints
PUT /api/user/mac-usernames
{
  usernames: string[]
}

PUT /api/user/slack-id
{
  slackUserId: string
}

GET /api/user/profile
Response: {
  id: string;
  email: string;
  name: string;
  image: string;
  macUsernames: string[];
  slackUserId: string;
  jobCount: number;
  recentJobs: Job[];
}
```

## Examples to Reference
- `.aidev-worktree/examples/components/UserRegistrationForm.tsx` for form patterns
- `.aidev-worktree/preferences/components.md` for component structure

## Documentation Links
- [React Hook Form](https://react-hook-form.com/)
- [Material-UI Form Components](https://mui.com/material-ui/react-text-field/)

## Potential Gotchas
- JSON array storage in database
- Slack user ID format validation
- Concurrent profile updates
- Username uniqueness per user only

## Out of Scope
- Username validation against system
- Slack ID verification
- Profile sharing
- Advanced preferences
- Avatar upload

## Testing Notes
- Test array manipulation
- Verify optimistic updates
- Test concurrent edits
- Mock API responses