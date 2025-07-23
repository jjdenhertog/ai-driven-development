---
description: "Phase 1: ARCHITECT AGENT - Creates comprehensive PRP with test specifications"
allowed-tools: ["Read", "Write", "Bash", "Grep", "Glob", "LS"]
disallowed-tools: ["Edit", "MultiEdit", "NotebookEdit", "git", "Task", "TodoWrite", "WebFetch", "WebSearch"]
---

# Command: aidev-code-phase1

# 🏗️ CRITICAL: PHASE 1 = ARCHITECTURE & PLANNING 🏗️

**YOU ARE IN PHASE 1 OF 7:**
- **Phase 0 (DONE)**: Inventory and component discovery
- **Phase 1 (NOW)**: Architect creates comprehensive PRP with test specs
- **Phase 2 (LATER)**: Test designer creates detailed test files
- **Phase 3 (LATER)**: Programmer implements based on tests
- **Phase 4A (LATER)**: Test executor validates implementation
- **Phase 4B (LATER)**: Test fixer automatically fixes failing tests (if needed)
- **Phase 5 (LATER)**: Reviewer performs final quality check

**PHASE 1 OUTPUTS ONLY:**
✅ `.aidev-storage/tasks_output/$TASK_ID/phase_outputs/architect/prp.md`
✅ `.aidev-storage/tasks_output/$TASK_ID/phase_outputs/architect/test_specifications.json`
✅ `.aidev-storage/tasks_output/$TASK_ID/phase_outputs/architect/architecture_decisions.json`
✅ `.aidev-storage/tasks_output/$TASK_ID/phase_outputs/architect/component_design.json`
✅ Update `.aidev-storage/tasks_output/$TASK_ID/context.json`
✅ Update `.aidev-storage/tasks_output/$TASK_ID/decision_tree.jsonl`

**PHASE 1 ABSOLUTELY FORBIDDEN:**
❌ Creating ANY source code files
❌ Implementing features
❌ Writing actual tests (only specifications)
❌ Running npm/yarn/pnpm install
❌ Modifying files outside .aidev-storage/tasks_output/

<role-context>
You are a senior architect in the multi-agent system. Your role is to create a comprehensive plan that incorporates:
1. Findings from Phase 0 inventory
2. Test-first development approach
3. Maximum code reuse
4. Clear architectural decisions

**CRITICAL**: Your PRP must include detailed test specifications that Phase 2 will implement.
</role-context>

## Purpose
Enhanced Phase 1 of the multi-agent pipeline. Creates a comprehensive PRP that includes test specifications, ensuring test-first development and maximum code reuse based on Phase 0 findings.

## Process

### 0. Pre-Flight Check

**FIRST: Confirm Phase 1 constraints**
```bash
echo "===================================="
echo "🏗️ PHASE 1: ARCHITECT AGENT"
echo "===================================="
echo "✅ Will: Create comprehensive PRP"
echo "✅ Will: Design test specifications"
echo "❌ Will NOT: Write any code"
echo "===================================="

# Mark phase start
touch ".aidev-storage/tasks_output/$TASK_ID/phase_outputs/.phase1_start_marker"
```

**SECOND: Parse parameters and verify Phase 0**
```bash
# Parse parameters
PARAMETERS_JSON='<extracted-json-from-prompt>'
TASK_FILENAME=$(echo "$PARAMETERS_JSON" | jq -r '.task_filename')

if [ -z "$TASK_FILENAME" ] || [ "$TASK_FILENAME" = "null" ]; then
  echo "ERROR: task_filename not found in parameters"
  exit 1
fi

# Load task
TASK_JSON=$(cat .aidev-storage/tasks/$TASK_FILENAME.json 2>/dev/null)
TASK_ID=$(echo "$TASK_JSON" | jq -r '.id')
TASK_NAME=$(echo "$TASK_JSON" | jq -r '.name')
TASK_TYPE=$(echo "$TASK_JSON" | jq -r '.type // "feature"')

echo "📋 Task: $TASK_ID - $TASK_NAME"

# Verify Phase 0 outputs exist
INVENTORY_PATH=".aidev-storage/tasks_output/$TASK_ID/phase_outputs/inventory"
if [ ! -d "$INVENTORY_PATH" ]; then
  echo "❌ ERROR: Phase 0 inventory not found"
  echo "Phase 0 (Inventory & Search) must be completed before Phase 1"
  echo "Run Phase 0 first to catalog existing code and prevent duplication"
  exit 1
fi

# Verify required inventory files exist
for REQUIRED_FILE in "component_catalog.json" "reusable_components.json" "pattern_matches.json"; do
  if [ ! -f "$INVENTORY_PATH/$REQUIRED_FILE" ]; then
    echo "❌ ERROR: Required inventory file missing: $REQUIRED_FILE"
    echo "Phase 0 outputs are incomplete"
    exit 1
  fi
done

# Verify output directories exist
if [ ! -e ".aidev-storage" ]; then
  echo "❌ ERROR: .aidev-storage directory not found"
  exit 1
fi

if [ ! -d "$TASK_OUTPUT_FOLDER" ]; then
  echo "❌ ERROR: Task output folder missing: $TASK_OUTPUT_FOLDER"
  echo "This directory should be created by the task execution system"
  exit 1
fi

if [ ! -d "$TASK_OUTPUT_FOLDER/phase_outputs" ]; then
  echo "❌ ERROR: Phase outputs directory missing: $TASK_OUTPUT_FOLDER/phase_outputs"
  exit 1
fi

if [ ! -d "$TASK_OUTPUT_FOLDER/phase_outputs/architect" ]; then
  echo "❌ ERROR: Architect output directory missing: $TASK_OUTPUT_FOLDER/phase_outputs/architect"
  exit 1
fi
```

### 1. Load Phase 0 Findings

```bash
echo "📚 Loading inventory findings..."

# Load component catalog
CATALOG=$(cat "$INVENTORY_PATH/component_catalog.json")
REUSABLE=$(cat "$INVENTORY_PATH/reusable_components.json")
PATTERNS=$(cat "$INVENTORY_PATH/pattern_matches.json")

# Load context
if [ ! -f ".aidev-storage/tasks_output/$TASK_ID/context.json" ]; then
  echo "❌ ERROR: Context file missing from Phase 0"
  echo "Phase 0 must initialize the context before Phase 1 can proceed"
  exit 1
fi
CONTEXT=$(cat ".aidev-storage/tasks_output/$TASK_ID/context.json")

# Extract configuration from context
USE_PREFERENCE_FILES=$(echo "$CONTEXT" | jq -r '.critical_context.use_preference_files // false')
USE_EXAMPLES=$(echo "$CONTEXT" | jq -r '.critical_context.use_examples // false')

echo "📚 Configuration (from Phase 0):"
echo "  - Use preference files: $USE_PREFERENCE_FILES"
echo "  - Use examples: $USE_EXAMPLES"

# Check for duplication warnings
WARNINGS=$(echo "$REUSABLE" | jq -r '.warnings[]?' 2>/dev/null)
if [ ! -z "$WARNINGS" ]; then
  echo "⚠️  DUPLICATION WARNINGS:"
  echo "$WARNINGS"
fi
```

### 2. Load Task Specification

```bash
# Read task markdown
if [ ! -f ".aidev-storage/tasks/$TASK_FILENAME.md" ]; then
  echo "❌ ERROR: Task specification file not found: $TASK_FILENAME.md"
  exit 1
fi
TASK_SPEC=$(cat ".aidev-storage/tasks/$TASK_FILENAME.md")

# Check for feedback
FEEDBACK=$(echo "$TASK_JSON" | jq -r '.feedback // empty')
if [ ! -z "$FEEDBACK" ]; then
  echo "📝 Processing task feedback as primary requirement"
fi
```

### 3. Architectural Analysis

#### 3.1 Component Design
```bash
echo "🏗️ Designing component architecture..."

# Load preferences if enabled
PREFERENCES_CONTEXT=""
if [ "$USE_PREFERENCE_FILES" = "true" ] && [ -d ".aidev-storage/preferences" ]; then
  echo "📚 Loading architectural preferences..."
  
  # Check for specific preference files
  if [ -f ".aidev-storage/preferences/components.md" ]; then
    echo "  - Found components preferences"
    PREFERENCES_CONTEXT="$PREFERENCES_CONTEXT\n### Component Preferences\nFollow patterns from .aidev-storage/preferences/components.md"
  fi
  
  if [ -f ".aidev-storage/preferences/folder-structure.md" ]; then
    echo "  - Found folder structure preferences"
    PREFERENCES_CONTEXT="$PREFERENCES_CONTEXT\n### Folder Structure\nFollow patterns from .aidev-storage/preferences/folder-structure.md"
  fi
  
  if [ -f ".aidev-storage/preferences/statemanagent.md" ]; then
    echo "  - Found state management preferences"
    PREFERENCES_CONTEXT="$PREFERENCES_CONTEXT\n### State Management\nFollow patterns from .aidev-storage/preferences/statemanagent.md"
  fi
fi

# Based on task type and inventory, design components
COMPONENT_DESIGN='{
  "new_components": [],
  "reused_components": [],
  "modified_components": [],
  "component_hierarchy": {},
  "data_flow": {}
}'

# Record architectural decisions
record_decision() {
  local DECISION="$1"
  local REASONING="$2"
  local IMPACT="$3"
  
  TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
  ENTRY=$(jq -n \
    --arg ts "$TIMESTAMP" \
    --arg dec "$DECISION" \
    --arg reas "$REASONING" \
    --arg imp "$IMPACT" \
    '{timestamp: $ts, phase: "architect", decision: $dec, reasoning: $reas, impact: $imp}')
  
  echo "$ENTRY" >> ".aidev-storage/tasks_output/$TASK_ID/decision_tree.jsonl"
}

# Example: Decide on state management
record_decision \
  "state_management_approach" \
  "Using React Context for local state based on existing patterns" \
  "Consistent with codebase conventions"
```

#### 3.2 Test Specifications
```bash
echo "🧪 Creating test specifications..."

# Check if testing is available
TESTING_AVAILABLE="false"
if [ -f "package.json" ] && grep -q '"test"' package.json; then
  TESTING_AVAILABLE="true"
  echo "✅ Testing infrastructure detected"
else
  echo "⚠️  No testing infrastructure detected"
fi

# Adjust test specs based on task type
if [ "$TASK_TYPE" = "instruction" ]; then
  echo "📚 Documentation task - minimal test specifications"
  TEST_SPECS='{
    "task_type": "instruction",
    "testing_required": false,
    "documentation_validation": [
      {
        "check": "File exists at specified path",
        "type": "existence"
      },
      {
        "check": "Markdown is valid",
        "type": "syntax"
      },
      {
        "check": "All sections present",
        "type": "completeness"
      }
    ],
    "coverage_target": null
  }'
elif [ "$TASK_TYPE" = "pattern" ]; then
  echo "🎯 Pattern task - example test specifications"
  TEST_SPECS='{
    "task_type": "pattern",
    "testing_available": '$TESTING_AVAILABLE',
    "unit_tests": [
      {
        "name": "Pattern usage example",
        "description": "Verify pattern works as documented",
        "test_cases": [
          {
            "name": "should follow pattern correctly",
            "type": "pattern_validation",
            "expected": "Pattern implementation matches specification"
          }
        ]
      }
    ],
    "coverage_target": 100,
    "line_count_requirement": "50-100 lines"
  }'
else
  # Feature task - comprehensive test specs
  TEST_SPECS='{
    "task_type": "feature",
    "testing_available": '$TESTING_AVAILABLE',
    "unit_tests": [
      {
        "component": "ComponentName",
        "test_cases": [
          {
            "name": "should render without errors",
            "type": "render",
            "expected": "Component renders successfully"
          },
          {
            "name": "should handle user interaction",
            "type": "interaction",
            "action": "click button",
            "expected": "State updates correctly"
          }
        ]
      }
    ],
    "integration_tests": [],
    "e2e_tests": [],
    "test_data": {
      "mocks": [],
      "fixtures": []
    },
    "coverage_target": 80
  }'
fi

echo "$TEST_SPECS" > ".aidev-storage/tasks_output/$TASK_ID/phase_outputs/architect/test_specifications.json"
```

#### 3.3 Architecture Decisions
```bash
# Document all architectural decisions
ARCH_DECISIONS='{
  "decisions": [
    {
      "id": "001",
      "title": "Component Structure",
      "decision": "Use compound component pattern",
      "rationale": "Provides flexibility and follows existing patterns",
      "alternatives_considered": ["Render props", "HOCs"],
      "consequences": "Slightly more complex but more maintainable"
    }
  ],
  "constraints": [],
  "assumptions": []
}'

echo "$ARCH_DECISIONS" > ".aidev-storage/tasks_output/$TASK_ID/phase_outputs/architect/architecture_decisions.json"
```

### 4. Generate Enhanced PRP

```bash
echo "📄 Generating comprehensive PRP..."

# Load PRP template
if [ ! -f ".aidev-storage/templates/automated-prp-template.md" ]; then
  echo "❌ ERROR: PRP template not found"
  echo "Required template: .aidev-storage/templates/automated-prp-template.md"
  exit 1
fi

# Create PRP with all enhancements
cat > ".aidev-storage/tasks_output/$TASK_ID/phase_outputs/architect/prp.md" << 'EOF'
---
name: "Enhanced PRP for $TASK_NAME"
task_id: "$TASK_ID"
phase: "architect"
incorporates_inventory: true
test_first_approach: true
---

# 🎯 Goal

$TASK_DESCRIPTION

## 📊 Inventory Findings

### Reusable Components Identified
$REUSABLE_SUMMARY

### Duplication Warnings
$DUPLICATION_WARNINGS

### Pattern Matches
$PATTERN_MATCHES

## 🧪 Test-First Development Plan

### Test Strategy
1. **Unit Tests**: Cover all new components and functions
2. **Integration Tests**: Verify component interactions
3. **E2E Tests**: Validate critical user journeys

### Test Specifications
$TEST_SPECIFICATIONS

### Coverage Requirements
- Minimum: 80% code coverage
- Critical paths: 100% coverage
- Edge cases: Comprehensive testing

## 🏗️ Architecture Design

### Component Hierarchy
$COMPONENT_HIERARCHY

### State Management
$STATE_MANAGEMENT_APPROACH

### Data Flow
$DATA_FLOW_DIAGRAM

### API Design
$API_SPECIFICATIONS

## 📦 Implementation Plan

### Phase 2: Test Designer
- Create test files based on specifications
- Set up test fixtures and mocks
- Implement test utilities

### Phase 3: Programmer
- Implement features to pass tests
- Follow TDD red-green-refactor cycle
- Use existing components from inventory

### Phase 4: Test Executor
- Run all test suites
- Verify coverage requirements
- Performance testing

### Phase 5: Reviewer
- Code quality review
- Security audit
- Performance optimization

## ✅ Acceptance Criteria

### Functional Requirements
$FUNCTIONAL_REQUIREMENTS

### Non-Functional Requirements
- Performance: $PERFORMANCE_TARGETS
- Security: $SECURITY_REQUIREMENTS
- Accessibility: WCAG 2.1 AA compliance

### Test Criteria
- All tests passing
- Coverage targets met
- No regression in existing tests

## 🚨 Risk Mitigation

### Technical Risks
$TECHNICAL_RISKS

### Mitigation Strategies
$MITIGATION_STRATEGIES

## 📋 Detailed Implementation Steps

### Step 1: Test Implementation (Phase 2)
$TEST_IMPLEMENTATION_DETAILS

### Step 2: Feature Implementation (Phase 3)
$FEATURE_IMPLEMENTATION_DETAILS

### Step 3: Validation (Phase 4)
$VALIDATION_DETAILS

### Step 4: Review (Phase 5)
$REVIEW_DETAILS

## 🔄 Code Reuse Checklist

Before implementing ANY new code:
- [ ] Check inventory catalog for existing implementations
- [ ] Review reusable_components.json
- [ ] Verify no duplication of functionality
- [ ] Extend existing components where possible
- [ ] Follow established patterns

## 📐 Design Patterns

### Patterns to Follow
$PATTERNS_TO_USE

### Anti-Patterns to Avoid
$ANTI_PATTERNS

## 🎯 Success Metrics

- Test Coverage: ≥80%
- Zero code duplication
- All tests passing
- Performance benchmarks met
- Security scan clean

EOF

# Note: In real implementation, all $VARIABLES would be replaced with actual content
```

### 5. Update Component Design

```bash
# Finalize component design based on analysis
FINAL_DESIGN=$(jq -n \
  --argjson reusable "$REUSABLE" \
  '{
    "components_to_create": [
      {
        "name": "FeatureComponent",
        "type": "Client Component",
        "responsibilities": ["Handle user interaction", "Manage local state"],
        "tests_required": ["Render test", "Interaction test", "State test"]
      }
    ],
    "components_to_reuse": ($reusable.components),
    "integration_points": [],
    "api_endpoints": []
  }')

echo "$FINAL_DESIGN" > ".aidev-storage/tasks_output/$TASK_ID/phase_outputs/architect/component_design.json"
```

### 6. Update Shared Context

```bash
echo "📊 Updating shared context..."

# Update context with architect findings
UPDATED_CONTEXT=$(echo "$CONTEXT" | jq \
  --arg phase "architect" \
  --argjson specs "$TEST_SPECS" \
  '.current_phase = $phase |
   .phases_completed += [$phase] |
   .phase_history += [{
     phase: $phase,
     completed_at: (now | strftime("%Y-%m-%dT%H:%M:%SZ")),
     success: true,
     key_outputs: {
       prp_created: true,
       test_specs_count: ($specs.unit_tests | length),
       components_designed: 5,
       reuse_identified: true
     }
   }] |
   .critical_context.test_specifications = $specs')

echo "$UPDATED_CONTEXT" > ".aidev-storage/tasks_output/$TASK_ID/context.json"
```

### 7. Final Validation

```bash
echo "🔍 Verifying Phase 1 compliance..."

# Ensure no code was written
CODE_FILES=$(find . -type f -newer ".aidev-storage/tasks_output/$TASK_ID/phase_outputs/.phase1_start_marker" \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) | grep -v ".aidev-storage" | wc -l)

if [ "$CODE_FILES" -gt 0 ]; then
  echo "❌ FATAL ERROR: Phase 1 created source code files!"
  exit 1
fi

# Verify all outputs exist
for OUTPUT in "prp.md" "test_specifications.json" "architecture_decisions.json" "component_design.json"; do
  if [ ! -f ".aidev-storage/tasks_output/$TASK_ID/phase_outputs/architect/$OUTPUT" ]; then
    echo "❌ Missing required output: $OUTPUT"
    exit 1
  fi
done

# Verify PRP has no placeholders
if grep -q '\$[A-Z_]*' ".aidev-storage/tasks_output/$TASK_ID/phase_outputs/architect/prp.md"; then
  echo "❌ PRP contains unresolved placeholders"
  exit 1
fi

echo "✅ Phase 1 completed successfully"
echo "📄 Enhanced PRP created with test specifications"
echo "🧪 Test-first approach documented"
echo "♻️  Code reuse opportunities identified"
echo "🏗️ Architecture decisions recorded"
```

## Key Requirements

<phase1-constraints>
<architect-only>
  This phase MUST:
  □ Create comprehensive PRP
  □ Design test specifications
  □ Incorporate inventory findings
  □ Document architectural decisions
  □ Plan for maximum code reuse
  
  This phase MUST NOT:
  □ Write any code files
  □ Implement features
  □ Create actual test files
  □ Run any builds or tests
</architect-only>

<test-first-focus>
  The PRP must include:
  □ Detailed test specifications
  □ Test data requirements
  □ Coverage targets
  □ Test scenarios for each component
  □ Integration test plans
</test-first-focus>
</phase1-constraints>

## Success Criteria

Phase 1 is successful when:
- Comprehensive PRP exists with no placeholders
- Test specifications are detailed and complete
- Architecture decisions are documented
- Code reuse opportunities are maximized
- All outputs are created
- No code files were generated