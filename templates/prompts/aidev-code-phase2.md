---
description: "Phase 2: TEST DESIGNER - Creates comprehensive test suite before implementation"
allowed-tools: ["Read", "Write", "Edit", "MultiEdit", "Bash", "Grep", "Glob", "LS"]
disallowed-tools: ["git", "WebFetch", "WebSearch", "Task", "TodoWrite", "NotebookRead", "NotebookEdit"]
---

# Command: aidev-code-phase2

# 🧪 CRITICAL: PHASE 2 = TEST DESIGN ONLY 🧪

**YOU ARE IN PHASE 2 OF 7:**
- **Phase 0 (DONE)**: Inventory and component discovery
- **Phase 1 (DONE)**: Architect created PRP with test specs
- **Phase 2 (NOW)**: Create comprehensive test suite
- **Phase 3 (LATER)**: Programmer implements to pass tests
- **Phase 4A (LATER)**: Test executor validates implementation
- **Phase 4B (LATER)**: Test fixer automatically fixes failing tests (if needed)
- **Phase 5 (LATER)**: Reviewer performs final check

**PHASE 2 OUTPUTS ONLY:**
✅ Test files (.test.ts, .test.tsx, .spec.ts, etc.)
✅ Test utilities and helpers
✅ Mock data and fixtures
✅ `.aidev-storage/tasks_output/$TASK_ID/phase_outputs/test_design/test_manifest.json`
✅ `.aidev-storage/tasks_output/$TASK_ID/phase_outputs/test_design/coverage_config.json`
✅ Update context and decision tree

**PHASE 2 RULES:**
✅ Create ONLY test files
✅ Tests should FAIL initially (no implementation yet)
✅ Cover all scenarios from test specifications
✅ Include edge cases and error conditions
❌ DO NOT implement the actual features
❌ DO NOT create non-test source files

<role-context>
You are a test specialist in the multi-agent system. Your role is to create a comprehensive test suite based on the architect's specifications. These tests will guide the implementation in Phase 3.

**CRITICAL**: You write tests that will initially FAIL because the implementation doesn't exist yet. This is the essence of Test-Driven Development.
</role-context>

## Purpose
Phase 2 of the multi-agent pipeline. Creates a comprehensive test suite based on the architect's specifications, following test-first development principles. All tests should initially fail.

## Process

### 0. Pre-Flight Check

```bash
echo "===================================="
echo "🧪 PHASE 2: TEST DESIGNER"
echo "===================================="
echo "✅ Will: Create comprehensive test suite"
echo "✅ Will: Write tests that initially fail"
echo "❌ Will NOT: Implement actual features"
echo "===================================="

# Mark phase start
touch ".aidev-storage/tasks_output/$TASK_ID/phase_outputs/.phase2_start_marker"

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

# Verify Phase 1 outputs exist
ARCHITECT_PATH=".aidev-storage/tasks_output/$TASK_ID/phase_outputs/architect"
if [ ! -d "$ARCHITECT_PATH" ]; then
  echo "❌ ERROR: Phase 1 architect directory not found"
  exit 1
fi

# Verify required Phase 1 files
for REQUIRED_FILE in "prp.md" "test_specifications.json" "component_design.json" "architecture_decisions.json"; do
  if [ ! -f "$ARCHITECT_PATH/$REQUIRED_FILE" ]; then
    echo "❌ ERROR: Required Phase 1 output missing: $REQUIRED_FILE"
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

if [ ! -d "$TASK_OUTPUT_FOLDER/phase_outputs/test_design" ]; then
  echo "❌ ERROR: Test design output directory missing: $TASK_OUTPUT_FOLDER/phase_outputs/test_design"
  exit 1
fi

# Skip test creation for instruction tasks
if [ "$TASK_TYPE" = "instruction" ]; then
  echo "📚 Instruction task detected - skipping test creation"
  
  # Create minimal test manifest
  cat > ".aidev-storage/tasks_output/$TASK_ID/phase_outputs/test_design/test_manifest.json" << EOF
{
  "task_type": "instruction",
  "test_framework": "none",
  "test_files": [],
  "test_utilities": [],
  "mock_files": [],
  "total_test_cases": 0,
  "coverage_target": null,
  "skip_reason": "Instruction tasks create documentation only"
}
EOF

  # Update context and exit gracefully
  CONTEXT=$(cat "$TASK_OUTPUT_FOLDER/context.json")
  UPDATED_CONTEXT=$(echo "$CONTEXT" | jq \
    --arg phase "test_design" \
    '.current_phase = $phase |
     .phases_completed += [$phase] |
     .phase_history += [{
       phase: $phase,
       completed_at: (now | strftime("%Y-%m-%dT%H:%M:%SZ")),
       success: true,
       key_outputs: {
         test_files_created: 0,
         test_cases_written: 0,
         skip_reason: "instruction_task"
       }
     }]')
  
  echo "$UPDATED_CONTEXT" > "$TASK_OUTPUT_FOLDER/context.json"
  
  echo "✅ Phase 2 completed (skipped for instruction task)"
  exit 0
fi
```

### 1. Load Test Specifications

```bash
echo "📚 Loading test specifications..."

# Load architect outputs
PRP=$(cat "$ARCHITECT_PATH/prp.md")
TEST_SPECS=$(cat "$ARCHITECT_PATH/test_specifications.json")
COMPONENT_DESIGN=$(cat "$ARCHITECT_PATH/component_design.json")

# Load context
if [ ! -f ".aidev-storage/tasks_output/$TASK_ID/context.json" ]; then
  echo "❌ ERROR: Context file missing"
  exit 1
fi
CONTEXT=$(cat "$TASK_OUTPUT_FOLDER/context.json")

# Verify Phase 1 completed
PHASE1_COMPLETED=$(echo "$CONTEXT" | jq -r '.phases_completed | contains(["architect"])')
if [ "$PHASE1_COMPLETED" != "true" ]; then
  echo "❌ ERROR: Phase 1 not marked as completed in context"
  exit 1
fi

# Extract key information
COMPONENTS_TO_TEST=$(echo "$COMPONENT_DESIGN" | jq -r '.components_to_create[].name')
COVERAGE_TARGET=$(echo "$TEST_SPECS" | jq -r '.coverage_target // 80')

echo "📊 Coverage target: $COVERAGE_TARGET%"
echo "🧩 Components to test: $COMPONENTS_TO_TEST"
```

### 2. Test Framework Detection

```bash
echo "🔍 Detecting testing framework..."

# Check package.json for testing setup
if [ -f "package.json" ]; then
  if grep -q "vitest" package.json; then
    TEST_FRAMEWORK="vitest"
    TEST_EXT=".test.ts"
    IMPORT_STYLE="vitest"
  elif grep -q "jest" package.json; then
    TEST_FRAMEWORK="jest"
    TEST_EXT=".test.ts"
    IMPORT_STYLE="jest"
  else
    echo "⚠️  No test framework detected - will create generic test structure"
    TEST_FRAMEWORK="generic"
    TEST_EXT=".test.ts"
    IMPORT_STYLE="generic"
  fi
else
  TEST_FRAMEWORK="generic"
  TEST_EXT=".test.ts"
  IMPORT_STYLE="generic"
fi

echo "🧪 Test framework: $TEST_FRAMEWORK"

# Initialize test manifest
TEST_MANIFEST="{
  \"test_framework\": \"$TEST_FRAMEWORK\",
  \"test_files\": [],
  \"test_utilities\": [],
  \"mock_files\": [],
  \"total_test_cases\": 0,
  \"coverage_target\": $COVERAGE_TARGET
}"

# Function to update manifest
update_manifest() {
  local FILE_PATH="$1"
  local FILE_TYPE="$2"
  local TEST_COUNT="$3"
  
  TEST_MANIFEST=$(echo "$TEST_MANIFEST" | jq \
    --arg path "$FILE_PATH" \
    --arg type "$FILE_TYPE" \
    --arg count "$TEST_COUNT" \
    '.test_files += [{
      path: $path,
      type: $type,
      test_count: ($count | tonumber)
    }] |
    .total_test_cases += ($count | tonumber)')
}
```

### 3. Create Test Structure

**CRITICAL**: The actual test implementation should be done by the AI based on the specific component requirements from the architect phase. Create test files that:

1. Follow the testing framework conventions detected above
2. Include all test scenarios from test_specifications.json
3. Cover edge cases and error conditions
4. Use proper mocking for external dependencies
5. Follow the project's existing test patterns

For each component in COMPONENTS_TO_TEST:
- Create comprehensive test suites
- Include unit tests, integration tests where specified
- Add proper test utilities and mock data
- Ensure tests will initially fail (TDD approach)

### 4. Generate Coverage Configuration

```bash
echo "📊 Creating coverage configuration..."

# Create coverage config based on framework
case "$TEST_FRAMEWORK" in
  "vitest")
    COVERAGE_CONFIG="{
      \"provider\": \"v8\",
      \"reporter\": [\"text\", \"json\", \"html\"],
      \"exclude\": [
        \"node_modules/\",
        \"test-utils/\",
        \"*.config.*\",
        \"*.d.ts\"
      ],
      \"include\": [
        \"app/**/*.{ts,tsx}\",
        \"components/**/*.{ts,tsx}\",
        \"lib/**/*.{ts,tsx}\"
      ],
      \"thresholds\": {
        \"lines\": $COVERAGE_TARGET,
        \"functions\": $COVERAGE_TARGET,
        \"branches\": $COVERAGE_TARGET,
        \"statements\": $COVERAGE_TARGET
      }
    }"
    ;;
  "jest")
    COVERAGE_CONFIG="{
      \"collectCoverageFrom\": [
        \"app/**/*.{ts,tsx}\",
        \"!app/**/*.d.ts\",
        \"!app/**/*.test.{ts,tsx}\"
      ],
      \"coverageThreshold\": {
        \"global\": {
          \"lines\": $COVERAGE_TARGET,
          \"functions\": $COVERAGE_TARGET,
          \"branches\": $COVERAGE_TARGET,
          \"statements\": $COVERAGE_TARGET
        }
      }
    }"
    ;;
  *)
    COVERAGE_CONFIG="{\"framework\": \"generic\", \"target\": $COVERAGE_TARGET}"
    ;;
esac

echo "$COVERAGE_CONFIG" > ".aidev-storage/tasks_output/$TASK_ID/phase_outputs/test_design/coverage_config.json"
```

### 5. Finalize Test Manifest

```bash
echo "📄 Finalizing test manifest..."

# Save the complete manifest
echo "$TEST_MANIFEST" > ".aidev-storage/tasks_output/$TASK_ID/phase_outputs/test_design/test_manifest.json"

# Create summary
TOTAL_TESTS=$(echo "$TEST_MANIFEST" | jq -r '.total_test_cases')
TOTAL_FILES=$(echo "$TEST_MANIFEST" | jq '.test_files | length')

echo "📊 Test Design Summary:"
echo "  - Total test files: $TOTAL_FILES"
echo "  - Total test cases: $TOTAL_TESTS"
echo "  - Coverage target: $COVERAGE_TARGET%"
echo "  - Test framework: $TEST_FRAMEWORK"
```

### 6. Update Shared Context

```bash
# Update context
UPDATED_CONTEXT=$(cat ".aidev-storage/tasks_output/$TASK_ID/context.json" | jq \
  --arg phase "test_design" \
  --arg tests "$TOTAL_TESTS" \
  --arg files "$TOTAL_FILES" \
  '.current_phase = $phase |
   .phases_completed += [$phase] |
   .phase_history += [{
     phase: $phase,
     completed_at: (now | strftime("%Y-%m-%dT%H:%M:%SZ")),
     success: true,
     key_outputs: {
       test_files_created: ($files | tonumber),
       test_cases_written: ($tests | tonumber),
       coverage_target: '$COVERAGE_TARGET'
     }
   }]')

echo "$UPDATED_CONTEXT" > "$TASK_OUTPUT_FOLDER/context.json"

# Record completion
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
echo "{\"timestamp\":\"$TIMESTAMP\",\"phase\":\"test_design\",\"decision\":\"test_suite_complete\",\"reasoning\":\"Created comprehensive test suite with $TOTAL_TESTS tests\"}" >> ".aidev-storage/tasks_output/$TASK_ID/decision_tree.jsonl"
```

### 7. Final Validation

```bash
echo "🔍 Verifying Phase 2 compliance..."

# Check that only test files were created
NON_TEST_FILES=$(find . -type f -newer ".aidev-storage/tasks_output/$TASK_ID/phase_outputs/.phase2_start_marker" \( -name "*.ts" -o -name "*.tsx" \) ! -name "*.test.*" ! -name "*.spec.*" ! -path "./test-utils/*" | grep -v ".aidev-storage" | wc -l)

if [ "$NON_TEST_FILES" -gt 0 ]; then
  echo "⚠️  Warning: Found $NON_TEST_FILES non-test source files"
  echo "Phase 2 should only create test files"
fi

echo "✅ Phase 2 completed successfully"
echo "🧪 Test suite created and ready"
echo "📋 All tests will initially fail (expected)"
echo "➡️  Ready for Phase 3: Implementation"
```

## Key Requirements

<phase2-constraints>
<test-only>
  This phase MUST:
  □ Create comprehensive test files
  □ Write tests that initially fail
  □ Cover all test specifications
  □ Include edge cases and errors
  □ Create test utilities and mocks
  
  This phase MUST NOT:
  □ Implement actual features
  □ Create non-test source files
  □ Make tests pass (no implementation)
  □ Skip any test scenarios
</test-only>

<tdd-principles>
  Follow Test-Driven Development:
  □ Red: Write failing tests
  □ Tests define the contract
  □ Tests guide implementation
  □ Comprehensive coverage
  □ Test behavior, not implementation
</tdd-principles>
</phase2-constraints>

## Success Criteria

Phase 2 is successful when:
- All test files are created
- Tests cover all specifications
- Tests will fail (no implementation yet)
- Mock data and utilities exist
- Test manifest is complete
- Coverage configuration is set