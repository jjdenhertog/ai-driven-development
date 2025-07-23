---
id: "201"
name: "setup-google-provider"
type: "feature"
dependencies: ["200-configure-nextauth"]
estimated_lines: 150
priority: "critical"
---

# Feature: Google OAuth Provider Setup

## Overview
Configure Google OAuth provider in NextAuth.js with domain restriction to @meningreen.agency emails only.

## User Stories
- As a user, I want to log in with my Google account so that authentication is simple
- As an admin, I want only @meningreen.agency users so that access is restricted

## Technical Requirements
- Google OAuth provider configuration
- Domain validation for @meningreen.agency
- Profile data mapping
- Error handling for invalid domains
- Proper redirect URLs

## Acceptance Criteria
- [ ] Google provider configured in auth.ts
- [ ] Domain restriction implemented
- [ ] Non-agency emails rejected with clear message
- [ ] User profile data saved correctly
- [ ] Login with Google button working
- [ ] Redirect after login works

## Testing Requirements

### Test Coverage Target
- OAuth flow validation
- Domain restriction testing

### Required Test Types (if testing infrastructure exists)
- **Integration Tests**: Google login flow
- **Unit Tests**: Domain validation logic
- **E2E Tests**: Complete login journey

### Test Scenarios
#### Happy Path
- [ ] @meningreen.agency email logs in successfully
- [ ] User data populated from Google profile
- [ ] Redirect to dashboard after login

#### Error Handling
- [ ] Non-agency email shows error
- [ ] Gmail.com addresses rejected
- [ ] Network errors handled gracefully

#### Edge Cases
- [ ] Subdomain emails handled correctly
- [ ] Case insensitive domain check

## Implementation Notes
- Add Google provider to auth config
- Implement signIn callback for domain check
- Map Google profile fields to User model
- Configure proper OAuth redirect URIs
- Add helpful error messages

## Code Reuse
- Use existing auth configuration
- Apply error handling patterns
- Follow User model structure

## Examples to Reference
- NextAuth Google provider docs
- Domain restriction examples

## Documentation Links
- [NextAuth Google Provider](https://authjs.dev/reference/core/providers_google)
- [NextAuth Callbacks](https://authjs.dev/reference/core#callbacks)

## Potential Gotchas
- Google client ID/secret required
- Redirect URIs must match exactly
- Domain check is case sensitive
- Profile image URL may expire

## Out of Scope
- Multiple OAuth providers
- Email allowlist/blocklist
- Admin override for domains

## Testing Notes
- Need test Google OAuth app
- Mock OAuth flow for unit tests
- Test various email domains