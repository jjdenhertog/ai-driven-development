---
id: "001"
name: "user-authentication"
type: "feature"
dependencies: ["000-pattern-component", "000-pattern-api"]
estimated_lines: 400
priority: "high"
---

# Feature: User Authentication

## Overview
Implement a complete user authentication system with email/password and OAuth providers (Google, GitHub). Users should be able to sign up, sign in, manage their sessions, and securely log out.

## User Stories
- As a new user, I want to sign up with my email and password so that I can create an account
- As a returning user, I want to sign in with Google/GitHub so that I don't need to remember another password
- As a logged-in user, I want my session to persist so that I don't need to log in repeatedly
- As a security-conscious user, I want to securely log out so that others can't access my account

## Technical Requirements
- NextAuth.js for authentication handling
- Support for email/password authentication
- OAuth integration with Google and GitHub providers
- Session storage in Redis for scalability
- Secure cookie-based session management
- CSRF protection enabled
- Rate limiting on auth endpoints

## Acceptance Criteria
- [ ] Users can successfully sign up with email/password
- [ ] Email validation is performed (format and uniqueness)
- [ ] Users can sign in with Google OAuth
- [ ] Users can sign in with GitHub OAuth
- [ ] Sessions persist for 7 days by default
- [ ] Logout clears all session data from Redis and cookies
- [ ] Proper error messages for invalid credentials
- [ ] Loading states during authentication
- [ ] Redirect to dashboard after successful login
- [ ] Redirect to login when accessing protected routes while logged out

## Implementation Notes
- Use NextAuth with custom Redis adapter
- Follow the established API pattern from `000-pattern-api`
- Use the standard component structure from `000-pattern-component`
- Implement proper TypeScript types for User and Session
- Use Zod for validation schemas
- Include rate limiting middleware

## Examples to Reference
- `.aidev/examples/components/LoginForm.tsx` - form component patterns
- `.aidev/examples/api/auth/` - authentication API patterns
- `.aidev/examples/middleware/auth.ts` - middleware patterns

## Documentation Links
- https://next-auth.js.org/configuration/initialization
- https://next-auth.js.org/adapters/redis
- https://next-auth.js.org/providers/google
- https://next-auth.js.org/providers/github

## Potential Gotchas
- OAuth redirect URLs must be configured in provider dashboards
- NEXTAUTH_URL must be set correctly for production
- NEXTAUTH_SECRET must be generated and kept secure
- Redis connection must be established before auth requests
- Email provider requires SMTP configuration

## Out of Scope
- Password reset functionality (separate feature)
- Two-factor authentication (future enhancement)
- Social login beyond Google/GitHub
- User profile management (separate feature)