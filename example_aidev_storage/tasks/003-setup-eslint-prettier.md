---
id: "003"
name: "setup-eslint-prettier"
type: "feature"
dependencies: ["002-configure-typescript"]
estimated_lines: 150
priority: "critical"
---

# Setup: ESLint and Prettier Configuration

## Overview
Configure ESLint and Prettier with the specific code style requirements for the AFX Render Manager, including 4-space indentation and React-specific rules.

## User Stories
- As a developer, I want consistent code formatting so that the codebase is maintainable
- As a developer, I want linting rules so that I avoid common mistakes

## Technical Requirements
- ESLint with TypeScript support
- Prettier with specific formatting rules
- React and React Hooks plugins
- Integration with Next.js
- Pre-commit hooks with Husky

## Acceptance Criteria
- [ ] ESLint configured with all specified rules
- [ ] Prettier configured with 4-space indentation
- [ ] No linting errors in initial project
- [ ] Format on save working in VS Code
- [ ] Pre-commit hooks running lint and format
- [ ] npm run lint and npm run format commands working

## Testing Requirements

### Test Coverage Target
- Linting rules validation

### Required Test Types (if testing infrastructure exists)
- **Linting Tests**: All files pass linting

### Test Scenarios
#### Happy Path
- [ ] Linting passes on all files
- [ ] Formatting is consistent across project

## Implementation Notes
- Install required packages:
  - eslint-plugin-react
  - eslint-plugin-react-hooks
  - @typescript-eslint/parser
  - @typescript-eslint/eslint-plugin
  - prettier
  - eslint-config-prettier
  - husky
  - lint-staged
- Configure .eslintrc.json with all rules from technical_architecture.json
- Configure .prettierrc with 4-space indentation
- Set up .vscode/settings.json for format on save
- Configure husky pre-commit hooks

## Code Reuse
- Use ESLint configuration from technical_architecture.json exactly

## Examples to Reference
- ESLint rules in .aidev-storage/planning/technical_architecture.json

## Documentation Links
- [ESLint Configuration](https://eslint.org/docs/latest/use/configure/)
- [Prettier Configuration](https://prettier.io/docs/en/configuration.html)
- [Husky](https://typicode.github.io/husky/)

## Potential Gotchas
- Ensure ESLint and Prettier don't conflict
- Windows line endings (CRLF vs LF)
- React 18+ specific rules

## Out of Scope
- Custom ESLint rules
- Additional code quality tools

## Testing Notes
- Run linting on entire codebase
- Verify formatting is applied consistently