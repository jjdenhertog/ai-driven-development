# CLAUDE.md - Next.js Project Guidelines

### 🔄 Project Awareness & Context

- **Always read `.claude/PROJECT.md`** at the start of a new conversation to understand the project's architecture, goals, style, and constraints.
- **Check `.claude/TODO.md`** before starting a new task. If the task isn't listed, add it with a brief description and today's date.
- **Use consistent naming conventions, file structure, and architecture patterns** as described in `.claude/PROJECT.md`.
- **Follow Next.js App Router conventions** unless the project explicitly uses Pages Router.

### 🧱 Code Structure & Modularity

- **Never create a file longer than 300 lines of code.** If a file approaches this limit, refactor by splitting it into modules, custom hooks, or utility files.
- **Organize code into clearly separated modules**, grouped by feature or responsibility:
  - `src/components/` - Shared UI components
  - `src/components/ui/` - Custom UI library (B-prefixed components)
  - `src/features/` - Feature modules with self-contained functionality
  - `app/` - App Router pages and layouts
  - `src/lib/` - Core utilities and singletons (prisma, redis, auth)
  - `src/hooks/` - Shared React hooks
  - `src/types/` - Global TypeScript types organized by domain
  - `src/services/` - API service layer (client/server separated)
  - `src/stores/` - Zustand state stores
  - `src/schemas/` - Zod validation schemas
  - `src/utils/` - Shared utilities (client/server/shared)
- **Feature-first organization**: Each feature in `src/features/` should be self-contained with its own components, hooks, utils, and types.
- **Co-locate related files** (component + styles + tests) when appropriate.
- **Use barrel exports** (`index.ts`) for cleaner imports from feature directories.
- **Use environment variables** through Next.js's built-in `.env.local` support.

### 🧪 Testing & Reliability

- **Use Test-Driven Development (TDD)** with Vitest as the test runner.
- **Co-locate tests with code** - place test files next to the files they test.
- **Tests should use**:
  - Vitest for unit tests
  - React Testing Library for component tests
  - Playwright for E2E tests
  - MSW for API mocking
- **Test files should be co-located** as `ComponentName.test.tsx` right next to the component.
- Include at least:
  - 1 test for expected behavior
  - 1 test for edge cases
  - 1 test for error states
  - 1 test for loading states (if applicable)
- **Ensure code quality** by testing your changes thoroughly.

### ✅ Task Completion

- **Mark completed tasks in `.claude/TODO.md`** immediately after finishing them.
- Please check through all the code you just wrote and make sure it follows security best practices. Make sure no sensitive information is in the front end and there are no vulnerabilities people can exploit.
- Add new sub-tasks or TODOs discovered during development to `.claude/TODO.md` under a "Discovered During Work" section.

### 📎 Style & Conventions

- **Use TypeScript** for all new files (`.ts`, `.tsx`).
- **Follow ESLint rules** and format with **Prettier**.
- **Use strict TypeScript** settings (`strict: true` in `tsconfig.json`).
- **Prefer functional components** with arrow functions and hooks.
- **Use Material-UI (MUI)** as the primary UI framework with the sx prop for styling.
- **Write clear, self-documenting code** with meaningful variable and function names.

### 🎨 React & Next.js Best Practices

- **Use Server Components by default** in App Router, client components only when needed.
- **Implement proper loading and error boundaries**.
- **Use Next.js Image component** for optimized images.
- **Use Next.js Link component** for internal navigation.
- **Implement proper SEO** with metadata API or generateMetadata.
- **Use proper data fetching patterns**:
  - Server Components for static data
  - TanStack Query (React Query) for client-side fetching
  - Server Actions for mutations (App Router)
- **State Management**:
  - Zustand for client-side global state
  - TanStack Query for server state
  - React Context for feature-specific state
  - useState for local component state

### 💅 Coding Style Patterns

- **Component Definition**: Use arrow functions with const:
  ```typescript
  export const UserProfile: React.FC<Props> = ({ name, email }) => {
    return <div>{name}</div>;
  };
  ```
- **Naming Conventions**:
  - Variables: `camelCase` for regular, `UPPER_SNAKE_CASE` for constants
  - Collections: Use plural (`users`, `items`)
  - Booleans: `is`, `has`, `should` prefixes (`isActive`, `hasPermission`)
  - Event handlers: `on` prefix (`onChange`, `onMouseOver`)
  - Functions: Verb-based (`fetchData`, `calculateTotal`)
  - Hooks: `use` prefix (`useAuth`, `useUsers`)
  - Types/Interfaces: `PascalCase`, no prefixes (use `interface` for objects, `type` for unions/aliases)
- **Use readonly for all interface properties**:
  ```typescript
  interface Props {
    readonly id: string;
    readonly name: string;
    readonly onChange?: (value: string) => void;
  }
  ```
- **Always use useCallback for event handlers**:
  ```typescript
  const handleClick = useCallback(() => {
    // handler logic
  }, [dependencies]);
  ```
- **Use useMemo for expensive computations and filtering**:
  ```typescript
  const filteredItems = useMemo(() => {
    return items.filter(item => item.active);
  }, [items]);
  ```

### 📚 Documentation & Explainability

- **Write clear, self-documenting code** that explains itself through good naming and structure.
- **Add comments for complex business logic** when the "why" is not obvious.
- When writing complex logic, **add an inline `// Reason:` comment** explaining the why, not just the what.

### 🧠 AI Behavior Rules

- **Never assume missing context. Ask questions if uncertain.**
- **Never hallucinate libraries or functions** – only use known, verified npm packages.
- **Always confirm file paths and module names** exist before referencing them in code or tests.
- **Never delete or overwrite existing code** unless explicitly instructed to or if part of a task from `.claude/TODO.md`.
- **Check `package.json`** to understand available dependencies before suggesting new ones.
- **Respect Next.js version** - features vary significantly between versions (check for App Router vs Pages Router).
- **Follow the technology stack strictly**:
  - Material-UI for UI components
  - TanStack Query for data fetching
  - Zustand for state management
  - Prisma with MySQL for database
  - Redis for caching
  - NextAuth for authentication
  - Zod for validation
  - React Hook Form for complex forms
