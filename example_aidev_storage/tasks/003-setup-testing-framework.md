---
id: "003"
name: "setup-testing-framework"
type: "feature"
dependencies: ["001"]
estimated_lines: 200
priority: "high"
---

# Setup: Testing Framework with Vitest

## Overview
Set up comprehensive testing infrastructure using Vitest for unit/component testing, React Testing Library for component testing, and Playwright for E2E testing. This enables TDD practices for all future development.

Creating task because concept states at line 411-433: "Test-Driven Development (TDD)" and preferences specify Vitest as the test runner.

## User Stories
- As a developer, I want to write tests alongside features so that I can ensure code quality
- As a developer, I want fast test execution so that I can practice TDD effectively

## Technical Requirements
- Vitest as primary test runner
- React Testing Library for component testing
- Playwright for E2E testing
- Mock Service Worker (MSW) for API mocking
- Coverage reporting with c8
- Test utilities and custom renders

## Acceptance Criteria
- [ ] Vitest installed and configured
- [ ] React Testing Library set up with custom render
- [ ] Playwright installed with basic configuration
- [ ] MSW configured for API mocking
- [ ] Test scripts added to package.json
- [ ] Coverage thresholds configured (80% target)
- [ ] Test utilities created (renderWithProviders, etc.)
- [ ] Example tests created and passing
- [ ] CI-friendly test commands available

## Testing Requirements

### Test Coverage Target
- Minimum 80% coverage for new code
- 100% coverage for critical business logic

### Required Test Types
- **Unit Tests**: Sample utility function test
- **Component Tests**: Sample component test with RTL
- **Integration Tests**: Sample API route test
- **E2E Tests**: Sample home page test with Playwright

### Test Scenarios
#### Happy Path
- [ ] All example tests pass
- [ ] Coverage report generates correctly

#### Error Handling
- [ ] Failed tests show clear error messages
- [ ] Coverage fails build if below threshold

## Implementation Notes
- Follow testing preferences from `.aidev-worktree/preferences/testing.md`
- Configure Vitest for Next.js compatibility
- Set up path aliases in test environment
- Create test utilities for common operations
- Configure MSW for development and testing

## Examples to Reference
- `.aidev-worktree/preferences/testing.md` for testing patterns
- `.aidev-worktree/examples/components/UserRegistrationForm.tsx` for component test patterns

## Documentation Links
- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/)
- [MSW Documentation](https://mswjs.io/)

## Potential Gotchas
- Vitest requires proper React configuration
- Next.js App Router needs special test setup
- MSW requires service worker setup for browser
- Path aliases must match tsconfig.json

## Out of Scope
- Storybook setup
- Visual regression testing
- Performance testing tools
- Load testing infrastructure

## Testing Notes
- This task sets up the testing infrastructure itself
- Future tasks will use this setup for their tests
- Include examples of each test type