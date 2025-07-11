---
name: "Testing Strategy and Preferences"
description: "Defines the testing approach, tools, and conventions for this project"
ai_instructions: |
  When implementing tests:
  1. Use Vitest as the primary test runner, not Jest
  2. Write tests alongside implementation (TDD when appropriate)
  3. Focus on testing behavior, not implementation details
  4. Aim for 80%+ coverage on new code
  5. Use React Testing Library for component tests
  6. Use Playwright for E2E tests
---

# Testing Strategy and Preferences

<ai-context>
This guide defines the testing approach for Next.js applications. We use Vitest for unit/component testing
and Playwright for E2E testing. Tests should focus on behavior and user interactions rather than
implementation details. AI should write tests alongside feature implementation.
</ai-context>

## Testing Philosophy

<ai-rules>
- WRITE tests for all new features and bug fixes
- FOCUS on testing behavior, not implementation
- USE data-testid attributes for reliable element selection
- MOCK external dependencies and API calls
- KEEP tests fast and independent
</ai-rules>
- Follow Test-Driven Development (TDD) practices with a pragmatic approach
- Write tests alongside features, not necessarily before (Red-Green-Refactor when appropriate)
- Focus on behavior testing over implementation details
- Aim for 80%+ test coverage for new code

## Testing Stack

### Unit & Component Testing
- **Framework**: Vitest (preferred) or Jest
- **Component Testing**: React Testing Library
- **Assertion Library**: @testing-library/jest-dom
- **Coverage Tool**: Vitest coverage (c8) or Jest coverage

### E2E Testing
- **Framework**: Playwright
- **Browser Testing**: Chromium, Firefox, WebKit
- **Mobile Testing**: Mobile viewports in Playwright

### API Testing
- **Mocking**: Mock Service Worker (MSW)
- **API Client Testing**: Supertest or built-in fetch testing

## Testing Commands

```json
{
  "scripts": {
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest --coverage",
    "test:ui": "vitest --ui",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug",
    "test:all": "npm run test && npm run test:e2e"
  }
}
```

## Test Structure

### File Organization
```
src/
├── components/
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.test.tsx      # Unit/Component test
│   │   └── Button.stories.tsx    # Optional: Storybook
├── app/
│   ├── api/
│   │   └── users/
│   │       ├── route.ts
│   │       └── route.test.ts     # API route test
tests/                            # or e2e/
├── auth.setup.ts                 # E2E auth setup
├── home.spec.ts                  # E2E test
└── fixtures/                     # Test data
```

### Test Naming Conventions

<validation-schema>
Test File Names:
- ✅ Button.test.tsx (unit/component tests)
- ✅ route.test.ts (API route tests)
- ✅ login.spec.ts (E2E tests)
- ❌ Button.spec.tsx (wrong extension for unit tests)
- ❌ test-button.tsx (wrong naming pattern)

Test Descriptions:
- ✅ "should display error message when form is invalid"
- ✅ "should redirect to dashboard after login"
- ❌ "test form validation" (not behavior-focused)
- ❌ "works correctly" (too vague)
</validation-schema>
- Test files: `*.test.ts(x)` for unit/component tests
- E2E files: `*.spec.ts` for Playwright tests
- Test descriptions: Use behavior-focused language
  - ✅ "should display error message when form is invalid"
  - ❌ "test form validation"

## Testing Patterns

### Component Testing Example

<code-template name="component-test">
```typescript
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from './Button'

describe('Button', () => {
  it('should handle click events', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()
    
    render(<Button onClick={handleClick}>Click me</Button>)
    
    await user.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```
</code-template>

### API Testing Example

<code-template name="api-test">
```typescript
import { createMocks } from 'node-mocks-http'
import { POST } from './route'

describe('/api/users', () => {
  it('should create a new user', async () => {
    const { req } = createMocks({
      method: 'POST',
      body: { email: 'test@example.com' },
    })
    
    const response = await POST(req)
    const data = await response.json()
    
    expect(response.status).toBe(201)
    expect(data.email).toBe('test@example.com')
  })
})
```
</code-template>

### E2E Testing Example

<code-template name="e2e-test">
```typescript
import { test, expect } from '@playwright/test'

test('user can complete signup flow', async ({ page }) => {
  await page.goto('/signup')
  
  await page.fill('[name="email"]', 'test@example.com')
  await page.fill('[name="password"]', 'securepassword')
  await page.click('button[type="submit"]')
  
  await expect(page).toHaveURL('/dashboard')
  await expect(page.getByText('Welcome')).toBeVisible()
})
```
</code-template>

## Test Implementation Requirements

### When Creating New Features
1. **Before Implementation** (Optional TDD):
   - Write E2E test for the user flow (failing test)
   - Write component tests for key interactions (failing tests)

2. **During Implementation**:
   - Implement feature to make tests pass
   - Add unit tests for utility functions
   - Add component tests for edge cases

3. **After Implementation**:
   - Ensure all tests pass
   - Check coverage (aim for 80%+)
   - Add any missing edge case tests

### What to Test

<ai-decision-tree>
Should I write a test for this?

1. Is it a user interaction?
   → YES: Write a component test
   → NO: Continue to 2

2. Is it an API endpoint?
   → YES: Write an API test
   → NO: Continue to 3

3. Is it a utility function?
   → YES: Does it have complex logic?
      → YES: Write a unit test
      → NO: Skip if trivial
   → NO: Continue to 4

4. Is it a critical user flow?
   → YES: Write an E2E test
   → NO: Consider if testing adds value
</ai-decision-tree>
- **Always Test**:
  - User interactions (clicks, form submissions)
  - API endpoints (success and error cases)
  - Business logic functions
  - Error states and loading states
  - Accessibility (ARIA labels, keyboard navigation)

- **Consider Testing**:
  - Complex component state logic
  - Custom hooks
  - Utility functions with multiple cases
  - Integration between components

- **Don't Test**:
  - Third-party libraries
  - Simple prop passing
  - CSS styles (use visual regression if needed)
  - Implementation details

## Coverage Requirements
- Minimum coverage for new code: 80%
- Critical paths must have 100% coverage
- Coverage reports should be reviewed in PR

## Performance Testing
- Keep test suites fast (< 5 minutes for full suite)
- Use test.concurrent() for independent tests
- Mock heavy operations and external services
- Run E2E tests in parallel when possible

## Continuous Integration
Tests should run automatically on:
- Every commit (unit tests)
- Every PR (all tests)
- Before deployment (all tests + smoke tests)

## Mock Data Strategy
- Use factories for consistent test data
- Keep test data realistic but minimal
- Use MSW for API mocking in component tests
- Maintain test fixtures separately

## Debugging Tests
- Use `test.only()` to isolate failing tests
- Enable Playwright trace viewer for E2E debugging
- Use `screen.debug()` for component test debugging
- Keep console.log statements out of committed tests

## Migration Path
For projects currently using Jest:
1. Keep Jest running while setting up Vitest
2. Migrate test by test (Vitest syntax is very similar)
3. Remove Jest once all tests are migrated
4. Update CI/CD pipelines

## Resources
- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/)
- [MSW Documentation](https://mswjs.io/)