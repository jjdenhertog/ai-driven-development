---
description: "Phase 2: TASK GENERATION - Generate detailed task specifications optimized for code phases"
allowed-tools: ["Read", "Write", "Bash", "Glob", "LS"]
disallowed-tools: ["Edit", "MultiEdit", "git", "TodoWrite", "WebFetch", "WebSearch"]
---

# Command: aidev-plan-phase2-generate

# 📝 PROJECT PLANNING PHASE 2: TASK GENERATION

**YOU ARE IN PHASE 2 OF 4:**
- **Phase 0 (DONE)**: Concept analysis completed
- **Phase 1 (DONE)**: Architecture approved by user
- **Phase 2 (NOW)**: Generate detailed task specifications
- **Phase 3 (LATER)**: Validate and refine plan

**PHASE 2 INPUTS:**
- `.aidev-storage/planning/technical_architecture.json`
- `.aidev-storage/planning/pattern_specifications.json`
- `.aidev-storage/planning/task_categories.json`
- `.aidev-storage/templates/task-specification-template.md`
- `.aidev-storage/templates/task-creation.md` (task creation standards)

**PHASE 2 OUTPUTS:**
✅ `.aidev-storage/tasks/###-task-name.md` (task specifications)
✅ `.aidev-storage/tasks/###-task-name.json` (task metadata)
✅ `.aidev-storage/planning/task_generation_report.json`

<role-context>
You are a technical task designer. Your job is to create detailed task specifications that will work perfectly with the multi-agent code phases. Each task must be self-contained, testable, and provide all information needed for implementation.
</role-context>

## Purpose
Generate comprehensive task specifications optimized for the code phases, ensuring maximum code reuse and test-driven development.

## Critical Task Design Principles

### 1. Searchable Names
Tasks MUST have descriptive names that match search patterns:
```
✅ GOOD: "user-authentication-login-form"
❌ BAD: "task-001" or "feature-a"
```

### 2. Test Specifications
Every feature task MUST include:
- Acceptance criteria as test cases
- Edge cases to handle
- Expected component behaviors
- API request/response examples

### 3. Code Reuse Directives
Each task MUST specify:
- Components to reuse (from Phase 0 inventory)
- Patterns to follow (from examples)
- Libraries already available
- Similar features to reference

## Process

### 1. Verify Previous Phase and Load Architecture

```bash
echo "🔍 Verifying Phase 1 completion..."

# Check Phase 1 completion marker
if [ ! -f ".aidev-storage/planning/PHASE1_COMPLETE" ]; then
  echo "❌ ERROR: Phase 1 has not been completed!"
  echo ""
  echo "You must complete Phase 1 first:"
  echo "  claude /aidev-plan-phase1-architect"
  echo ""
  echo "Exiting..."
  exit 1
fi

# Verify all required Phase 1 outputs exist
REQUIRED_FILES=(
  ".aidev-storage/planning/technical_architecture.json"
  ".aidev-storage/planning/pattern_specifications.json"
  ".aidev-storage/planning/task_categories.json"
  ".aidev-storage/planning/architecture_proposal.md"
)

for FILE in "${REQUIRED_FILES[@]}"; do
  if [ ! -f "$FILE" ]; then
    echo "❌ ERROR: Missing required file from Phase 1: $FILE"
    echo "Phase 1 may have failed. Please run it again."
    exit 1
  fi
done

echo "✅ Phase 1 outputs verified"

# Check if Phase 2 was already completed
if [ -f ".aidev-storage/planning/PHASE2_COMPLETE" ]; then
  echo "⚠️  Phase 2 was already completed"
  echo "To re-run, delete: .aidev-storage/planning/PHASE2_COMPLETE"
  exit 1
fi

# Load all planning outputs
ARCHITECTURE=$(cat .aidev-storage/planning/technical_architecture.json)
PATTERNS=$(cat .aidev-storage/planning/pattern_specifications.json)
CATEGORIES=$(cat .aidev-storage/planning/task_categories.json)
TEMPLATE=$(cat .aidev-storage/templates/task-specification-template.md)

# Load task creation standards if available
if [ -f ".aidev-storage/templates/task-creation.md" ]; then
  TASK_STANDARDS=$(cat .aidev-storage/templates/task-creation.md)
  echo "📋 Loaded task creation standards"
fi

echo "📋 Loaded architecture and templates"
echo "Categories to generate: $(echo "$CATEGORIES" | jq '.categories | keys | length')"
```

### 2. Generate Tasks Following Standards

**IMPORTANT**: Follow the task creation standards from `.aidev-storage/templates/task-creation.md` for ALL tasks.

Key requirements:
- Use searchable, descriptive names (e.g., `setup-nextjs-testing-vitest`, not `task-001`)
- Include all required sections based on task type
- Specify code reuse opportunities from Phase 0 inventory
- Include comprehensive test specifications
- Follow the exact template structure for consistency

**CRITICAL**: Tasks must be SELF-CONTAINED:
- DO NOT reference planning folder files (e.g., "see technical_architecture.json")
- DO NOT create dependencies on planning files
- EMBED all necessary information directly in the task specification
- Include specific technology choices, patterns, and requirements IN the task
- Each task should be executable without access to planning files

### 3. Task Generation Process

For each task category, generate tasks according to:

1. **Setup Tasks (001-099)**: Follow the Setup Task Template
2. **Pattern Tasks (100-199)**: Follow the Pattern Task Template  
3. **Feature Tasks (200+)**: Follow the Feature Task Template
4. **Instruction Tasks**: Follow the Instruction Task Template

Each task MUST:
- Have both a `.json` metadata file and `.md` specification file
- Use the exact structure from the task creation template
- Include all required sections for its type
- Reference specific code reuse opportunities from Phase 0 inventory
- Have comprehensive test specifications

### 4. Task Validation

For each generated task, verify against the task creation standards:
```bash
# Validate task completeness
for TASK in .aidev-storage/tasks/*.md; do
  echo "Validating: $TASK"
  TASK_TYPE=$(grep -E "^type:" "$TASK" | cut -d'"' -f2)
  
  # Check common required sections
  grep -q "## Description" "$TASK" || echo "❌ Missing description"
  grep -q "## Code Reuse" "$TASK" || echo "❌ Missing code reuse section"
  
  # Check type-specific requirements
  case "$TASK_TYPE" in
    "feature")
      grep -q "## Acceptance Criteria" "$TASK" || echo "❌ Missing acceptance criteria"
      grep -q "## Test Specifications" "$TASK" || echo "❌ Missing test specifications"
      grep -q "## Component Specifications\|## API Specifications" "$TASK" || echo "❌ Missing component or API specs"
      ;;
    "pattern")
      grep -q "## Pattern Requirements" "$TASK" || echo "❌ Missing pattern requirements"
      grep -q "## Usage Examples" "$TASK" || echo "❌ Missing usage examples"
      ;;
    "setup")
      grep -q "## Technical Requirements" "$TASK" || echo "❌ Missing technical requirements"
      grep -q "verification_tests:" "$TASK" || echo "❌ Missing verification tests"
      ;;
    "instruction")
      grep -q "## Manual Steps Required" "$TASK" || echo "❌ Missing manual steps"
      grep -q "## Verification Steps" "$TASK" || echo "❌ Missing verification steps"
      ;;
  esac
done
```

### 7. Generate Summary Report

```json
{
  "generation_summary": {
    "total_tasks": 25,
    "setup_tasks": 5,
    "pattern_tasks": 4,
    "feature_tasks": 14,
    "instruction_tasks": 2
  },
  "test_coverage": {
    "tasks_with_tests": 23,
    "total_test_cases": 156,
    "average_tests_per_task": 6.5
  },
  "reuse_metrics": {
    "tasks_reusing_code": 20,
    "components_reused": 15,
    "patterns_applied": 8
  },
  "validation_status": "ready_for_review"
}
```

## User Validation Point

Present generated tasks for review:

```bash
# Count tasks
SETUP_COUNT=$(ls -1 .aidev-storage/tasks/0*.json 2>/dev/null | wc -l)
PATTERN_COUNT=$(ls -1 .aidev-storage/tasks/1*.json 2>/dev/null | wc -l)
FEATURE_COUNT=$(ls -1 .aidev-storage/tasks/[2-9]*.json 2>/dev/null | wc -l)
INSTRUCTION_COUNT=$(grep -l '"type": "instruction"' .aidev-storage/tasks/*.json 2>/dev/null | wc -l)
TOTAL_COUNT=$((SETUP_COUNT + PATTERN_COUNT + FEATURE_COUNT))

# Save summary
cat > .aidev-storage/planning/task_generation_summary.md << EOF
# Task Generation Summary

## Total Tasks: $TOTAL_COUNT

### Setup Tasks (001-099): $SETUP_COUNT
$(ls -1 .aidev-storage/tasks/0*.json 2>/dev/null | while read f; do
  ID=$(jq -r '.id' "$f")
  NAME=$(jq -r '.name' "$f")
  TYPE=$(jq -r '.type' "$f")
  echo "- $ID: $NAME ($TYPE)"
done)

### Pattern Tasks (100-199): $PATTERN_COUNT
$(ls -1 .aidev-storage/tasks/1*.json 2>/dev/null | while read f; do
  ID=$(jq -r '.id' "$f")
  NAME=$(jq -r '.name' "$f")
  echo "- $ID: $NAME"
done)

### Feature Tasks (200+): $FEATURE_COUNT
$(ls -1 .aidev-storage/tasks/[2-9]*.json 2>/dev/null | while read f; do
  ID=$(jq -r '.id' "$f")
  NAME=$(jq -r '.name' "$f")
  TYPE=$(jq -r '.type' "$f")
  echo "- $ID: $NAME ($TYPE)"
done)

### Instruction Tasks: $INSTRUCTION_COUNT
$(grep -l '"type": "instruction"' .aidev-storage/tasks/*.json 2>/dev/null | while read f; do
  ID=$(jq -r '.id' "$f")
  NAME=$(jq -r '.name' "$f")
  echo "- $ID: $NAME"
done)
EOF
```

**📝 TASK GENERATION REVIEW**

I've generated detailed task specifications based on your approved architecture.

**📊 TASK SUMMARY**
Generated [X] total tasks:

**🔧 Setup Tasks (001-099): [count] tasks**
- Testing framework setup
- Database configuration
- Authentication setup
[List actual generated setup tasks]

**📔 Instruction Tasks: [count] tasks**
- Environment variable configuration
- External service setup
[List actual generated instruction tasks]

**🏗️ Pattern Tasks (100-199): [count] tasks**
- API error handler pattern
- Component structure pattern
[List actual generated pattern tasks]

**✨ Feature Tasks (200+): [count] tasks**
- User authentication flows
- Dashboard implementation
[List actual generated feature tasks]

Would you like to review any specific tasks, make changes, or are you satisfied with the task list?

You can ask to:
- Review a specific task (e.g., "show me task 200")
- List tasks by category
- Modify, add, or remove tasks
- Or confirm you're done

**Note**: The summary has been saved to `.aidev-storage/planning/task_generation_summary.md`

### Final Output Format

After user types "done", create completion marker and end with:
```bash
# Create phase completion marker
echo "Phase 2 completed at $(date)" > .aidev-storage/planning/PHASE2_COMPLETE

# Save task generation summary
echo "$GENERATION_SUMMARY" > .aidev-storage/planning/task_generation_report.json

# Count generated tasks
TASK_COUNT=$(ls -1 .aidev-storage/tasks/*.json 2>/dev/null | wc -l)
echo "Total tasks generated: $TASK_COUNT" >> .aidev-storage/planning/PHASE2_COMPLETE
```

Then display:
```
✅ Phase 2 Complete - Tasks Generated!

Generated [X] tasks:
- Setup: [count] tasks
- Instruction: [count] tasks
- Patterns: [count] tasks  
- Features: [count] tasks

All task specifications saved to:
.aidev-storage/tasks/

Please:
1. Type /exit to close this session and automatically move to the next

The next phase will validate all tasks and ensure they're ready for implementation.
```

After each modification:
```
✅ Task [action] successfully!

Options:
- Review another task: "review [id]"
- Make more changes: "modify [id]"
- When finished: "done"
```

## Success Criteria

Phase 2 is complete when:
- All tasks generated with proper structure
- Test specifications included
- Code reuse opportunities identified
- Tasks properly numbered and categorized
- User has reviewed task list
- Ready for validation phase