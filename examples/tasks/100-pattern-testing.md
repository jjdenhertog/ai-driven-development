---
id: "100"
name: "pattern-testing"
type: "pattern"
dependencies: ["002-setup-testing-framework"]
estimated_lines: 200
priority: "high"
---

# Pattern: Testing Standards and Utilities

## Overview
Establish testing patterns, utilities, and conventions that all future tests will follow. This includes custom render functions, mock factories, test data builders, and consistent testing practices across the codebase.

## User Stories
- As a developer, I want consistent test patterns so that tests are predictable and maintainable
- As a developer, I want reusable test utilities so that I don't repeat testing code
- As a developer, I want mock data factories so that test data is consistent

## Technical Requirements
- Custom render function with all providers
- Test data factory pattern using Factory.ts or similar
- MSW handlers for common API endpoints
- Custom test matchers for domain-specific assertions
- Accessibility testing utilities
- Performance testing helpers
- Test file naming and organization standards

## Acceptance Criteria
- [ ] Custom render function includes all app providers
- [ ] Test factory created for each major data model
- [ ] MSW handlers cover authentication and common APIs
- [ ] Test utilities documented with examples
- [ ] Accessibility tests integrated into component tests
- [ ] Test organization follows clear patterns
- [ ] Example tests demonstrate all patterns

## Testing Requirements

### Test Coverage Target
- The pattern files themselves should be 100% covered
- Utilities should have comprehensive tests

### Required Test Types
- **Unit Tests**: Test utilities and factories
- **Component Tests**: Example using custom render
- **Integration Tests**: Example using MSW handlers
- **E2E Tests**: Example using page object pattern

### Test Scenarios
#### Happy Path
- [ ] Custom render works with all providers
- [ ] Factories generate valid test data
- [ ] MSW handlers return expected responses

#### Error Handling
- [ ] Test utilities handle edge cases
- [ ] Clear error messages for misuse

### Test File Locations
- Test utilities: `src/test-utils/`
- Mock handlers: `src/mocks/handlers/`
- Test factories: `src/test-utils/factories/`
- Page objects: `e2e/page-objects/`

## Implementation Notes
- Create renderWithProviders that includes:
  - React Query client
  - Next.js router mock
  - Theme provider
  - Auth context
  - Any other app-wide providers
- Implement factory pattern for:
  - User data
  - Authentication tokens
  - Common domain objects
- Set up MSW with:
  - Auth endpoints
  - User CRUD operations
  - File upload mocks
- Create custom matchers for:
  - Accessibility assertions
  - Data validation
  - Component state checks

## Examples to Reference
- `.aidev/preferences/testing.md` - Project testing preferences
- `.aidev/examples/` - Look for any existing test examples
- Industry best practices for React Testing Library

## Documentation Links
- https://testing-library.com/docs/react-testing-library/setup#custom-render
- https://mswjs.io/docs/best-practices
- https://kentcdodds.com/blog/test-isolation-with-react
- https://github.com/mswjs/data (for mock data)

## Potential Gotchas
- Custom render must handle all providers in correct order
- MSW handlers must be properly cleaned up between tests
- Factory data must be realistic enough for tests
- Page objects can become too complex if not managed

## Out of Scope
- Visual regression testing setup
- Contract testing patterns
- Mutation testing configuration
- Cross-browser testing setup

## Testing Notes
- All patterns must have clear examples
- Document the "why" behind each pattern
- Include anti-patterns to avoid
- Create a testing style guide document