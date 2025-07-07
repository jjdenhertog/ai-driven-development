# Claude Documentation Index

This directory contains all the documentation and guidelines for AI-assisted development in this project.

## Core Documents

### 📋 **PROJECT.md**
The main project overview containing:
- Technology stack details
- Project structure
- Coding style guidelines
- Development workflow

### 📝 **TODO.md**
Current task list - check this before starting work

## Detailed Guides

### 💻 **CODING_PATTERNS.md**
Comprehensive coding patterns reference:
- Naming conventions
- Component patterns
- TypeScript usage
- State management patterns
- Error handling
- Import organization

### 🌐 **API_PATTERNS.md**
Detailed API development patterns:
- Custom middleware helpers
- Error handling with Sentry
- Caching strategies
- Rate limiting
- Pagination
- File uploads

### ⚡ **PERFORMANCE_PATTERNS.md**
Performance optimization patterns:
- useMemo guidelines
- Context value memoization
- React.memo usage
- Code splitting
- Server vs Client components

### 🎨 **STYLING_GUIDE.md**
Complete styling approach:
- CSS Modules vs MUI sx prop
- Theme configuration
- Color system
- Animation patterns
- Responsive design

### 🔄 **STATE_MANAGEMENT_GUIDE.md**
State management patterns:
- TanStack Query setup
- Query key conventions
- Optimistic updates
- Cache management
- Form state handling

## Quick Reference

### Technology Stack
- **Framework**: Next.js 15 with App Router
- **UI**: Material-UI (MUI)
- **State**: Zustand + TanStack Query
- **Database**: Prisma with MySQL
- **Caching**: Redis
- **Auth**: NextAuth.js
- **Validation**: Zod
- **Testing**: Vitest (only when requested)

### Key Patterns
1. Arrow functions for components
2. Readonly interface properties
3. useCallback for all event handlers
4. useMemo for expensive computations
5. 2-line if statements without braces
6. No return types when TypeScript can infer
7. @ts-ignore over type casting
8. Minimal documentation

### Important Notes
- Never import GSAP (manually added)
- Only create tests when explicitly requested
- Use provided linting commands only
- Server Components by default
- Always validate with Zod in API routes

## Where to Start

1. Read **PROJECT.md** for project overview
2. Check **TODO.md** for current tasks
3. Reference **CODING_PATTERNS.md** for style guidelines
4. Use specific guides as needed for deep dives

## Related Files

- `/CLAUDE.md` - Root-level guidelines
- `/PROMPTS/` - Prompt templates
- `/PRPs/` - Product Requirement Prompts
- `/examples/` - Code examples demonstrating patterns
- `/mypreferences/` - Original preference documents