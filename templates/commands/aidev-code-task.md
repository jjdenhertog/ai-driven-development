---
description: "Implements the selected task without any git operations"
allowed-tools: ["Read", "Write", "Edit", "MultiEdit", "Bash", "Grep", "Glob", "LS", "Task", "TodoWrite", "WebFetch", "WebSearch", "NotebookRead", "NotebookEdit"]
disallowed-tools: ["git"]
---

# Command: aidev-code-task

<role-context>
You are a senior engineer implementing a specific task. You have deep knowledge of this codebase, follow all established patterns religiously, and never create code that doesn't align with existing conventions. You verify everything before proceeding.

**CRITICAL: You are STRICTLY FORBIDDEN from using ANY git commands or performing ANY version control operations. This includes but is not limited to:**
- git status
- git diff
- git add
- git commit
- git log
- git push/pull
- Any other git subcommands
- Any tools or commands that interact with git

**If asked to perform git operations, you MUST refuse and explain that this command is configured to prohibit git usage.**
</role-context>

**CRITICAL: This command REQUIRES a task filename argument (format: taskId-taskName). If no argument is provided (#$ARGUMENTS is empty), immediately stop with an error message.**

**IMMEDIATE VALIDATION:**
If #$ARGUMENTS is empty or not provided:
1. Output: "No task filename provided. This command requires a task filename."
2. Output: "Usage: /aidev-code-task <taskId-taskName>"
3. STOP EXECUTION - Do not proceed with any other steps

## Purpose
Implements the task based on task type:
- **Pattern tasks**: Create exemplar implementations with PRP
- **Feature tasks**: Full implementation with PRP
- **Instruction tasks**: Create documentation with PRP

## Process

**CRITICAL: This command MUST generate a PRP (Plan-Research-Pseudocode) document before implementation. The PRP is mandatory for ALL task types (pattern, feature, and instruction). Skipping PRP generation will cause the command to fail.**

### 0. Pre-Flight Check

**FIRST: Check for .aidev-storage directory**
```bash
# Verify .aidev-storage directory exists
if [ ! -d ".aidev-storage" ]; then
    echo "ERROR: Cannot find .aidev-storage directory"
    exit 1
fi

echo "✅ Found .aidev-storage directory"
```

**SECOND: Check if task filename was provided**
```bash
if [ -z "#$ARGUMENTS" ]; then
  echo "No task filename provided. This command requires a task filename."
  echo "Usage: /aidev-code-task <taskId-taskName>"
  exit 1
fi
```

**THIRD: Check if task files exist and can be loaded**
```bash
# Check if task JSON exists
if [ ! -f ".aidev-storage/tasks/#$ARGUMENTS.json" ]; then
  echo "Task not found: #$ARGUMENTS"
  echo "Task file does not exist at: .aidev-storage/tasks/#$ARGUMENTS.json"
  exit 1
fi

# Check if task MD exists
if [ ! -f ".aidev-storage/tasks/#$ARGUMENTS.md" ]; then
  echo "Task specification not found: #$ARGUMENTS"
  echo "Task specification file does not exist at: .aidev-storage/tasks/#$ARGUMENTS.md"
  exit 1
fi

# Try to load and parse the task JSON
TASK_JSON=$(cat .aidev-storage/tasks/#$ARGUMENTS.json 2>/dev/null)
if [ $? -ne 0 ]; then
  echo "Failed to read task file: #$ARGUMENTS"
  exit 1
fi

# Verify JSON is valid
echo "$TASK_JSON" | jq . >/dev/null 2>&1
if [ $? -ne 0 ]; then
  echo "Task file contains invalid JSON: #$ARGUMENTS"
  exit 1
fi

# Extract task ID from the JSON
TASK_ID=$(echo "$TASK_JSON" | jq -r '.id')
if [ -z "$TASK_ID" ] || [ "$TASK_ID" = "null" ]; then
  echo "Task JSON does not contain a valid 'id' field"
  exit 1
fi

echo "✅ Task #$ARGUMENTS found and loaded successfully"
echo "📋 Task ID: $TASK_ID"
```

<pre-flight-validation>
<mandatory-checks>
  □ Task argument provided (MUST CHECK: #$ARGUMENTS is not empty)
  □ Task JSON file exists at `.aidev-storage/tasks/#$ARGUMENTS.json`
  □ Task JSON is valid and can be parsed
  □ Task MD file exists at `.aidev-storage/tasks/#$ARGUMENTS.md`
  □ Required patterns exist (quote file:line for each)
  □ Example files found (list exact paths)
</mandatory-checks>

<abort-conditions>
  ABORT IMMEDIATELY if no task argument: "No task filename provided. Usage: /aidev-code-task <taskId-taskName>"
  ABORT if task JSON missing: "Task not found: #$ARGUMENTS"
  ABORT if task MD missing: "Task specification not found: #$ARGUMENTS"
  ABORT if JSON cannot be read: "Failed to read task file: #$ARGUMENTS"
  ABORT if JSON is invalid: "Task file contains invalid JSON: #$ARGUMENTS"
  ABORT if dependency incomplete: "Dependency [id] is not completed"
  ABORT if PRP not created: "FATAL: PRP document was not generated - cannot proceed"
  ABORT if PRP is empty: "FATAL: PRP document exists but is empty"
  ABORT if PRP has placeholders: "FATAL: PRP contains unresolved ${...} placeholders"
  ASK if pattern not found: "Pattern [name] referenced but not found"
</abort-conditions>
</pre-flight-validation>

### 1. Context Loading

#### 1.1 Check Testing Availability
- Check if package.json has test scripts
- Set TESTING_AVAILABLE flag accordingly
- Load testing preferences if available

#### 1.2 Analyze Related Tasks
- Analyze pending tasks to make future-compatible decisions
- Identify shared components and APIs needed by multiple tasks
- Design with extensibility in mind for future requirements

#### 1.3 Load Project Context
- Load preferences from `.aidev-storage/preferences/`
- Load patterns from `.aidev-storage/patterns/established/` and `.aidev-storage/patterns/learned/`
- Analyze existing codebase for reusable components and patterns
- Identify existing utilities and APIs to avoid duplication

### 2. Check for Feedback
- If task has "feedback" field, process it as primary context
- Address each feedback item in the implementation

### 3. Determine Task Type

- **Pattern tasks**: Create minimal exemplar implementation (50-100 lines)
- **Feature tasks**: Full production implementation following patterns
- **Instruction tasks**: Documentation only

### 4. Generate PRP (All Task Types)

**🛑 CRITICAL: PRP GENERATION IS MANDATORY - THE COMMAND WILL ABORT IF PRP IS NOT CREATED**

For all task types (pattern, feature, and instruction):

#### 4.1 Read the PRP Template
- Read the template from `.aidev-storage/templates/automated-prp-template.md`
- This template contains placeholder variables like `${FEATURE_OVERVIEW}`, `${TASK_NAME}`, etc.
- **ABORT if template not found**: "PRP template not found at .aidev-storage/templates/automated-prp-template.md"

#### 4.2 Gather Context for Template Variables
Collect information to replace each placeholder:
- `${TASK_ID}`: Extract from the task JSON using jq (stored in $TASK_ID variable)
- `${TASK_NAME}`: From the task JSON
- `${TASK_TYPE}`: Pattern/Feature/Instruction from task JSON
- `${FEATURE_OVERVIEW}`: Extract from task specification markdown
- `${EXECUTIVE_SUMMARY}`: Create a 2-3 sentence summary of what will be implemented
- `${DEPENDENCIES}`: List from task JSON or "None"
- `${PRIORITY}`: From task JSON
- `${ESTIMATED_LINES}`: Based on task type (Pattern: 50-100, Feature: 200-500, Instruction: N/A)
- `${CODEBASE_ANALYSIS}`: Results from analyzing existing code
- `${EXTERNAL_RESEARCH}`: Any research needed for the implementation
- `${ESTABLISHED_PATTERNS}`: Content from `.aidev-storage/patterns/established/`
- `${LEARNED_PATTERNS}`: Content from `.aidev-storage/patterns/learned/`
- `${SESSION_CONTEXT}`: Current session ID and timestamp
- `${EXAMPLE_REFERENCES}`: Relevant examples from `.aidev-storage/examples/`
- `${PROJECT_ANALYSIS}`: Analysis of existing utilities, components, APIs
- And all other variables in the template...

#### 4.3 Generate the PRP Document

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

#### 4.4 Save the Generated PRP
- Create directory: `.aidev-storage/tasks_output/$TASK_ID/` (using the ID extracted from JSON)
- Save the completed PRP to: `.aidev-storage/tasks_output/$TASK_ID/prp.md`
- The PRP should be a complete, actionable document with no placeholders

#### 4.5 Initialize Decision Tree
- Create decision tree file: `.aidev-storage/tasks_output/$TASK_ID/decision_tree.jsonl`
- Record the initial decision to start the task:

```bash
# Initialize decision tree with first entry
DECISION_TREE_PATH=".aidev-storage/tasks_output/$TASK_ID/decision_tree.jsonl"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Create first decision entry
echo "{\"timestamp\":\"$TIMESTAMP\",\"phase\":\"initialization\",\"decision\":\"start_task\",\"context\":{\"task_id\":\"$TASK_ID\",\"task_type\":\"$(echo "$TASK_JSON" | jq -r '.type')\",\"status\":\"beginning\"},\"reasoning\":\"Task validated and PRP generated successfully\",\"alternatives_considered\":[],\"confidence\":1.0}" > "$DECISION_TREE_PATH"

echo "✅ Decision tree initialized at: $DECISION_TREE_PATH"
```

**🛑 CRITICAL VALIDATION - MUST VERIFY PRP EXISTS:**
```bash
# Verify PRP was created (using extracted task ID)
PRP_PATH=".aidev-storage/tasks_output/$TASK_ID/prp.md"
if [ ! -f "$PRP_PATH" ]; then
  echo "❌ FATAL: PRP was not created at $PRP_PATH"
  echo "The PRP document is MANDATORY for all task types."
  echo "Aborting task execution."
  exit 1
fi

# Verify PRP has content
if [ ! -s "$PRP_PATH" ]; then
  echo "❌ FATAL: PRP file exists but is empty"
  echo "The PRP document must contain the implementation plan."
  echo "Aborting task execution."
  exit 1
fi

# Verify no placeholders remain
if grep -q '\${[^}]*}' "$PRP_PATH"; then
  echo "❌ FATAL: PRP contains unresolved placeholders"
  echo "All template variables must be replaced with actual values."
  echo "Found placeholders:"
  grep -o '\${[^}]*}' "$PRP_PATH" | head -5
  echo "Aborting task execution."
  exit 1
fi

echo "✅ PRP validation passed - proceeding with implementation"
```

#### 4.6 Follow the Generated PRP
- Use the generated PRP as your implementation guide
- The PRP contains specific validation checkpoints - follow them
- Design with future tasks in mind for extensibility
- For instruction tasks, focus on documentation structure and completeness
- **NEVER proceed without a valid PRP document**

### 4A. Decision Tree Tracking

**CRITICAL: Throughout the implementation, you MUST record key decisions in the decision tree**

#### Decision Tree Entry Format (JSONL)
Each line in the decision tree file should be a JSON object with this structure:
```json
{
  "timestamp": "ISO-8601 timestamp",
  "phase": "research|design|implementation|validation|troubleshooting",
  "decision": "short description of the decision",
  "context": {
    "file": "file being worked on (if applicable)",
    "line_range": "lines affected (if applicable)",
    "component": "component/module name",
    "related_decisions": ["previous decision IDs if this builds on them"]
  },
  "reasoning": "why this approach was chosen",
  "alternatives_considered": [
    {
      "option": "alternative approach",
      "reason_rejected": "why it wasn't chosen"
    }
  ],
  "confidence": 0.0-1.0,
  "impact": "low|medium|high",
  "reversible": true|false,
  "tags": ["architecture", "pattern", "library", "api", "error-handling", etc.]
}
```

#### When to Record Decisions
Record a decision when you:
- Choose between multiple implementation approaches
- Select a specific pattern or library
- Design an API or interface
- Handle an error or edge case
- Make assumptions about requirements
- Encounter and resolve ambiguity
- Change direction based on discoveries
- Make performance or security trade-offs

#### Recording Decisions During Implementation
```bash
# Function to append decision to tree
record_decision() {
  local PHASE="$1"
  local DECISION="$2"
  local REASONING="$3"
  local CONFIDENCE="$4"
  local IMPACT="${5:-medium}"
  
  TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
  DECISION_ENTRY=$(jq -n \
    --arg ts "$TIMESTAMP" \
    --arg ph "$PHASE" \
    --arg dec "$DECISION" \
    --arg reas "$REASONING" \
    --arg conf "$CONFIDENCE" \
    --arg imp "$IMPACT" \
    '{timestamp: $ts, phase: $ph, decision: $dec, reasoning: $reas, confidence: ($conf | tonumber), impact: $imp}')
  
  echo "$DECISION_ENTRY" >> "$DECISION_TREE_PATH"
}

# Example usage during implementation
record_decision "design" "Use singleton pattern for API client" "Ensures single connection pool and consistent configuration" "0.9" "high"
```

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

### 5. Implementation

**🛑 PRE-IMPLEMENTATION CHECKPOINT - VERIFY PRP EXISTS:**
```bash
# Final PRP check before implementation (using extracted task ID)
if [ ! -f ".aidev-storage/tasks_output/$TASK_ID/prp.md" ]; then
  echo "❌ CANNOT PROCEED: No PRP document found"
  echo "Implementation is blocked until PRP is generated"
  echo "This is a mandatory requirement for ALL task types"
  exit 1
fi

# Verify decision tree exists
if [ ! -f ".aidev-storage/tasks_output/$TASK_ID/decision_tree.jsonl" ]; then
  echo "❌ CANNOT PROCEED: No decision tree found"
  echo "Decision tracking is mandatory for audit trail"
  exit 1
fi

echo "✅ PRP document verified - proceeding with implementation"
echo "✅ Decision tree active - recording implementation choices"
```

<implementation-rules>
<decision-tracking>
  During ALL implementation phases, record decisions:
  □ Pattern selection → record_decision "design" "Selected X pattern" "reason" confidence
  □ Library choice → record_decision "implementation" "Using library Y" "reason" confidence
  □ API design → record_decision "design" "API structure: {...}" "reason" confidence
  □ Error handling → record_decision "implementation" "Handle error via Z" "reason" confidence
  □ Performance trade-offs → record_decision "implementation" "Chose approach A over B" "reason" confidence
</decision-tracking>

<pattern-tasks>
  Requirements:
  □ Implementation EXACTLY 50-100 lines (count required)
  □ Include working usage example (mandatory)
  □ Self-contained with no external dependencies
  □ Match existing pattern from preferences (quote source)
  □ Export pattern for use by other code
  □ Record pattern selection decision in tree
  
  Verification after creation:
  □ Line count: wc -l [file] must show 50-100
  □ Pattern matches preference: side-by-side comparison
  □ Usage example runs without errors
  □ Decision tree has pattern choice recorded
</pattern-tasks>

<feature-tasks>
  Requirements:
  □ Follow PRP file list EXACTLY (no extra files)
  □ Import only packages found in package.json
  □ Create tests FIRST if testing available
  □ Save all changes without committing
  
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
  □ Verify no code files created
  □ Only the specified .md file should exist
</instruction-tasks>
</implementation-rules>

### 6. Validation

<validation-requirements>
<automated-checks>
  Pattern/Feature Tasks:
  □ npm test → MUST pass (show output)
  □ npm run lint → MUST pass (show output)
  □ npm run type-check → MUST succeed
  □ npm run build → MUST complete without errors
  
  Instruction Tasks:
  □ Verify only .md file created
  □ No package.json changes
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

### 7. Create PR Message

**CRITICAL**: Save PR message to `.aidev-storage/tasks_output/$TASK_ID/last_result.md` (using the ID extracted from JSON)

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

### Key Decisions Made
[Extract 3-5 most important decisions from decision tree]
- **[Decision]**: [Brief reasoning]

### Validation
- [ ] All tests pass (if testing exists)
- [ ] Linting clean
- [ ] Build successful

### Session
- Session ID: [timestamp]
- PRP: [path to PRP]
- Decision Tree: [path to decision tree] ([number] decisions recorded)
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

### 8. Quality Review

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

### 9. Finalization

**CRITICAL**: Verify PRP, decision tree, and PR message were created before updating status

```bash
# Verify PRP exists (final check - using extracted task ID)
PRP_PATH=".aidev-storage/tasks_output/$TASK_ID/prp.md"
if [ ! -f "$PRP_PATH" ]; then
  echo "❌ FATAL: Cannot finalize - PRP document is missing"
  echo "The PRP is a mandatory deliverable for all tasks"
  exit 1
fi

# Verify decision tree exists and has meaningful content
DECISION_TREE_PATH=".aidev-storage/tasks_output/$TASK_ID/decision_tree.jsonl"
if [ ! -f "$DECISION_TREE_PATH" ]; then
  echo "❌ FATAL: Cannot finalize - Decision tree is missing"
  echo "Decision tracking is mandatory for audit trail"
  exit 1
fi

# Count decisions made (should be more than just initialization)
DECISION_COUNT=$(wc -l < "$DECISION_TREE_PATH")
if [ "$DECISION_COUNT" -lt 2 ]; then
  echo "⚠️  WARNING: Only $DECISION_COUNT decision(s) recorded"
  echo "Consider if all key decisions were tracked"
fi

# Verify last_result.md exists and has content (using extracted task ID)
LAST_RESULT_PATH=".aidev-storage/tasks_output/$TASK_ID/last_result.md"
if [ ! -f "$LAST_RESULT_PATH" ] || [ ! -s "$LAST_RESULT_PATH" ]; then
  echo "PR message (last_result.md) was not created or is empty!"
  exit 1
fi

# Record final decision
record_decision "finalization" "Task completed successfully" "All validations passed, deliverables created" "1.0" "high"

echo "✅ Task #$ARGUMENTS completed successfully"
echo "📝 PR message saved to: $LAST_RESULT_PATH"
echo "🌳 Decision tree saved to: $DECISION_TREE_PATH ($DECISION_COUNT decisions)"
echo ""
echo "AI Development command was successful"
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
  - PRP template cannot be found or read
  - Unable to generate PRP for any reason
</permission-to-stop>

<required-admissions>
  "Cannot find pattern [name] at specified location"
  "Package [name] not in dependencies"
  "Task specifies [X] but preference shows [Y]"
  "Multiple approaches possible - need clarification"
  "Cannot generate PRP - [specific reason]"
  "PRP validation failed - [specific error]"
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
- **Status Updates**: Do not update task status - this is handled by the parent process
- **PR Message**: MUST create `last_result.md` before marking as review
- **Testing**: Only create tests if testing infrastructure exists
- **Patterns**: Follow established patterns from `.aidev-storage/patterns/`
- **Changes**: Save all changes to files
- **NO GIT OPERATIONS**: This command is strictly forbidden from using git