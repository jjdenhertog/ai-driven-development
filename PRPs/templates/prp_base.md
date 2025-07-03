name: "Base PRP Template v2 - Context-Rich with Validation Loops"
description: |

## Purpose

Template optimized for AI agents to implement features with sufficient context and self-validation capabilities to achieve working code through iterative refinement.

## Core Principles

1. **Context is King**: Include ALL necessary documentation, examples, and caveats
2. **Validation Loops**: Provide executable tests/lints the AI can run and fix
3. **Information Dense**: Use keywords and patterns from the codebase
4. **Progressive Success**: Start simple, validate, then enhance
5. **Global rules**: Be sure to follow all rules in CLAUDE.md

---

## Goal

[What needs to be built - be specific about the end state and desires]

## Why

- [Business value and user impact]
- [Integration with existing features]
- [Problems this solves and for whom]

## What

[User-visible behavior and technical requirements]

### Success Criteria

- [ ] [Specific measurable outcomes]

## All Needed Context

### Documentation & References (list all context needed to implement the feature)

```yaml
# MUST READ - Include these in your context window
- url: https://nextjs.org/docs/[specific-section]
  why: [Specific APIs/patterns you'll need]

- url: https://react.dev/reference/[specific-hook]
  why: [React patterns and hooks documentation]

- file: [app/components/similar-component.tsx]
  why: [Pattern to follow, component structure]

- file: [lib/utils/example.ts]
  why: [Utility patterns, type definitions]

- doc: [Library documentation URL]
  section: [Specific section about TypeScript usage]
  critical: [Key insight that prevents common errors]

- docfile: [PRPs/ai_docs/file.md]
  why: [docs that the user has pasted in to the project]
```

### Current Codebase tree (run `tree` in the root of the project) to get an overview of the codebase

```bash

```

### Desired Codebase tree with files to be added and responsibility of file

```bash

```

### Known Gotchas of our codebase & Library Quirks

```typescript
// CRITICAL: [Next.js version] specific features
// Example: App Router requires 'use client' directive for client components
// Example: Server Components can't use useState/useEffect
// Example: Hydration errors from date/random values
// Example: Bundle size implications of importing entire libraries
// Example: Environment variables need NEXT_PUBLIC_ prefix for client-side
```

## Implementation Blueprint

### TypeScript Types and Interfaces

Define all types first for type safety and clarity:

```typescript
// Types for props, state, API responses
interface FeatureProps {
	// Component props
}

interface FeatureState {
	// State shape
}

type ApiResponse = {
	// API response structure
};

// Zod schemas for runtime validation (if using)
const featureSchema = z.object({
	// Runtime validation
});
```

### Component Hierarchy & Architecture

```yaml
FeatureComponent/ (Server Component)
├── FeatureProvider.tsx (Client Component - Context)
├── FeatureHeader.tsx (Server Component)
├── FeatureContent.tsx (Client Component - Interactive)
│   ├── FeatureList.tsx
│   └── FeatureItem.tsx
├── hooks/
│   └── useFeature.ts (Custom hook)
└── __tests__/
└── Feature.test.tsx
```

### List of tasks to be completed to fulfill the PRP in the order they should be completed

```yaml
Task 1: Create TypeScript types and interfaces
CREATE types/feature.ts:
  - Define all interfaces and types
  - Export for use across components

Task 2: Create Server Component wrapper
CREATE app/components/Feature/Feature.tsx:
  - PATTERN: Server Component by default
  - Fetch data if needed (async component)
  - Pass data to client components

Task 3: Create Client Components for interactivity
CREATE app/components/Feature/FeatureContent.tsx:
  - ADD 'use client' directive at top
  - PATTERN: Use existing component structure from similar-component.tsx
  - Handle user interactions

Task 4: Create custom hooks
CREATE hooks/useFeature.ts:
  - PATTERN: Follow existing hooks pattern
  - Include error handling
  - TypeScript return types

Task 5: API Route or Server Action (if needed)
CREATE app/api/feature/route.ts OR app/actions/feature.ts:
  - PATTERN: Match existing API patterns
  - Validate inputs with zod
  - Return typed responses

Task 6: Write tests
CREATE __tests__/Feature.test.tsx:
  - Component tests with React Testing Library
  - Mock API calls
  - Test error states

Task N:
```

### Per task pseudocode as needed added to each task

```typescript
// Task 2: Server Component example
// app/components/Feature/Feature.tsx
export default async function Feature({ params }: FeatureProps) {
	// PATTERN: Data fetching in Server Components
	const data = await fetchFeatureData(params.id); // Direct DB/API call

	// PATTERN: Error handling with error.tsx
	if (!data) {
		notFound(); // Next.js notFound function
	}

	// PATTERN: Pass serializable props to Client Components
	return (
		<div className='feature-container'>
			<FeatureHeader title={data.title} />
			<FeatureContent initialData={data} />
		</div>
	);
}

// Task 3: Client Component example
// app/components/Feature/FeatureContent.tsx
('use client');

export function FeatureContent({ initialData }: ContentProps) {
	// PATTERN: SWR/React Query for client-side data
	const { data, error, isLoading } = useSWR(`/api/feature/${initialData.id}`, fetcher, {
		fallbackData: initialData,
	});

	// PATTERN: Loading states
	if (isLoading) return <FeatureSkeleton />;

	// PATTERN: Error boundaries
	if (error) return <FeatureError error={error} />;

	// PATTERN: Event handlers with proper typing
	const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
		// Handle interaction
	};

	return <div>{/* Component JSX */}</div>;
}
```

### Integration Points

```yaml
ROUTING:
  - add to: app/[feature]/page.tsx
  - pattern: 'export default function Page({ params, searchParams })'

CONFIG:
  - add to: .env.local
  - pattern: 'NEXT_PUBLIC_FEATURE_API_URL=...'

STATE MANAGEMENT:
  - pattern: Context API or Zustand store
  - location: contexts/ or stores/

API INTEGRATION:
  - pattern: Server Actions or Route Handlers
  - location: app/actions/ or app/api/
```

## Validation Loop

### Level 1: TypeScript & Linting

```bash
# Run these FIRST - fix any errors before proceeding
npm run lint                    # ESLint with Next.js config
npm run type-check             # TypeScript compiler check

# Expected: No errors. If errors, READ the error and fix.
```

### Level 2: Component Tests

```typescript
// __tests__/Feature.test.tsx with these test cases:
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('Feature', () => {
	it('renders without crashing', () => {
		render(<Feature {...mockProps} />);
		expect(screen.getByRole('heading')).toBeInTheDocument();
	});

	it('handles user interaction', async () => {
		const user = userEvent.setup();
		render(<Feature {...mockProps} />);

		await user.click(screen.getByRole('button'));
		expect(screen.getByText('Updated')).toBeInTheDocument();
	});

	it('handles error states gracefully', () => {
		render(<Feature {...errorProps} />);
		expect(screen.getByText(/error/i)).toBeInTheDocument();
	});

	it('shows loading state', () => {
		render(<Feature loading />);
		expect(screen.getByTestId('skeleton')).toBeInTheDocument();
	});
});
```

```bash
# Run and iterate until passing:
npm test -- Feature.test.tsx --watch
# If failing: Read error, understand root cause, fix code, re-run
```

### Level 3: Build Validation

```bash
# Build the application
npm run build

# Check for build errors:
# - Missing imports
# - Type errors
# - Client/Server component mismatches

# Start production build
npm start

# Test the feature
curl http://localhost:3000/feature

# Expected: Proper response/rendered HTML
# If error: Check console and Next.js error overlay
```

## Final Validation Checklist

- [ ] All tests pass: `npm test`
- [ ] No linting errors: `npm run lint`
- [ ] No type errors: `npm run type-check`
- [ ] Build succeeds: `npm run build`
- [ ] No console errors in browser
- [ ] Accessibility: `npm run test:a11y` (if configured)
- [ ] Performance: Check with Lighthouse
- [ ] SEO: Proper meta tags and structure
- [ ] Works with JavaScript disabled (if SSR)

---

## Anti-Patterns to Avoid

- ❌ Don't use 'use client' unnecessarily - prefer Server Components
- ❌ Don't import client-only code in Server Components
- ❌ Don't use window/document without checking if client-side
- ❌ Don't skip TypeScript types - use 'unknown' over 'any'
- ❌ Don't ignore hydration warnings
- ❌ Don't fetch data in useEffect when Server Components work
- ❌ Don't hardcode values that should be environment variables
- ❌ Don't forget loading and error states
