---
id: "102"
name: "pattern-testing"
type: "pattern"
dependencies: ["003"]
estimated_lines: 200
priority: "medium"
---

# Pattern: Testing Standards and Utilities

## Overview
Establish comprehensive testing patterns for components, API routes, hooks, and utilities. Create reusable test utilities, mock factories, and MSW handlers that will be used throughout the application.

Creating task because testing framework is set up in task 003 and pattern will be used in: all component tests, all API route tests (lines 269-320), all feature E2E tests, all utility function tests.

## User Stories
- As a developer, I want consistent testing patterns so tests are easy to write and maintain
- As a developer, I want realistic mock data so tests reflect actual usage

## Technical Requirements
- Custom render functions with providers
- Mock data factories for all models
- MSW handlers for external APIs
- Test utilities for common operations
- Consistent test file organization
- Performance testing helpers
- Accessibility testing utilities

## Acceptance Criteria
- [ ] Custom render with all providers created
- [ ] Mock factories for User, Job, ApiToken models
- [ ] MSW handlers for NextAuth and external APIs
- [ ] Test utilities for auth, routing, and forms
- [ ] Example tests demonstrating all patterns
- [ ] Test data generators implemented
- [ ] Performance benchmarking utilities
- [ ] Accessibility testing helpers
- [ ] Documentation for test patterns

## Testing Requirements

### Test Coverage Target
- Test utilities: 100% coverage
- Mock factories: 100% coverage
- Example implementations: 90% coverage

### Required Test Types
- **Unit Tests**: Test utilities themselves
- **Component Tests**: Example component with all patterns
- **Integration Tests**: Full flow examples
- **E2E Tests**: Example user journey

### Test Scenarios
#### Happy Path
- [ ] All test utilities work correctly
- [ ] Mock data generates valid models
- [ ] MSW handlers simulate real APIs

#### Error Handling
- [ ] Test utilities handle edge cases
- [ ] Mock factories validate constraints
- [ ] Error simulation works properly

## Implementation Notes
- Follow testing patterns from `.aidev-worktree/preferences/testing.md`
- Create factories that respect database constraints
- MSW handlers should simulate real API behavior
- Include helpers for common assertions
- Make test data deterministic when possible

## Pattern Structure

```typescript
// test-utils/render.tsx
export function renderWithProviders(
  ui: React.ReactElement,
  options?: RenderOptions
)

// test-utils/factories.ts
export const userFactory = Factory.define<User>(() => ({
  id: faker.datatype.uuid(),
  email: faker.internet.email(),
  // ... other fields
}))

// test-utils/msw-handlers.ts
export const handlers = [
  rest.post('/api/auth/session', sessionHandler),
  rest.post('/api/jobs', createJobHandler),
  // ... other handlers
]

// test-utils/helpers.ts
export async function loginUser(user: User)
export async function waitForLoadingToFinish()
export function expectAccessible(container: HTMLElement)

// Example test pattern
describe('JobList', () => {
  it('should display jobs for authenticated user', async () => {
    const user = userFactory.build()
    const jobs = jobFactory.buildList(3, { userId: user.id })
    
    server.use(
      rest.get('/api/jobs', (req, res, ctx) => {
        return res(ctx.json({ data: jobs }))
      })
    )
    
    const { getByText } = renderWithProviders(<JobList />, {
      session: user
    })
    
    await waitForLoadingToFinish()
    
    jobs.forEach(job => {
      expect(getByText(job.projectPath)).toBeInTheDocument()
    })
  })
})
```

## Examples to Reference
- `.aidev-worktree/preferences/testing.md` for testing philosophy
- `.aidev-worktree/examples/components/UserRegistrationForm.tsx` for component patterns
- React Testing Library best practices

## Documentation Links
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [MSW Documentation](https://mswjs.io/)
- [Factory.ts](https://github.com/thoughtbot/fishery)
- [Faker.js](https://fakerjs.dev/)

## Potential Gotchas
- MSW requires service worker setup
- Async rendering needs proper waits
- Mock data must respect constraints
- Test isolation is critical

## Out of Scope
- Visual regression testing
- Performance profiling tools
- Load testing utilities
- Contract testing
- Mutation testing

## Testing Notes
- Test the test utilities themselves
- Ensure factories generate valid data
- Verify MSW handlers match real APIs
- Document all helper functions