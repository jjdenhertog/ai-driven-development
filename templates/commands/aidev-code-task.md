---
description: "Implements the selected task"
allowed-tools: ["*"]
---

# Command: aidev-code-task

**CRITICAL: This command REQUIRES a task ID argument. If no argument is provided ($ARGUMENTS is empty), immediately stop with an error message. DO NOT proceed with any example task IDs.**

## Purpose
Implements the task based on task type:
- **Pattern tasks**: Create exemplar implementations with PRP
- **Feature tasks**: Full implementation with PRP
- **Instruction tasks**: Create documentation without PRP

## Key Features
- **Future Task Awareness**: Analyzes ALL PENDING tasks to coordinate upcoming work
- **Proactive Design**: Makes implementation decisions that support future requirements
- **Conflict Prevention**: Avoids technology choices that would conflict with pending tasks
- **Task Boundary Protection**: Enforces strict boundaries to prevent accidental execution of other tasks
- **Shared Component Planning**: Creates reusable components that future tasks can leverage

## Process

### 0. Pre-Flight Safety Check

- **CRITICAL**: First check if task argument was provided:
  ```bash
  if [ -z "$ARGUMENTS" ]; then
    echo "ERROR: No task ID provided. You must specify a task ID."
    echo "Usage: claude /aidev-code-task <task-id>"
    echo "Example: claude /aidev-code-task 001-setup-nextjs-project"
    exit 1
  fi
  ```
- Read the task JSON file from `.aidev/tasks/$ARGUMENTS.json`
- **IMPORTANT**: If you cannot find the JSON file at `.aidev/tasks/$ARGUMENTS.json` you should stop with error: "Task not found: $ARGUMENTS"
- Check the task status in the JSON file:
  - If status is NOT "pending", stop with message: "Task $ARGUMENTS is not in pending status (current status: [status])"
  - If status is "pending", proceed with implementation
- Read the corresponding task specification from `.aidev/tasks/$ARGUMENTS.md`
- If task has a "feedback" field in JSON, this indicates it returned to pending status for revisions
- **Initialize logging variables**:
  ```bash
  # Extract log path from task JSON
  TASK_JSON=$(cat .aidev/tasks/$ARGUMENTS.json)
  LOG_PATH=$(echo "$TASK_JSON" | jq -r '.log_path')
  
  # If no log path exists, this task hasn't been started yet
  if [ "$LOG_PATH" = "null" ] || [ -z "$LOG_PATH" ]; then
    echo "ERROR: Task has no log_path. Task may not have been properly initialized."
    exit 1
  fi
  
  # Set up logging function
  log_to_task() {
    local message="$1"
    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")
    echo "[$timestamp] $message" >> "$LOG_PATH"
  }
  
  # Log task execution start
  log_to_task "Starting aidev-code-task execution for task $ARGUMENTS"
  ```
- **Initialize global testing availability flag**:
  ```bash
  # This will be used throughout the implementation
  export TESTING_AVAILABLE=false
  ```

### 1. Update Task Status to In-Progress
- Update the task JSON file to set status to "in-progress":
  ```bash
  # Read current task JSON
  TASK_JSON=$(cat .aidev/tasks/$ARGUMENTS.json)
  
  # Update status to in-progress
  UPDATED_JSON=$(echo "$TASK_JSON" | jq '.status = "in-progress"')
  
  # Write back to file
  echo "$UPDATED_JSON" > .aidev/tasks/$ARGUMENTS.json
  
  # Log status update
  log_to_task "Updated task status to in-progress"
  
  # Commit the status change
  git add .aidev/tasks/$ARGUMENTS.json
  git commit -m "chore: mark task $ARGUMENTS as in-progress"
  
  log_to_task "Committed status change to git"
  ```

### 2. Context Loading

#### 2.1 Testing Infrastructure Check
- **Check if testing is available**:
  ```bash
  # Check if package.json has test scripts
  if [ -f "package.json" ] && grep -q '"test"' package.json; then
    echo "Testing infrastructure detected"
    export TESTING_AVAILABLE=true
    log_to_task "Testing infrastructure detected - tests will be created"
  else
    echo "No testing infrastructure found - skipping test creation"
    export TESTING_AVAILABLE=false
    log_to_task "No testing infrastructure found - proceeding without tests"
  fi
  ```
- **If testing is available, load preferences**:
  ```bash
  if [ "$TESTING_AVAILABLE" = "true" ]; then
    # Check for testing preferences
    if [ -f ".aidev/preferences/testing.md" ]; then
      echo "Loading project testing preferences..."
      # Use testing.md preferences
    else
      echo "Using default testing configuration"
    fi
    
    # Verify specific testing tools
    - Check if test framework is installed (Vitest/Jest)
    - Check if React Testing Library is available
    - Check if E2E framework is set up (Playwright/Cypress)
    - Identify test command in package.json
  fi
  ```

#### 2.2 Pending Task Analysis (CRITICAL)
- **Load and analyze ALL PENDING tasks to coordinate future work**:
  ```bash
  # Get current task for reference
  CURRENT_TASK_ID="$ARGUMENTS"
  echo "Current task: $CURRENT_TASK_ID"
  log_to_task "Starting analysis of pending tasks for coordination"
  
  # Load ALL PENDING tasks for future coordination
  echo "=== Analyzing pending tasks to avoid future conflicts ==="
  PENDING_TASK_COUNT=0
  find .aidev/tasks -name "*.json" -type f | while read task_file; do
    TASK_ID=$(basename "$task_file" .json)
    
    # Skip the current task itself
    if [ "$TASK_ID" = "$CURRENT_TASK_ID" ]; then
      continue
    fi
    
    TASK_JSON=$(cat "$task_file")
    TASK_STATUS=$(echo "$TASK_JSON" | jq -r '.status')
    
    # Only analyze pending tasks
    if [ "$TASK_STATUS" = "pending" ]; then
      TASK_TYPE=$(echo "$TASK_JSON" | jq -r '.type')
      echo "--- Pending Task: $TASK_ID (Type: $TASK_TYPE) ---"
      log_to_task "Analyzing pending task: $TASK_ID (Type: $TASK_TYPE)"
      ((PENDING_TASK_COUNT++))
      
      # Read the task specification to understand future requirements
      if [ -f ".aidev/tasks/${TASK_ID}.md" ]; then
        echo "Reading specification to identify:"
        echo "- Technology choices that might conflict"
        echo "- Components that could be shared"
        echo "- APIs that multiple tasks will need"
        echo "- Data models that should be designed for reuse"
        # The AI will analyze the content to make smart decisions
      fi
    fi
  done
  
  log_to_task "Found $PENDING_TASK_COUNT pending tasks for coordination analysis"
  
  # Let AI determine how to coordinate with future tasks
  # AI will intelligently:
  # - Make technology choices that won't conflict with future tasks
  # - Create reusable components that pending tasks can use
  # - Design APIs with future requirements in mind
  # - Build extensible data models
  
  # IMPORTANT: This is READ-ONLY analysis - do NOT modify other tasks
  # Purpose: Proactive coordination with future work
  ```

- **AI-driven future task coordination**:
  - **Proactive design decisions**:
    - Choose technologies that align with future task requirements
    - Create components that pending tasks explicitly need
    - Design APIs to handle upcoming feature requirements
    - Build data models that support future functionality
  - **Conflict prevention**:
    - Avoid technology choices that conflict with pending tasks
    - Don't hardcode solutions that future tasks need to change
    - Leave extension points for planned features
  - **Shared component opportunities**:
    - Identify UI components multiple pending tasks will need
    - Create reusable utilities for common functionality
    - Design flexible base components for future customization
  - **Example scenarios**:
    - Current task: "Setup authentication"
    - Pending task: "Add social login"
    - Decision: Design auth system to easily add providers later

#### 2.3 Project Context
- **Check .aidev/examples/** for coding style and patterns
- **Load all user preferences from .aidev/preferences/**:
  ```bash
  # Find and load all .md preference files dynamically
  find .aidev/preferences -name "*.md" -type f | while read pref_file; do
    echo "Loading preference: $(basename "$pref_file")"
    # Process each preference file to understand patterns and conventions
  done
  ```
  - Each .md file contains specific preferences and patterns
  - Files may cover styling, technology stack, components, APIs, state management, etc.
  - New preference files can be added at any time and will be automatically loaded
  - All preferences should be considered when implementing features
- Load established patterns from `.aidev/patterns/established/`
- Load learned patterns from `.aidev/patterns/learned/`
- **Deep analysis of existing codebase**:
  ```bash
  # Find all utility functions to avoid duplication
  rg "export (function|const)" --type ts --type tsx | grep -E "(util|helper|lib)" > .aidev/temp/existing-utils.txt
  
  # Find all API routes
  find app/api -name "route.ts" -o -name "route.tsx" > .aidev/temp/api-routes.txt
  
  # Find all components
  find . -name "*.tsx" -path "*/components/*" > .aidev/temp/components.txt
  
  # Analyze imports to understand dependencies
  rg "^import" --type ts --type tsx | sort | uniq > .aidev/temp/import-patterns.txt
  ```
- Identify reusable components and utilities
- Map existing API endpoints that could be reused
- Check for established patterns in the current codebase

### 3. Process Feedback (if applicable)
- If task JSON contains a "feedback" field:
  ```bash
  # Check for feedback in task JSON
  FEEDBACK=$(echo "$TASK_JSON" | jq -r '.feedback // empty')
  if [ -n "$FEEDBACK" ]; then
    log_to_task "Processing feedback from previous attempt"
    log_to_task "Feedback: $FEEDBACK"
  fi
  ```
  - Read and understand all feedback points
  - Include feedback as primary context for implementation
  - Address each feedback item explicitly in your approach
  - Document in commit messages which feedback was addressed

### 3.1 Task Boundary Enforcement (CRITICAL SAFETY CHECK)
**IMPORTANT: You must NEVER execute or modify tasks other than $ARGUMENTS**

- **Enforcement Rules**:
  ```bash
  # Define current task boundary
  CURRENT_TASK_ID="$ARGUMENTS"
  echo "ENFORCEMENT: This session is ONLY authorized to work on task: $CURRENT_TASK_ID"
  
  # Create boundary check function
  check_task_boundary() {
    local action="$1"
    local target="$2"
    
    if [[ "$target" != "$CURRENT_TASK_ID" ]]; then
      echo "ERROR: Attempted to $action task $target. Only task $CURRENT_TASK_ID is authorized."
      echo "This is a boundary violation. Stopping execution."
      exit 1
    fi
  }
  ```

- **What you CAN do with other tasks**:
  - ✅ READ their JSON files to understand dependencies
  - ✅ READ their .md specifications for context
  - ✅ ANALYZE their technology choices
  - ✅ LEARN from their patterns and decisions

- **What you CANNOT do with other tasks**:
  - ❌ MODIFY their status
  - ❌ EXECUTE their implementation
  - ❌ CREATE files for them
  - ❌ UPDATE their JSON files
  - ❌ COMMIT changes on their behalf

- **Example Boundary Check**:
  ```bash
  # Before any task status update
  check_task_boundary "update status of" "$task_id"
  
  # Before any implementation
  check_task_boundary "implement" "$task_id"
  ```

### 4. Behavior Mode Detection

```bash
# Detect task type from JSON
TASK_TYPE=$(echo "$TASK_JSON" | jq -r '.type')
log_to_task "Task type detected: $TASK_TYPE"
```

#### Pattern Establishment Mode (type: "pattern")
When the task is a pattern file (000-pattern-*.md):
- Create minimal, exemplar implementation
- Focus on establishing conventions
- Keep it simple but complete
- Include comments explaining choices
- Aim for 50-100 lines

#### Feature Implementation Mode (type: "feature")
When implementing a full feature:
- Follow all established patterns religiously
- Implement complete functionality
- Include proper error handling
- Add comprehensive types
- Write production-ready code

#### Documentation/Instruction Mode (type: "instruction")
When the task is an instruction file:
- Create the documentation/instruction file only
- No code implementation needed
- Focus on clear, actionable documentation
- Include all specified content from the task
- Single commit for the documentation

### 5. Test Planning & PRP Generation
**Skip for instruction tasks** - proceed directly to implementation.

#### 5.1 Test-First Planning (Conditional)
For pattern and feature tasks, plan the testing approach **only if testing infrastructure exists**:
```bash
if [ "$TESTING_AVAILABLE" = "true" ]; then
  echo "Planning test implementation..."
  # - Identify testable behaviors from the task specification
  # - Plan test structure:
  #   - E2E tests for user flows (if UI involved)
  #   - Component tests for React components
  #   - Unit tests for business logic
  #   - API tests for endpoints
  # - Create test checklist to implement alongside feature
else
  echo "Skipping test planning - no testing infrastructure"
fi
```

#### 5.2 PRP Generation
```bash
log_to_task "Starting PRP generation using automated template"
```

Generate a PRP using `./.aidev/templates/automated-prp-template.md` with the following context:
- Feature specification from the selected task
- Learned patterns from `.aidev/patterns/learned/`
- Established patterns from `.aidev/patterns/established/`
- Previous corrections to avoid
- Session context from recent sessions
- **Future task context (CRITICAL)**:
  - Requirements from ALL pending tasks
  - Technology preferences specified in future tasks
  - Components that multiple pending tasks will need
  - API endpoints required by upcoming features
  - Data models that need to support future functionality
  - UI patterns that pending tasks expect
  - Authentication/authorization needs of future features
  - Integration points with planned functionality
  - Potential conflicts to avoid
  - Extension points to build in
  - Reusable abstractions to create
- **Existing codebase analysis**: 
  - Available utilities and helpers to reuse
  - Existing components that can be extended
  - API endpoints already implemented
  - Current patterns and conventions in use

The template includes placeholders for:
- ${FEATURE_OVERVIEW}, ${TASK_ID}, ${TASK_NAME}, etc.
- ${ESTABLISHED_PATTERNS}, ${LEARNED_PATTERNS}
- ${SESSION_CONTEXT}, ${EXAMPLE_REFERENCES}
- ${PENDING_TASKS_ANALYSIS} - Analysis of all pending task requirements
- ${FUTURE_REQUIREMENTS} - Features and components needed by pending tasks
- ${COORDINATION_DECISIONS} - Technology choices to support future work
- ${EXTENSION_POINTS} - Areas designed for future enhancement
- ${TEST_STRATEGY} - Testing approach and test files to create (if testing available)
- ${TEST_CHECKLIST} - Specific tests to implement with the feature (if testing available)
- Implementation mode detection (pattern vs feature)

Save the generated PRP to:
```
.aidev/logs/[taskid]/prp.md
```

Log PRP generation:
```bash
# Extract directory from log path
LOG_DIR=$(dirname "$LOG_PATH")
PRP_PATH="$LOG_DIR/prp.md"

# Write PRP to file
echo "$GENERATED_PRP" > "$PRP_PATH"

log_to_task "Generated PRP saved to: $PRP_PATH"
```

### 5.1 Future Task Coordination & Conflict Prevention
**CRITICAL: Design current implementation to support future requirements**

Before generating the PRP, analyze pending tasks to make forward-compatible decisions:

**Proactive Design Analysis**:
- Identify technology requirements in pending tasks
- Find components needed by multiple future tasks
- Detect API patterns that support upcoming features
- Design extensible data models for future needs

**Example Coordination Decisions**:
```markdown
## Future Task Coordination Plan

### Authentication System Design
- Current task: "Setup basic authentication"
- Pending task: "Add OAuth providers" (task 008)
- Pending task: "Add two-factor authentication" (task 012)
- **Decision**: Use NextAuth.js with modular provider system

### Component Architecture
- Current task: "Create user profile page"
- Pending task: "Add user dashboard" (needs UserAvatar)
- Pending task: "Create team members list" (needs UserAvatar)
- **Decision**: Create reusable UserAvatar in components/shared/

### API Design
- Current task: "Setup user management API"
- Pending task: "Add role-based permissions" (task 009)
- Pending task: "Add team management" (task 011)
- **Decision**: Design user model with roles field from start

### State Management
- Current task: "Install dependencies"
- Pending task: "Add real-time notifications" (needs global state)
- Pending task: "Add shopping cart" (needs persistent state)
- **Decision**: Choose Zustand for flexibility with middleware support
```

**Future-Proofing Priority**:
1. Analyze ALL pending tasks for requirements
2. Choose technologies that support future needs
3. Create abstractions that enable extensions
4. Avoid hardcoding limitations
5. Document extension points for future tasks

**Document all reconciliations in the PRP** for transparency and future reference.

### 6. Implementation with Test-Driven Development

#### For Pattern/Feature Tasks
Execute the PRP following TDD practices:

##### 6.1 Test Implementation (Red Phase) - Conditional
**Only execute if testing infrastructure is available:**
```bash
if [ "$TESTING_AVAILABLE" = "true" ]; then
  echo "Creating test files alongside implementation..."
  # - Create test files alongside feature files:
  #   - Component.test.tsx next to Component.tsx
  #   - route.test.ts next to route.ts
  #   - feature.spec.ts in e2e/ for user flows
  # - Write failing tests first (optional but recommended):
  #   - Define expected behavior
  #   - Run tests to see them fail
  #   - This ensures tests actually test something
else
  echo "Skipping test creation - no testing infrastructure"
  echo "Note: Task is being implemented without tests"
fi
```

##### 6.2 Feature Implementation (Green Phase)
- Implement the minimum code to make tests pass
- Focus on functionality over perfection
- Make atomic commits at logical boundaries
- Log implementation progress:
  ```bash
  log_to_task "Starting feature implementation phase"
  # Log each major component as it's implemented
  log_to_task "Implementing [component/feature name]"
  ```
- Each commit should have meaningful AI attribution using --author flag:
  
  For new implementation:
  ```bash
  git commit --author="Claude AI <claude@anthropic.com>" -m "feat(auth): implement user registration flow

  🤖 AI Generated
  Task: 001-user-authentication
  Session: 2025-01-07-001
  PRP: .aidev/logs/001/prp.md

  Co-Authored-By: Claude <noreply@anthropic.com>"
  ```
  
  For addressing review feedback:
  ```bash
  git commit --author="Claude AI <claude@anthropic.com>" -m "fix(auth): address review feedback - [specific change]

  🤖 AI Generated
  Task: 001-user-authentication
  Session: 2025-01-07-002
  Addressing: Review feedback from [date]

  Co-Authored-By: Claude <noreply@anthropic.com>"
  ```
- Run validation after each major component
- Document decisions in session log

#### For Instruction Tasks
- Read the task specification content
- Create the documentation file at the specified location
- Make a single commit:
  ```bash
  git commit --author="Claude AI <claude@anthropic.com>" -m "docs: add [instruction-name] documentation

  🤖 AI Generated
  Task: [task-id]-[task-name]
  Type: instruction
  Session: [timestamp]

  Co-Authored-By: Claude <noreply@anthropic.com>"
  ```
- No validation or testing needed

### 7. Automated Validation & Testing
All validation must be automated - no manual checklists.

#### For Pattern/Feature Tasks

##### 7.1 Automated Test Execution (Conditional)
```bash
# Only run tests if testing infrastructure exists
if [ "$TESTING_AVAILABLE" = "true" ]; then
  echo "Running automated tests..."
  
  # Run unit/component tests
  npm test
  # or if using test:watch during development
  # npm run test:watch
  
  # Check test coverage if available
  if grep -q '"test:coverage"' package.json; then
    npm run test:coverage
    # Ensure new code has 80%+ coverage
  fi
  
  # Run E2E tests for UI features if available
  if grep -q '"test:e2e"' package.json; then
    npm run test:e2e
  fi
else
  echo "Skipping test execution - no testing infrastructure"
  echo "WARNING: Code implemented without automated tests"
fi
```

##### 7.2 Code Quality Checks
```bash
log_to_task "Starting code quality checks"

# Run linting
log_to_task "Running linter"
npm run lint
if [ $? -eq 0 ]; then
  log_to_task "Linting passed successfully"
else
  log_to_task "Linting failed - fixing issues"
fi

# Run type checking
log_to_task "Running type checker"
npm run type-check
if [ $? -eq 0 ]; then
  log_to_task "Type checking passed successfully"
else
  log_to_task "Type checking failed - fixing issues"
fi

# Build the project
log_to_task "Building project"
npm run build
if [ $? -eq 0 ]; then
  log_to_task "Build completed successfully"
else
  log_to_task "Build failed - investigating issues"
fi
```

##### 7.3 Automated Browser Testing
**All browser testing should be automated through E2E tests**

```bash
# E2E tests cover all browser-based scenarios:
# - Component rendering
# - User interactions
# - Form validations
# - Error states
# - Navigation flows
npm run test:e2e

# For debugging E2E tests:
npm run test:e2e:ui  # Opens Playwright UI
npm run test:e2e:debug  # Step through tests

# The E2E tests should verify:
# - Pages load without errors
# - Interactive elements work
# - Forms validate correctly
# - Error messages display
# - API integrations function
```

**No manual browser testing required** - E2E tests handle all browser verification automatically.

##### 7.4 Test Results Verification (Conditional)
```bash
# Only verify tests if testing infrastructure exists
if [ "$TESTING_AVAILABLE" = "true" ]; then
  # Ensure all tests pass before proceeding
  if npm test; then
    echo "✅ All tests passing"
    
    # Run E2E tests if available
    if grep -q '"test:e2e"' package.json && npm run test:e2e; then
      echo "✅ E2E tests passing"
    fi
  else
    echo "❌ Tests failing - fix before continuing"
    exit 1
  fi
  
  # Verify test coverage if command exists
  if grep -q '"test:coverage"' package.json; then
    if npm run test:coverage | grep -q "All files.*[8-9][0-9]\.[0-9]\|100"; then
      echo "✅ Coverage meets 80% threshold"
    else
      echo "⚠️ Coverage below 80% - add more tests"
    fi
  fi
else
  echo "⚠️ No test verification - testing infrastructure not available"
  echo "Note: Feature implemented without test coverage"
fi
```

### 8. Response Creation

**CRITICAL**: Create and save the PR message before proceeding to finalization.

```bash
# Extract directory from log path
LOG_DIR=$(dirname "$LOG_PATH")
LAST_RESULT_PATH="$LOG_DIR/last_result.md"

log_to_task "Creating PR message at: $LAST_RESULT_PATH"
```

#### For Pattern/Feature Tasks
```bash
# Create the PR message content
PR_MESSAGE="$(cat <<'EOF'
## 🤖 AI Generated Implementation

### Task
[Task ID and name]

### Summary
[What was implemented]

### Changes
- [List of key changes]
- [Components created/modified]
- [Tests added]

### Patterns Followed
- [List patterns from established/learned]

### Testing
- [ ] All tests pass (if testing infrastructure exists)
- [ ] Linting clean
- [ ] Build successful
- [ ] Note: If no testing infrastructure, tests were skipped

### Session
- Session ID: [timestamp]
- PRP: [path to PRP]
- Commits: [number of commits]

---
Generated by Claude AI
Review corrections will be captured for learning
EOF
)"

# Save to last_result.md
echo "$PR_MESSAGE" > "$LAST_RESULT_PATH"
log_to_task "PR message saved to: $LAST_RESULT_PATH"
```

#### For Instruction Tasks
```bash
# Create the PR message content
PR_MESSAGE="$(cat <<'EOF'
## 🤖 AI Generated Documentation

### Task
[Task ID and name]
Type: Instruction

### Summary
Created documentation/instruction file as specified in the task.

### Files Added
- [Path to documentation file]

### Session
- Session ID: [timestamp]
- Task Type: instruction

---
Generated by Claude AI
EOF
)"

# Save to last_result.md
echo "$PR_MESSAGE" > "$LAST_RESULT_PATH"
log_to_task "PR message saved to: $LAST_RESULT_PATH"
```

### 9. Code Quality Feedback Loop
**For Pattern/Feature Tasks Only** - Perform a fresh perspective analysis:

```bash
log_to_task "Starting code quality feedback loop analysis"
```

1. **Step back and analyze the generated code**:
   - Does the implementation actually fulfill what was briefed in the task?
   - Are all requirements from the task specification met?
   - Is the code following the established patterns correctly?

2. **Quality Checklist**:
   - [ ] All task requirements implemented
   - [ ] Code follows project patterns and conventions
   - [ ] Error handling is comprehensive
   - [ ] Types are properly defined
   - [ ] No security vulnerabilities introduced
   - [ ] Performance considerations addressed
   - [ ] Code is maintainable and readable
   - [ ] Browser testing confirms UI works as expected
   - [ ] No console errors or warnings in browser
   - [ ] User interactions function correctly

3. **Document findings in session log**:
   ```markdown
   ### Fresh Perspective Analysis
   #### Alignment with Brief
   - [List how each requirement was addressed]
   - [Note any deviations from the original brief]
   
   #### Quality Assessment
   - Code clarity: [rating and notes]
   - Pattern adherence: [rating and notes]
   - Completeness: [rating and notes]
   
   #### Potential Improvements
   - [List any identified improvements]
   ```

4. **Feedback Resolution Loop**:
   ```bash
   ITERATION_COUNT=0
   while [ $CRITICAL_ISSUES_FOUND -eq 1 ]; do
     ((ITERATION_COUNT++))
     log_to_task "Quality feedback iteration $ITERATION_COUNT - addressing issues"
     
     # Make corrections
     # - Fix identified issues
     # - Commit with message: "fix: address quality feedback - [specific issue]"
     log_to_task "Fixed: [specific issue description]"
     # - Push changes: git push
     
     # Re-validate
     log_to_task "Re-validating after fixes"
     # - Run all tests again
     # - Run linting again
     # - Run type checking again
     # - Run dev server and re-test in browser
     # - Check for new console errors
     # - Verify fixes work in browser
     # - Perform fresh analysis
     
     # Document iteration
     # - Update session log with changes made
     # - Note if new issues were found
     
     # Check if resolved
     # - If all issues resolved: CRITICAL_ISSUES_FOUND=0
     # - If new issues found: CRITICAL_ISSUES_FOUND=1
   done
   
   log_to_task "Quality feedback loop completed after $ITERATION_COUNT iterations"
   ```

5. **Session log should track iterations**:
   ```markdown
   ### Quality Feedback Iterations
   #### Iteration 1
   - Issue: Missing error handling in API routes
   - Fix: Added try-catch blocks and proper error responses
   - Result: Tests now pass, but found type issue
   
   #### Iteration 2
   - Issue: TypeScript error in response types
   - Fix: Updated response interface
   - Result: All checks pass ✓
   ```

6. **Only proceed to PR creation when**:
   - All critical issues are resolved
   - All tests pass
   - No linting errors
   - No type errors
   - Implementation matches task requirements
   - Dev server runs without errors
   - UI components render correctly in browser
   - No console errors or warnings
   - User interactions work as expected

### 10. Finalization

**CRITICAL**: Before completing the task, verify that the PR message was created:

```bash
# Verify last_result.md exists
if [ ! -f "$LAST_RESULT_PATH" ]; then
  echo "ERROR: PR message (last_result.md) was not created!"
  log_to_task "ERROR: Failed to create PR message at $LAST_RESULT_PATH"
  exit 1
fi

# Verify the file has content
if [ ! -s "$LAST_RESULT_PATH" ]; then
  echo "ERROR: PR message (last_result.md) is empty!"
  log_to_task "ERROR: PR message file is empty at $LAST_RESULT_PATH"
  exit 1
fi

log_to_task "PR message successfully created and verified"

# Update task status to review
log_to_task "Updating task status to review"
TASK_JSON=$(cat .aidev/tasks/$ARGUMENTS.json)
UPDATED_JSON=$(echo "$TASK_JSON" | jq '.status = "review"')
echo "$UPDATED_JSON" > .aidev/tasks/$ARGUMENTS.json

# Commit the status change
git add .aidev/tasks/$ARGUMENTS.json
git commit -m "chore: mark task $ARGUMENTS as ready for review"

log_to_task "Updated task status to review and committed change"
log_to_task "Task execution completed successfully"

# Display success message
echo "✅ Task $ARGUMENTS completed successfully"
echo "📝 PR message saved to: $LAST_RESULT_PATH"
echo "📋 Task status updated to: review"
```

## Error Handling
If any step fails:
1. Document the error in session log
   ```bash
   # Example error handling
   if [ $? -ne 0 ]; then
     ERROR_MSG="Failed at step: [describe step]"
     log_to_task "ERROR: $ERROR_MSG"
     echo "ERROR: $ERROR_MSG"
     exit 1
   fi
   ```
2. Report clear error message with recovery instructions
3. Always log errors before exiting

## Important Notes
- Always follow established patterns exactly
- Make frequent, small commits
- Document why decisions were made
- Include comprehensive error handling
- Ensure all validation passes
- **CRITICAL for testing**: Write tests ONLY if testing infrastructure exists
- **Testing is conditional**: Check package.json for test scripts first
- If no testing available, implement without tests (note this in PR)
- When testing IS available:
  - Write tests alongside (or before) implementation
  - All testing must be automated - no manual browser checklists
  - Tests are part of the feature - not an afterthought
  - Aim for 80%+ test coverage on new code
  - E2E tests replace manual browser testing
- **CRITICAL RULE**: Tasks remain in `.aidev/tasks/` folder - only status changes
- Always analyze existing code to avoid duplication
- Task JSON file must be updated with status changes
- Include feedback processing when task returns to pending with feedback
- **CRITICAL for logging**:
  - Log all major steps throughout execution using `log_to_task` function
  - Log path comes from task JSON's `log_path` field
  - PR message MUST be saved to `last_result.md` in same directory as logs
  - Verify `last_result.md` exists before completing task

## Testing Philosophy Summary
- **Prerequisite Check**: Testing only happens if infrastructure exists
- **Conditional TDD**: Write tests with features IF testing is set up
- **Graceful Degradation**: Continue without tests if no test runner found
- **When Testing Available**:
  - TDD Approach: Write tests with features (Red-Green-Refactor)
  - Automation First: All validation through automated tests
  - Coverage Target: 80%+ for new code
  - Test Types: Unit, Component, Integration, E2E
  - No Manual Testing: E2E tests handle browser scenarios