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

## 🛠️ Implementation Plan

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

## 💻 Implementation Steps

${IMPLEMENTATION_STEPS}

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

## ✅ Validation Requirements

### Code Quality Checks
```bash
# Must pass before proceeding
# Check with project's lint/type-check commands
```

### Build Validation
```bash
npm run build
# Expected: Build completes without errors
```

### Testing Requirements
${IF_TESTS_NEEDED}
- Create tests in co-located test files
- Achieve minimum 80% coverage
- Test happy path, edge cases, and error states

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

### Integration Points
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

### Validation Criteria
- [ ] Feature works as specified
- [ ] No regression in existing functionality
- [ ] Code follows project conventions
- [ ] All quality gates passed

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

### Testing
- [ ] All tests pass
- [ ] Linting clean
- [ ] Build successful
- [ ] Manually tested core functionality

### Session
- Session ID: ${SESSION_ID}
- PRP: ${PRP_PATH}
- Commits: ${COMMIT_COUNT}

---
Generated by Claude AI
Review corrections will be captured for learning
```

## ⚠️ Important Reminders

### Key Principles
- Follow the project's established patterns and conventions
- Refer to CLAUDE.md for project-specific guidelines
- Check existing code for patterns before implementing new features

### Implementation Notes
${IMPLEMENTATION_NOTES}

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

- [ ] All tests pass
- [ ] No linting errors
- [ ] No type errors
- [ ] Build succeeds: `npm run build`
- [ ] No console errors in browser
- [ ] Accessibility: Proper ARIA labels and semantic HTML
- [ ] Performance: Bundle size optimized
- [ ] SEO: Proper meta tags and structure
- [ ] Works with JavaScript disabled (if SSR)