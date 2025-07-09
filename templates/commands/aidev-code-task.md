---
description: "Implements the selected task"
allowed-tools: ["*"]
---

# Command: aidev-code-task

**CRITICAL: This command REQUIRES a task ID argument. If no argument is provided ($ARGUMENTS is empty), immediately stop with an error message.**

## Purpose
Implements the task based on task type:
- **Pattern tasks**: Create exemplar implementations with PRP
- **Feature tasks**: Full implementation with PRP
- **Instruction tasks**: Create documentation with PRP

## Process

**CRITICAL: This command MUST generate a PRP (Plan-Research-Pseudocode) document before implementation. The PRP is mandatory for ALL task types (pattern, feature, and instruction). Skipping PRP generation will cause the command to fail.**

### 0. Pre-Flight Check

- Check if task argument was provided:
  ```bash
  if [ -z "$ARGUMENTS" ]; then
    echo "ERROR: No task ID provided. Usage: claude /aidev-code-task <task-id>"
    exit 1
  fi
  ```
- Read the task JSON file from `.aidev/tasks/$ARGUMENTS.json`
- If task not found, stop with error: "Task not found: $ARGUMENTS"
- Check task status - must be "pending" to proceed
- Read task specification from `.aidev/tasks/$ARGUMENTS.md`
- Extract log path from task JSON for saving results

### 1. Update Task Status
- Update task status to "in-progress" in JSON file
- Commit the status change

### 2. Context Loading

#### 2.1 Check Testing Availability
- Check if package.json has test scripts
- Set TESTING_AVAILABLE flag accordingly
- Load testing preferences if available

#### 2.2 Analyze Related Tasks
- Analyze pending tasks to make future-compatible decisions
- Identify shared components and APIs needed by multiple tasks
- Design with extensibility in mind for future requirements

#### 2.3 Load Project Context
- Load preferences from `.aidev/preferences/`
- Load patterns from `.aidev/patterns/established/` and `.aidev/patterns/learned/`
- Analyze existing codebase for reusable components and patterns
- Identify existing utilities and APIs to avoid duplication

### 3. Check for Feedback
- If task has "feedback" field, process it as primary context
- Address each feedback item in the implementation

### 4. Determine Task Type

- **Pattern tasks**: Create minimal exemplar implementation (50-100 lines)
- **Feature tasks**: Full production implementation following patterns
- **Instruction tasks**: Documentation only

### 5. Generate PRP (All Task Types)

For all task types (pattern, feature, and instruction):

#### 5.1 Read the PRP Template
- Read the template from `.aidev/templates/automated-prp-template.md`
- This template contains placeholder variables like `${FEATURE_OVERVIEW}`, `${TASK_NAME}`, etc.

#### 5.2 Gather Context for Template Variables
Collect information to replace each placeholder:
- `${TASK_ID}`: From the task JSON
- `${TASK_NAME}`: From the task JSON
- `${TASK_TYPE}`: Pattern/Feature/Instruction from task JSON
- `${FEATURE_OVERVIEW}`: Extract from task specification markdown
- `${EXECUTIVE_SUMMARY}`: Create a 2-3 sentence summary of what will be implemented
- `${DEPENDENCIES}`: List from task JSON or "None"
- `${PRIORITY}`: From task JSON
- `${ESTIMATED_LINES}`: Based on task type (Pattern: 50-100, Feature: 200-500, Instruction: N/A)
- `${CODEBASE_ANALYSIS}`: Results from analyzing existing code
- `${EXTERNAL_RESEARCH}`: Any research needed for the implementation
- `${ESTABLISHED_PATTERNS}`: Content from `.aidev/patterns/established/`
- `${LEARNED_PATTERNS}`: Content from `.aidev/patterns/learned/`
- `${SESSION_CONTEXT}`: Current session ID and timestamp
- `${EXAMPLE_REFERENCES}`: Relevant examples from `.aidev/examples/`
- `${PROJECT_ANALYSIS}`: Analysis of existing utilities, components, APIs
- And all other variables in the template...

#### 5.3 Generate the PRP Document
- Replace ALL placeholder variables in the template with actual content
- For conditional sections (${IF_PATTERN_MODE}, ${IF_FEATURE_MODE}, ${IF_INSTRUCTION_MODE}):
  - Include only the relevant section based on task type
  - Remove the conditional markers
- Ensure no placeholders remain in the final document

#### 5.4 Save the Generated PRP
- Create directory: `.aidev/logs/[taskid]/`
- Save the completed PRP to: `.aidev/logs/[taskid]/prp.md`
- The PRP should be a complete, actionable document with no placeholders

#### 5.5 Follow the Generated PRP
- Use the generated PRP as your implementation guide
- The PRP contains specific validation checkpoints - follow them
- Design with future tasks in mind for extensibility
- For instruction tasks, focus on documentation structure and completeness

#### Example of a Properly Generated PRP
After replacing all placeholders, the PRP should look like this (partial example):
```markdown
## 🎯 Goal

Implement a user authentication system with login, logout, and session management capabilities using NextAuth.js.

### Executive Summary
This feature will add complete user authentication to the application, including secure login/logout flows, session persistence, and protected routes. The implementation will follow established auth patterns and integrate with the existing user model.

## 📋 Task Details

- **Task ID**: auth-001
- **Task Name**: User Authentication System
- **Task Type**: Feature
- **Dependencies**: user-model-pattern
- **Priority**: High
- **Estimated Lines**: 200-500

## 📚 Research Phase

### Codebase Analysis
- [x] Analyzed existing patterns
- [x] Identified dependencies
- [x] Reviewed similar implementations
- [x] Checked for potential conflicts
...
```

**NOTE**: The generated PRP must have NO placeholder variables (no ${...} syntax) remaining.

### 6. Implementation

#### Pattern/Feature Tasks:
- Create tests alongside implementation (if testing available)
- Implement following the PRP
- Make atomic commits with AI attribution
- Include task ID and session info in commits

#### Instruction Tasks:
- **CRITICAL**: Only create the documentation file specified in the task
- **DO NOT**: Install any packages, create utility files, or modify existing code
- **DO NOT**: Create example files, test files, or any supporting files
- Create documentation file as specified
- Single commit with appropriate message
- If the instruction mentions packages or dependencies, document them but DO NOT install

### 7. Validation

#### For Pattern/Feature Tasks:
- Run tests if available: `npm test`
- Run linting: `npm run lint`
- Run type checking: `npm run type-check`
- Build project: `npm run build`
- Run E2E tests if available

#### For Instruction Tasks:
- **CRITICAL**: Verify ONLY documentation files were created
- **CRITICAL**: Ensure NO packages were installed (check git status)
- **CRITICAL**: Confirm NO code files or utilities were created
- Verify all required sections are included
- Check technical accuracy
- Validate code examples (if any)
- Ensure formatting follows project standards
- Review for clarity and completeness

### 8. Create PR Message

**CRITICAL**: Save PR message to `.aidev/logs/[taskid]/last_result.md`

#### Pattern/Feature Tasks:
```markdown
## 🤖 AI Generated Implementation

### Task
[Task ID and name]

### Summary
[What was implemented]

### Changes
- [List of key changes]
- [Components created/modified]
- [Tests added if applicable]

### Validation
- [ ] All tests pass (if testing exists)
- [ ] Linting clean
- [ ] Build successful

### Session
- Session ID: [timestamp]
- PRP: [path to PRP]
- Commits: [number]
```

#### Instruction Tasks:
```markdown
## 🤖 AI Generated Documentation

### Task
[Task ID and name]
Type: Instruction

### Summary
Created documentation as specified

### Files Added
- [Path to file]
```

### 9. Quality Review

#### For Pattern/Feature Tasks:
- Verify implementation meets all requirements
- Fix any critical issues found
- Re-run validation after fixes
- Only proceed when all checks pass

#### For Instruction Tasks:
- Ensure documentation is complete and accurate
- Verify all examples are tested and working
- Check that formatting is consistent
- Review for clarity and target audience appropriateness

### 10. Finalization

**CRITICAL**: Verify PR message was created before updating status

```bash
# Verify last_result.md exists and has content
if [ ! -f "$LAST_RESULT_PATH" ] || [ ! -s "$LAST_RESULT_PATH" ]; then
  echo "ERROR: PR message (last_result.md) was not created or is empty!"
  exit 1
fi

# Update task status to review
TASK_JSON=$(cat .aidev/tasks/$ARGUMENTS.json)
UPDATED_JSON=$(echo "$TASK_JSON" | jq '.status = "review"')
echo "$UPDATED_JSON" > .aidev/tasks/$ARGUMENTS.json

# Commit status change
git add .aidev/tasks/$ARGUMENTS.json
git commit -m "chore: mark task $ARGUMENTS as ready for review"

echo "✅ Task $ARGUMENTS completed successfully"
echo "📝 PR message saved to: $LAST_RESULT_PATH"
echo "📋 Task status updated to: review"
```

## Error Handling
- Document errors clearly
- Exit with appropriate error message
- Provide recovery instructions when possible

## Key Requirements
- **Task Isolation**: Only modify the specified task
- **Status Updates**: Update task JSON status (pending → in-progress → review)
- **PR Message**: MUST create `last_result.md` before marking as review
- **Testing**: Only create tests if testing infrastructure exists
- **Patterns**: Follow established patterns from `.aidev/patterns/`
- **Commits**: Use AI attribution in commit messages