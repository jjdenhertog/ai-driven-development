name: "Multi-Component System: Research Dashboard with AI Assistant"
description: |

## Purpose
Build a Next.js application with a Research Dashboard that integrates external search APIs and an AI Assistant component for content generation. This demonstrates advanced component composition, server actions, and real-time streaming patterns.

## Core Principles
1. **Context is King**: Include ALL necessary documentation, examples, and caveats
2. **Validation Loops**: Provide executable tests/lints the AI can run and fix
3. **Information Dense**: Use keywords and patterns from the codebase
4. **Progressive Success**: Start simple, validate, then enhance
5. **Global rules**: Be sure to follow all rules in CLAUDE.md

---

## Goal
Create a production-ready research dashboard where users can search topics, view results in real-time, and use an AI assistant to generate summaries or draft content based on research. The system should support real-time updates, proper state management, and handle API authentication securely.

## Why
- **Business value**: Streamlines research and content creation workflows
- **Integration**: Demonstrates advanced Next.js patterns with external APIs
- **Problems solved**: Reduces context switching between research and content creation

## What
A web application where:
- Users input research queries via search interface
- Dashboard displays search results from multiple sources
- AI Assistant can analyze results and generate content
- Real-time streaming responses with loading states
- Responsive design with dark mode support

### Success Criteria
- [ ] Search component successfully queries external APIs
- [ ] AI Assistant generates content based on research context
- [ ] Real-time streaming works with proper error handling
- [ ] State persists across navigation (with proper hydration)
- [ ] All components are accessible and performant
- [ ] Tests pass with >80% coverage

## All Needed Context

### Documentation & References
```yaml
# MUST READ - Include these in your context window
- url: https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations
  why: Server Actions for API calls and mutations
  
- url: https://nextjs.org/docs/app/api-reference/functions/use-server
  why: Streaming responses pattern
  
- url: https://ui.shadcn.com/docs/components/card
  why: UI component patterns we're using
  
- url: https://swr.vercel.app/docs/getting-started
  why: Client-side data fetching and caching
  
- url: https://github.com/vercel/ai/tree/main/examples/next-app
  why: AI SDK streaming patterns for Next.js
  
- file: app/components/Dashboard/Dashboard.tsx
  why: Existing dashboard layout patterns
  
- file: lib/api/client.ts
  why: API client configuration pattern
  
- file: app/actions/search.ts
  why: Server action patterns for data fetching

- url: https://tanstack.com/query/latest/docs/framework/react/overview
  why: React Query for complex data fetching if needed
```

### Current Codebase tree
```bash
.
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   └── ui/
├── lib/
│   └── utils.ts
├── public/
├── .env.local
└── package.json
```

### Desired Codebase tree with files to be added
```bash
.
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── research/
│   │   ├── page.tsx              # Research dashboard page
│   │   └── layout.tsx            # Research-specific layout
│   ├── api/
│   │   ├── search/
│   │   │   └── route.ts          # Search API endpoint
│   │   └── assistant/
│   │       └── route.ts          # AI assistant endpoint
│   └── actions/
│       ├── search.ts             # Server actions for search
│       └── assistant.ts          # Server actions for AI
├── components/
│   ├── research/
│   │   ├── ResearchDashboard.tsx # Main dashboard component
│   │   ├── SearchBar.tsx         # Search input component
│   │   ├── SearchResults.tsx     # Results display
│   │   ├── ResultCard.tsx        # Individual result card
│   │   └── AIAssistant.tsx       # AI assistant panel
│   ├── ui/
│   │   ├── skeleton.tsx          # Loading skeletons
│   │   └── ... (other UI components)
│   └── providers/
│       └── ResearchProvider.tsx   # Context provider
├── hooks/
│   ├── useSearch.ts              # Search functionality hook
│   ├── useAssistant.ts           # AI assistant hook
│   └── useDebounce.ts            # Debounce hook
├── lib/
│   ├── api/
│   │   ├── search-client.ts      # Search API client
│   │   └── assistant-client.ts   # AI API client
│   ├── utils/
│   │   └── stream.ts             # Streaming utilities
│   └── types/
│       └── research.ts           # TypeScript types
├── stores/
│   └── research-store.ts         # Zustand store
├── __tests__/
│   ├── components/
│   │   ├── SearchBar.test.tsx
│   │   └── AIAssistant.test.tsx
│   └── api/
│       └── search.test.ts
├── .env.local
└── package.json
```

### Known Gotchas & Library Quirks
```typescript
// CRITICAL: Server Components can't use hooks or browser APIs
// CRITICAL: 'use client' required for interactive components
// CRITICAL: Environment variables need NEXT_PUBLIC_ prefix for client access
// CRITICAL: Streaming responses require proper ReadableStream handling
// CRITICAL: Hydration errors from Date() or Math.random() - use stable values
// CRITICAL: SWR/React Query for client-side, fetch for Server Components
// CRITICAL: Server Actions must be async functions
// CRITICAL: Tailwind classes must be complete strings (no dynamic concatenation)
```

## Implementation Blueprint

### TypeScript Types and Interfaces

```typescript
// lib/types/research.ts
export interface SearchQuery {
  query: string;
  filters?: SearchFilters;
  limit?: number;
}

export interface SearchFilters {
  dateRange?: DateRange;
  sources?: SearchSource[];
  contentType?: ContentType[];
}

export interface SearchResult {
  id: string;
  title: string;
  url: string;
  snippet: string;
  source: SearchSource;
  publishedAt: string;
  relevanceScore: number;
}

export interface AssistantRequest {
  context: SearchResult[];
  prompt: string;
  streamResponse?: boolean;
}

export interface AssistantResponse {
  content: string;
  tokensUsed: number;
  model: string;
}

// Zod schemas for validation
import { z } from 'zod';

export const searchQuerySchema = z.object({
  query: z.string().min(1).max(500),
  limit: z.number().min(1).max(50).default(10),
});
```

### Component Hierarchy & Architecture
```yaml
ResearchDashboard/ (Server Component)
├── ResearchProvider (Client Component - Context)
│   ├── SearchBar (Client Component)
│   ├── SearchResults (Server Component with Suspense)
│   │   └── ResultCard (Server Component)
│   └── AIAssistant (Client Component)
│       ├── AssistantInput (Client Component)
│       └── AssistantOutput (Client Component - Streaming)
└── ResearchLayout (Server Component - Layout wrapper)
```

### List of tasks to be completed

```yaml
Task 1: Setup TypeScript types and schemas
CREATE lib/types/research.ts:
  - Define all interfaces for type safety
  - Create Zod schemas for runtime validation
  - Export types for use across components

Task 2: Create API clients
CREATE lib/api/search-client.ts:
  - PATTERN: Use fetch with proper error handling
  - Include retry logic for failed requests
  - Return typed responses

CREATE lib/api/assistant-client.ts:
  - Handle streaming responses
  - Parse SSE (Server-Sent Events)
  - Manage connection lifecycle

Task 3: Implement Server Actions
CREATE app/actions/search.ts:
  - 'use server' directive at top
  - Validate inputs with Zod
  - Cache results with React cache()
  - Return serializable data

Task 4: Create Search Components
CREATE components/research/SearchBar.tsx:
  - 'use client' for interactivity
  - Debounced input handling
  - Loading states during search
  - Keyboard navigation support

CREATE components/research/SearchResults.tsx:
  - Server Component with data fetching
  - Suspense boundary for loading
  - Error boundary for failures
  - Pagination support

Task 5: Implement AI Assistant
CREATE components/research/AIAssistant.tsx:
  - 'use client' for real-time updates
  - Streaming response handling
  - Markdown rendering for output
  - Copy to clipboard functionality

Task 6: Setup State Management
CREATE stores/research-store.ts:
  - Zustand for client state
  - Persist selected results
  - Manage assistant history
  - Handle optimistic updates

Task 7: Create Context Provider
CREATE components/providers/ResearchProvider.tsx:
  - Wrap child components
  - Provide search context
  - Handle global error states
  - Manage loading states

Task 8: Write Comprehensive Tests
CREATE __tests__/:
  - Component tests with RTL
  - API route tests
  - Hook tests
  - Integration tests

Task 9: Add Loading & Error States
CREATE components/ui/skeleton.tsx:
  - Search result skeletons
  - Assistant response skeleton
  - Consistent loading UX

Task 10: Documentation & Examples
UPDATE README.md:
  - Setup instructions
  - API key configuration
  - Architecture overview
  - Usage examples
```

### Per task pseudocode

```typescript
// Task 3: Server Actions
// app/actions/search.ts
'use server';

import { searchQuerySchema } from '@/lib/types/research';
import { cache } from 'react';

export const searchAction = cache(async (query: string) => {
  // PATTERN: Validate input
  const validated = searchQuerySchema.parse({ query });
  
  // PATTERN: Multiple API calls in parallel
  const results = await Promise.allSettled([
    searchBraveAPI(validated.query),
    searchInternalDB(validated.query),
    searchGoogleScholar(validated.query)
  ]);
  
  // PATTERN: Handle partial failures gracefully
  const successfulResults = results
    .filter(r => r.status === 'fulfilled')
    .map(r => r.value)
    .flat();
  
  // PATTERN: Sort by relevance
  return successfulResults.sort((a, b) => b.relevanceScore - a.relevanceScore);
});

// Task 5: AI Assistant with Streaming
// components/research/AIAssistant.tsx
'use client';

export function AIAssistant({ context }: { context: SearchResult[] }) {
  const [response, setResponse] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  
  const handleGenerate = async (prompt: string) => {
    setIsStreaming(true);
    setResponse('');
    
    // PATTERN: Streaming with fetch
    const res = await fetch('/api/assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, context }),
    });
    
    // PATTERN: Handle streaming response
    const reader = res.body?.getReader();
    const decoder = new TextDecoder();
    
    while (reader) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      setResponse(prev => prev + chunk);
    }
    
    setIsStreaming(false);
  };
  
  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle>AI Assistant</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto">
        {isStreaming ? (
          <StreamingSkeleton />
        ) : (
          <Markdown>{response}</Markdown>
        )}
      </CardContent>
      <CardFooter>
        <AssistantInput onSubmit={handleGenerate} disabled={isStreaming} />
      </CardFooter>
    </Card>
  );
}
```

### Integration Points
```yaml
ENVIRONMENT:
  - add to: .env.local
  - vars: |
      # Search APIs
      BRAVE_API_KEY=BSA...
      GOOGLE_SCHOLAR_API_KEY=...
      
      # AI Provider
      OPENAI_API_KEY=sk-...
      
      # Public vars for client
      NEXT_PUBLIC_APP_URL=http://localhost:3000
      NEXT_PUBLIC_ENABLE_ANALYTICS=false
      
DEPENDENCIES:
  - add to package.json:
    - @vercel/ai (AI SDK for streaming)
    - swr or @tanstack/react-query (data fetching)
    - zustand (state management)
    - zod (validation)
    - react-markdown (markdown rendering)
    - @radix-ui/react-* (UI primitives)
    
CONFIGURATION:
  - Tailwind: Ensure all custom colors defined
  - TypeScript: Strict mode enabled
  - ESLint: Next.js recommended config
```

## Validation Loop

### Level 1: TypeScript & Linting
```bash
# Run these FIRST - fix any errors before proceeding
npm run lint                    # ESLint checks
npm run type-check             # TypeScript validation

# Expected: No errors. If errors, READ and fix.
```

### Level 2: Component Tests
```typescript
// __tests__/components/SearchBar.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchBar } from '@/components/research/SearchBar';

describe('SearchBar', () => {
  it('debounces search input', async () => {
    const onSearch = jest.fn();
    render(<SearchBar onSearch={onSearch} />);
    
    const input = screen.getByRole('searchbox');
    await userEvent.type(input, 'test query');
    
    // Should not call immediately
    expect(onSearch).not.toHaveBeenCalled();
    
    // Should call after debounce
    await waitFor(() => {
      expect(onSearch).toHaveBeenCalledWith('test query');
    }, { timeout: 600 });
  });
  
  it('shows loading state during search', async () => {
    render(<SearchBar isSearching />);
    expect(screen.getByTestId('search-spinner')).toBeInTheDocument();
  });
});

// __tests__/api/search.test.ts
import { POST } from '@/app/api/search/route';

describe('Search API', () => {
  it('validates input with Zod', async () => {
    const response = await POST(new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ query: '' }), // Invalid empty query
    }));
    
    expect(response.status).toBe(400);
  });
});
```

```bash
# Run tests iteratively:
npm test -- --watch
npm test -- --coverage

# If failing: Fix specific test, ensure mocks are correct
```

### Level 3: Build & E2E Validation
```bash
# Build the application
npm run build

# Check for:
# - No type errors
# - No missing imports
# - Successful compilation

# Start production build
npm start

# Manual testing flow:
# 1. Navigate to /research
# 2. Enter search query
# 3. Verify results appear
# 4. Select results for context
# 5. Use AI assistant with context
# 6. Verify streaming works

# E2E test (if Playwright configured)
npm run test:e2e
```

## Final Validation Checklist
- [ ] All tests pass: `npm test`
- [ ] No linting errors: `npm run lint`
- [ ] No type errors: `npm run type-check`
- [ ] Build succeeds: `npm run build`
- [ ] Search returns results from multiple sources
- [ ] AI Assistant streams responses properly
- [ ] State persists during navigation
- [ ] Loading states appear correctly
- [ ] Error states handle API failures gracefully
- [ ] Mobile responsive design works
- [ ] Accessibility: keyboard navigation works
- [ ] Performance: Lighthouse score >90

---

## Anti-Patterns to Avoid
- ❌ Don't use 'use client' on every component - keep Server Components where possible
- ❌ Don't fetch data in useEffect - use Server Components or SWR/React Query
- ❌ Don't hardcode API keys - use environment variables
- ❌ Don't ignore TypeScript errors - fix them properly
- ❌ Don't skip loading states - users need feedback
- ❌ Don't forget error boundaries - handle failures gracefully
- ❌ Don't use dynamic Tailwind classes - use complete strings
- ❌ Don't block UI during API calls - use optimistic updates

## Confidence Score: 9/10

High confidence due to:
- Clear Next.js patterns in documentation
- Well-established component patterns
- Comprehensive validation gates
- Strong TypeScript foundation

Minor uncertainty on streaming implementation details across different deployment platforms, but patterns are well documented.