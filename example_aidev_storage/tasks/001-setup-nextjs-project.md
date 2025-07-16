---
id: "001"
name: "setup-nextjs-project"
type: "feature"
dependencies: []
estimated_lines: 300
priority: "critical"
---

# Setup: Initialize Next.js Project with TypeScript

## Overview
Initialize a new Next.js 15.x project with TypeScript, App Router, and essential configuration following the technology stack preferences. This establishes the foundation for the After Effects Render Manager application.

Creating task because concept states at line 15-19: "Core Technologies: Authentication: NextAuth.js, Database: SQLite/PostgreSQL with Prisma ORM"

## User Stories
- As a developer, I want to set up a Next.js project with proper configuration so that I can build the render manager
- As a developer, I want TypeScript configured strictly so that I can catch errors early

## Technical Requirements
- Next.js 15.x with App Router
- TypeScript 5.x with strict configuration
- Material-UI (MUI) for UI components
- ESLint and Prettier for code quality
- Project structure matching folder-structure.md preferences
- Path aliases configured in tsconfig.json

## Acceptance Criteria
- [ ] Next.js project initialized with TypeScript and App Router
- [ ] Strict TypeScript configuration enabled
- [ ] ESLint and Prettier configured with Next.js rules
- [ ] MUI installed and theme provider setup
- [ ] Project structure created matching `.aidev-worktree/preferences/folder-structure.md`
- [ ] Path aliases configured (@/ for src/, @components, @hooks, etc.)
- [ ] Basic layout component with MUI theme
- [ ] Development server runs without errors
- [ ] Git repository initialized with proper .gitignore

## Testing Requirements

**Note**: Testing infrastructure will be set up in task 003. Tests will be created for this setup after testing framework is available.

### Test Coverage Target
- Will be applied after testing setup is complete

### Required Test Types (after testing setup)
- **Unit Tests**: Theme configuration, utility functions
- **Component Tests**: Layout components, theme provider
- **E2E Tests**: Basic navigation and page loading

### Test Scenarios
#### Happy Path
- [ ] Home page loads successfully
- [ ] Theme applies correctly

#### Error Handling
- [ ] 404 page renders for invalid routes
- [ ] Error boundary catches component errors

## Implementation Notes
- Follow technology stack from `.aidev-worktree/preferences/technology-stack.md`
- Use npm as package manager (not yarn or pnpm)
- Configure MUI with dark mode as default
- Set up CSS variables for theming
- Include src/ directory structure as specified in preferences

## Examples to Reference
- `.aidev-worktree/preferences/folder-structure.md` for directory organization
- `.aidev-worktree/preferences/technology-stack.md` for exact dependencies
- `.aidev-worktree/examples/components/ExampleComponent.tsx` for component patterns

## Documentation Links
- [Next.js 15 Documentation](https://nextjs.org/docs)
- [MUI Installation Guide](https://mui.com/material-ui/getting-started/installation/)
- [TypeScript Strict Mode](https://www.typescriptlang.org/tsconfig#strict)

## Potential Gotchas
- Ensure Next.js 15.x is used (not 14.x)
- MUI requires emotion dependencies for styling
- App Router structure differs from Pages Router
- TypeScript strict mode may require additional type definitions

## Out of Scope
- Database setup (handled in separate task)
- Authentication setup (handled in separate task)
- API routes implementation
- Complex UI components
- Testing setup (handled in task 003)

## Testing Notes
- Testing infrastructure not yet available
- Tests will be added in future task after Vitest setup
- Focus on manual verification for this task