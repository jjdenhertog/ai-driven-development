---
id: "021"
name: "define-user-schema"
type: "feature"
dependencies: ["020-setup-prisma-sqlite"]
estimated_lines: 80
priority: "critical"
---

# Database: Define User Schema

## Overview
Create the User model in Prisma schema to store user authentication data and profile information for Google OAuth users.

## User Stories
- As a system, I need to store user data so that users can authenticate
- As an admin, I want to track user creation and last login times

## Technical Requirements
- User model compatible with NextAuth.js
- Google OAuth provider data storage
- Domain restriction enforcement (@meningreen.agency)
- Audit fields for tracking

## Acceptance Criteria
- [ ] User model defined in schema.prisma
- [ ] All required fields present
- [ ] Indexes created for performance
- [ ] Model compatible with NextAuth.js
- [ ] Domain validation at database level

## Testing Requirements

### Test Coverage Target
- Schema validation and constraints

### Required Test Types (if testing infrastructure exists)
- **Unit Tests**: User creation validation
- **Integration Tests**: NextAuth.js compatibility

### Test Scenarios
#### Happy Path
- [ ] User created with valid email
- [ ] Google provider data stored correctly
- [ ] Timestamps auto-generated

#### Error Handling
- [ ] Duplicate email rejected
- [ ] Invalid domain rejected
- [ ] Required fields enforced

## Implementation Notes
Define User model with:
```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  image         String?
  emailVerified DateTime?
  
  // OAuth provider data
  provider      String    @default("google")
  providerId    String?
  
  // Metadata
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  lastLoginAt   DateTime?
  
  // Relations
  jobs          Job[]
  apiTokens     ApiToken[]
  
  @@index([email])
  @@index([providerId])
}
```

## Code Reuse
- Follow NextAuth.js schema conventions
- Use standard audit fields pattern

## Examples to Reference
- NextAuth.js Prisma adapter schema

## Documentation Links
- [NextAuth.js Prisma Adapter](https://authjs.dev/reference/adapter/prisma)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)

## Potential Gotchas
- NextAuth.js expects specific field names
- Email must be unique across all users
- Domain validation needs app-level enforcement

## Out of Scope
- Session/Account models (NextAuth handles)
- Role-based permissions
- User preferences

## Testing Notes
- Test unique constraints
- Verify NextAuth.js can create users