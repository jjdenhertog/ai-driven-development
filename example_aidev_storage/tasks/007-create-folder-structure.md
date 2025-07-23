---
id: "007"
name: "create-folder-structure"
type: "feature"
dependencies: ["001-init-nextjs-project"]
estimated_lines: 50
priority: "critical"
---

# Setup: Create Project Folder Structure

## Overview
Create the complete folder structure for the AFX Render Manager application following the architecture specifications.

## User Stories
- As a developer, I want a well-organized folder structure so that I can find code easily
- As a developer, I want consistent organization so that the project scales well

## Technical Requirements
- Create all directories as specified in technical architecture
- Add README files to explain each directory's purpose
- Set up index files for barrel exports where appropriate

## Acceptance Criteria
- [ ] All specified directories created
- [ ] README.md files in key directories
- [ ] Barrel exports set up for components
- [ ] .gitkeep files in empty directories
- [ ] Structure matches architecture document

## Testing Requirements

### Test Coverage Target
- Directory structure validation

### Required Test Types (if testing infrastructure exists)
- **Build Tests**: All imports resolve correctly

### Test Scenarios
#### Happy Path
- [ ] All directories exist as specified
- [ ] Import paths work correctly

## Implementation Notes
Create the following structure:
```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── (auth)/           # Auth-required routes
│   └── (public)/         # Public routes
├── components/
│   ├── ui/               # B-prefixed MUI components
│   ├── layout/           # Layout components
│   └── features/         # Feature-specific components
├── features/
│   ├── auth/            # Authentication feature
│   ├── jobs/            # Job management
│   ├── admin/           # Admin dashboard
│   └── render/          # Render execution
├── hooks/               # Custom React hooks
├── lib/                 # Core libraries
├── schemas/             # Zod validation schemas
├── services/            # Business logic services
├── types/               # TypeScript types
└── utils/               # Utility functions

prisma/                  # Database schema
public/                  # Static assets
scripts/                 # Utility scripts
```

## Code Reuse
- Use project structure from technical_architecture.json

## Examples to Reference
- Project structure in technical architecture document

## Documentation Links
- [Next.js Project Structure](https://nextjs.org/docs/app/building-your-application/routing/colocation)

## Potential Gotchas
- App Router has specific naming conventions
- Route groups use parentheses
- Some directories need _components folders

## Out of Scope
- Individual component files
- Detailed feature implementations

## Testing Notes
- Verify all directories are created
- Check that imports work from each directory