name: "Automated PRP Template for Next-Task"
description: |
  Template used by aidev-next-task to automatically generate PRPs from feature specifications.
  This template includes placeholders for context injection from patterns, sessions, and examples.
---

## 🎯 Goal

${FEATURE_OVERVIEW}

### Executive Summary
${EXECUTIVE_SUMMARY}

## 📋 Task Details

- **Task ID**: ${TASK_ID}
- **Task Name**: ${TASK_NAME}
- **Task Type**: ${TASK_TYPE}
- **Dependencies**: ${DEPENDENCIES}
- **Priority**: ${PRIORITY}
- **Estimated Lines**: ${ESTIMATED_LINES}

## 📚 Research Phase

### Codebase Analysis
${CODEBASE_ANALYSIS}
- [ ] Analyzed existing patterns
- [ ] Identified dependencies
- [ ] Reviewed similar implementations
- [ ] Checked for potential conflicts
- [ ] Scanned for reusable utilities and helpers
- [ ] Mapped existing API endpoints
- [ ] Identified components to extend or reuse

### External Research
${EXTERNAL_RESEARCH}
- [ ] Reviewed relevant documentation
- [ ] Identified best practices
- [ ] Considered security implications
- [ ] Evaluated performance impacts

## 🎨 Context Injection

### Established Patterns
${ESTABLISHED_PATTERNS}

### Learned Patterns
${LEARNED_PATTERNS}

### Previous Session Context
${SESSION_CONTEXT}

### Example References
${EXAMPLE_REFERENCES}

### Existing Project Resources
${PROJECT_ANALYSIS}
- **Reusable Utilities**: ${EXISTING_UTILS}
- **Available Components**: ${REUSABLE_COMPONENTS}
- **Existing API Endpoints**: ${EXISTING_APIS}
- **Current Patterns**: ${CURRENT_PATTERNS}

### Duplication Prevention
${DUPLICATION_CHECK}
- **Functions to reuse instead of recreating**: ${REUSABLE_FUNCTIONS}
- **Components to extend**: ${EXTENDABLE_COMPONENTS}
- **Patterns to follow**: ${ESTABLISHED_CONVENTIONS}
- **AVOID recreating**: ${AVOID_RECREATING}

### Documentation & References
```yaml
# MUST READ - Include these in your context window
${DOCUMENTATION_REFERENCES}
# Example format:
# - url: https://nextjs.org/docs/[specific-section]
#   why: [Specific APIs/patterns you'll need]
# - file: [app/components/similar-component.tsx]
#   why: [Pattern to follow, component structure]
# - docfile: [.claude/documents/*.txt]
#   why: [docs that the user has pasted in to the project]
```

### Known Gotchas & Library Quirks
```typescript
${KNOWN_GOTCHAS}
// CRITICAL: Next.js App Router specific features
// Example: App Router requires 'use client' directive for client components
// Example: Server Components can't use useState/useEffect
// Example: Hydration errors from date/random values
// Example: Bundle size implications of importing entire libraries
// Example: Environment variables need NEXT_PUBLIC_ prefix for client-side
```

## 📦 Implementation Requirements

### Architecture Decision
${ARCHITECTURE_DECISION}

### User Stories
${USER_STORIES}

### Technical Requirements
${TECHNICAL_REQUIREMENTS}

### Acceptance Criteria
${ACCEPTANCE_CRITERIA}

## 🛠️ Implementation Plan with Validation Checkpoints

### 🔍 Checkpoint 1: Type Safety Foundation
### TypeScript Types and Interfaces
```typescript
${TYPE_DEFINITIONS}
// Define all types first for type safety and clarity
// Example structure:
// interface FeatureProps {
//   readonly id: string;
//   readonly name: string;
//   readonly onChange?: (value: string) => void;
// }
// 
// // Zod schemas for runtime validation (ALWAYS use in API routes)
// const featureSchema = z.object({
//   name: z.string().min(1, 'Name is required'),
//   email: z.string().email('Invalid email'),
// });
```

**Validation Checkpoint 1:**
- [ ] All types defined before implementation
- [ ] Zod schemas match TypeScript types
- [ ] No `any` types used
- [ ] All properties marked `readonly` where appropriate

### 🔍 Checkpoint 2: Architecture Validation
### Component Hierarchy & Architecture
```yaml
${COMPONENT_HIERARCHY}
# Example:
# FeatureComponent/ (Server Component)
# ├── FeatureProvider.tsx (Client Component - Context)
# ├── FeatureContent.tsx (Client Component - Interactive)
# │   ├── FeatureList.tsx
# │   └── FeatureItem.tsx
# ├── hooks/
# │   └── useFeature.ts (Custom hook)
# └── __tests__/
#     └── Feature.test.tsx
```

**Validation Checkpoint 2:**
- [ ] Component hierarchy matches project patterns
- [ ] Server/Client components properly separated
- [ ] No client-only features in Server Components
- [ ] File structure follows conventions

### Pattern Mode Implementation
${IF_PATTERN_MODE}
**Creating a new pattern: Focus on establishing conventions**
- Create minimal, exemplar implementation (50-100 lines)
- Include clear comments explaining architectural choices
- Establish naming conventions and file structure
- Create reusable components/utilities
- Document the pattern for future use
${END_IF_PATTERN_MODE}

### Feature Mode Implementation
${IF_FEATURE_MODE}
**Implementing production feature: Follow established patterns**
- Strictly follow patterns from: ${PATTERN_DEPENDENCIES}
- Implement complete functionality with error handling
- Include comprehensive TypeScript types
- Add loading and error states
- Write production-ready code
${END_IF_FEATURE_MODE}

## 📂 Files to Create/Modify

${FILE_STRUCTURE}

### 🔍 Checkpoint 3: Pre-Implementation Review
**Before starting implementation:**
- [ ] All file paths are correct and follow project structure
- [ ] No duplicate functionality being created
- [ ] Dependencies are available and imported correctly
- [ ] Implementation order makes logical sense

## 💻 Implementation Steps

${IMPLEMENTATION_STEPS}

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
// Example: Server Component with data fetching
export default async function Feature({ params }: FeatureProps) {
  // Direct DB/API call using Prisma
  const data = await prisma.feature.findUnique({
    where: { id: params.id }
  });

  if (!data) 
    notFound();

  // Pass serializable props to Client Components
  return (
    <Box>
      <FeatureHeader title={data.title} />
      <FeatureContent initialData={data} />
    </Box>
  );
}
```

#### Client Component Pattern
```typescript
'use client';

export const FeatureContent: React.FC<ContentProps> = ({ initialData }) => {
  // TanStack Query for client-side data
  const { data, error, isLoading } = useQuery({
    queryKey: ['feature', initialData.id],
    queryFn: async () => {
      const response = await fetch(\`/api/feature/\${initialData.id}\`);
      if (!response.ok) throw new Error('Failed to fetch');
      return response.json();
    },
    initialData,
  });

  // Memoized event handler with useCallback
  const handleClick = useCallback((id: string) => {
    console.log('Clicked:', id);
  }, []);

  // Expensive computation with useMemo
  const processedData = useMemo(() => {
    return data?.items.filter(item => item.active);
  }, [data?.items]);

  if (isLoading) 
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;

  if (error) 
    return <ErrorDisplay error={error} />;

  return (
    <Box sx={{ p: 2 }}>
      {processedData?.map(item => (
        <FeatureItem 
          key={item.id} 
          item={item} 
          onClick={handleClick}
        />
      ))}
    </Box>
  );
};
```

#### Custom Hook Pattern
```typescript
export function useFeature(id: string) {
  const queryClient = useQueryClient();
  
  const query = useQuery({
    queryKey: ['feature', id],
    queryFn: () => fetchFeature(id),
  });

  const mutation = useMutation({
    mutationFn: (data: UpdateFeatureData) => updateFeature(id, data),
    onSuccess: (updatedData) => {
      queryClient.setQueryData(['feature', id], updatedData);
      queryClient.invalidateQueries({ queryKey: ['features'] });
      enqueueSnackbar('Feature updated successfully');
    },
    onError: () => {
      enqueueSnackbar('Failed to update feature', { variant: 'error' });
    },
  });

  return {
    ...query,
    update: mutation.mutate,
    isUpdating: mutation.isPending,
  };
}
```

#### API Route Pattern
```typescript
// app/api/feature/[id]/route.ts
const updateSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  active: z.boolean().optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) 
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const validatedData = updateSchema.parse(body);

    const feature = await prisma.feature.update({
      where: { id: params.id },
      data: validatedData,
    });

    // Clear cache after mutation
    await redis.del(\`feature:\${params.id}\`);

    return NextResponse.json(feature);
  } catch (error) {
    if (error instanceof z.ZodError) 
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
```

### Implementation Checklist

#### Pre-Implementation
- [ ] All research completed
- [ ] Plan reviewed for completeness
- [ ] Dependencies available
- [ ] No blocking issues

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

### Phase 1: Continuous Implementation Validation
**Run after each major code change:**

#### Code Quality Checks
```bash
# Must pass before proceeding to next file/component
npm run lint          # ESLint with all rules
npm run type-check    # TypeScript strict mode
npm run format        # Prettier formatting
```
- [ ] No TypeScript errors
- [ ] No ESLint violations  
- [ ] Imports are correct and resolvable
- [ ] No `any` types without justification
- [ ] No console.log statements in production code
- [ ] No commented-out code blocks
- [ ] No TODO comments without tickets

#### Incremental Build Validation
```bash
npm run build
# Expected: Build completes without errors
```
- [ ] Build passes after each component/module completion
- [ ] No new build warnings introduced
- [ ] Bundle size within acceptable limits

#### Continuous Test Execution
```bash
# Run tests frequently during development
npm run test          # Run ALL tests to catch regressions early
npm run test:watch    # If available, keep tests running

# After implementing each component/function:
# 1. Write its tests immediately
# 2. Run ALL tests to ensure nothing broke
# 3. Only proceed if all tests pass
```
- [ ] New feature tests written and passing
- [ ] All existing tests still passing (regression check)
- [ ] No decrease in test coverage

### Phase 2: Fresh Perspective Self-Validation
**After completing each major component:**

1. **Mental Reset**: Step back and re-read the feature specification
2. **Implementation Review**: Review the code as if seeing it for the first time
3. **Simulate User Journey**:
   - [ ] Does the implementation match the specification?
   - [ ] Are all user flows properly handled?
   - [ ] Is the code intuitive and maintainable?
   
4. **Identify Gaps**:
   - [ ] Missing error handling
   - [ ] Incomplete edge cases
   - [ ] Accessibility concerns
   - [ ] Performance bottlenecks
   - [ ] Security vulnerabilities

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

### Phase 4: Integration Testing
${IF_TESTS_NEEDED}
**CRITICAL: Tests protect your feature from future regressions!**

#### Test Creation Requirements
- Create tests in co-located test files (e.g., `Component.test.tsx` next to `Component.tsx`)
- Achieve minimum 80% coverage for new code
- Test happy path, edge cases, and error states
- Tests must be deterministic (no flaky tests)
- Tests become part of the regression suite for future features

#### What to Test
1. **Unit Tests**: Individual functions and components in isolation
2. **Integration Tests**: Component interactions and data flow
3. **API Tests**: Endpoint behavior and error handling
4. **E2E Tests**: Critical user journeys (if Playwright/Cypress available)

#### Test Pattern Example
```typescript
// Component.test.tsx - Co-located with component
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('Feature', () => {
  it('renders without crashing', () => {
    render(<Feature {...mockProps} />);
    expect(screen.getByRole('heading')).toBeInTheDocument();
  });

  it('handles user interaction', async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    
    render(<Feature {...mockProps} onEdit={onEdit} />);
    await user.click(screen.getByRole('button'));
    expect(onEdit).toHaveBeenCalled();
  });

  it('handles error states gracefully', () => {
    render(<Feature {...errorProps} />);
    expect(screen.getByText(/error/i)).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(<Feature loading />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });
});
```
${END_IF_TESTS_NEEDED}

### Phase 5: Browser-Based Testing (CRITICAL for UI Components)
**When implementing UI components or features with visual elements:**

> **🤖 AI Testing Capabilities:**
> - ✅ Can run terminal commands (`npm run dev`, `npm test`, etc.)
> - ✅ Can check compilation output for errors
> - ✅ Can run Playwright/Cypress tests if configured
> - ❌ Cannot directly interact with a browser UI
> - ❌ Cannot visually see rendered components
> 
> **Therefore: Use automated tests when possible, document manual testing needs clearly**

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
   - [ ] Navigate to the implemented feature/page
   - [ ] Component renders without React errors
   - [ ] No browser console errors/warnings
   - [ ] Proper layout and styling
   - [ ] Responsive design works on all breakpoints

3. **Functionality Testing**:
   - [ ] All interactive elements work (buttons, forms, etc.)
   - [ ] State changes work correctly
   - [ ] Error states display properly (invalid inputs, network failures)
   - [ ] Loading states display properly
   - [ ] Form validation works as expected

4. **Cross-Component Integration**:
   - [ ] New components integrate with existing ones
   - [ ] Navigation between pages/features works
   - [ ] Data flow between components is correct
   - [ ] Context/state management works properly

5. **Performance Check**:
   - [ ] No unnecessary re-renders in React DevTools
   - [ ] No memory leaks in browser DevTools
   - [ ] No infinite loops or excessive API calls
   - [ ] Animations perform at 60fps
   - [ ] Bundle size is reasonable

#### Example Browser Test Session
```markdown
### Browser Testing Results
- Dev server started successfully ✓
- No compilation errors ✓
- Component renders at /dashboard ✓
- Console warnings: 0 ✓
- Interactive elements tested:
  - Submit button triggers API call ✓
  - Form validation works ✓
  - Error toast displays on failure ✓
- Performance: No excessive re-renders ✓
- Accessibility: Keyboard navigation works ✓
```

#### API Testing (for backend features)
For features that include API routes:

```bash
# Test API endpoints using curl or similar
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "testpass123"}'

# Check response format and status codes
# Verify error handling with invalid data
```

#### Automated E2E Testing (if Playwright is configured)
If the project has Playwright set up, create E2E tests:

```typescript
// e2e/feature.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Feature E2E Tests', () => {
  test('should render and interact with feature', async ({ page }) => {
    await page.goto('/feature-page');
    
    // Check page loads
    await expect(page.getByRole('heading')).toBeVisible();
    
    // Test interactions
    await page.getByRole('button', { name: 'Submit' }).click();
    await expect(page.getByText('Success')).toBeVisible();
    
    // Check for console errors
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    expect(errors).toHaveLength(0);
  });
});
```

Run E2E tests if available:
```bash
# Check if Playwright is installed
if [ -f "playwright.config.ts" ]; then
  npm run test:e2e
fi
```

**Note**: If Playwright is not set up, rely on manual browser testing as described above.

### Phase 6: Security Validation
**Run comprehensive security checks:**

#### Security Checklist
1. **Frontend Security**:
   - [ ] No API keys, secrets, or credentials in client-side code
   - [ ] No sensitive data in localStorage/sessionStorage
   - [ ] No direct database queries from frontend
   - [ ] No XSS vulnerabilities through user input
   - [ ] No dangerouslySetInnerHTML without DOMPurify
   - [ ] All user inputs escaped before rendering

2. **Backend/API Security**:
   - [ ] All API endpoints require proper authentication
   - [ ] All user inputs validated with schemas (Zod)
   - [ ] All database queries use parameterized statements
   - [ ] Error messages don't expose sensitive information
   - [ ] Proper CORS configuration
   - [ ] Rate limiting implemented where needed

3. **Environment & Configuration**:
   - [ ] Environment variables use NEXT_PUBLIC_ prefix correctly
   - [ ] No hardcoded secrets or API keys
   - [ ] .env files are in .gitignore
   - [ ] Production builds don't include debug information

```bash
# Security scan commands
grep -r "process.env" --include="*.tsx" --include="*.ts" | grep -v "NEXT_PUBLIC"
grep -r "dangerouslySetInnerHTML" --include="*.tsx"
grep -r "localStorage\|sessionStorage" --include="*.tsx" --include="*.ts"
```

### Phase 7: API & Database Optimization
**Ensure efficient external communications:**

#### API Optimization Checklist
1. **Request Efficiency**:
   - [ ] No duplicate API calls for same data
   - [ ] Requests are properly cached (SWR/React Query)
   - [ ] No sequential requests that could be batched
   - [ ] No overfetching of unused data fields
   - [ ] Proper pagination implemented

2. **Database Query Optimization**:
   - [ ] No N+1 query problems
   - [ ] Queries select only needed fields
   - [ ] Proper indexes used
   - [ ] Connection pooling configured
   - [ ] No raw SQL with user input

3. **Performance Patterns**:
   - [ ] Loading states during data fetching
   - [ ] Optimistic updates where appropriate
   - [ ] Proper error handling for failed requests
   - [ ] Request debouncing for search/filter inputs
   - [ ] Image optimization with next/image

```typescript
// ❌ Bad: Multiple calls
const user = await fetch('/api/user/123');
const posts = await fetch('/api/user/123/posts');

// ✅ Good: Single batched call
const userData = await fetch('/api/user/123?include=posts');
```

### Phase 8: Integration Points Validation
```yaml
${INTEGRATION_POINTS}
# Examples:
# ROUTING:
#   - add to: app/[feature]/page.tsx
#   - pattern: 'export default function Page({ params, searchParams })'
# 
# CONFIG:
#   - add to: .env.local
#   - pattern: 'NEXT_PUBLIC_FEATURE_API_URL=...'
# 
# STATE MANAGEMENT:
#   - pattern: Context API or Zustand store
#   - location: contexts/ or stores/
```

- [ ] All integration points connected
- [ ] Data flows correctly between components
- [ ] State management works as expected
- [ ] API endpoints properly integrated

### Phase 9: Comprehensive Final Validation
**Run ALL validation checks before declaring complete:**

#### Automated Tests & Quality Checks
```bash
# Run the complete validation suite
npm run lint          # Must pass with ZERO warnings
npm run type-check    # Must pass with ZERO errors
npm run test          # ALL tests must pass (including existing tests!)
npm run test:coverage # Must meet coverage thresholds
npm run build         # Must build successfully

# CRITICAL: Regression Testing
# This runs ALL tests in the codebase, not just new ones
# If ANY existing test fails, it means the new feature broke something
# DO NOT proceed until ALL tests pass
```

#### Regression Testing Verification
- [ ] All existing unit tests still pass
- [ ] All existing integration tests still pass
- [ ] All existing E2E tests still pass (if applicable)
- [ ] No reduction in overall test coverage
- [ ] No performance regression in test execution time

#### Manual Browser Verification
- [ ] Start dev server: `npm run dev`
- [ ] Test all implemented features in browser
- [ ] Check browser console for ANY errors/warnings
- [ ] Verify responsive design on mobile/tablet/desktop
- [ ] Test with slow network (Chrome DevTools)
- [ ] Test error scenarios (offline, failed API calls)

#### Performance Metrics
- [ ] Lighthouse score > 90 for all categories
- [ ] No memory leaks detected
- [ ] Bundle size within limits
- [ ] First Contentful Paint < 1.8s
- [ ] Time to Interactive < 3.9s

#### Accessibility Audit
- [ ] Keyboard navigation works for all features
- [ ] Screen reader compatible
- [ ] Color contrast passes WCAG AA
- [ ] All images have alt text
- [ ] Forms have proper labels
- [ ] ARIA attributes used correctly

### Phase 10: Final Validation Report

#### Implementation Confidence
- **Confidence Level**: [High/Medium/Low]
- **Reasoning**: ${CONFIDENCE_REASONING}

#### Quality Metrics Summary
- **TypeScript Coverage**: 100% (no `any` types)
- **Test Coverage**: ___% (target: >80%)
- **Lighthouse Scores**: Performance: ___, Accessibility: ___, Best Practices: ___, SEO: ___
- **Bundle Size**: ___KB (target: <___KB)
- **Security Issues**: 0
- **Console Errors/Warnings**: 0

#### Risk Assessment
- **Potential Issues**: ${RISK_ITEMS}
- **Mitigation Steps**: ${MITIGATION_STEPS}

#### Final Checklist
- [ ] Feature works exactly as specified
- [ ] No regression in existing functionality
- [ ] Code follows all project conventions
- [ ] All quality gates passed (lint, type-check, tests, build)
- [ ] Browser testing completed with no issues
- [ ] Performance metrics acceptable
- [ ] Security best practices followed
- [ ] API calls are optimized and efficient
- [ ] Accessibility standards met
- [ ] Documentation complete (if required)
- [ ] Ready for production deployment

## 🚀 Git Workflow

### Branch Creation
```bash
git checkout -b ai/${TASK_ID}-${TASK_NAME_SLUG}
```

### Commit Strategy
- Make atomic commits at logical boundaries
- Use conventional commit format:
  ```
  ${COMMIT_TYPE}(${SCOPE}): ${DESCRIPTION}

  🤖 AI Generated
  Task: ${TASK_ID}-${TASK_NAME}
  Session: ${SESSION_ID}
  PRP: ${PRP_PATH}

  Co-Authored-By: Claude <noreply@anthropic.com>
  ```

### Pull Request
Create PR with title: `${PR_TITLE}`

Body:
```markdown
## 🤖 AI Generated Implementation

### Task
${TASK_ID}: ${TASK_NAME}

### Summary
${IMPLEMENTATION_SUMMARY}

### Changes
${CHANGES_LIST}

### Patterns Followed
${PATTERNS_FOLLOWED}

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
- [ ] API calls optimized
- [ ] Accessibility verified

### Session
- Session ID: ${SESSION_ID}
- PRP: ${PRP_PATH}
- Commits: ${COMMIT_COUNT}

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
  - ${POSITIVE_OUTCOMES}

Challenges Encountered:
  - ${CHALLENGES_FACED}

Patterns Discovered:
  - ${NEW_PATTERNS_IDENTIFIED}

Future Improvements:
  - ${IMPROVEMENT_SUGGESTIONS}
```

#### Validation Loop Summary
- **Total Validation Cycles**: ${VALIDATION_CYCLE_COUNT}
- **Issues Found and Fixed**: ${ISSUES_FIXED_COUNT}
- **Time Saved by Early Detection**: ${TIME_SAVED_ESTIMATE}

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

### 🚨 CRITICAL: Comprehensive Testing is MANDATORY
**You MUST complete ALL validation phases before considering the task complete:**
1. **Automated Testing**: ESLint, TypeScript, unit tests MUST all pass with ZERO errors
2. **Regression Testing**: ALL existing tests must continue to pass - no breaking changes!
3. **New Test Creation**: Write tests for your feature that will catch future regressions
4. **Browser Testing**: ALWAYS run `npm run dev` and test UI features in the browser
5. **Security Validation**: Check for exposed secrets, XSS vulnerabilities, etc.
6. **API Optimization**: Ensure no duplicate calls, proper caching, efficient queries
7. **Performance Testing**: Lighthouse scores, bundle size, no memory leaks

**⚠️ REGRESSION TESTING IS NON-NEGOTIABLE:**
- Running `npm run test` executes ALL tests in the codebase
- If ANY test fails, your changes broke existing functionality
- You MUST fix the regression before proceeding
- Your new tests will protect future developers from breaking YOUR feature

**DO NOT declare the task complete until ALL validation phases show ✅ status!**

### Key Principles
- Follow the project's established patterns and conventions
- Refer to CLAUDE.md for project-specific guidelines
- Check existing code for patterns before implementing new features

### Implementation Notes
${IMPLEMENTATION_NOTES}

### Code Reuse Checklist
- [ ] Checked for existing utility functions before creating new ones
- [ ] Verified no duplicate API endpoints will be created
- [ ] Identified components that can be extended rather than recreated
- [ ] Ensured following established patterns from the codebase
- [ ] Avoided recreating functionality that already exists

### Risk Assessment
- **Low Risk**: ${LOW_RISK_ITEMS}
- **Medium Risk**: ${MEDIUM_RISK_ITEMS}
- **High Risk**: ${HIGH_RISK_ITEMS}

### Potential Gotchas
${POTENTIAL_GOTCHAS}

### Out of Scope
${OUT_OF_SCOPE}

## 🎬 Session Recording

Document all decisions and issues in:
`.aidev/sessions/${SESSION_ID}/log.md`

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

## 📋 Final Validation Checklist

### Automated Checks (MUST ALL PASS)
- [ ] All tests pass: `npm run test`
- [ ] No linting errors: `npm run lint`
- [ ] No type errors: `npm run type-check`
- [ ] Build succeeds: `npm run build`
- [ ] Test coverage meets threshold: `npm run test:coverage`

### Browser Testing (CRITICAL for UI features)
- [ ] Dev server runs without errors: `npm run dev`
- [ ] No console errors or warnings in browser
- [ ] All interactive features work as expected
- [ ] Forms validate and submit correctly
- [ ] Error states display properly
- [ ] Loading states appear during async operations
- [ ] Responsive design works on all viewports

### Quality Standards
- [ ] Accessibility: Proper ARIA labels and semantic HTML
- [ ] Performance: Bundle size optimized
- [ ] SEO: Proper meta tags and structure
- [ ] Security: No exposed secrets or vulnerabilities
- [ ] API calls are efficient and optimized
- [ ] Works with JavaScript disabled (if SSR)