---
description: "Phase 4B: TEST FIXER - Automatically fixes failing tests and re-validates"
allowed-tools: ["Read", "Edit", "MultiEdit", "Bash", "Grep", "Glob", "LS", "Write", "TodoWrite"]
disallowed-tools: ["git", "WebFetch", "WebSearch", "Task", "NotebookRead", "NotebookEdit"]
---

# Command: aidev-code-phase4B

# 🔧 CRITICAL: PHASE 4B = AUTOMATIC TEST FIXING 🔧

**YOU ARE IN PHASE 4B OF 7:**
- **Phase 0 (DONE)**: Inventory completed
- **Phase 1 (DONE)**: Architecture designed
- **Phase 2 (DONE)**: Tests created
- **Phase 3 (DONE)**: Implementation completed
- **Phase 4A (DONE)**: Validation executed
- **Phase 4B (NOW)**: Fix failing tests automatically
- **Phase 5 (LATER)**: Final review

**PHASE 4B RESPONSIBILITIES:**
✅ Read Phase 4 validation results
✅ Identify failing tests
✅ Fix implementation to make tests pass
✅ Re-run tests to verify fixes
✅ Update implementation files only
✅ Track fixing progress with TodoWrite
❌ DO NOT modify test files
❌ DO NOT change test expectations
❌ DO NOT skip failing tests

<role-context>
You are a test fixing specialist in the multi-agent system. Your role is to automatically fix failing tests by updating the implementation code to meet test expectations.

**CRITICAL**: You fix implementation to match tests, not the other way around. Tests define the specification.
</role-context>

## Purpose
Phase 4B of the multi-agent pipeline. Automatically fixes failing tests by updating implementation code to meet test specifications.

## Process

### 0. Pre-Flight Check

**FIRST: Confirm Phase 4B constraints**
```bash
echo "===================================="
echo "🔧 PHASE 4B: TEST FIXER"
echo "===================================="
echo "✅ Will: Fix implementation for failing tests"
echo "✅ Will: Re-run tests to verify fixes"
echo "❌ Will NOT: Modify test files"
echo "❌ Will NOT: Change test expectations"
echo "===================================="

# Mark phase start
touch "$TASK_OUTPUT_FOLDER/phase_outputs/.phase4B_start_marker"
```

**SECOND: Parse parameters and verify Phase 4**
```bash
# Parse parameters
PARAMETERS_JSON='<extracted-json-from-prompt>'
TASK_FILENAME=$(echo "$PARAMETERS_JSON" | jq -r '.task_filename')
TASK_OUTPUT_FOLDER=$(echo "$PARAMETERS_JSON" | jq -r '.task_output_folder // empty')

if [ -z "$TASK_FILENAME" ] || [ "$TASK_FILENAME" = "null" ]; then
  echo "ERROR: task_filename not found in parameters"
  exit 1
fi

if [ -z "$TASK_OUTPUT_FOLDER" ] || [ "$TASK_OUTPUT_FOLDER" = "null" ]; then
  echo "ERROR: task_output_folder not found in parameters"
  exit 1
fi

# Load task
TASK_JSON=$(cat .aidev-storage/tasks/$TASK_FILENAME.json 2>/dev/null)
TASK_ID=$(echo "$TASK_JSON" | jq -r '.id')
TASK_NAME=$(echo "$TASK_JSON" | jq -r '.name')
TASK_TYPE=$(echo "$TASK_JSON" | jq -r '.type // "feature"')

echo "📋 Task: $TASK_ID - $TASK_NAME"

# Only proceed if this is a feature task (not pattern)
if [ "$TASK_TYPE" = "pattern" ]; then
  echo "✅ Pattern task - test fixing not applicable"
  echo "Skipping Phase 4B for pattern tasks"
  exit 0
fi

# Verify Phase 4 validation results exist
VALIDATE_PATH="$TASK_OUTPUT_FOLDER/phase_outputs/validate"
if [ ! -f "$VALIDATE_PATH/validation_summary.json" ]; then
  echo "❌ ERROR: Phase 4 validation summary not found"
  echo "Phase 4 must complete before test fixing"
  exit 1
fi

# Check if tests failed
VALIDATION_SUMMARY=$(cat "$VALIDATE_PATH/validation_summary.json")
TEST_PASSED=$(echo "$VALIDATION_SUMMARY" | jq -r '.checks.tests.passed')
FAILING_TESTS=$(echo "$VALIDATION_SUMMARY" | jq -r '.checks.tests.failing')

if [ "$TEST_PASSED" = "true" ] || [ "$FAILING_TESTS" = "0" ]; then
  echo "✅ All tests are passing - no fixes needed"
  echo "Skipping Phase 4B as tests are already passing"
  
  # Update context to mark phase as completed
  UPDATED_CONTEXT=$(cat "$TASK_OUTPUT_FOLDER/context.json" | jq \
    --arg phase "test_fix" \
    '.current_phase = $phase |
     .phases_completed += [$phase] |
     .phase_history += [{
       phase: $phase,
       completed_at: (now | strftime("%Y-%m-%dT%H:%M:%SZ")),
       success: true,
       key_outputs: {
         tests_needed_fixing: false,
         fixes_applied: 0
       }
     }]')
  
  echo "$UPDATED_CONTEXT" > "$TASK_OUTPUT_FOLDER/context.json"
  exit 0
fi

echo "❌ Found $FAILING_TESTS failing tests - proceeding with automatic fixes"

# Create fix tracking directory
FIX_OUTPUT_PATH="$TASK_OUTPUT_FOLDER/phase_outputs/test_fix"
mkdir -p "$FIX_OUTPUT_PATH"

# Initialize fix tracking
echo '{"fixes": [], "iterations": 0, "start_time": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'"}' > "$FIX_OUTPUT_PATH/fix_tracking.json"
```

### 1. Analyze Test Failures

#### CRITICAL: Todo Management with TodoWrite Tool

**YOU MUST USE THE TodoWrite TOOL FOR ALL TODO OPERATIONS:**
1. Use TodoWrite tool to create initial todos (5 test fix todos)
2. Use TodoWrite tool to update status for EVERY change
3. Before phase ends, use TodoWrite tool to ensure ALL todos are marked as completed

```bash
echo "🔍 Analyzing test failures..."

# Use TodoWrite tool to create todo list for fixing
# Create 5 todos: identify failures, analyze specs, fix implementation, re-run tests, document fixes

# Use TodoWrite tool to mark first todo as in progress
# Update todo ID 1 status to "in_progress"
```

Now use the Read tool to examine test results:
```bash
# Read test output
cat "$VALIDATE_PATH/test_results.txt" > "$FIX_OUTPUT_PATH/original_test_output.txt"

# Extract failing test details
echo "Extracting failing test information..."
```

Then analyze each failing test:
- Read the test file to understand expectations
- Read the implementation file being tested
- Identify the mismatch between expected and actual behavior
- Create a fix plan

### 2. Apply Fixes Iteratively

For each failing test:

```bash
# Mark fixing todo as in progress
# Use TodoWrite tool to mark todo as in progress
# Update todo ID 3 status to "in_progress"

# Track current iteration
ITERATION=$(jq -r '.iterations' "$FIX_OUTPUT_PATH/fix_tracking.json")
ITERATION=$((ITERATION + 1))

echo "🔧 Starting fix iteration $ITERATION..."
```

Use MultiEdit to fix implementation files based on test expectations:
- Update function logic to match test assertions
- Fix return values to match expected outputs
- Add missing error handling
- Correct data transformations

After each fix:
```bash
# Document the fix
FIX_RECORD='{
  "iteration": '$ITERATION',
  "timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'",
  "test_name": "<test-name>",
  "file_fixed": "<file-path>",
  "fix_description": "<what-was-fixed>"
}'

# Add to tracking
jq --argjson fix "$FIX_RECORD" '.fixes += [$fix] | .iterations = '$ITERATION "$FIX_OUTPUT_PATH/fix_tracking.json" > "$FIX_OUTPUT_PATH/fix_tracking.json.tmp"
mv "$FIX_OUTPUT_PATH/fix_tracking.json.tmp" "$FIX_OUTPUT_PATH/fix_tracking.json"
```

### 3. Re-run Tests After Fixes

```bash
echo "🧪 Re-running tests to verify fixes..."

# Mark re-run todo as in progress
# Use TodoWrite tool to mark todo as in progress
# Update todo ID 4 status to "in_progress"

# Run tests again
if grep -q "vitest" package.json 2>/dev/null; then
  npm run test > "$FIX_OUTPUT_PATH/test_results_iteration_$ITERATION.txt" 2>&1
  TEST_EXIT_CODE=$?
elif grep -q "jest" package.json 2>/dev/null; then
  npm test > "$FIX_OUTPUT_PATH/test_results_iteration_$ITERATION.txt" 2>&1
  TEST_EXIT_CODE=$?
else
  npm test > "$FIX_OUTPUT_PATH/test_results_iteration_$ITERATION.txt" 2>&1
  TEST_EXIT_CODE=$?
fi

# Check if tests now pass
if [ $TEST_EXIT_CODE -eq 0 ]; then
  echo "✅ All tests now passing!"
  FIXES_COMPLETE=true
else
  # Check if we made progress
  NEW_FAILING=$(grep -c "failed" "$FIX_OUTPUT_PATH/test_results_iteration_$ITERATION.txt" || echo "0")
  
  if [ $NEW_FAILING -lt $FAILING_TESTS ]; then
    echo "📈 Progress made: $NEW_FAILING tests still failing (was $FAILING_TESTS)"
    FAILING_TESTS=$NEW_FAILING
    
    # Continue fixing if under iteration limit
    if [ $ITERATION -lt 5 ]; then
      echo "Continuing with next iteration..."
      # Loop back to step 2
    else
      echo "⚠️ Reached maximum iterations (5) - stopping"
      FIXES_COMPLETE=true
    fi
  else
    echo "❌ No progress made - stopping fixes"
    FIXES_COMPLETE=true
  fi
fi
```

### 4. Generate Fix Report

```bash
echo "📄 Generating fix report..."

# Mark documentation todo as in progress
# Use TodoWrite tool to mark todo as in progress
# Update todo ID 5 status to "in_progress"

# Get final test results
if [ $TEST_EXIT_CODE -eq 0 ]; then
  FINAL_STATUS="✅ All tests passing"
  REMAINING_FAILURES=0
else
  FINAL_STATUS="⚠️ Some tests still failing"
  REMAINING_FAILURES=$NEW_FAILING
fi

# Create fix report
cat > "$FIX_OUTPUT_PATH/test_fix_report.md" << EOF
# Test Fix Report

**Task**: $TASK_ID - $TASK_NAME
**Date**: $(date -u +"%Y-%m-%d %H:%M:%S UTC")

## Summary

- **Initial Failing Tests**: $FAILING_TESTS
- **Fix Iterations**: $ITERATION
- **Final Status**: $FINAL_STATUS
- **Remaining Failures**: $REMAINING_FAILURES

## Fixes Applied

$(jq -r '.fixes[] | "### Iteration \(.iteration)\n- **Test**: \(.test_name)\n- **File**: \(.file_fixed)\n- **Fix**: \(.fix_description)\n- **Time**: \(.timestamp)\n"' "$FIX_OUTPUT_PATH/fix_tracking.json")

## Test Results

### Before Fixes
- Failing Tests: $FAILING_TESTS
- Exit Code: Non-zero

### After Fixes
- Failing Tests: $REMAINING_FAILURES
- Exit Code: $([ $TEST_EXIT_CODE -eq 0 ] && echo "0 (Success)" || echo "$TEST_EXIT_CODE (Failed)")

## Files Modified

$(find . -name "*.ts" -o -name "*.tsx" -newer "$TASK_OUTPUT_FOLDER/phase_outputs/.phase4B_start_marker" | grep -v ".aidev-storage" | grep -v "test" | sort | uniq | sed 's/^/- /')

## Next Steps

$([ $TEST_EXIT_CODE -eq 0 ] && echo "✅ All tests passing - ready for final review" || echo "⚠️ Manual intervention needed for remaining $REMAINING_FAILURES failing tests")

---
Generated by Test Fix Phase (4B)
EOF

# Create JSON summary
cat > "$FIX_OUTPUT_PATH/fix_summary.json" << EOF
{
  "task_id": "$TASK_ID",
  "fix_date": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "initial_failures": $FAILING_TESTS,
  "iterations": $ITERATION,
  "fixes_applied": $(jq '.fixes | length' "$FIX_OUTPUT_PATH/fix_tracking.json"),
  "final_status": $([ $TEST_EXIT_CODE -eq 0 ] && echo "\"all_passing\"" || echo "\"partial_fix\""),
  "remaining_failures": $REMAINING_FAILURES,
  "success": $([ $TEST_EXIT_CODE -eq 0 ] && echo "true" || echo "false")
}
EOF

# Use TodoWrite tool to mark documentation todo as completed
# Update todo ID 5 status to "completed"
```

### 5. Update Context

```bash
# Update context with test fix results
UPDATED_CONTEXT=$(cat "$TASK_OUTPUT_FOLDER/context.json" | jq \
  --arg phase "test_fix" \
  --arg success "$([ $TEST_EXIT_CODE -eq 0 ] && echo "true" || echo "false")" \
  --arg fixes "$(jq '.fixes | length' "$FIX_OUTPUT_PATH/fix_tracking.json")" \
  --arg remaining "$REMAINING_FAILURES" \
  '.current_phase = $phase |
   .phases_completed += [$phase] |
   .phase_history += [{
     phase: $phase,
     completed_at: (now | strftime("%Y-%m-%dT%H:%M:%SZ")),
     success: ($success == "true"),
     key_outputs: {
       tests_needed_fixing: true,
       fixes_applied: ($fixes | tonumber),
       iterations: '$ITERATION',
       remaining_failures: ($remaining | tonumber),
       all_tests_passing: ($success == "true")
     }
   }]')

echo "$UPDATED_CONTEXT" > "$TASK_OUTPUT_FOLDER/context.json"

# Record in decision tree
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
echo "{\"timestamp\":\"$TIMESTAMP\",\"phase\":\"test_fix\",\"action\":\"fixes_complete\",\"success\":$([ $TEST_EXIT_CODE -eq 0 ] && echo "true" || echo "false"),\"details\":{\"fixes_applied\":$(jq '.fixes | length' "$FIX_OUTPUT_PATH/fix_tracking.json"),\"iterations\":$ITERATION,\"remaining_failures\":$REMAINING_FAILURES}}" >> "$TASK_OUTPUT_FOLDER/decision_tree.jsonl"
```

### 6. Final Todo Completion

**CRITICAL: Before phase completion, ensure ALL todos are marked as completed using TodoWrite tool**

```bash
echo "📝 Finalizing todo status..."

# IMPORTANT: Use TodoWrite tool to ensure all todos are marked as completed
# This is REQUIRED for phase success determination
# All 5 test fix todos should be marked as completed
```

### 7. Final Summary

```bash
echo ""
echo "===================================="
echo "🔧 TEST FIXING COMPLETE"
echo "===================================="
echo ""
echo "Results:"
echo "  - Initial Failures: $FAILING_TESTS"
echo "  - Fixes Applied: $(jq '.fixes | length' "$FIX_OUTPUT_PATH/fix_tracking.json")"
echo "  - Iterations: $ITERATION"
echo "  - Final Status: $FINAL_STATUS"
echo ""
if [ $TEST_EXIT_CODE -eq 0 ]; then
  echo "✅ All tests are now passing!"
  echo "➡️ Ready for Phase 5: Final Review"
else
  echo "⚠️ $REMAINING_FAILURES tests still failing"
  echo "Manual intervention may be required"
fi
```

## Key Requirements

<phase4B-constraints>
<fix-only>
  This phase MUST:
  □ Fix implementation to match test expectations
  □ Re-run tests after each fix
  □ Track all fixes applied
  □ Stop after 5 iterations maximum
  □ Document all changes
  
  This phase MUST NOT:
  □ Modify test files
  □ Change test expectations
  □ Skip or disable tests
  □ Add new features
</fix-only>

<iteration-limits>
  Maximum 5 fix iterations:
  □ Stop if all tests pass
  □ Stop if no progress made
  □ Stop after 5 iterations
  □ Document remaining issues
</iteration-limits>
</phase4B-constraints>

## Success Criteria

Phase 4B is successful when:
- All failing tests are fixed OR
- Maximum iterations reached with progress documented
- All fixes are tracked and reported
- Implementation matches test specifications
- Fix report generated
- **ALL TODOS MARKED AS COMPLETED using TodoWrite tool**