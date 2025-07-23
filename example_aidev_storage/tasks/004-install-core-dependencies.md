---
id: "004"
name: "install-core-dependencies"
type: "feature"
dependencies: ["003-setup-eslint-prettier"]
estimated_lines: 50
priority: "critical"
---

# Setup: Install Core Dependencies

## Overview
Install all core dependencies required for the AFX Render Manager, including Material-UI, database ORM, authentication, and other essential packages.

## User Stories
- As a developer, I want all required dependencies installed so that I can start building features
- As a developer, I want dependency versions locked so that builds are reproducible

## Technical Requirements
- Material-UI v5 with emotion
- Prisma ORM for SQLite
- NextAuth.js v5
- Socket.io for real-time updates
- TanStack Query v5
- Other utilities as specified

## Acceptance Criteria
- [ ] All dependencies installed without conflicts
- [ ] No security vulnerabilities in dependencies
- [ ] Package-lock.json committed
- [ ] Project builds successfully
- [ ] Development server runs without errors

## Testing Requirements

### Test Coverage Target
- Dependency compatibility check

### Required Test Types (if testing infrastructure exists)
- **Build Tests**: Project builds with all dependencies

### Test Scenarios
#### Happy Path
- [ ] All imports resolve correctly
- [ ] No TypeScript errors from dependencies

## Implementation Notes
Install the following packages:
- UI: @mui/material @emotion/react @emotion/styled @mui/icons-material
- Database: @prisma/client prisma
- Auth: next-auth@beta
- Real-time: socket.io socket.io-client
- Data fetching: @tanstack/react-query
- Forms: react-hook-form zod @hookform/resolvers
- Utilities: date-fns lodash
- Development: @types/lodash @types/node

## Code Reuse
- Check package.json from any existing Next.js projects for version compatibility

## Examples to Reference
- Package versions from technical_architecture.json

## Documentation Links
- [MUI Installation](https://mui.com/material-ui/getting-started/installation/)
- [Prisma Getting Started](https://www.prisma.io/docs/getting-started)
- [NextAuth.js](https://authjs.dev/)

## Potential Gotchas
- MUI v5 requires emotion (not styled-components)
- NextAuth.js v5 is still in beta
- Socket.io version must match between client and server

## Out of Scope
- Nexrender packages (separate task)
- Testing framework setup
- Deployment-specific packages

## Testing Notes
- Verify all packages are installed
- Check for peer dependency warnings