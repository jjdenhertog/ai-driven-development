---
id: "002"
name: "setup-testing-framework"
type: "feature"
dependencies: ["001-setup-nextjs-project"]
estimated_lines: 150
priority: "critical"
---

# Setup: Testing Framework

## Overview
Install and configure a comprehensive testing framework for the Next.js application. This includes unit testing with Vitest, component testing with React Testing Library, and E2E testing with Playwright. All new features must include tests with 80%+ coverage.

## User Stories
- As a developer, I want to run unit tests quickly so that I can verify my code works
- As a developer, I want to test React components in isolation so that I can ensure they behave correctly
- As a developer, I want to run E2E tests so that I can verify complete user flows work

## Technical Requirements
- Vitest as the primary test runner (faster than Jest)
- React Testing Library for component testing
- Playwright for E2E testing
- Mock Service Worker (MSW) for API mocking
- Test coverage reporting with c8
- Test scripts in package.json
- TypeScript support for all tests

## Acceptance Criteria
- [ ] Vitest is installed and configured
- [ ] React Testing Library is set up with custom render utilities
- [ ] Playwright is installed with basic configuration
- [ ] MSW is configured for API mocking
- [ ] Test scripts work: `npm test`, `npm run test:watch`, `npm run test:coverage`
- [ ] E2E test scripts work: `npm run test:e2e`
- [ ] Coverage reporting shows in terminal and generates HTML report
- [ ] Example tests pass for each type (unit, component, E2E)
- [ ] Testing preference document is followed if it exists

## Testing Requirements

### Test Coverage Target
- This task itself should have example tests that demonstrate patterns
- Coverage configuration should enforce 80% threshold

### Required Test Types
- **Unit Tests**: Example utility function test
- **Component Tests**: Example component test with RTL
- **Integration Tests**: Example hook test
- **E2E Tests**: Example homepage test with Playwright

### Test Scenarios
#### Happy Path
- [ ] Example tests run and pass
- [ ] Coverage report generates successfully

#### Error Handling
- [ ] Tests fail appropriately when code is broken
- [ ] Clear error messages help debugging

### Test File Locations
- Config files: `vitest.config.ts`, `playwright.config.ts`
- Test utilities: `src/test-utils/`
- Example tests: Co-located with example code

## Implementation Notes
- Check `.aidev-storage/preferences/testing.md` for any project-specific testing preferences
- If no testing preference exists, use these defaults
- Create vitest.config.ts with jsdom environment
- Set up testing-library cleanup in test setup file
- Configure path aliases to work in tests
- Add MSW handlers directory structure
- Create custom render function with providers

## Examples to Reference
- `.aidev-storage/preferences/testing.md` - Testing preferences (if exists)
- Standard Vitest + Next.js setup patterns
- React Testing Library best practices

## Documentation Links
- https://vitest.dev/guide/
- https://testing-library.com/docs/react-testing-library/setup
- https://playwright.dev/docs/intro
- https://mswjs.io/docs/getting-started

## Potential Gotchas
- Vitest needs explicit jsdom environment for React components
- Path aliases must be configured in vitest.config.ts
- Playwright needs to install browser binaries
- MSW requires public directory setup for browser mocking
- Some Next.js features (like App Router) need special test setup

## Out of Scope
- Complex CI/CD pipeline setup (separate task)
- Advanced Playwright features like visual regression
- Performance testing setup
- Load testing configuration

## Testing Notes
- This setup task should include its own example tests
- The example tests serve as templates for future tests
- All test utilities should have JSDoc comments
- Create a README in test-utils explaining the setup