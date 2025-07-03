# Create PRP

## Feature file: $ARGUMENTS

Generate a complete PRP for general feature implementation with thorough research. Ensure context is passed to the AI agent to enable self-validation and iterative refinement. Read the feature file first to understand what needs to be created, how the examples provided help, and any other considerations.

The AI agent only gets the context you are appending to the PRP and training data. Assume the AI agent has access to the codebase and the same knowledge cutoff as you, so it's important that your research findings are included or referenced in the PRP. The Agent has Websearch capabilities, so pass URLs to documentation and examples.

## Research Process

1. **Codebase Analysis**

   - Search for similar components/patterns in the codebase
   - Identify files to reference in PRP (components, hooks, utilities)
   - Note existing conventions to follow (component structure, styling approach)
   - Check test patterns for validation approach
   - Review App Router vs Pages Router usage
   - Check package.json for available dependencies

2. **External Research**

   - Search for similar features/patterns online
   - Next.js documentation (include specific URLs for App Router/Pages Router)
   - React documentation for hooks/patterns
   - Library documentation (include specific URLs and version compatibility)
   - Implementation examples (GitHub/StackOverflow/blogs)
   - Best practices and common pitfalls
   - TypeScript patterns for the feature

3. **User Clarification** (if needed)
   - Specific patterns to mirror and where to find them?
   - Integration requirements and where to find them?
   - Performance requirements (SSR/SSG/ISR/Client-side)?
   - Accessibility requirements?

## PRP Generation

Using PRPs/templates/prp_base.md as template:

### Critical Context to Include and pass to the AI agent as part of the PRP

- **Documentation**: URLs with specific sections (Next.js docs, React docs, library docs)
- **Code Examples**: Real snippets from codebase (components, hooks, API routes)
- **TypeScript Types**: Existing interfaces/types to extend or follow
- **Gotchas**:
  - Server vs Client Component constraints
  - Hydration issues
  - Bundle size considerations
  - Version-specific features
- **Patterns**:
  - State management approach (Context, Zustand, Redux, etc.)
  - Data fetching patterns (SWR, React Query, Server Actions)
  - Styling conventions (CSS Modules, Tailwind, styled-components)

### Implementation Blueprint

- Start with component hierarchy diagram
- Define TypeScript interfaces/types first
- Reference real files for patterns
- Include error handling strategy (Error Boundaries, try-catch)
- List tasks to be completed to fulfill the PRP in the order they should be completed:
  1. Type definitions
  2. Server/Client component decisions
  3. Core component implementation
  4. Hooks (if needed)
  5. API routes/Server Actions (if needed)
  6. Tests
  7. Documentation

### Validation Gates (Must be Executable)

```bash
# TypeScript/Linting
npm run lint && npm run type-check

# Unit/Component Tests
npm test -- --coverage

# Build Validation
npm run build

# Optional: E2E Tests (if configured)
npm run test:e2e
```

**_ CRITICAL AFTER YOU ARE DONE RESEARCHING AND EXPLORING THE CODEBASE BEFORE YOU START WRITING THE PRP _**

**_ ULTRATHINK ABOUT THE PRP AND PLAN YOUR APPROACH THEN START WRITING THE PRP _**

## Output

Save as: `PRPs/{feature-name}.md`

## Quality Checklist

- [ ] All necessary context included (Next.js version, Router type, dependencies)
- [ ] TypeScript types clearly defined
- [ ] Server/Client component boundaries clear
- [ ] Validation gates are executable by AI
- [ ] References existing patterns in codebase
- [ ] Clear implementation path with component hierarchy
- [ ] Error handling and loading states documented
- [ ] Accessibility considerations included
- [ ] Performance implications noted (bundle size, SSR/SSG)

Score the PRP on a scale of 1-10 (confidence level to succeed in one-pass implementation using Claude Codes)

Remember: The goal is one-pass implementation success through comprehensive context. Include specific Next.js patterns like:

- Metadata/SEO setup
- Image optimization approach
- Link usage patterns
- Data fetching strategy
- Environment variable usage
