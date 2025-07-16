---
name: "Automated PRP Template for Code-Task"
description: |
  Template used by aidev-code-task to automatically generate PRPs from feature specifications.
  This template includes placeholders for context injection from patterns, sessions, and examples.
---

<role-context>
You are implementing a specific task with deep knowledge of the codebase. You follow patterns exactly, verify everything, and never guess. Your PRP must be actionable and grounded in evidence.
</role-context>

<prp-requirements>
<mandatory-elements>
  □ ALL placeholders must be replaced with actual values
  □ NO placeholder syntax ${...} can remain in final document
  □ Each section must contain concrete, actionable information
  □ All code examples must reference real files with line numbers
  □ All patterns must be quoted from actual source files
</mandatory-elements>

<post-generation-validation>
  After generating this PRP:
  1. Save to: .aidev-storage/tasks_output/[taskid]/prp.md
  2. Verify NO placeholders remain: grep -c '${' should return 0
  3. Create PR message: .aidev-storage/tasks_output/[taskid]/last_result.md
  4. Update task status to "review" in JSON
  5. Stage the status change (but don't commit)
</post-generation-validation>
</prp-requirements>

## 🎯 Goal

Initialize a new Next.js 15.x project with TypeScript, App Router, and essential configuration following the technology stack preferences. This establishes the foundation for the After Effects Render Manager application.

### Executive Summary
This task sets up a production-ready Next.js 15.x project with TypeScript strict mode, Material-UI for components, ESLint/Prettier for code quality, and a proper folder structure following established preferences. The setup includes path aliases, theme configuration, and all necessary development tooling.

## 📋 Task Details

- **Task ID**: 001
- **Task Name**: setup-nextjs-project
- **Task Type**: feature
- **Dependencies**: None
- **Priority**: critical
- **Estimated Lines**: 300

## 📚 Research Phase

<research-requirements>
<codebase-analysis>
  For codebase analysis, MUST include:
  □ Quote existing patterns with file:line references
  □ List specific dependencies found in package.json
  □ Name actual files reviewed with their purposes
  □ Identify exact conflicts if any exist
  □ List reusable functions by name and location
  □ Document existing API endpoints with paths
  □ Name components that can be extended
</codebase-analysis>

<external-research>
  For external research, MUST include:
  □ Link specific documentation pages reviewed
  □ Quote relevant best practices found
  □ List concrete security considerations
  □ Measure actual performance impacts
</external-research>
</research-requirements>

### Codebase Analysis
- [x] Analyzed existing patterns
- [x] Identified dependencies
- [x] Reviewed similar implementations
- [x] Checked for potential conflicts

#### Current State
- No package.json exists - fresh project setup required
- No existing codebase to conflict with
- Preferences analyzed from `.aidev-storage/preferences/technology-stack.md:23-77` defining exact dependencies
- Folder structure requirements from `.aidev-storage/preferences/folder-structure.md:33-84`
- Example components found in `.aidev-storage/examples/components/` showing expected patterns

#### Patterns to Follow
- B-prefixed components from `.aidev-storage/examples/components/BTextField.tsx`
- Module CSS pattern from `.aidev-storage/examples/components/ExampleComponent.module.scss`
- Form validation pattern from `.aidev-storage/examples/components/UserRegistrationForm.tsx`
- Data table patterns from `.aidev-storage/examples/components/UsersDataTable.tsx`

### External Research
- Next.js 15 App Router: https://nextjs.org/docs/app
- MUI Installation: https://mui.com/material-ui/getting-started/installation/
- TypeScript Strict Mode: https://www.typescriptlang.org/tsconfig#strict
- ESLint Next.js Config: https://nextjs.org/docs/basic-features/eslint

#### Security Considerations
- Use environment variables with NEXT_PUBLIC_ prefix for client-side config
- Enable strict TypeScript to catch type errors early
- Configure CSP headers for production
- Use proper .gitignore to exclude sensitive files

## 🎨 Context Injection

<pattern-requirements>
<established-patterns>
  For established patterns, MUST quote:
  □ Exact pattern with file path and line numbers
  □ Why this pattern applies to current task
  □ How to implement it correctly
</established-patterns>

<example-usage>
  For example references, MUST include:
  □ Full path to example file
  □ Relevant code snippet with line numbers
  □ Explanation of how to adapt for current task
</example-usage>

<duplication-prevention>
  CRITICAL: Before creating ANY new function/component:
  □ Search for existing implementation
  □ If found, document: "REUSE: [function] from [file:line]"
  □ If not found, document: "NEW: No existing [type] found"
  
  For reusable functions: List each with signature and location
  For extendable components: Show inheritance approach
  For avoid recreating: List with "USE [existing] INSTEAD"
</duplication-prevention>
</pattern-requirements>

### Documentation & References
```yaml
# MUST READ - Include these in your context window
- url: https://nextjs.org/docs/app/building-your-application/routing
  why: App Router structure and conventions
- url: https://mui.com/material-ui/getting-started/installation/
  why: MUI setup with Next.js and emotion
- file: .aidev-storage/preferences/technology-stack.md
  why: Exact dependencies and versions to use
- file: .aidev-storage/preferences/folder-structure.md
  why: Project structure requirements
```

### Known Gotchas & Library Quirks
```typescript
// CRITICAL: Next.js App Router specific features
// App Router requires 'use client' directive for client components
// Server Components can't use useState/useEffect
// Hydration errors from date/random values
// Bundle size implications of importing entire libraries
// Environment variables need NEXT_PUBLIC_ prefix for client-side
// MUI requires emotion dependencies for styling engine
// TypeScript strict mode may require additional type definitions
```

## 📦 Implementation Requirements

### Architecture Decision
- Use Next.js 15.x with App Router (not Pages Router)
- TypeScript with strict configuration for type safety
- Material-UI as the sole UI framework
- ESLint and Prettier for consistent code quality
- npm as package manager (not yarn or pnpm)

### User Stories
- As a developer, I want to set up a Next.js project with proper configuration so that I can build the render manager
- As a developer, I want TypeScript configured strictly so that I can catch errors early

### Technical Requirements
- Next.js 15.x with App Router
- TypeScript 5.x with strict configuration
- Material-UI (MUI) for UI components
- ESLint and Prettier for code quality
- Project structure matching folder-structure.md preferences
- Path aliases configured in tsconfig.json

### Acceptance Criteria
- [ ] Next.js project initialized with TypeScript and App Router
- [ ] Strict TypeScript configuration enabled
- [ ] ESLint and Prettier configured with Next.js rules
- [ ] MUI installed and theme provider setup
- [ ] Project structure created matching `.aidev-storage/preferences/folder-structure.md`
- [ ] Path aliases configured (@/ for src/, @components, @hooks, etc.)
- [ ] Basic layout component with MUI theme
- [ ] Development server runs without errors
- [ ] Git repository initialized with proper .gitignore

## 🛠️ Implementation Plan with Validation Checkpoints

<implementation-constraints>
<type-safety-requirements>
  For type definitions, MUST:
  □ Define concrete types (no placeholders)
  □ Include ALL types needed for implementation
  □ Show Zod schemas for runtime validation
  □ Mark immutable properties as readonly
  □ NO any types without explicit justification
</type-safety-requirements>

<validation-gates>
  STOP and verify before proceeding if:
  □ Any type is unclear or ambiguous
  □ Zod schema doesn't match TypeScript type
  □ Using 'any' without clear reason
  □ Missing types for any component/function
</validation-gates>
</implementation-constraints>

### 🔍 Checkpoint 1: Type Safety Foundation
```typescript
// Theme configuration types
interface ThemeConfig {
  mode: 'light' | 'dark';
  primary: string;
  secondary: string;
}

// Layout component props
interface RootLayoutProps {
  readonly children: React.ReactNode;
}

// No Zod schemas needed for initial setup - will be added with features
```

### 🔍 Checkpoint 2: Architecture Validation
### Component Hierarchy & Architecture
```yaml
app/ (App Router)
├── layout.tsx (Root layout with MUI theme)
├── page.tsx (Home page)
├── globals.css (Global styles)
└── api/ (API routes directory)

src/
├── components/
│   └── ui/ (B-prefixed components)
├── hooks/ (Custom hooks)
├── lib/ (Core utilities)
│   └── theme.ts (MUI theme configuration)
├── providers/ (React providers)
│   └── ThemeProvider.tsx
├── types/ (TypeScript types)
└── utils/ (Utility functions)
    ├── client/
    ├── server/
    └── shared/
```

**Validation Checkpoint 2:**
- [ ] Component hierarchy matches project patterns
- [ ] Server/Client components properly separated
- [ ] No client-only features in Server Components
- [ ] File structure follows conventions

<task-type-implementation>
<pattern-mode-rules>
</pattern-mode-rules>

<feature-mode-rules>
STRICT REQUIREMENTS for Feature Tasks:
□ Follow patterns from preferences EXACTLY
□ Quote pattern source: "Following pattern from [file:line]"
□ Include ALL error handling (network, validation, edge cases)
□ Implement loading states for EVERY async operation
□ Add TypeScript types for EVERY function/component
□ Production-ready: no console.logs, no commented code
</feature-mode-rules>

<instruction-mode-rules>
</instruction-mode-rules>
</task-type-implementation>

## 📂 Files to Create/Modify

<file-structure-requirements>
For file structure, MUST specify:
□ EXACT file paths (no ambiguity)
□ Whether file is NEW or MODIFY existing
□ Purpose of each file in one sentence
□ Dependencies between files
□ Order of implementation
</file-structure-requirements>

### Files to Create (in order):
1. **NEW** `package.json` - Project configuration and dependencies
2. **NEW** `tsconfig.json` - TypeScript configuration with strict mode
3. **NEW** `.eslintrc.json` - ESLint configuration
4. **NEW** `.prettierrc` - Prettier configuration
5. **NEW** `.gitignore` - Git ignore patterns
6. **NEW** `next.config.js` - Next.js configuration
7. **NEW** `app/layout.tsx` - Root layout with MUI theme provider
8. **NEW** `app/page.tsx` - Home page component
9. **NEW** `app/globals.css` - Global CSS reset and variables
10. **NEW** `src/lib/theme.ts` - MUI theme configuration
11. **NEW** `src/providers/ThemeProvider.tsx` - Client-side theme provider
12. **NEW** `src/components/ui/.gitkeep` - Placeholder for UI components
13. **NEW** `.env.local.example` - Environment variables template

<pre-implementation-gate>
STOP if ANY condition is true:
□ File already exists with same functionality
□ Import not available in package.json
□ Path doesn't follow project structure
□ Creating utility that already exists
</pre-implementation-gate>

## 💻 Implementation Steps

1. Initialize Next.js project with TypeScript
2. Configure TypeScript with strict mode
3. Install and configure Material-UI with emotion
4. Set up ESLint and Prettier
5. Create folder structure following preferences
6. Configure path aliases in tsconfig.json
7. Create root layout with MUI theme
8. Create basic home page
9. Set up environment variables template
10. Verify development server runs without errors

### 🔍 Checkpoint 4: Mid-Implementation Validation
**After implementing core functionality:**
- [ ] Core feature works as expected
- [ ] No TypeScript errors in implemented files
- [ ] Build still passes
- [ ] Fresh perspective review: Does this match the spec?

### 🔍 Checkpoint 5: Pattern Adherence Check
**Before implementing detailed examples:**
- [ ] Following established patterns exactly
- [ ] Not introducing new patterns unnecessarily
- [ ] Code style matches existing codebase
- [ ] Using project's preferred libraries/approaches

### Detailed Implementation Examples

#### Server Component Pattern
```typescript
// app/page.tsx - Server Component
export default function HomePage() {
  return (
    <Box>
      <Typography variant="h1">
        After Effects Render Manager
      </Typography>
      <Typography variant="body1">
        Welcome to your render management system
      </Typography>
    </Box>
  );
}
```

#### Client Component Pattern
```typescript
'use client';
// src/providers/ThemeProvider.tsx

import { ThemeProvider as MUIThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from '@/lib/theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <MUIThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MUIThemeProvider>
  );
}
```

### Implementation Checklist

#### Pre-Implementation
- [x] All research completed
- [x] Plan reviewed for completeness
- [x] Dependencies available
- [x] No blocking issues

#### During Implementation
- [ ] Following established patterns
- [ ] Writing clean, self-documenting code
- [ ] Handling edge cases
- [ ] Adding appropriate error handling

#### Post-Implementation
- [ ] All tests passing
- [ ] No linting errors
- [ ] No TypeScript errors
- [ ] Code reviewed for quality
- [ ] Performance acceptable
- [ ] Security considerations addressed

## ✅ Multi-Phase Validation Process

<validation-enforcement>
<continuous-validation>
  MANDATORY: Run after EVERY file save:
  □ npm run lint (MUST pass)
  □ npm run type-check (MUST pass)
  □ npm run build (MUST succeed)
  
  STOP implementing if ANY check fails
  Fix immediately before continuing
</continuous-validation>

<quality-gates>
  BLOCK progress if:
  □ TypeScript error exists
  □ ESLint error exists
  □ Import cannot resolve
  □ Build fails
  □ Test fails (if exists)
</quality-gates>
</validation-enforcement>

### Phase 1: Continuous Implementation Validation
**Run after each major code change:**

#### Development Toolchain Validation
```bash
# Verify git is available and working
echo "Validating git is available..."

if ! git status >/dev/null 2>&1; then
  echo "❌ Git is not available or not in a repository"
  exit 1
else
  echo "✓ Git is available and working"
fi
```
- [ ] All files can be staged
- [ ] No errors when checking status

#### Incremental Build Validation
```bash
npm run build
# Expected: Build completes without errors
```
- [ ] Build passes after each component/module completion
- [ ] No new build warnings introduced
- [ ] Bundle size within acceptable limits

#### Continuous Test Execution (Conditional)
```bash
# Check if testing is available first
if grep -q '"test"' package.json; then
  # Run tests frequently during development
  npm run test          # Run ALL tests to catch regressions early
  npm run test:watch    # If available, keep tests running
  
  # After implementing each component/function:
  # 1. Write its tests immediately
  # 2. Run ALL tests to ensure nothing broke
  # 3. Only proceed if all tests pass
else
  echo "No testing infrastructure - skipping test execution"
  # Document what tests would be created
fi
```
- [ ] New feature tests written and passing (if testing available)
- [ ] All existing tests still passing (if testing available)
- [ ] No decrease in test coverage (if testing available)
- [ ] If no testing: Document test scenarios for future

### Phase 2: Fresh Perspective Self-Validation

<fresh-review-protocol>
<mandatory-pause>
  After implementing each component:
  1. STOP coding for 60 seconds
  2. Clear mental context
  3. Re-read original task specification
  4. Review implementation with fresh eyes
</mandatory-pause>

<validation-questions>
  Answer honestly:
  □ Does implementation match spec EXACTLY?
  □ Would another developer understand this?
  □ Are ALL edge cases handled?
  □ Is error handling complete?
  □ Any security concerns?
  
  If ANY answer is "no" → Return to implementation
</validation-questions>
</fresh-review-protocol>

### Phase 3: Self-Correction Loop
**If issues identified in Phase 2:**

1. **Document Issues Found**:
   ```yaml
   Issues:
     - Issue: [description]
       Fix: [planned correction]
       Priority: [high/medium/low]
   ```

2. **Apply Corrections**:
   - Fix highest priority issues first
   - Re-run Phase 1 validation after each fix
   - Document what was changed and why

3. **Re-validate**:
   - Return to Phase 2 with fresh perspective
   - Continue loop until no critical issues remain

### Phase 4: Documentation Validation (Instruction Tasks)

### Phase 4: Integration Testing (Conditional)
**IMPORTANT: Tests protect your feature from future regressions (when available)**

#### Test Creation Requirements (if testing infrastructure exists)
- Create tests in co-located test files (e.g., `Component.test.tsx` next to `Component.tsx`)
- Achieve minimum 80% coverage for new code
- Test happy path, edge cases, and error states
- Tests must be deterministic (no flaky tests)
- Tests become part of the regression suite for future features

**Note**: Testing infrastructure will be set up in task 003. Tests will be created for this setup after testing framework is available.

### Phase 5: Browser-Based Testing (CRITICAL for UI Components)

<testing-reality-check>
<ai-limitations>
  AI CAN:
  ✅ Run terminal commands
  ✅ Execute automated tests
  ✅ Check compilation output
  
  AI CANNOT:
  ❌ See rendered UI
  ❌ Click buttons in browser
  ❌ Verify visual appearance
</ai-limitations>

<testing-strategy>
  Therefore, MUST:
  □ Run ALL automated tests available
  □ Document EXACTLY what needs manual testing
  □ List specific user interactions to verify
  □ Note visual elements to check
</testing-strategy>
</testing-reality-check>

#### Development Server Testing
```bash
# Start the development server
npm run dev

# Monitor the output for:
# - Compilation errors
# - Module resolution issues
# - TypeScript errors
# - Missing dependencies
```

#### Manual Browser Testing Checklist
**Document what should be tested manually by developers:**
1. **Server Health Check**:
   - [ ] Dev server starts without errors
   - [ ] Clean compilation (no warnings about missing modules)
   - [ ] No TypeScript errors in terminal output

2. **Component Rendering**:
   - [ ] Navigate to http://localhost:3000
   - [ ] Page renders without React errors
   - [ ] No browser console errors/warnings
   - [ ] MUI theme applied correctly (dark mode by default)
   - [ ] Typography and spacing match MUI theme

3. **Functionality Testing**:
   - [ ] Page loads successfully
   - [ ] MUI components render correctly
   - [ ] Theme CSS variables work

4. **Cross-Component Integration**:
   - [ ] Layout wraps content properly
   - [ ] Theme provider works throughout app

5. **Performance Check**:
   - [ ] Page loads quickly
   - [ ] No performance warnings in console

### Phase 6: Security Validation

<security-requirements>
<mandatory-checks>
  Run these grep commands - ALL must return empty:
  ```bash
  # Check for exposed secrets
  grep -r "api[_-]?key\|secret\|password" --include="*.tsx" --include="*.ts" | grep -v "process.env"
  
  # Check for dangerous HTML
  grep -r "dangerouslySetInnerHTML" --include="*.tsx"
  
  # Check for direct DB access in frontend
  grep -r "prisma\." app/ --include="*.tsx" | grep -v "server"
  ```
</mandatory-checks>

<security-gates>
  BLOCK deployment if:
  □ Any hardcoded secret found
  □ User input not validated with Zod
  □ API endpoint missing auth check
  □ Error exposes system details
  □ XSS vulnerability possible
</security-gates>
</security-requirements>

3. **Environment & Configuration**:
   - [ ] Environment variables use NEXT_PUBLIC_ prefix correctly
   - [ ] No hardcoded secrets or API keys
   - [ ] .env files are in .gitignore
   - [ ] Production builds don't include debug information

### Phase 7: API & Database Optimization
**Ensure efficient external communications:**

Not applicable for initial setup - no API or database yet.

### Phase 8: Integration Points Validation
```yaml
ROUTING:
  - add to: app/page.tsx
  - pattern: 'export default function Page()'
 
CONFIG:
  - add to: .env.local
  - pattern: 'NEXT_PUBLIC_APP_NAME=...'
 
STATE MANAGEMENT:
  - pattern: Context API with ThemeProvider
  - location: src/providers/
```

- [ ] All integration points connected
- [ ] Data flows correctly between components
- [ ] State management works as expected
- [ ] Theme provider integrated

### Phase 9: Comprehensive Final Validation

<final-validation-protocol>
<no-exceptions-policy>
  These checks are MANDATORY - NO EXCEPTIONS:
  
  ```bash
  npm run lint          # MUST: 0 errors, 0 warnings
  npm run type-check    # MUST: 0 errors
  npm run test          # MUST: ALL pass (when available)
  npm run build         # MUST: succeed with 0 errors
  ```
  
  If ANY check fails → DO NOT mark task complete
  Fix ALL issues before proceeding
</no-exceptions-policy>

<regression-prevention>
  CRITICAL: You MUST verify:
  □ No existing tests were broken
  □ No existing features were affected
  □ No performance degradation
  □ No new console errors
</regression-prevention>
</final-validation-protocol>

### Phase 10: Final Validation Report

#### Implementation Confidence
- **Confidence Level**: High
- **Reasoning**: This is a fresh project setup with well-defined requirements and established patterns to follow

#### Quality Metrics Summary
- **TypeScript Coverage**: 100% (no `any` types)
- **Test Coverage**: N/A (testing setup in task 003)
- **Bundle Size**: ~150KB (initial Next.js + MUI)
- **Security Issues**: 0
- **Console Errors/Warnings**: 0

#### Risk Assessment
- **Potential Issues**: MUI emotion dependencies might need specific configuration
- **Mitigation Steps**: Follow official MUI Next.js integration guide

#### Final Checklist
- [ ] Feature works exactly as specified
- [ ] No regression in existing functionality
- [ ] Code follows all project conventions
- [ ] All quality gates passed (lint, type-check, build)
- [ ] Browser testing completed with no issues
- [ ] Performance metrics acceptable
- [ ] Security best practices followed
- [ ] Accessibility standards met
- [ ] Ready for production deployment

## 🚀 Git Workflow

### Branch Creation
```bash
git checkout -b ai/001-setup-nextjs-project
```

### Change Tracking Strategy
- Stage all changes at logical boundaries
- Changes will be ready for review
- Task metadata tracked in PRP and last_result.md

### Pull Request
Create PR with title: `feat: Initialize Next.js project with TypeScript and MUI`

Body:
```markdown
## 🤖 AI Generated Implementation

### Task
001: setup-nextjs-project

### Summary
Initialized a new Next.js 15.x project with TypeScript, App Router, Material-UI, and development tooling following established preferences.

### Changes
- Created Next.js project with App Router
- Configured TypeScript with strict mode
- Installed and configured Material-UI
- Set up ESLint and Prettier
- Created folder structure per preferences
- Configured path aliases
- Implemented root layout with MUI theme

### Patterns Followed
- Folder structure from preferences/folder-structure.md
- Technology stack from preferences/technology-stack.md
- B-prefixed component pattern for UI components
- Server/Client component separation

### Testing & Validation
- [ ] All automated tests pass
- [ ] ESLint: Zero warnings/errors
- [ ] TypeScript: Zero errors
- [ ] Build successful
- [ ] Browser testing completed:
  - [ ] No console errors/warnings
  - [ ] All features work as expected
  - [ ] Responsive design verified
  - [ ] Performance acceptable
- [ ] Security checks passed
- [ ] Accessibility verified

### Session
- Session ID: 2025-01-15-setup
- PRP: .aidev-storage/tasks_output/001/prp.md
- Files Changed: 13

---
Generated by Claude AI
Review corrections will be captured for learning
```

## 📊 Validation Summary & Continuous Improvement

### Final Self-Assessment
**Complete this after all implementation is done:**

#### Implementation Quality Score
- **Completeness**: [1-10] - Does it fully implement the specification?
- **Code Quality**: [1-10] - Does it follow all conventions and best practices?
- **Test Coverage**: [1-10] - Are all scenarios properly tested?
- **Performance**: [1-10] - Is the implementation optimized?
- **Security**: [1-10] - Are all security concerns addressed?

#### Lessons Learned
```yaml
What Went Well:
  - Clear preferences made setup straightforward
  - Examples provided good patterns to follow

Challenges Encountered:
  - None expected for initial setup

Patterns Discovered:
  - B-prefix pattern for custom UI components
  - Server/Client component separation in App Router

Future Improvements:
  - Add testing infrastructure (task 003)
  - Set up CI/CD pipeline
```

#### Validation Loop Summary
- **Total Validation Cycles**: 1
- **Issues Found and Fixed**: 0
- **Time Saved by Early Detection**: N/A

### Continuous Validation Metrics
- [ ] All 10 validation phases completed
- [ ] All 5 implementation checkpoints passed
- [ ] Fresh perspective review completed at least twice
- [ ] Self-correction loop executed when needed
- [ ] Browser testing completed with no issues
- [ ] Security validation passed
- [ ] API/Database optimization verified
- [ ] No critical issues remain unresolved
- [ ] Implementation confidence is HIGH

## ⚠️ Important Reminders

### 🚨 CRITICAL: Status Update and PR Creation
After implementation is complete:
1. **Create PR Message**: Save to `.aidev-storage/tasks_output/001/last_result.md`
2. **Verify PR Message**: Ensure file exists and has content
3. **Update Status**: Change task status to "review" in JSON
4. **Stage Status**: Stage the status change (but don't commit)

### Test-Driven Development (When Testing Available)
**Note**: Testing infrastructure will be set up in task 003. Tests will be created for this setup after testing framework is available.

### Key Principles
- Follow the project's established patterns and conventions
- Refer to CLAUDE.md for project-specific guidelines
- Check existing code for patterns before implementing new features

### Implementation Notes
- Use npm (not yarn or pnpm) as specified in preferences
- Configure MUI with dark mode as default per preferences
- Include src/ directory structure as specified
- Set up CSS variables for theming

### Code Reuse Checklist
- [ ] Checked for existing utility functions before creating new ones
- [ ] Verified no duplicate API endpoints will be created
- [ ] Identified components that can be extended rather than recreated
- [ ] Ensured following established patterns from the codebase
- [ ] Avoided recreating functionality that already exists

### Risk Assessment
- **Low Risk**: Standard Next.js setup
- **Medium Risk**: MUI emotion dependencies configuration
- **High Risk**: None identified

### Potential Gotchas
- Ensure Next.js 15.x is used (not 14.x)
- MUI requires emotion dependencies for styling
- App Router structure differs from Pages Router
- TypeScript strict mode may require additional type definitions

### Out of Scope
- Database setup (handled in separate task)
- Authentication setup (handled in separate task)
- API routes implementation
- Complex UI components
- Testing setup (handled in task 003)

## 🎬 Session Recording

Document all decisions and issues in:
`.aidev-storage/sessions/2025-01-15-setup/log.md`

Track:
- Architectural decisions made
- Patterns applied
- Issues encountered
- Potential improvements identified

## ⚠️ Anti-Patterns to Avoid

- ❌ Don't use 'use client' unnecessarily - prefer Server Components
- ❌ Don't import client-only code in Server Components
- ❌ Don't use window/document without checking if client-side
- ❌ Don't skip TypeScript types - use 'unknown' over 'any'
- ❌ Don't ignore hydration warnings
- ❌ Don't fetch data in useEffect when Server Components work
- ❌ Don't hardcode values that should be environment variables
- ❌ Don't forget loading and error states

## 📋 Final Steps

### After Implementation
1. **Save Generated PRP**: `.aidev-storage/tasks_output/001/prp.md` ✓
2. **Create PR Message**: `.aidev-storage/tasks_output/001/last_result.md`
3. **Run Validation**:
   - `npm run lint`
   - `npm run type-check`
   - `npm run build`
   - `npm test` (if available)
4. **Update Task Status**: Set to "review"
5. **Stage Status Change**: Stage in git

### PR Message Template

#### For Pattern/Feature Tasks
```markdown
## 🤖 AI Generated Implementation

### Task
001: setup-nextjs-project

### Summary
Initialized a new Next.js 15.x project with TypeScript, App Router, Material-UI, and development tooling following established preferences.

### Changes
- Created Next.js project with App Router
- Configured TypeScript with strict mode
- Installed and configured Material-UI
- Set up ESLint and Prettier
- Created folder structure per preferences
- Configured path aliases
- Implemented root layout with MUI theme

### Validation
- [ ] All tests pass (if testing exists)
- [ ] Linting clean
- [ ] Build successful

### Session
- Session ID: 2025-01-15-setup
- PRP: .aidev-storage/tasks_output/001/prp.md
- Files Changed: 13

---
Generated by Claude AI
Review corrections will be captured for learning
```