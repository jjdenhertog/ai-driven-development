---
id: "200"
name: "configure-nextauth"
type: "feature"
dependencies: ["004-install-core-dependencies", "021-define-user-schema", "006-setup-environment-variables"]
estimated_lines: 200
priority: "critical"
---

# Feature: Configure NextAuth.js

## Overview
Set up NextAuth.js v5 with JWT strategy for authentication, preparing for Google OAuth integration.

## User Stories
- As a developer, I want authentication configured so that users can log in
- As a system, I need session management so that user state persists

## Technical Requirements
- NextAuth.js v5 configuration
- JWT token strategy
- Session callbacks
- Database adapter setup
- TypeScript types
- Middleware configuration

## Acceptance Criteria
- [ ] NextAuth configured in lib/auth.ts
- [ ] API route handler created
- [ ] Session types extended
- [ ] Middleware protecting routes
- [ ] Environment variables working
- [ ] Dev login page accessible

## Testing Requirements

### Test Coverage Target
- Authentication flow testing
- Session management validation

### Required Test Types (if testing infrastructure exists)
- **Integration Tests**: Login flow works
- **Unit Tests**: Session callbacks
- **API Tests**: Protected routes block unauthenticated

### Test Scenarios
#### Happy Path
- [ ] User can access login page
- [ ] Session created after login
- [ ] Protected routes accessible with session

#### Error Handling
- [ ] Invalid credentials rejected
- [ ] Expired sessions handled
- [ ] Missing env vars cause clear errors

## Implementation Notes
- Create auth configuration in lib/auth.ts
- Set up [...nextauth] route handler
- Configure JWT with proper secret
- Add session callback for user data
- Create middleware.ts for route protection
- Extend NextAuth types for User model

## Code Reuse
- Use User model from Prisma schema
- Apply error handling patterns
- Follow Next.js App Router conventions

## Examples to Reference
- NextAuth.js v5 documentation examples
- App Router authentication patterns

## Documentation Links
- [NextAuth.js v5](https://authjs.dev/)
- [NextAuth with Prisma](https://authjs.dev/reference/adapter/prisma)

## Potential Gotchas
- v5 has different API than v4
- App Router uses different patterns
- JWT secret must be set
- Prisma adapter needs configuration

## Out of Scope
- OAuth provider setup (next task)
- Custom login UI
- Role-based access control

## Testing Notes
- Test with mock provider first
- Verify session persistence
- Check protected route behavior