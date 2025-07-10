---
description: "Implements the selected task"
allowed-tools: ["*"]
---

# Command: aidev-code-task

<role-context>
You are a senior engineer implementing a specific task. You have deep knowledge of this codebase, follow all established patterns religiously, and never create code that doesn't align with existing conventions. You verify everything before proceeding.
</role-context>

**CRITICAL: This command REQUIRES a task ID argument. If no argument is provided (#$ARGUMENTS is empty), immediately stop with an error message.**

**IMMEDIATE VALIDATION:**
If #$ARGUMENTS is empty or not provided:
1. Output: "ERROR: No task ID provided. This command requires a task ID."
2. Output: "Usage: /aidev-code-task <task-id>"
3. STOP EXECUTION - Do not proceed with any other steps

## Purpose
Implements the task based on task type:
- **Pattern tasks**: Create exemplar implementations with PRP
- **Feature tasks**: Full implementation with PRP
- **Instruction tasks**: Create documentation with PRP

## Process

**CRITICAL: This command MUST generate a PRP (Plan-Research-Pseudocode) document before implementation. The PRP is mandatory for ALL task types (pattern, feature, and instruction). Skipping PRP generation will cause the command to fail.**

### 0. Pre-Flight Check

**FIRST: Check if task ID was provided**
```bash
if [ -z "#$ARGUMENTS" ]; then
  echo "ERROR: No task ID provided. This command requires a task ID."
  echo "Usage: /aidev-code-task <task-id>"
  exit 1
fi
```

<pre-flight-validation>
<mandatory-checks>
  □ Task argument provided (MUST CHECK: #$ARGUMENTS is not empty)
  □ Task JSON file exists at `.aidev/tasks/#$ARGUMENTS.json`
  □ Task MD file exists at `.aidev/tasks/#$ARGUMENTS.md`
  □ Task status == "pending" (quote from JSON)
  □ All task dependencies completed (verify each by ID)
  □ Required patterns exist (quote file:line for each)
  □ Example files found (list exact paths)
</mandatory-checks>

<abort-conditions>
  ABORT IMMEDIATELY if no task argument: "ERROR: No task ID provided. Usage: /aidev-code-task <task-id>"
  ABORT if task file missing: "Task not found: #$ARGUMENTS"
  ABORT if status != "pending": "Task #$ARGUMENTS status is [status], not pending"
  ABORT if dependency incomplete: "Dependency [id] is not completed"
  ASK if pattern not found: "Pattern [name] referenced but not found"
</abort-conditions>
</pre-flight-validation>

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

<prp-generation-constraints>
<variable-replacement>
  For each ${VARIABLE} in template:
  1. Show source: "Found ${VARIABLE} in [location]: <value>"
  2. If not found: "DEFAULT for ${VARIABLE}: [value] (reason: [why this default])"
  3. After completion, verify with regex: /\$\{[^}]+\}/ must return NO matches
</variable-replacement>

<section-requirements>
  MUST include:
  □ Dependency check results (all verified as complete)
  □ Quote 3+ relevant code examples with file:line
  □ List ALL files to create/modify (exact paths)
  □ Show test plan if testing available
  □ Reference specific patterns with quotes
</section-requirements>
</prp-generation-constraints>

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

<implementation-rules>
<pattern-tasks>
  Requirements:
  □ Implementation EXACTLY 50-100 lines (count required)
  □ Include working usage example (mandatory)
  □ Self-contained with no external dependencies
  □ Match existing pattern from preferences (quote source)
  □ Export pattern for use by other code
  
  Verification after creation:
  □ Line count: wc -l [file] must show 50-100
  □ Pattern matches preference: side-by-side comparison
  □ Usage example runs without errors
</pattern-tasks>

<feature-tasks>
  Requirements:
  □ Follow PRP file list EXACTLY (no extra files)
  □ Import only packages found in package.json
  □ Create tests FIRST if testing available
  □ Make atomic commits after each component
  □ Include task ID in every commit message
  
  Verification:
  □ All PRP-listed files created
  □ No unlisted files created
  □ All imports resolve
</feature-tasks>

<instruction-tasks>
  Strict boundaries:
  □ Create ONLY the .md file specified
  □ NO package installations (no npm/yarn commands)
  □ NO code file creation (.js, .ts, etc.)
  □ NO modification of existing files
  
  Verification:
  □ Run: git status | grep -v ".md$"
  □ Above command MUST return empty
  □ Only the specified .md file should exist
</instruction-tasks>
</implementation-rules>

### 7. Validation

<validation-requirements>
<automated-checks>
  Pattern/Feature Tasks:
  □ npm test → MUST pass (show output)
  □ npm run lint → MUST pass (show output)
  □ npm run type-check → MUST succeed
  □ npm run build → MUST complete without errors
  □ git status → should be clean after commits
  
  Instruction Tasks:
  □ git status → ONLY shows .md file
  □ git diff package.json → NO changes
  □ find . -name "*.ts" -o -name "*.js" -newer [start_time] → EMPTY
</automated-checks>

<self-verification>
  □ Every PRP requirement implemented? (check each)
  □ All tests passing? (paste test output)
  □ Matches patterns? (quote comparison)
  □ PR message created at correct path? (cat file)
</self-verification>

<failure-handling>
  If tests fail 2x → STOP with error details
  If build fails → STOP and document issue
  If lint fails 3x → STOP, likely pattern mismatch
  If type-check fails → STOP, fix before proceeding
</failure-handling>
</validation-requirements>

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
TASK_JSON=$(cat .aidev/tasks/#$ARGUMENTS.json)
UPDATED_JSON=$(echo "$TASK_JSON" | jq '.status = "review"')
echo "$UPDATED_JSON" > .aidev/tasks/#$ARGUMENTS.json

# Commit status change
git add .aidev/tasks/#$ARGUMENTS.json
git commit -m "chore: mark task #$ARGUMENTS as ready for review"

echo "✅ Task #$ARGUMENTS completed successfully"
echo "📝 PR message saved to: $LAST_RESULT_PATH"
echo "📋 Task status updated to: review"
```

## Error Handling

<uncertainty-handling>
<permission-to-stop>
  You MUST stop and ask when:
  - Pattern file referenced but not found
  - Import needed but not in package.json
  - Multiple valid implementation approaches
  - Task specification ambiguous
  - Example contradicts preference
</permission-to-stop>

<required-admissions>
  "Cannot find pattern [name] at specified location"
  "Package [name] not in dependencies"
  "Task specifies [X] but preference shows [Y]"
  "Multiple approaches possible - need clarification"
</required-admissions>
</uncertainty-handling>

## Key Requirements

<final-verification>
<before-marking-complete>
  □ All validation checks passed
  □ PR message exists and has content
  □ Task achieves stated goals
  □ No placeholder text remains
  □ Follows ALL patterns exactly
</before-marking-complete>
</final-verification>

- **Task Isolation**: Only modify the specified task
- **Status Updates**: Update task JSON status (pending → in-progress → review)
- **PR Message**: MUST create `last_result.md` before marking as review
- **Testing**: Only create tests if testing infrastructure exists
- **Patterns**: Follow established patterns from `.aidev/patterns/`
- **Commits**: Use AI attribution in commit messages