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
  □ ALL ${PLACEHOLDERS} must be replaced with actual values
  □ NO placeholder syntax ${...} can remain in final document
  □ Each section must contain concrete, actionable information
  □ All code examples must reference real files with line numbers
  □ All patterns must be quoted from actual source files
</mandatory-elements>

<post-generation-validation>
  After generating this PRP:
  1. Save to: .aidev/logs/[taskid]/prp.md
  2. Verify NO placeholders remain: grep -c '${' should return 0
  3. Create PR message: .aidev/logs/[taskid]/last_result.md
  4. Update task status to "review" in JSON
  5. Stage the status change (but don't commit)
</post-generation-validation>
</prp-requirements>

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

<research-requirements>
<codebase-analysis>
  For ${CODEBASE_ANALYSIS}, MUST include:
  □ Quote existing patterns with file:line references
  □ List specific dependencies found in package.json
  □ Name actual files reviewed with their purposes
  □ Identify exact conflicts if any exist
  □ List reusable functions by name and location
  □ Document existing API endpoints with paths
  □ Name components that can be extended
</codebase-analysis>

<external-research>
  For ${EXTERNAL_RESEARCH}, MUST include:
  □ Link specific documentation pages reviewed
  □ Quote relevant best practices found
  □ List concrete security considerations
  □ Measure actual performance impacts
</external-research>
</research-requirements>

## 🎨 Context Injection

<pattern-requirements>
<established-patterns>
  For ${ESTABLISHED_PATTERNS}, MUST quote:
  □ Exact pattern with file path and line numbers
  □ Why this pattern applies to current task
  □ How to implement it correctly
</established-patterns>

<example-usage>
  For ${EXAMPLE_REFERENCES}, MUST include:
  □ Full path to example file
  □ Relevant code snippet with line numbers
  □ Explanation of how to adapt for current task
</example-usage>

<duplication-prevention>
  CRITICAL: Before creating ANY new function/component:
  □ Search for existing implementation
  □ If found, document: "REUSE: [function] from [file:line]"
  □ If not found, document: "NEW: No existing [type] found"
  
  For ${REUSABLE_FUNCTIONS}: List each with signature and location
  For ${EXTENDABLE_COMPONENTS}: Show inheritance approach
  For ${AVOID_RECREATING}: List with "USE [existing] INSTEAD"
</duplication-prevention>
</pattern-requirements>

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

<implementation-constraints>
<type-safety-requirements>
  For ${TYPE_DEFINITIONS}, MUST:
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
${TYPE_DEFINITIONS}
// ALL types must be defined here before any implementation
// Example: If creating UserProfile component, define UserProfileProps, UserData, etc.
```

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

<task-type-implementation>
<pattern-mode-rules>
${IF_PATTERN_MODE}
STRICT REQUIREMENTS for Pattern Tasks:
□ Implementation MUST be 50-100 lines (verify with wc -l)
□ Include inline comments explaining EVERY design decision
□ Export pattern for reuse by other components
□ Create accompanying usage example
□ Document naming conventions established
□ NO external dependencies or complex logic
${END_IF_PATTERN_MODE}
</pattern-mode-rules>

<feature-mode-rules>
${IF_FEATURE_MODE}
STRICT REQUIREMENTS for Feature Tasks:
□ Follow patterns from ${PATTERN_DEPENDENCIES} EXACTLY
□ Quote pattern source: "Following pattern from [file:line]"
□ Include ALL error handling (network, validation, edge cases)
□ Implement loading states for EVERY async operation
□ Add TypeScript types for EVERY function/component
□ Production-ready: no console.logs, no commented code
${END_IF_FEATURE_MODE}
</feature-mode-rules>

<instruction-mode-rules>
${IF_INSTRUCTION_MODE}
STRICT REQUIREMENTS for Instruction Tasks:
□ Create ONLY documentation files (no code files)
□ Include ALL sections from task specification
□ Verify technical accuracy of EVERY statement
□ Test ALL code examples before including
□ Follow existing doc structure from similar files
□ Target audience: ${TARGET_AUDIENCE}
${END_IF_INSTRUCTION_MODE}
</instruction-mode-rules>
</task-type-implementation>

## 📂 Files to Create/Modify

<file-structure-requirements>
For ${FILE_STRUCTURE}, MUST specify:
□ EXACT file paths (no ambiguity)
□ Whether file is NEW or MODIFY existing
□ Purpose of each file in one sentence
□ Dependencies between files
□ Order of implementation
</file-structure-requirements>

${FILE_STRUCTURE}

<pre-implementation-gate>
STOP if ANY condition is true:
□ File already exists with same functionality
□ Import not available in package.json
□ Path doesn't follow project structure
□ Creating utility that already exists
</pre-implementation-gate>

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
${IF_INSTRUCTION_MODE}
**For instruction tasks, validate documentation quality:**

#### Documentation Checklist
- [ ] All required sections included as per task specification
- [ ] Technical accuracy verified
- [ ] Examples are clear and working
- [ ] Formatting is consistent with project standards
- [ ] Links and references are valid
- [ ] Code snippets are syntactically correct
- [ ] No spelling or grammar errors
- [ ] Appropriate for target audience (developers/users/etc.)

#### Documentation Structure Validation
- [ ] Clear hierarchy with proper headings
- [ ] Table of contents if document is long
- [ ] Logical flow from introduction to advanced topics
- [ ] Cross-references to related documentation
- [ ] Version/update information if applicable
${END_IF_INSTRUCTION_MODE}

### Phase 4: Integration Testing (Conditional)
${IF_TESTS_NEEDED}
**IMPORTANT: Tests protect your feature from future regressions (when available)**

#### Test Creation Requirements (if testing infrastructure exists)
- Create tests in co-located test files (e.g., `Component.test.tsx` next to `Component.tsx`)
- Achieve minimum 80% coverage for new code
- Test happy path, edge cases, and error states
- Tests must be deterministic (no flaky tests)
- Tests become part of the regression suite for future features

**Note**: If no testing infrastructure exists, document what tests should be created

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

<final-validation-protocol>
<no-exceptions-policy>
  These checks are MANDATORY - NO EXCEPTIONS:
  
  ```bash
  npm run lint          # MUST: 0 errors, 0 warnings
  npm run type-check    # MUST: 0 errors
  npm run test          # MUST: ALL pass (new + existing)
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

### Change Tracking Strategy
- Stage all changes at logical boundaries
- Changes will be ready for review
- Task metadata tracked in PRP and last_result.md

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
- Files Changed: ${FILES_CHANGED_COUNT}

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

<placeholder-replacement-critical>
<before-using-this-template>
  CRITICAL: This is a TEMPLATE with ${PLACEHOLDERS}
  
  You MUST:
  □ Replace EVERY ${PLACEHOLDER} with actual values
  □ Remove ALL ${IF_*} and ${END_IF_*} conditional markers
  □ Verify with grep: grep -c '${' prp.md → MUST return 0
  □ Ensure all sections have concrete, actionable content
  
  NEVER leave placeholders in the final PRP!
</before-using-this-template>
</placeholder-replacement-critical>

## ⚠️ Important Reminders

### 🚨 CRITICAL: Status Update and PR Creation
After implementation is complete:
1. **Create PR Message**: Save to `.aidev/logs/[taskid]/last_result.md`
2. **Verify PR Message**: Ensure file exists and has content
3. **Update Status**: Change task status to "review" in JSON
4. **Stage Status**: Stage the status change (but don't commit)

### Test-Driven Development (When Testing Available)
**Follow TDD practices if testing infrastructure exists:**
- Write tests alongside implementation
- Achieve 80%+ coverage for new code
- Include unit, component, and E2E tests
- All tests must pass before completion

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

## 📋 Final Steps

### After Implementation
1. **Save Generated PRP**: `.aidev/logs/[taskid]/prp.md`
2. **Create PR Message**: `.aidev/logs/[taskid]/last_result.md`
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
${TASK_ID}: ${TASK_NAME}

### Summary
${IMPLEMENTATION_SUMMARY}

### Changes
${CHANGES_LIST}

### Validation
- [ ] All tests pass (if testing exists)
- [ ] Linting clean
- [ ] Build successful

### Session
- Session ID: ${SESSION_ID}
- PRP: ${PRP_PATH}
- Files Changed: ${FILES_CHANGED_COUNT}

---
Generated by Claude AI
Review corrections will be captured for learning
```

#### For Instruction Tasks
```markdown
## 🤖 AI Generated Documentation

### Task
${TASK_ID}: ${TASK_NAME}
Type: Instruction

### Summary
${DOCUMENTATION_SUMMARY}

### Files Created/Modified
${FILES_LIST}

### Documentation Validation
- [ ] All required sections included
- [ ] Technical accuracy verified
- [ ] Examples tested and working
- [ ] Formatting consistent with standards
- [ ] No spelling/grammar errors

### Session
- Session ID: ${SESSION_ID}
- PRP: ${PRP_PATH}
- Files Changed: ${FILES_CHANGED_COUNT}

---
Generated by Claude AI
Review corrections will be captured for learning
```