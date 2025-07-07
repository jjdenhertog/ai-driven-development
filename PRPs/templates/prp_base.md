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

- docfile: [.claude/documents/*.txt]
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

Define all types first for type safety and clarity, following our coding standards:

```typescript
// Types for props, state, API responses - always use readonly
interface FeatureProps {
	readonly id: string;
	readonly name: string;
	readonly onChange?: (value: string) => void;
}

interface FeatureState {
	readonly loading: boolean;
	readonly data: FeatureData | null;
	readonly error: Error | null;
}

type ApiResponse = {
	readonly items: ReadonlyArray<Item>;
	readonly total: number;
};

// Zod schemas for runtime validation (ALWAYS use in API routes)
const featureSchema = z.object({
	name: z.string().min(1, 'Name is required'),
	email: z.string().email('Invalid email'),
	role: z.enum(['admin', 'user', 'guest']),
});

type FeatureFormData = z.infer<typeof featureSchema>;
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
// Task 2: Server Component example (following our patterns)
// src/features/Feature/Feature.tsx
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

// Task 3: Client Component example (following our patterns)
// src/features/Feature/components/FeatureContent.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { Box, CircularProgress } from '@mui/material';

export const FeatureContent: React.FC<ContentProps> = ({ initialData }) => {
	// TanStack Query for client-side data
	const { data, error, isLoading } = useQuery({
		queryKey: ['feature', initialData.id],
		queryFn: async () => {
			const response = await fetch(`/api/feature/${initialData.id}`);
			if (!response.ok) throw new Error('Failed to fetch');
			return response.json();
		},
		initialData,
	});

	// Memoized event handler with useCallback
	const handleClick = useCallback((id: string) => {
		// Handle interaction
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

// Task 4: Custom Hook example
// src/features/Feature/hooks/useFeature.ts
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

// Task 5: API Route example (following our patterns)
// app/api/feature/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

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
		await redis.del(`feature:${params.id}`);

		return NextResponse.json(feature);
	} catch (error) {
		if (error instanceof z.ZodError) 
			return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
		
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
	}
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
npm run lint <file>              # Check specific file for linting errors
npm run lint:fix <file>          # Auto-fix linting issues
npm run type-check <file>        # TypeScript check for specific file

# Expected: No errors. If errors, READ the error and fix.
# Note: If commands are not available, notify the user. Do not use tsc --noEmit directly.
```

### Level 2: Component Tests (Only if explicitly requested)

```typescript
// src/features/Feature/Feature.test.tsx - Co-located with component
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const createTestQueryClient = () => new QueryClient({
	defaultOptions: {
		queries: { retry: false },
	},
});

describe('Feature', () => {
	it('renders without crashing', () => {
		const queryClient = createTestQueryClient();
		render(
			<QueryClientProvider client={queryClient}>
				<Feature {...mockProps} />
			</QueryClientProvider>
		);
		expect(screen.getByRole('heading')).toBeInTheDocument();
	});

	it('handles user interaction', async () => {
		const user = userEvent.setup();
		const onEdit = vi.fn();
		const queryClient = createTestQueryClient();
		
		render(
			<QueryClientProvider client={queryClient}>
				<Feature {...mockProps} onEdit={onEdit} />
			</QueryClientProvider>
		);

		await user.click(screen.getByRole('button'));
		expect(onEdit).toHaveBeenCalled();
	});

	it('handles error states gracefully', () => {
		const queryClient = createTestQueryClient();
		render(
			<QueryClientProvider client={queryClient}>
				<Feature {...errorProps} />
			</QueryClientProvider>
		);
		expect(screen.getByText(/error/i)).toBeInTheDocument();
	});

	it('shows loading state', () => {
		const queryClient = createTestQueryClient();
		render(
			<QueryClientProvider client={queryClient}>
				<Feature loading />
			</QueryClientProvider>
		);
		expect(screen.getByRole('progressbar')).toBeInTheDocument();
	});
});
```

```bash
# Run tests with Vitest (only if explicitly requested)
npm test                         # Run all tests
npm test Feature.test.tsx        # Run specific test file
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
