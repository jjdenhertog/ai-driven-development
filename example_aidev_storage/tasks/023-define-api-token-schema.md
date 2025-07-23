---
id: "023"
name: "define-api-token-schema"
type: "feature"
dependencies: ["021-define-user-schema"]
estimated_lines: 80
priority: "high"
---

# Database: Define API Token Schema

## Overview
Create the ApiToken model in Prisma schema for external API authentication, allowing tools like Google Sheets to submit render jobs.

## User Stories
- As an admin, I want to generate API tokens so that external tools can submit jobs
- As a system, I need to validate API tokens so that only authorized requests are accepted

## Technical Requirements
- Secure token generation and storage
- Token expiration support
- Usage tracking
- Scopes for different permissions
- Token identification metadata

## Acceptance Criteria
- [ ] ApiToken model defined with security fields
- [ ] Relations to User model established
- [ ] Token uniqueness enforced
- [ ] Expiration handling included
- [ ] Usage tracking fields present

## Testing Requirements

### Test Coverage Target
- Token validation and expiration

### Required Test Types (if testing infrastructure exists)
- **Unit Tests**: Token generation and validation
- **Security Tests**: Token uniqueness and entropy

### Test Scenarios
#### Happy Path
- [ ] Token created successfully
- [ ] Token validates correctly
- [ ] Usage count increments

#### Error Handling
- [ ] Expired tokens rejected
- [ ] Revoked tokens rejected
- [ ] Invalid tokens handled

## Implementation Notes
Define ApiToken model with:
```prisma
model ApiToken {
  id          String    @id @default(cuid())
  userId      String
  user        User      @relation(fields: [userId], references: [id])
  
  // Token details
  name        String    // e.g., "Google Sheets Integration"
  token       String    @unique
  
  // Security
  scopes      String[]  @default(["job:create"])
  expiresAt   DateTime?
  revokedAt   DateTime?
  
  // Usage tracking
  lastUsedAt  DateTime?
  usageCount  Int       @default(0)
  lastIp      String?
  
  // Metadata
  description String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  @@index([token])
  @@index([userId])
  @@index([expiresAt])
}
```

## Code Reuse
- Use standard token patterns
- Follow security best practices

## Examples to Reference
- API token patterns from other systems

## Documentation Links
- [Prisma String Arrays](https://www.prisma.io/docs/concepts/components/prisma-schema/data-types#string)
- [API Token Best Practices](https://www.oauth.com/oauth2-servers/access-tokens/)

## Potential Gotchas
- Token must be hashed before storage
- SQLite array support is limited
- Token generation needs crypto-safe random

## Out of Scope
- OAuth2 flow implementation
- Rate limiting configuration
- Token rotation mechanism

## Testing Notes
- Test token uniqueness constraint
- Verify expiration logic
- Check scope validation