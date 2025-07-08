# AI-Dev Instructions

## Core Workflow
AI-Driven Development with learning capabilities. AI learns from corrections.

## Guidelines

### Context & Awareness
- Read `.claude/PROJECT.md` at conversation start
- Check `.claude/TODO.md` before tasks
- Follow project conventions strictly
- Use App Router unless specified

### Code Structure
- **Max 300 lines per file** - split if larger
- **Directory structure**:
  ```
  src/
  ├── components/     # UI (shared & ui/)
  ├── features/       # Feature modules
  ├── lib/           # Core utils (prisma, redis, auth)
  ├── hooks/         # React hooks
  ├── types/         # TypeScript types
  ├── services/      # API layer (client/server)
  ├── stores/        # Zustand stores
  ├── schemas/       # Zod validation
  └── utils/         # Utilities
  app/               # App Router pages
  ```
- Feature-first organization in `src/features/`
- Co-locate related files, use barrel exports

### Testing (TDD)
- **Stack**: Vitest, RTL, Playwright, MSW
- **Co-locate**: `ComponentName.test.tsx`
- **Coverage**: expected behavior, edge cases, errors, loading

### Task Management
- Mark tasks complete in `.claude/TODO.md`
- Security check all code
- Add discovered tasks to TODO

### Code Style
- TypeScript strict mode
- ESLint + Prettier  
- Functional components with arrow functions
- MUI components with sx prop (primary) or CSS Modules (when needed)
- B-prefixed custom components (BTextField, BCheckbox)

### React/Next.js
- Server Components by default
- Loading/error boundaries
- Next.js Image/Link components
- **Data fetching**:
  - Server Components: static
  - TanStack Query: client-side
  - Server Actions: mutations
- **State**: 
  - Zustand with immer/devtools/persist for global state
  - TanStack Query for server state
  - Context for feature-specific state
  - useState for local component state

### Naming
- `camelCase` variables, `UPPER_SNAKE_CASE` constants
- Plurals for collections
- Prefixes: `is/has/should` (booleans), `on` (handlers), `use` (hooks)
- `PascalCase` for types/interfaces

### Code Patterns
```typescript
// Components with sx prop (PRIMARY)
export const Component: React.FC<Props> = ({ prop }) => {
  const styles = useMemo(() => ({
    root: {
      p: 2,
      bgcolor: 'background.paper',
      borderRadius: 1,
    }
  }), []);
  
  return <Box sx={styles.root}>{prop}</Box>;
};

// B-prefixed custom components
export const BTextField = (props: BTextFieldProps) => {
  const { onPressEnter, validation, ...textFieldProps } = props;
  return <TextField {...textFieldProps} variant="outlined" size="small" />;
};

// Zustand store with middleware
export const useAppStore = create<AppState>()(
  devtools(
    persist(
      immer((set) => ({
        user: null,
        setUser: (user) => set((state) => { state.user = user; }),
      })),
      { name: 'app-store' }
    )
  )
);

// React Hook Form with Zod + Controller
const schema = z.object({
  name: z.string().min(1, 'Required'),
  email: z.string().email()
});

const { control, handleSubmit } = useForm({
  resolver: zodResolver(schema)
});

// Use Controller with MUI
<Controller
  name="name"
  control={control}
  render={({ field }) => (
    <BTextField {...field} label="Name" />
  )}
/>
```

### AI Rules
- Ask if uncertain
- Verify paths/modules exist
- Check package.json for deps
- Never delete without instruction
- **Tech stack**: 
  - UI: MUI + CSS Modules (SCSS)
  - State: Zustand (immer/devtools/persist) + TanStack Query
  - Forms: React Hook Form + Zod + MUI Controller pattern
  - Backend: Prisma/MySQL, Redis caching
  - Auth: NextAuth.js
  - Validation: Zod schemas everywhere

## AI-Dev Commands
- `/aidev-generate-project` - Break concept into features
- `/aidev-next-task` - Implement next feature
- `/aidev-review-complete` - Capture corrections
- `/aidev-retry-feature` - Re-implement with patterns
- `/aidev-export-patterns` - Export patterns
- `/aidev-update-project` - Update docs
- `/aidev-check-errors` - Fix quality issues
- `/aidev-check-security` - Fix vulnerabilities
- `/aidev-check-api-database` - Optimize API/DB

## Workflow Steps
1. Add concept to `.aidev/concept/`
2. Add examples to `.aidev/examples/`
3. Run `/aidev-generate-project`
4. Run `/aidev-next-task`
5. Make corrections
6. Run `/aidev-review-complete --pr=<number>`
7. AI applies learned patterns

## Learning System
- 🤖 marker for AI commits
- Pattern confidence tracking
- Auto-apply patterns >0.8 confidence

## Best Practices
- One feature = One PR
- 200-500 lines per feature
- Correct patterns, not just code