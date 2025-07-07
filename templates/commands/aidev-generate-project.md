---
description: "Generates feature specifications from the project concept document"
allowed-tools: ["Read", "Write", "Glob", "Edit", "MultiEdit", "Task", "TodoRead", "TodoWrite"]
---

# Command: aidev-generate-project

## Purpose
Analyzes concept documents in the `.aidev/concept/` directory and breaks them down into individual feature specifications that can be implemented incrementally.

## Process

### 1. Discovery Phase
- Read all files in `.aidev/concept/` directory
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
Use the template from `.aidev/templates/feature-specification-template.md` to create each feature specification. The template includes sections for:
- Metadata (id, name, type, dependencies, etc.)
- Overview and user stories
- Technical requirements and acceptance criteria
- Implementation notes and examples to reference
- Documentation links and potential gotchas

Refer to `.aidev/templates/feature-specification-example.md` for a complete example.

### 5. Output Structure
Create files in `.aidev/features/queue/` with proper numbering:
```
.aidev/features/queue/
├── 000-pattern-component.md
├── 000-pattern-api.md
├── 000-pattern-service.md
├── 001-user-authentication.md
├── 002-user-profile.md
├── 003-dashboard.md
└── ...
```

Each file should follow the structure defined in `.aidev/templates/feature-specification-template.md`

## Validation Steps
1. Ensure all concepts have been captured in features
2. Verify dependencies are correctly mapped
3. Check that pattern establishment comes before feature implementation
4. Confirm feature sizes are manageable (not too large)
5. Create a summary report showing the execution plan

## Example Usage
```bash
claude /aidev-generate-project
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