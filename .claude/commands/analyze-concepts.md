---
description: "Analyzes concept documents and generates feature specifications"
allowed-tools: ["Read", "Write", "Glob", "Edit", "MultiEdit", "Task", "TodoRead", "TodoWrite"]
---

# Command: analyze-concepts

## Purpose
Analyzes concept documents in the `/concepts/` directory and breaks them down into individual feature specifications that can be implemented incrementally.

## Process

### 1. Discovery Phase
- Read all files in `/concepts/` directory
- Identify the overall project vision and goals
- Extract feature requirements and dependencies

### 2. Feature Breakdown
- Break down the project into discrete, implementable features
- Each feature should be:
  - Self-contained (can be implemented independently)
  - Testable (has clear acceptance criteria)
  - Reviewable (reasonable PR size: 200-500 lines)
  - Numbered (001-feature-name.md, 002-feature-name.md)

### 3. Pattern Identification
For new projects, identify what patterns need to be established:
- Component patterns (if UI components are needed)
- API patterns (if API routes are needed)
- Service patterns (if business logic is needed)
- Store patterns (if state management is needed)
- Database patterns (if data models are needed)

Create pattern establishment tasks numbered from 000:
- `000-pattern-component.md`
- `000-pattern-api.md`
- etc.

### 4. Feature Specification Template
Each feature specification should follow this structure:

```yaml
---
id: "001"
name: "user-authentication"
type: "feature" # or "pattern"
dependencies: ["000-pattern-component", "000-pattern-api"]
estimated_lines: 300
priority: "high"
---

# Feature: User Authentication

## Overview
Brief description of what this feature accomplishes.

## User Stories
- As a user, I want to...
- As an admin, I want to...

## Technical Requirements
- OAuth2 integration with Google/GitHub
- Session management with Redis
- Email/password fallback option

## Acceptance Criteria
- [ ] Users can sign up with email/password
- [ ] Users can sign in with OAuth providers
- [ ] Sessions persist across browser restarts
- [ ] Logout clears all session data

## Implementation Notes
- Use NextAuth for authentication
- Store sessions in Redis
- Follow established auth patterns from pattern files

## Potential Gotchas
- Handle OAuth callback URLs properly
- Ensure CSRF protection is enabled
```

### 5. Output Structure
Create files in `/features/queue/` with proper numbering:
```
features/queue/
├── 000-pattern-component.md
├── 000-pattern-api.md
├── 000-pattern-service.md
├── 001-user-authentication.md
├── 002-user-profile.md
├── 003-dashboard.md
└── ...
```

## Validation Steps
1. Ensure all concepts have been captured in features
2. Verify dependencies are correctly mapped
3. Check that pattern establishment comes before feature implementation
4. Confirm feature sizes are manageable (not too large)
5. Create a summary report showing the execution plan

## Example Usage
```bash
claude /analyze-concepts
```

This will:
1. Read all concept documents
2. Generate pattern establishment tasks (if new project)
3. Generate feature specifications
4. Create an execution plan
5. Output a summary of what was created

## Important Notes
- Number prefixes determine execution order
- Pattern files (000-*) should always come first
- Features with dependencies should be numbered after their dependencies
- Keep features focused - if too large, split into sub-features