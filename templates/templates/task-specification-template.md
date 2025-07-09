---
id: "XXX"
name: "feature-name"
type: "feature" # feature, pattern, or instruction
dependencies: []
estimated_lines: 300 # Use 0 for instruction tasks
priority: "medium" # high, medium, low
---

# Feature: [Feature Name]

## Overview
[Brief description of what this feature accomplishes from a user perspective]

## User Stories
- As a [user type], I want to [action] so that [benefit]
- As a [user type], I want to [action] so that [benefit]

## Technical Requirements
- [List specific technical requirements]
- [Include any external APIs or services needed]
- [Specify any performance requirements]

## Acceptance Criteria
- [ ] [Specific measurable outcome]
- [ ] [User-facing functionality that must work]
- [ ] [Edge cases that must be handled]
- [ ] [Error states that must be graceful]

## Testing Requirements

**Note**: Testing requirements only apply if testing infrastructure is available in the project. If no testing framework is set up, tests will be created when the testing infrastructure task is completed.

### Test Coverage Target
- Minimum 80% coverage for all new code (when testing is available)
- 100% coverage for critical business logic (when testing is available)

### Required Test Types (if testing infrastructure exists)
- **Unit Tests**: [List specific functions/utilities to test]
- **Component Tests**: [List components and their test scenarios]
- **Integration Tests**: [List integration points to test]
- **E2E Tests**: [List user flows to test end-to-end]

### Test Scenarios
#### Happy Path
- [ ] [Primary user flow works correctly]
- [ ] [Data saves and retrieves properly]

#### Error Handling
- [ ] [Invalid input shows appropriate error]
- [ ] [Network failures handled gracefully]
- [ ] [Authentication errors redirect properly]

#### Edge Cases
- [ ] [Empty states render correctly]
- [ ] [Maximum input limits enforced]
- [ ] [Concurrent operations handled]

### Test File Locations (when testing is available)
- Component tests: `[component-name].test.tsx` (co-located)
- API route tests: `route.test.ts` (co-located)
- E2E tests: `e2e/[feature-name].spec.ts`
- Test utilities: `src/test-utils/[feature-name].ts`

**Note**: If testing infrastructure is not yet set up, document what tests WOULD be created for future reference.

## Implementation Notes
- [Specific libraries or patterns to use]
- [References to existing code patterns to follow]
- [Any architectural decisions already made]

## Examples to Reference
- [Path to similar features in .aidev/examples/]
- [Existing components that demonstrate patterns]

## Documentation Links
- [Relevant Next.js documentation]
- [Library documentation needed]
- [API documentation]

## Potential Gotchas
- [Known issues to watch out for]
- [Common mistakes to avoid]
- [Security considerations]

## Out of Scope
- [Explicitly list what should NOT be implemented]
- [Features to be handled in future iterations]

## Testing Notes
- [Any special testing considerations]
- [Mock data requirements]
- [External services to mock]
- [Performance benchmarks to meet]
- **Infrastructure Check**: Implementation will check for testing setup before creating tests
- **Fallback**: If no testing available, feature will be implemented without tests