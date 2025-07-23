# Task Creation Template

This template defines the standard structure for creating tasks in the AI-driven development workflow. It ensures consistency across all task types and phases.

## CRITICAL: Tasks Must Be Self-Contained

**Tasks MUST NOT reference planning folder files**. Each task specification must include ALL necessary information:
- ❌ WRONG: "Use the database choice from technical_architecture.json"
- ✅ RIGHT: "Use PostgreSQL with Prisma ORM for database operations"

**Why**: Tasks are executed independently by code agents who don't have access to planning files. All context, technology choices, patterns, and requirements must be embedded directly in each task.

## Task Categories

### Setup Tasks (001-099)
Tasks that configure the development environment, install dependencies, and set up foundational infrastructure.

### Pattern Tasks (100-199)
Reusable patterns and utilities that will be used across multiple features.

### Feature Tasks (200+)
User-facing features and functionality that implement the concept requirements.

### Instruction Tasks
Manual tasks that require user intervention (e.g., API key configuration).

## Task File Structure

Each task consists of two files:

### 1. JSON Metadata File: `[task-id]-[task-name].json`

```json
{
  "id": "[task-id]",
  "name": "[task-name]",
  "type": "feature|pattern|setup|instruction",
  "category": "feature|pattern|setup|instruction",
  "description": "[Brief description]",
  "dependencies": ["[task-id]", "[task-id]"],
  "priority": "critical|high|medium|low",
  "estimated_complexity": "low|medium|high",
  "estimated_lines": [number],
  "created_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
```

**IMPORTANT**: Dependencies must contain ONLY the task ID (e.g., `"001"`, `"100"`, `"200"`), NOT the full task name (e.g., NOT `"001-init-nextjs-project"`)

#### Example JSON file: `007-create-folder-structure.json`
```json
{
  "id": "007",
  "name": "create-folder-structure",
  "type": "feature",
  "dependencies": ["001"],  // ✅ CORRECT: Just the ID
  // NOT: ["001-init-nextjs-project"] ❌ WRONG: Full task name
  "estimated_lines": 50,
  "priority": "critical",
  "category": "setup",
  "description": "Create complete project folder structure"
}
```

### 2. Markdown Specification File: `[task-id]-[task-name].md`

## Feature Task Template

```markdown
---
id: "[task-id]"
name: "[task-name]"
type: "feature"
dependencies: ["[task-id]", "[task-id]"]  # Just IDs: ["001", "100"], not full names
estimated_lines: [number]
priority: "critical|high|medium|low"
---

# Feature: [Human-Readable Title]

## Description
[Comprehensive description of what this feature does and why it's needed]

## Acceptance Criteria
- [ ] [Specific, measurable requirement]
- [ ] [User-visible behavior]
- [ ] [Edge case handling]
- [ ] [Performance requirement]
- [ ] [Security requirement]

## Component Specifications
```yaml
components:
  ComponentName:
    props:
      - propName: PropType
      - onEvent: (param: Type) => void
    
    states:
      - idle: Description
      - loading: Description
      - error: Description
      - success: Description
    
    validations:
      - fieldName: Validation rules
```

## API Specifications
```yaml
endpoints:
  - method: GET|POST|PUT|PATCH|DELETE
    path: /api/resource/path
    request:
      headers:
        Authorization: Bearer token
      params:
        id: string
      body:
        field: type
    responses:
      200:
        success: true
        data: object
      400:
        error: "Validation error"
        details: array
      401:
        error: "Unauthorized"
      404:
        error: "Not found"
```

## Test Specifications
```yaml
component_tests:
  ComponentName:
    - "Renders with default props"
    - "Handles user interaction correctly"
    - "Shows loading state during async operations"
    - "Displays error messages appropriately"
    - "Validates input according to rules"

api_tests:
  endpoint_name:
    - "Returns correct data for valid request"
    - "Validates required fields"
    - "Handles authentication properly"
    - "Returns appropriate error codes"
    - "Implements rate limiting"

integration_tests:
  - "Complete user flow works end-to-end"
  - "Data persists correctly"
  - "Error recovery works as expected"
```

## Code Reuse
- Use existing `[Component]` from `[path]`
- Apply `[pattern]` from task [task-id]
- Reuse `[utility]` from `[path]`
- Leverage existing `[hook/context]`
- Follow pattern established in `[reference]`

## Security Considerations
- [Authentication/authorization requirements]
- [Data validation and sanitization]
- [Rate limiting or abuse prevention]
- [Sensitive data handling]

## Performance Considerations
- [Expected load or scale]
- [Optimization strategies]
- [Caching approach]
- [Database query optimization]

## UI/UX Specifications
```yaml
interactions:
  user_action:
    - trigger: Description
    - feedback: Visual/audio response
    - result: What happens
  
visual_design:
  - follows_theme: true
  - responsive: mobile|tablet|desktop
  - accessibility: WCAG 2.1 AA

animations:
  - element: Duration and easing
  - transition: Smooth state changes
```
```

## Pattern Task Template

```markdown
---
id: "[task-id]"
name: "pattern-[pattern-name]"
type: "pattern"
dependencies: ["[task-id]"]  # Just IDs: ["001"], not ["001-init-nextjs-project"]
estimated_lines: [50-150]
priority: "high"
---

# Pattern: [Pattern Name]

## Description
[What problem this pattern solves and when to use it]

## Pattern Requirements
- [Consistency requirement]
- [Reusability requirement]
- [Type safety requirement]
- [Performance requirement]

## Implementation
Create a [50-150] line exemplar that demonstrates:
```typescript
// Pattern structure example
export function patternName(params: Type): ReturnType {
  // Implementation showcase
}
```

## Test Specifications
```yaml
pattern_tests:
  - scenario: "Normal usage"
    input: "Valid input"
    expected: "Expected output"
  
  - scenario: "Edge case"
    input: "Edge case input"
    expected: "Handled gracefully"
  
  - scenario: "Error case"
    input: "Invalid input"
    expected: "Appropriate error"
```

## Usage Examples
Show 3+ places this pattern will be used:
1. `[path/to/usage]` - [How it's used]
2. `[path/to/usage]` - [How it's used]
3. `[path/to/usage]` - [How it's used]

## Code Reuse
- Extends existing `[pattern]` from `[path]`
- Uses types from `[path]`
- Follows conventions from `[reference]`
```

## Setup Task Template

```markdown
---
id: "[task-id]"
name: "setup-[what-to-setup]"
type: "setup"
dependencies: []  # Usually empty for setup tasks, or just IDs like ["001"]
estimated_lines: [number]
priority: "critical"
---

# Setup: [What's Being Set Up]

## Description
[Why this setup is needed and what it enables]

## Acceptance Criteria
- [ ] [Package/tool installed]
- [ ] [Configuration file created]
- [ ] [Integration working]
- [ ] [Tests can run]
- [ ] [Development environment ready]

## Technical Requirements
- [Specific version requirements]
- [Compatibility requirements]
- [System requirements]

## Test Specifications
```yaml
verification_tests:
  - name: "Setup verification"
    command: "npm run test:setup"
    should: "Pass all checks"
  
  - name: "Configuration valid"
    file: "config.file"
    should: "Contain required settings"
```

## Code Reuse
- Check for existing `[config]` in `[paths]`
- Reuse any existing `[setup]` from `[path]`
- Follow patterns from similar setups
```

## Instruction Task Template

```markdown
---
id: "[task-id]"
name: "[instruction-name]"
type: "instruction"
dependencies: ["[task-id]"]  # Just IDs: ["001"], not full names
estimated_lines: 0
priority: "critical|high"
---

# [Instruction Title]

## Description
[What needs to be done manually and why]

## Manual Steps Required
1. [First step with detailed instructions]
   ```bash
   # Example command if applicable
   ```

2. [Second step]
   - Sub-step with details
   - Another sub-step

3. [Third step]

## Required Values
```env
# Environment variables needed
VARIABLE_NAME="description of what to put here"
SECRET_KEY="how to generate or obtain"
```

## Verification Steps
- [ ] [How to verify step 1 worked]
- [ ] [How to verify step 2 worked]
- [ ] [All services connected properly]
- [ ] [No errors in logs]

## Security Notes
- [Important security consideration]
- [Best practices reminder]
- [What not to do]

## Troubleshooting
- **Problem**: [Common issue]
  **Solution**: [How to fix]

- **Problem**: [Another issue]
  **Solution**: [How to fix]
```

## Dependency Format Rules

### CRITICAL: Dependencies Must Use Task IDs Only

Dependencies MUST contain only the numeric task ID, not the full task name:

✅ **CORRECT Examples:**
```json
"dependencies": []                    // No dependencies
"dependencies": ["001"]               // Single dependency
"dependencies": ["001", "100"]        // Multiple dependencies
"dependencies": ["200", "201", "100"] // Mixed categories
```

❌ **INCORRECT Examples:**
```json
"dependencies": ["001-init-nextjs-project"]      // WRONG: Full task name
"dependencies": ["setup-nextjs-testing-vitest"]  // WRONG: Task name only
"dependencies": ["task-001"]                     // WRONG: Prefixed ID
```

### Why This Matters
- The task execution system expects numeric IDs only
- Full task names will cause dependency resolution to fail
- This ensures tasks can be renamed without breaking dependencies

## Task Naming Conventions

### Searchable Names
Tasks MUST have descriptive names that match search patterns:
- ✅ GOOD: `user-authentication-login-form`
- ✅ GOOD: `pattern-api-error-handler`
- ✅ GOOD: `setup-nextjs-testing-vitest`
- ❌ BAD: `task-001` or `feature-a`

### Naming Pattern
- Setup: `setup-[technology]-[purpose]`
- Pattern: `pattern-[pattern-type]-[usage]`
- Feature: `feature-[domain]-[specific-feature]`
- Instruction: `configure-[what]-[purpose]`

## Required Sections by Task Type

### All Tasks Must Have:
- Description
- Code Reuse
- Test Specifications (except instruction tasks)

### Feature Tasks Must Have:
- Acceptance Criteria
- Component Specifications (if UI)
- API Specifications (if backend)
- Test Specifications (component, API, integration)

### Pattern Tasks Must Have:
- Pattern Requirements
- Implementation Example
- Usage Examples (3+)
- Test Specifications

### Setup Tasks Must Have:
- Acceptance Criteria
- Technical Requirements
- Verification Tests

### Instruction Tasks Must Have:
- Manual Steps Required
- Verification Steps
- Security Notes (if applicable)

## Handling Unclear Requirements

When creating tasks with unclear or ambiguous requirements:

### 1. Identify Ambiguities
Mark unclear aspects with questions:
- Implementation approach unclear
- Scope not well defined
- Technical requirements missing
- User experience not specified

### 2. Document Assumptions
If proceeding with assumptions, clearly state them:
```markdown
## Assumptions
- Using email for notifications (SMS not mentioned)
- Following existing authentication patterns
- Limiting bulk operations to 1000 items
- Using soft delete for data safety
```

### 3. Create Flexible Specifications
Design tasks that can accommodate different approaches:
- Use configuration options
- Create extensible interfaces
- Plan for future enhancements

### 4. Default Recommendations
When in doubt, use these sensible defaults:
- **Authentication**: Email-based, standard security
- **Bulk Operations**: 100-1000 items, with progress
- **Data Deletion**: Soft delete with 30-day retention
- **API Rate Limits**: 100 requests per minute
- **Cache Duration**: 5 minutes for lists, 1 hour for static
- **Pagination**: 20-50 items per page

## Validation Checklist

Before a task is considered complete, verify:
- [ ] JSON metadata file exists and is valid
- [ ] Markdown specification follows template
- [ ] Task name is searchable and descriptive
- [ ] Dependencies are properly listed WITH ONLY IDS (e.g., ["001"], NOT ["001-init-nextjs-project"])
- [ ] Test specifications are comprehensive
- [ ] Code reuse opportunities identified
- [ ] Estimated lines is realistic
- [ ] Priority is appropriate
- [ ] Unclear requirements documented or clarified