---
name: "Enhanced PRP for init-nextjs-project"
task_id: "001"
phase: "architect"
incorporates_inventory: true
test_first_approach: true
---

# 🎯 Goal

Create a new Next.js 15.x project using App Router with TypeScript support and proper directory structure for the AFX Render Manager application. This is the foundational setup that all future features will build upon.

## 📊 Inventory Findings

### Reusable Components Identified
- No existing components found (new project initialization)
- Preference files available for guidance on structure and conventions
- AI-Dev guidelines available in CLAUDE.md

### Duplication Warnings
- This is a new project initialization - no duplication concerns
- Must establish patterns that prevent future duplication

### Pattern Matches
- Will follow established patterns from preference files:
  - Feature-first directory organization
  - TypeScript with strict mode
  - React Context API for state management (not Redux/Zustand)
  - npm as package manager

## 🧪 Test-First Development Plan

### Test Strategy
1. **Smoke Tests**: Immediate validation of basic functionality
   - Development server starts correctly
   - Build process completes without errors
   - Basic page renders

2. **Unit Tests**: Component-level testing (to be added with testing framework)
   - App component renders without errors
   - Layout applies correct structure
   - Metadata is properly set

3. **Integration Tests**: System-level validation
   - Development environment hot reload
   - Production build optimization
   - TypeScript compilation

### Test Specifications
- **Coverage Target**: 80% (when testing framework is added)
- **Initial Focus**: Smoke tests for basic functionality
- **Test Files**: Will be created in Phase 2 when testing infrastructure is added
- **Key Test Scenarios**:
  - App starts on port 3000
  - No console errors on page load
  - TypeScript compiles without errors
  - ESLint passes with no violations

### Coverage Requirements
- Initial setup: Smoke tests only
- Future requirement: 80% code coverage minimum
- Critical paths: Home page rendering, build process

## 🏗️ Architecture Design

### Component Hierarchy
```
<RootLayout>                    // src/app/layout.tsx
  <html>
    <body>
      <HomePage />              // src/app/page.tsx
    </body>
  </html>
</RootLayout>
```

### State Management
- Initial: No state management needed
- Future: React Context API (per technology-stack.md)
- Preparation: Structure supports provider wrappers in layout.tsx

### Data Flow
- Static rendering for initial setup
- Server Components by default
- Client Components only when needed for interactivity

### Directory Structure
```
afx-render-manager/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Home page
│   │   └── globals.css        # Global styles
│   ├── components/            # Shared components (future)
│   │   └── ui/               # UI library (future)
│   ├── features/             # Feature modules (future)
│   ├── lib/                  # Utilities (future)
│   ├── hooks/                # Custom hooks (future)
│   └── types/                # TypeScript types (future)
├── public/                    # Static assets
├── package.json
├── tsconfig.json
├── next.config.js
├── .eslintrc.json
└── .gitignore
```

## 📦 Implementation Plan

### Phase 2: Test Designer
- Skip for initial setup (no testing framework yet)
- Document test specifications for future implementation
- Plan smoke test procedures

### Phase 3: Programmer
1. Run `npx create-next-app@latest` with specific options:
   - TypeScript: Yes
   - ESLint: Yes
   - Tailwind CSS: No
   - `src/` directory: Yes
   - App Router: Yes
   - Import alias: Yes (@/*)

2. Clean up default content:
   - Remove default styles except essential globals
   - Replace home page with AFX Render Manager welcome
   - Update metadata in layout.tsx

3. Verify directory structure matches design

4. Ensure all configuration files are properly set:
   - Strict TypeScript configuration
   - ESLint with Next.js rules
   - Comprehensive .gitignore

### Phase 4: Test Executor
1. Run smoke tests:
   - `npm install` completes successfully
   - `npm run dev` starts on port 3000
   - Browser loads without console errors
   - `npm run build` completes without errors

2. Validate file structure

3. Check TypeScript and ESLint compliance

### Phase 5: Reviewer
1. Verify all acceptance criteria met
2. Check code follows conventions from preference files
3. Ensure no unnecessary files or dependencies
4. Validate documentation completeness

## ✅ Acceptance Criteria

### Functional Requirements
- [ ] Next.js 15.x project created with create-next-app
- [ ] TypeScript configuration properly set up with strict mode
- [ ] App Router structure in place
- [ ] Development server runs on port 3000
- [ ] Build process completes without errors
- [ ] .gitignore includes common patterns
- [ ] Clean home page with AFX Render Manager branding
- [ ] Proper metadata in layout.tsx

### Non-Functional Requirements
- Performance: Fast development server startup (<3s)
- Security: No exposed secrets or sensitive data
- Accessibility: Semantic HTML structure
- Code Quality: ESLint passes with no errors

### Test Criteria
- Development server starts without errors
- No console errors in browser
- Build completes successfully
- TypeScript compilation succeeds

## 🚨 Risk Mitigation

### Technical Risks
1. **Node.js Version Compatibility**
   - Risk: Developer might have older Node.js
   - Mitigation: Clear documentation of Node.js 20.x requirement
   - Detection: Package.json engines field

2. **Windows Path Issues**
   - Risk: Path handling differences on Windows
   - Mitigation: Use cross-platform approaches
   - Detection: Test on both platforms

3. **Dependency Conflicts**
   - Risk: Future dependencies might conflict
   - Mitigation: Lock versions appropriately
   - Detection: Regular dependency audits

### Mitigation Strategies
- Document all prerequisites clearly
- Use exact versions for critical dependencies
- Include troubleshooting guide in README
- Follow established patterns from preference files

## 📋 Detailed Implementation Steps

### Step 1: Project Initialization
```bash
npx create-next-app@latest afx-render-manager --typescript --eslint --no-tailwind --src-dir --app --import-alias "@/*"
```

### Step 2: Clean Default Content
1. Update `src/app/page.tsx`:
   - Remove default Next.js content
   - Add AFX Render Manager welcome message
   - Ensure proper TypeScript types

2. Update `src/app/layout.tsx`:
   - Set proper metadata (title, description)
   - Keep minimal structure
   - Prepare for future provider wrappers

3. Clean `src/app/globals.css`:
   - Remove default styles
   - Keep only essential resets
   - Add base typography

### Step 3: Directory Structure Setup
1. Create required directories:
   - `src/components/ui/`
   - `src/features/`
   - `src/lib/`
   - `src/hooks/`
   - `src/types/`

2. Add `.gitkeep` files to empty directories

### Step 4: Configuration Validation
1. Verify `tsconfig.json`:
   - Strict mode enabled
   - Path aliases configured
   - Target ES2022 or later

2. Check `.eslintrc.json`:
   - Next.js recommended rules
   - No conflicting configurations

3. Update `package.json`:
   - Set correct project name
   - Add description
   - Verify scripts

## 🔄 Code Reuse Checklist

Before implementing ANY new code:
- [x] Check inventory catalog for existing implementations - None found (new project)
- [x] Review reusable_components.json - Empty (new project)
- [x] Verify no duplication of functionality - N/A (new project)
- [x] Extend existing components where possible - N/A (new project)
- [x] Follow established patterns - Using preference files

## 📐 Design Patterns

### Patterns to Follow
- **Feature-First Organization**: From folder-structure.md
- **Server Components by Default**: Next.js 15 best practice
- **TypeScript Strict Mode**: From technology-stack.md
- **Minimal Initial Setup**: Progressive enhancement approach

### Anti-Patterns to Avoid
- No Redux or Zustand (use Context API when needed)
- No SWR (use TanStack Query when needed)
- No mixed styling systems (MUI only, no Tailwind)
- No Pages Router patterns

## 🎯 Success Metrics

- Development server starts in <3 seconds
- Zero TypeScript errors
- Zero ESLint violations
- Build completes successfully
- All directories created per structure
- Clean, minimal initial setup ready for features
