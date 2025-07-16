---
id: "200"
name: "feature-authentication"
type: "feature"
dependencies: ["001", "002", "004", "100"]
estimated_lines: 400
priority: "critical"
---

# Feature: Google OAuth Authentication

## Overview
Implement Google OAuth authentication using NextAuth.js, restricted to company email domain. This provides secure access control for the render manager with automatic user account creation.

Creating task because concept states at line 16: "Authentication: NextAuth.js with Google Provider" and lines 200-207: "First Time Setup: User logs into dashboard with company Google account"

## User Stories
- As a user, I want to sign in with my company Google account so that I can access the render manager
- As an admin, I want only @company.com emails allowed so that access is restricted to employees

## Technical Requirements
- NextAuth.js with Google OAuth provider
- Domain restriction to @company.com emails
- Automatic user account creation on first login
- Session management with JWT
- Role-based access (USER/ADMIN)
- Secure session cookies
- Profile data from Google (name, email, avatar)

## Acceptance Criteria
- [ ] NextAuth configured with Google provider
- [ ] Sign in page with Google button
- [ ] Domain restriction enforced (@company.com only)
- [ ] User account created automatically on first login
- [ ] Session persists across page refreshes
- [ ] Sign out functionality works
- [ ] Protected routes redirect to sign in
- [ ] User profile displays Google data
- [ ] Admin role assignment capability

## Testing Requirements

### Test Coverage Target
- Authentication flows: 90% coverage
- Protected routes: 100% coverage
- Domain validation: 100% coverage

### Required Test Types
- **Unit Tests**: Domain validation, session handling
- **Component Tests**: Sign in/out buttons, protected pages
- **Integration Tests**: Full auth flow
- **E2E Tests**: Complete sign in journey

### Test Scenarios
#### Happy Path
- [ ] Valid @company.com email signs in successfully
- [ ] New user account created on first sign in
- [ ] Existing user signs in without duplication

#### Error Handling
- [ ] Non-company email rejected with clear message
- [ ] OAuth errors handled gracefully
- [ ] Session expiry redirects to sign in

#### Edge Cases
- [ ] Multiple sign in attempts handled
- [ ] Concurrent sessions supported
- [ ] Profile updates reflected

## Implementation Notes
- Follow NextAuth patterns from technology-stack.md
- Use database sessions with Prisma adapter
- Configure proper callback URLs
- Set secure cookie options for production
- Include CSRF protection

## Examples to Reference
- `.aidev-worktree/preferences/technology-stack.md` for NextAuth configuration
- Standard NextAuth.js patterns

## Documentation Links
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [NextAuth Google Provider](https://next-auth.js.org/providers/google)
- [NextAuth Prisma Adapter](https://next-auth.js.org/adapters/prisma)

## Potential Gotchas
- Google OAuth requires exact redirect URI match
- Domain restriction needs custom signIn callback
- Development uses different OAuth credentials
- Session secret must be properly generated

## Out of Scope
- Multi-factor authentication
- Password-based login
- Other OAuth providers
- Account linking
- Email verification

## Testing Notes
- Mock NextAuth for component tests
- Use test OAuth credentials
- Test domain restriction thoroughly
- Verify session persistence