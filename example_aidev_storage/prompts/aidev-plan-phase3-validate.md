---
description: "Phase 3: VALIDATION & REFINEMENT - Ensure tasks will successfully implement the concept"
allowed-tools: ["Read", "Write", "Edit", "MultiEdit", "Bash", "Glob", "LS"]
disallowed-tools: ["git", "TodoWrite", "WebFetch", "WebSearch"]
---

# Command: aidev-plan-phase3-validate

# ✅ PROJECT PLANNING PHASE 3: VALIDATION & REFINEMENT

**YOU ARE IN PHASE 3 OF 4:**
- **Phase 0 (DONE)**: Concept analysis completed
- **Phase 1 (DONE)**: Architecture defined
- **Phase 2 (DONE)**: Tasks generated
- **Phase 3 (NOW)**: Validate and refine the complete plan

**PHASE 3 INPUTS:**
- All generated task files in `.aidev-storage/tasks/`
- Task outputs in `.aidev-storage/tasks_output/[task-id]/`
- Original concept from `.aidev-storage/concept/`
- Architecture from `.aidev-storage/planning/`

**PHASE 3 OUTPUTS:**
✅ `.aidev-storage/planning/validation_report.md`
✅ Updated task files (if corrections needed)
✅ `.aidev-storage/planning/implementation_ready.json`

<role-context>
You are a senior technical reviewer performing final validation. Your job is to ensure that implementing all tasks will successfully achieve the concept goals, and that tasks are optimized for the code phases.

CRITICAL RULE: NEVER suggest going back to Phase 2, regardless of how low the coverage is. If coverage is extremely low (even below 50%), you MUST:
1. Ask clarifying questions to understand missing requirements
2. Create all necessary gap-filling tasks yourself within Phase 3
3. After creating tasks, tell the user to run Phase 3 again to re-validate
This is an iterative process - Phase 3 can be run multiple times to refine and add tasks.
</role-context>

## Purpose
Perform comprehensive validation to ensure tasks will work with the multi-agent code phases and achieve the desired outcome.

## Process

### 1. Verify Previous Phases and Load Tasks

```bash
echo "🔍 Verifying Phase 2 completion..."

# Check Phase 2 completion marker
if [ ! -f ".aidev-storage/planning/PHASE2_COMPLETE" ]; then
  echo "❌ ERROR: Phase 2 has not been completed!"
  echo ""
  echo "You must complete Phase 2 first:"
  echo "  claude /aidev-plan-phase2-generate"
  echo ""
  echo "Exiting..."
  exit 1
fi

# Verify tasks were generated
if [ ! -d ".aidev-storage/tasks" ] || [ -z "$(ls -A .aidev-storage/tasks/*.json 2>/dev/null)" ]; then
  echo "❌ ERROR: No tasks found!"
  echo "Phase 2 may have failed. Please run it again."
  exit 1
fi

# Check if tasks_output directory exists (for tasks that have been executed)
if [ -d ".aidev-storage/tasks_output" ]; then
  EXECUTED_TASKS=$(ls -1d .aidev-storage/tasks_output/*/ 2>/dev/null | wc -l)
  echo "📁 Found $EXECUTED_TASKS executed tasks in tasks_output/"
fi

# Check all previous phases completed
REQUIRED_MARKERS=(
  ".aidev-storage/planning/PHASE0_COMPLETE"
  ".aidev-storage/planning/PHASE1_COMPLETE"
  ".aidev-storage/planning/PHASE2_COMPLETE"
)

for MARKER in "${REQUIRED_MARKERS[@]}"; do
  if [ ! -f "$MARKER" ]; then
    echo "❌ ERROR: Missing phase completion marker: $MARKER"
    echo "All phases must be completed in order."
    exit 1
  fi
done

echo "✅ All previous phases verified"

# Check if Phase 3 was already completed
if [ -f ".aidev-storage/planning/READY" ]; then
  echo "⚠️  Planning was already completed and finalized"
  echo "Tasks are ready for implementation"
  exit 0
fi

# Count and categorize tasks
TOTAL_TASKS=$(ls -1 .aidev-storage/tasks/*.json 2>/dev/null | wc -l)
SETUP_TASKS=$(ls -1 .aidev-storage/tasks/0*.json 2>/dev/null | wc -l)
PATTERN_TASKS=$(ls -1 .aidev-storage/tasks/1*.json 2>/dev/null | wc -l)
FEATURE_TASKS=$(ls -1 .aidev-storage/tasks/[2-9]*.json 2>/dev/null | wc -l)

echo "📊 Task Summary:"
echo "- Total tasks: $TOTAL_TASKS"
echo "- Setup: $SETUP_TASKS"
echo "- Patterns: $PATTERN_TASKS"
echo "- Features: $FEATURE_TASKS"
```

### 2. Validate Task Quality

For EACH task, verify:

**Note**: If task has been executed, also check outputs in `.aidev-storage/tasks_output/[task-id]/`

#### A. Code Phase Compatibility
```bash
# Check task has required fields for code phases
for TASK in .aidev-storage/tasks/*.json; do
  TASK_ID=$(jq -r '.id' "$TASK")
  TASK_NAME=$(jq -r '.name' "$TASK")
  
  # Verify searchable name
  if [[ ! "$TASK_NAME" =~ ^[a-z0-9-]+$ ]]; then
    echo "❌ Task $TASK_ID has invalid name format: $TASK_NAME"
  fi
  
  # Check corresponding .md file exists
  MD_FILE="${TASK%.json}.md"
  if [ ! -f "$MD_FILE" ]; then
    echo "❌ Missing specification file for $TASK_ID"
  fi
done
```

#### B. Test Specification Quality
Read each .md file and verify:
- Has "Test Specifications" or "Test Cases" section
- Includes specific test scenarios
- Test cases are actionable and measurable
- Coverage aligns with 80% target

#### C. Dependency Chain Validation
```bash
# Build dependency graph
echo "digraph tasks {" > task_dependencies.dot
for TASK in .aidev-storage/tasks/*.json; do
  TASK_ID=$(jq -r '.id' "$TASK")
  DEPS=$(jq -r '.dependencies[]' "$TASK" 2>/dev/null)
  for DEP in $DEPS; do
    echo "  \"$DEP\" -> \"$TASK_ID\";" >> task_dependencies.dot
  done
done
echo "}" >> task_dependencies.dot

# Check for cycles
if grep -q "cycle" <<< $(dot -Tplain task_dependencies.dot 2>&1); then
  echo "❌ CRITICAL: Circular dependencies detected!"
fi
```

### 3. Comprehensive Concept Coverage Analysis

#### A. Extract and Analyze Concept Requirements
```bash
# Load original concept
CONCEPT_FILE=$(ls .aidev-storage/concept/*.md | head -1)
echo "📄 Analyzing concept from: $CONCEPT_FILE"

# Extract all functional requirements
echo "🎯 Extracting concept requirements..."
```

Read the concept file and create a detailed requirements checklist:

```markdown
# Concept Coverage Analysis

## Core Requirements Extracted
Based on the concept, the following must be implemented:

### Functional Requirements
- [ ] User Authentication (login, signup, logout)
- [ ] User Profile Management 
- [ ] Dashboard with key metrics
- [ ] Data CRUD operations
- [ ] Search functionality
- [ ] Export capabilities
- [ ] Settings management

### Non-Functional Requirements  
- [ ] Responsive design
- [ ] Performance optimization
- [ ] Security best practices
- [ ] Accessibility compliance

## Task Coverage Mapping
For each requirement, identify which tasks address it:

| Requirement | Tasks | Coverage | Notes |
|------------|-------|----------|-------|
| User Authentication | 200, 201, 202 | 90% | Missing password reset |
| Dashboard | 210 | 100% | Fully covered |
| Data Management | 220, 221 | 80% | Missing bulk operations |
| Settings | 230 | 100% | Fully covered |

## Coverage Calculation
- Total Requirements: 15
- Fully Covered: 10 (66.7%)
- Partially Covered: 3 (20%)
- Not Covered: 2 (13.3%)

**Overall Coverage: 86.7%** ⚠️

## Missing Functionality
1. Password reset flow - CRITICAL
2. Bulk data operations - IMPORTANT
3. Advanced search filters - NICE TO HAVE
```

### 4. Enhanced Code Output Simulation

For critical tasks, simulate the actual code that will be produced:

#### A. Select Sample Task for Deep Validation
```bash
# Pick a complex feature task to validate
SAMPLE_TASK="200-feature-user-authentication-login"
echo "🔬 Running deep validation on task: $SAMPLE_TASK"
```

#### B. Simulate Code Phase Outputs

```markdown
# Code Output Simulation for Task 200

## Phase 0 (Inventory) Expected Findings:
- components/Button.tsx - Can reuse ✅
- utils/validation.ts - Has email validator ✅
- No auth context exists - Will need to create ✅

## Phase 1 (Architect) Expected PRP:
### Components to Create:
- components/auth/LoginForm.tsx (45 lines)
- contexts/AuthContext.tsx (80 lines)
- hooks/useAuth.ts (35 lines)
- pages/login.tsx (25 lines)

### Test Files:
- __tests__/auth/LoginForm.test.tsx
- __tests__/hooks/useAuth.test.ts

### Estimated Total: 185 lines of code

## Validation Results:
- ✅ Code will integrate with existing components
- ✅ Follows project patterns
- ✅ Implements all requirements
- ✅ Testable and maintainable
- ⚠️ Missing: Error message internationalization

## Coverage Assessment:
This task will achieve 90% of its requirements.
Missing 10%: i18n support for error messages
```

### 5. Gap Analysis and Remediation

Based on coverage analysis, identify gaps and create remediation plan:

```markdown
# Gap Remediation Plan

## Coverage Assessment
Current Coverage: [X]%

⚠️ IMPORTANT: Regardless of how low the coverage is, we will address ALL gaps in Phase 3.
This is an iterative process - we can run Phase 3 multiple times to refine the plan.

## Approach for Handling Gaps

### If Coverage is Good (>85%)
Create specific tasks for each identified gap.

### If Coverage is Low (<50%)
1. Group missing features into logical categories
2. Ask targeted questions about the most critical features
3. Create tasks in batches
4. Run Phase 3 again to validate the new tasks

## YOUR OPTIONS:
1. **"create all"** - I'll create all missing tasks with sensible defaults
2. **"answer questions"** - Provide specific requirements first
3. **"minimal implementation"** - Create only the absolute core features
4. **"review tasks"** - See all current tasks before deciding
```

### 6. Gap Task Creation Process

When creating gap tasks, follow this consolidated process:

```bash
echo "🔄 Creating gap-filling tasks based on your requirements..."

# Load task creation template
if [ -f ".aidev-storage/templates/task-creation.md" ]; then
  echo "📋 Using task creation standards from template"
  TASK_TEMPLATE=".aidev-storage/templates/task-creation.md"
else
  echo "⚠️  Task creation template not found, using inline standards"
fi

# Create gap tasks following the task creation standards
# IMPORTANT: Tasks must be SELF-CONTAINED - do not reference planning files
# Example: Password Reset Task
cat > .aidev-storage/tasks/203-feature-password-reset-flow.json << 'EOF'
{
  "id": "203",
  "name": "feature-password-reset-flow",
  "type": "feature",
  "category": "feature",
  "description": "Implement password reset functionality with email flow",
  "dependencies": ["200", "201", "100"],
  "priority": "high",
  "estimated_complexity": "medium",
  "estimated_lines": 250,
  "created_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF

# Create the corresponding .md file with full task specification
# [Task specification content follows the task-creation.md template]

echo "✅ Created gap-filling tasks"
echo "📊 New coverage: [X]%"
echo ""
echo "🔄 Please run Phase 3 again to validate the newly created tasks:"
echo "   claude /aidev-plan-phase3-validate"
```

### 7. Generate Comprehensive Validation Report

**Output Location**: Save to `.aidev-storage/planning/validation_report.md`

```markdown
# Task Validation Report

## Executive Summary
- **Concept Coverage: [X]%** (Target: >90%)
- Total Tasks: [count]
- Tasks Passing Validation: [count]
- Tasks Needing Correction: [count]
- Critical Gaps Identified: [count]

## Concept Coverage Analysis
[Coverage details as determined above]

## Code Phase Readiness
- Phase 0: All task names searchable ✅
- Phase 1: Architecture detail sufficient ✅
- Phase 2: Test specs comprehensive ✅
- Phase 3: Implementation clear ✅
- Phase 4: Tests executable ✅
- Phase 5: Success criteria defined ✅

## Recommendation
[Based on coverage percentage, provide clear next steps]
```

### 8. Create Implementation Ready Flag

```json
{
  "status": "ready",
  "validation_complete": true,
  "total_tasks": 25,
  "estimated_total_lines": 5500,
  "estimated_hours": 40,
  "phases_ready": {
    "phase0": true,
    "phase1": true,
    "phase2": true,
    "phase3": true,
    "phase4": true,
    "phase5": true
  },
  "next_step": "Run code phases for task implementation"
}
```

## User Interactions

### For Clarification (When Gaps Found)

```markdown
# 🤔 CLARIFICATION NEEDED FOR GAP TASKS

I've identified [X] missing features that would improve coverage from [current]% to [projected]%.

Before creating these tasks, I need clarification on implementation details:

[List specific questions for each gap]

**YOUR OPTIONS:**
1. **Answer questions** - Provide specific requirements
2. **"use defaults"** - I'll use sensible defaults
3. **"minimal gaps"** - Add basic versions
4. **"skip gaps"** - Proceed without these features
5. **"review tasks"** - See current tasks first

What would you like to do?
```

### Final Confirmation

After user confirms tasks or coverage is adequate:

```bash
# Create READY flag
touch .aidev-storage/planning/READY
echo "✅ Created READY flag"
```

Then display:

```
🎉 PROJECT PLANNING COMPLETE!

✅ All [count] tasks have been validated and are ready for implementation
✅ Created implementation ready flag: .aidev-storage/planning/READY
✅ Concept coverage: [X]%

You can now start implementing your project:

1. View all tasks:
   aidev task list

2. Execute tasks in order:
   aidev task execute 001
   aidev task execute 002
   ... and so on

3. Or jump to a specific task:
   aidev task execute [task-id]

Good luck with your implementation!

Type /exit to close this planning session.
```

## Success Criteria

Phase 3 is complete when:
- All tasks validated for code phase compatibility
- Test specifications are comprehensive
- Dependencies form valid DAG
- Concept coverage confirmed
- Issues corrected
- User gives final approval
- Implementation ready flag set

## Important Path Structure

- Task definitions: `.aidev-storage/tasks/[task-id].json` and `.aidev-storage/tasks/[task-id].md`
- Task execution outputs: `.aidev-storage/tasks_output/[task-id]/phase_outputs/[phase-name]/`
- Validation outputs go to: `.aidev-storage/planning/validation_report.md`