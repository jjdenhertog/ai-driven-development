# CLAUDE.md - Next.js Project Guidelines

### 🔄 Project Awareness & Context

- **Always read `.claude/PROJECT.md`** at the start of a new conversation to understand the project's architecture, goals, style, and constraints.
- **Check `.claude/TODO.md`** before starting a new task. If the task isn't listed, add it with a brief description and today's date.
- **Use consistent naming conventions, file structure, and architecture patterns** as described in `.claude/PROJECT.md`.
- **Follow Next.js App Router conventions** unless the project explicitly uses Pages Router.

### 🧱 Code Structure & Modularity

- **Never create a file longer than 300 lines of code.** If a file approaches this limit, refactor by splitting it into modules, custom hooks, or utility files.
- **Organize code into clearly separated modules**, grouped by feature or responsibility:
  - `components/` - Reusable UI components
  - `app/` - App Router pages and layouts
  - `lib/` - Utility functions and shared logic
  - `hooks/` - Custom React hooks
  - `types/` - TypeScript type definitions
  - `services/` - API clients and external service integrations
- **Co-locate related files** (component + styles + tests) when appropriate.
- **Use barrel exports** (`index.ts`) for cleaner imports from feature directories.
- **Use environment variables** through Next.js's built-in `.env.local` support.

### 🧪 Testing & Reliability

- **Always create tests for new features** (components, hooks, utilities, API routes).
- **After updating any logic**, check whether existing tests need to be updated. If so, do it.
- **Tests should use**:
  - Jest for unit tests
  - React Testing Library for component tests
  - Playwright or Cypress for E2E tests (if configured)
- **Test files should be co-located** as `ComponentName.test.tsx` or in a `__tests__` folder.
- Include at least:
  - 1 test for expected behavior
  - 1 test for edge cases
  - 1 test for error states
  - 1 test for loading states (if applicable)

### ✅ Task Completion

- **Mark completed tasks in `.claude/TODO.md`** immediately after finishing them.
- Please check through all the code you just wrote and make sure it follows security best practices. Make sure no sensitive information is in the front end and ther are no vulnerabilities people can exploit.
- Add new sub-tasks or TODOs discovered during development to `.claude/TODO.md` under a "Discovered During Work" section.

### 📎 Style & Conventions

- **Use TypeScript** for all new files (`.ts`, `.tsx`).
- **Follow ESLint rules** and format with **Prettier**.
- **Use strict TypeScript** settings (`strict: true` in `tsconfig.json`).
- **Prefer functional components** with hooks over class components.
- **Use CSS Modules, Tailwind CSS, or styled-components** (check project setup).
- Write **JSDoc comments for complex functions**:
  ```typescript
  /**
   * Brief description of what the function does.
   * @param {string} param1 - Description of param1
   * @returns {ReturnType} Description of return value
   */
  function example(param1: string): ReturnType {
  	// implementation
  }
  ```

### 🎨 React & Next.js Best Practices

- **Use Server Components by default** in App Router, client components only when needed.
- **Implement proper loading and error boundaries**.
- **Use Next.js Image component** for optimized images.
- **Use Next.js Link component** for internal navigation.
- **Implement proper SEO** with metadata API or generateMetadata.
- **Use proper data fetching patterns**:
  - Server Components for static data
  - SWR or React Query for client-side fetching
  - Server Actions for mutations (App Router)

### 📚 Documentation & Explainability

- **Update `README.md`** when new features are added, dependencies change, or setup steps are modified.
- **Comment non-obvious code** and ensure everything is understandable to a mid-level developer.
- When writing complex logic, **add an inline `// Reason:` comment** explaining the why, not just the what.
- **Document component props** with TypeScript interfaces and JSDoc when helpful.

### 🧠 AI Behavior Rules

- **Never assume missing context. Ask questions if uncertain.**
- **Never hallucinate libraries or functions** – only use known, verified npm packages.
- **Always confirm file paths and module names** exist before referencing them in code or tests.
- **Never delete or overwrite existing code** unless explicitly instructed to or if part of a task from `.claude/TODO.md`.
- **Check `package.json`** to understand available dependencies before suggesting new ones.
- **Respect Next.js version** - features vary significantly between versions (check for App Router vs Pages Router).
