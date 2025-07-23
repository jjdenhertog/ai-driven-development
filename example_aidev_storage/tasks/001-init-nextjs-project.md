---
id: "001"
name: "init-nextjs-project"
type: "feature"
dependencies: []
estimated_lines: 100
priority: "critical"
---

# Setup: Initialize Next.js Project

## Overview
Create a new Next.js 15.x project using App Router with TypeScript support and proper directory structure for the AFX Render Manager application.

## User Stories
- As a developer, I want to set up a Next.js project so that I can build the render manager
- As a developer, I want TypeScript configured so that I have type safety

## Technical Requirements
- Next.js 15.x with App Router
- TypeScript 5.x configuration
- ESLint and Prettier setup
- Proper .gitignore file
- Package.json with correct scripts

## Acceptance Criteria
- [ ] Next.js 15.x project created with create-next-app
- [ ] TypeScript configuration properly set up
- [ ] App Router structure in place
- [ ] Development server runs on port 3000
- [ ] Build process completes without errors
- [ ] .gitignore includes common patterns

## Testing Requirements

### Test Coverage Target
- Basic smoke test to ensure app starts

### Required Test Types (if testing infrastructure exists)
- **Unit Tests**: App component renders
- **Integration Tests**: Home page loads

### Test Scenarios
#### Happy Path
- [ ] Development server starts successfully
- [ ] Home page renders without errors

### Test File Locations (when testing is available)
- Component tests: `src/app/page.test.tsx`

## Implementation Notes
- Use `npx create-next-app@latest` with the following options:
  - TypeScript: Yes
  - ESLint: Yes
  - Tailwind CSS: No (we're using MUI)
  - src/ directory: Yes
  - App Router: Yes
  - Import alias: Yes (@/*)
- Remove default styles and content
- Set up proper project structure

## Examples to Reference
- Standard Next.js App Router structure

## Documentation Links
- [Next.js App Router Documentation](https://nextjs.org/docs/app)
- [TypeScript with Next.js](https://nextjs.org/docs/app/building-your-application/configuring/typescript)

## Potential Gotchas
- Ensure Node.js 20.x is installed
- Windows path handling for development

## Out of Scope
- MUI setup (separate task)
- Database configuration
- Authentication setup

## Testing Notes
- Initial setup focuses on basic functionality
- More comprehensive tests added as features develop