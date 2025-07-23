---
description: "Phase 4A: TEST EXECUTOR - Runs comprehensive validation and quality checks"
allowed-tools: ["Read", "Bash", "Grep", "Glob", "LS", "Write", "TodoWrite"]
disallowed-tools: ["Edit", "MultiEdit", "git", "WebFetch", "WebSearch", "Task", "NotebookRead", "NotebookEdit"]
---

# Command: aidev-code-phase4a

# 🧪 CRITICAL: PHASE 4A = TEST EXECUTION & VALIDATION 🧪

**YOU ARE IN PHASE 4A OF 7:**
- **Phase 0 (DONE)**: Inventory completed
- **Phase 1 (DONE)**: Architecture designed
- **Phase 2 (DONE)**: Tests created
- **Phase 3 (DONE)**: Implementation completed
- **Phase 4A (NOW)**: Execute comprehensive validation
- **Phase 4B (LATER)**: Fix failing tests automatically (if needed)
- **Phase 5 (LATER)**: Final review

**PHASE 4A RESPONSIBILITIES:**
✅ Run all test suites with coverage
✅ Execute linting and type checking
✅ Verify build process
✅ Run security scans
✅ Check performance metrics
✅ Generate quality reports
❌ DO NOT modify implementation
❌ DO NOT change core functionality

<role-context>
You are a test execution specialist in the multi-agent system. Your role is to thoroughly validate the implementation, ensuring quality standards are met and providing comprehensive reports.

**CRITICAL**: You validate but do not fix. Document all findings for the reviewer.
</role-context>

## Purpose
Phase 4A of the multi-agent pipeline. Executes comprehensive validation including tests, coverage, linting, type checking, security scans, and performance checks.

## Process

### 0. Pre-Flight Check

**FIRST: Confirm Phase 4A constraints**
```bash
echo "===================================="
echo "🧪 PHASE 4A: TEST EXECUTOR"
echo "===================================="
echo "✅ Will: Run comprehensive validation"
echo "✅ Will: Generate quality reports"
echo "❌ Will NOT: Modify implementation"
echo "===================================="

# Mark phase start
touch "$TASK_OUTPUT_FOLDER/phase_outputs/.phase4_start_marker"
```

**SECOND: Parse parameters and verify Phase 3**
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

echo "📋 Task: $TASK_ID - $TASK_NAME"

# Verify Phase 3 completed
IMPLEMENT_PATH="$TASK_OUTPUT_FOLDER/phase_outputs/implement"
if [ ! -d "$IMPLEMENT_PATH" ]; then
  echo "❌ ERROR: Phase 3 implementation directory not found"
  echo "Phase 3 (Programmer) must complete before validation"
  exit 1
fi

if [ ! -f "$IMPLEMENT_PATH/implementation_summary.json" ]; then
  echo "❌ ERROR: Phase 3 implementation summary not found"
  echo "Phase 3 must generate implementation_summary.json"
  exit 1
fi

# Verify context exists and check previous phases
if [ ! -f "$TASK_OUTPUT_FOLDER/context.json" ]; then
  echo "❌ ERROR: Context file missing"
  exit 1
fi

CONTEXT=$(cat "$TASK_OUTPUT_FOLDER/context.json")
PHASE3_COMPLETED=$(echo "$CONTEXT" | jq -r '.phases_completed | contains(["implement"])')
if [ "$PHASE3_COMPLETED" != "true" ]; then
  echo "❌ ERROR: Phase 3 not marked as completed in context"
  echo "Phase 3 (Programmer) must complete successfully before validation"
  exit 1
fi

# Verify other required phase outputs
if [ ! -d "$TASK_OUTPUT_FOLDER/phase_outputs/architect" ]; then
  echo "❌ ERROR: Architect phase outputs missing"
  exit 1
fi

# Verify test design phase
if [ ! -d "$TASK_OUTPUT_FOLDER/phase_outputs/test_design" ]; then
  echo "❌ ERROR: Test design phase outputs missing"
  exit 1
fi

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

if [ ! -d "$TASK_OUTPUT_FOLDER/phase_outputs/validate" ]; then
  echo "❌ ERROR: Validation output directory missing: $TASK_OUTPUT_FOLDER/phase_outputs/validate"
  exit 1
fi

# Get task type
TASK_TYPE=$(echo "$TASK_JSON" | jq -r '.type // "feature"')

# Initialize validation checklist based on task type
if [ "$TASK_TYPE" = "pattern" ]; then
  TODO_LIST='[
    {"content": "Validate pattern implementation", "status": "pending", "priority": "high", "id": "1"},
    {"content": "Verify usage examples", "status": "pending", "priority": "high", "id": "2"},
    {"content": "Run type checking", "status": "pending", "priority": "high", "id": "3"},
    {"content": "Check code style", "status": "pending", "priority": "medium", "id": "4"},
    {"content": "Generate quality report", "status": "pending", "priority": "low", "id": "5"}
  ]'
else
  TODO_LIST='[
    {"content": "Run test suite with coverage", "status": "pending", "priority": "high", "id": "1"},
    {"content": "Execute linting checks", "status": "pending", "priority": "high", "id": "2"},
    {"content": "Run type checking", "status": "pending", "priority": "high", "id": "3"},
    {"content": "Verify build process", "status": "pending", "priority": "high", "id": "4"},
    {"content": "Run security scans", "status": "pending", "priority": "medium", "id": "5"},
    {"content": "Check performance metrics", "status": "pending", "priority": "medium", "id": "6"},
    {"content": "Generate quality report", "status": "pending", "priority": "low", "id": "7"}
  ]'
fi
```

### 1. Test Suite Execution with Coverage

#### CRITICAL: Todo Management with TodoWrite Tool

**YOU MUST USE THE TodoWrite TOOL FOR ALL TODO OPERATIONS:**
1. Use TodoWrite tool to create initial todos (7 validation todos)
2. Use TodoWrite tool to update status for EVERY change
3. Before phase ends, use TodoWrite tool to ensure ALL todos are marked as completed

```bash
echo "🧪 Running comprehensive test suite..."

# Use TodoWrite tool to mark todo as in progress
# Update todo ID 1 status to "in_progress"

# Get task type
TASK_TYPE=$(echo "$TASK_JSON" | jq -r '.type // "feature"')

# Handle different task types
if [ "$TASK_TYPE" = "pattern" ]; then
  echo "🎯 Pattern task - validating pattern implementation"
  
  # Find pattern files
  PATTERN_FILES=$(find . -type f \( -name "*.ts" -o -name "*.tsx" \) -newer "$TASK_OUTPUT_FOLDER/phase_outputs/.phase3_start_marker" | grep -v ".aidev-storage" | grep -v "test")
  
  if [ ! -z "$PATTERN_FILES" ]; then
    echo "✅ Found pattern implementation"
    
    # Validate pattern files
    for FILE in $PATTERN_FILES; do
      echo "Pattern file: $FILE"
      
      if [ -s "$FILE" ]; then
        echo "  ✅ Pattern file has content"
        TEST_EXIT_CODE=0
      else
        echo "  ❌ Pattern file is empty"
        TEST_EXIT_CODE=1
      fi
      
      # Check for example/usage
      if grep -q "Example\|example\|Usage\|usage" "$FILE"; then
        echo "  ✅ Contains usage example"
      else
        echo "  ⚠️  Missing usage example"
      fi
    done
    
    TOTAL_TESTS="Pattern Validation"
    PASSING_TESTS=$([ $TEST_EXIT_CODE -eq 0 ] && echo "1" || echo "0")
    FAILING_TESTS=$([ $TEST_EXIT_CODE -eq 0 ] && echo "0" || echo "1")
    COVERAGE="N/A"
  else
    echo "❌ No pattern files found"
    TEST_EXIT_CODE=1
    TOTAL_TESTS="0"
    PASSING_TESTS="0"
    FAILING_TESTS="1"
  fi
  
else
  # Feature task - run actual tests
  # Detect test framework and run with coverage
  if grep -q "vitest" package.json 2>/dev/null; then
    echo "Running Vitest with coverage..."
    npm run test -- --coverage > "$TASK_OUTPUT_FOLDER/phase_outputs/validate/test_results.txt" 2>&1
    TEST_EXIT_CODE=$?
    
    # Extract coverage summary
    if [ -f "coverage/coverage-summary.json" ]; then
      cp coverage/coverage-summary.json "$TASK_OUTPUT_FOLDER/phase_outputs/validate/coverage_summary.json"
    fi
  elif grep -q "jest" package.json 2>/dev/null; then
    echo "Running Jest with coverage..."
    npm test -- --coverage > "$TASK_OUTPUT_FOLDER/phase_outputs/validate/test_results.txt" 2>&1
    TEST_EXIT_CODE=$?
  else
    echo "⚠️  No test framework detected - checking for manual test commands"
    
    # Check if test script exists in package.json
    if grep -q '"test":' package.json 2>/dev/null; then
      echo "Running npm test..."
      npm test > "$TASK_OUTPUT_FOLDER/phase_outputs/validate/test_results.txt" 2>&1
      TEST_EXIT_CODE=$?
    else
      echo "⚠️  No test script found - skipping test execution"
      TEST_EXIT_CODE=0
      TOTAL_TESTS="0"
      PASSING_TESTS="0"
      FAILING_TESTS="0"
    fi
  fi
fi

# Analyze results for feature tasks
if [ "$TASK_TYPE" = "feature" ] && [ -f "$TASK_OUTPUT_FOLDER/phase_outputs/validate/test_results.txt" ]; then
  TOTAL_TESTS=$(grep -E "(passed|failed)" "$TASK_OUTPUT_FOLDER/phase_outputs/validate/test_results.txt" | wc -l)
  PASSING_TESTS=$(grep -c "passed" "$TASK_OUTPUT_FOLDER/phase_outputs/validate/test_results.txt" || echo "0")
  FAILING_TESTS=$(grep -c "failed" "$TASK_OUTPUT_FOLDER/phase_outputs/validate/test_results.txt" || echo "0")
fi

echo "📊 Test Results:"
echo "  - Total: $TOTAL_TESTS"
echo "  - Passing: $PASSING_TESTS"
echo "  - Failing: $FAILING_TESTS"

# Extract coverage if available
if [ -f "$TASK_OUTPUT_FOLDER/phase_outputs/validate/coverage_summary.json" ]; then
  COVERAGE=$(jq -r '.total.lines.pct' "$TASK_OUTPUT_FOLDER/phase_outputs/validate/coverage_summary.json")
  echo "  - Coverage: $COVERAGE%"
fi

# Mark todo as completed
# Use TodoWrite tool to mark todo as completed
# Update todo ID 1 status to "completed"

# Record result
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
echo "{\"timestamp\":\"$TIMESTAMP\",\"phase\":\"validate\",\"check\":\"tests\",\"passed\":$([ $TEST_EXIT_CODE -eq 0 ] && echo "true" || echo "false"),\"details\":{\"total\":$TOTAL_TESTS,\"passing\":$PASSING_TESTS,\"failing\":$FAILING_TESTS}}" >> "$TASK_OUTPUT_FOLDER/decision_tree.jsonl"
```

### 2. Linting Validation

```bash
echo "🔍 Running ESLint checks..."

# Mark todo as in progress
# Use TodoWrite tool to mark todo as in progress
# Update todo ID 2 status to "in_progress"

# Run linting
npm run lint > "$TASK_OUTPUT_FOLDER/phase_outputs/validate/lint_results.txt" 2>&1
LINT_EXIT_CODE=$?

# Count issues
LINT_ERRORS=$(grep -c "error" "$TASK_OUTPUT_FOLDER/phase_outputs/validate/lint_results.txt" || echo "0")
LINT_WARNINGS=$(grep -c "warning" "$TASK_OUTPUT_FOLDER/phase_outputs/validate/lint_results.txt" || echo "0")

echo "📋 Lint Results:"
echo "  - Errors: $LINT_ERRORS"
echo "  - Warnings: $LINT_WARNINGS"
echo "  - Status: $([ $LINT_EXIT_CODE -eq 0 ] && echo "✅ Clean" || echo "❌ Issues found")"

# Mark todo as completed
# Use TodoWrite tool to mark todo as completed
# Update todo ID 2 status to "completed"

# Record result
echo "{\"timestamp\":\"$TIMESTAMP\",\"phase\":\"validate\",\"check\":\"lint\",\"passed\":$([ $LINT_EXIT_CODE -eq 0 ] && echo "true" || echo "false"),\"details\":{\"errors\":$LINT_ERRORS,\"warnings\":$LINT_WARNINGS}}" >> "$TASK_OUTPUT_FOLDER/decision_tree.jsonl"
```

### 3. Type Checking

```bash
echo "📐 Running TypeScript type checking..."

# Mark todo as in progress
# Use TodoWrite tool to mark todo as in progress
# Update todo ID 3 status to "in_progress"

# Run type checking
npm run type-check > "$TASK_OUTPUT_FOLDER/phase_outputs/validate/typecheck_results.txt" 2>&1
TYPECHECK_EXIT_CODE=$?

# Count type errors
TYPE_ERRORS=$(grep -c "error TS" "$TASK_OUTPUT_FOLDER/phase_outputs/validate/typecheck_results.txt" || echo "0")

echo "🔤 Type Check Results:"
echo "  - Type Errors: $TYPE_ERRORS"
echo "  - Status: $([ $TYPECHECK_EXIT_CODE -eq 0 ] && echo "✅ Type safe" || echo "❌ Type errors")"

# Check for 'any' usage
ANY_COUNT=$(grep -r "any" --include="*.ts" --include="*.tsx" --exclude-dir="node_modules" . | grep -v "// eslint-disable" | wc -l)
echo "  - Uses of 'any': $ANY_COUNT"

# Mark todo as completed
# Use TodoWrite tool to mark todo as completed
# Update todo ID 3 status to "completed"

# Record result
echo "{\"timestamp\":\"$TIMESTAMP\",\"phase\":\"validate\",\"check\":\"types\",\"passed\":$([ $TYPECHECK_EXIT_CODE -eq 0 ] && echo "true" || echo "false"),\"details\":{\"errors\":$TYPE_ERRORS,\"any_usage\":$ANY_COUNT}}" >> "$TASK_OUTPUT_FOLDER/decision_tree.jsonl"
```

### 4. Build Verification

```bash
echo "🏗️ Verifying build process..."

# Mark todo as in progress
# Use TodoWrite tool to mark todo as in progress
# Update todo ID 4 status to "in_progress"

# Clean previous builds
if [ -d ".next" ]; then
  rm -rf .next
fi
if [ -d "dist" ]; then
  rm -rf dist
fi

# Run build
BUILD_START=$(date +%s)
npm run build > "$TASK_OUTPUT_FOLDER/phase_outputs/validate/build_results.txt" 2>&1
BUILD_EXIT_CODE=$?
BUILD_END=$(date +%s)
BUILD_TIME=$((BUILD_END - BUILD_START))

echo "🔨 Build Results:"
echo "  - Status: $([ $BUILD_EXIT_CODE -eq 0 ] && echo "✅ Success" || echo "❌ Failed")"
echo "  - Build time: ${BUILD_TIME}s"

# Check bundle size if build succeeded
if [ $BUILD_EXIT_CODE -eq 0 ] && [ -d ".next" ]; then
  BUNDLE_SIZE=$(du -sh .next | cut -f1)
  echo "  - Bundle size: $BUNDLE_SIZE"
fi

# Mark todo as completed
# Use TodoWrite tool to mark todo as completed
# Update todo ID 4 status to "completed"

# Record result
echo "{\"timestamp\":\"$TIMESTAMP\",\"phase\":\"validate\",\"check\":\"build\",\"passed\":$([ $BUILD_EXIT_CODE -eq 0 ] && echo "true" || echo "false"),\"details\":{\"build_time\":$BUILD_TIME,\"bundle_size\":\"$BUNDLE_SIZE\"}}" >> "$TASK_OUTPUT_FOLDER/decision_tree.jsonl"
```

### 5. Security Validation

```bash
echo "🔒 Running security checks..."

# Mark todo as in progress
# Use TodoWrite tool to mark todo as in progress
# Update todo ID 5 status to "in_progress"

# Initialize security report
SECURITY_ISSUES=0

# Check for hardcoded secrets
echo "Checking for exposed secrets..."
SECRETS_FOUND=$(grep -r "api[_-]?key\|secret\|password\|token" \
  --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" \
  --exclude-dir="node_modules" --exclude-dir=".next" . | \
  grep -v "process.env" | \
  grep -v "// " | \
  wc -l)

if [ $SECRETS_FOUND -gt 0 ]; then
  echo "⚠️  Found $SECRETS_FOUND potential hardcoded secrets"
  SECURITY_ISSUES=$((SECURITY_ISSUES + SECRETS_FOUND))
fi

# Check for dangerous patterns
echo "Checking for dangerous patterns..."
DANGEROUS_HTML=$(grep -r "dangerouslySetInnerHTML" --include="*.tsx" --exclude-dir="node_modules" . | wc -l)
if [ $DANGEROUS_HTML -gt 0 ]; then
  echo "⚠️  Found $DANGEROUS_HTML uses of dangerouslySetInnerHTML"
  SECURITY_ISSUES=$((SECURITY_ISSUES + DANGEROUS_HTML))
fi

# Check for eval usage
EVAL_USAGE=$(grep -r "eval(" --include="*.ts" --include="*.tsx" --include="*.js" --exclude-dir="node_modules" . | wc -l)
if [ $EVAL_USAGE -gt 0 ]; then
  echo "⚠️  Found $EVAL_USAGE uses of eval()"
  SECURITY_ISSUES=$((SECURITY_ISSUES + EVAL_USAGE))
fi

# Check npm audit
echo "Running npm audit..."
npm audit --json > "$TASK_OUTPUT_FOLDER/phase_outputs/validate/npm_audit.json" 2>&1 || true
VULNERABILITIES=$(jq -r '.metadata.vulnerabilities.total // 0' "$TASK_OUTPUT_FOLDER/phase_outputs/validate/npm_audit.json")

echo "🔐 Security Results:"
echo "  - Hardcoded secrets: $SECRETS_FOUND"
echo "  - Dangerous HTML: $DANGEROUS_HTML"
echo "  - Eval usage: $EVAL_USAGE"
echo "  - NPM vulnerabilities: $VULNERABILITIES"
echo "  - Total issues: $((SECURITY_ISSUES + VULNERABILITIES))"

# Mark todo as completed
# Use TodoWrite tool to mark todo as completed
# Update todo ID 5 status to "completed"

# Record result
echo "{\"timestamp\":\"$TIMESTAMP\",\"phase\":\"validate\",\"check\":\"security\",\"passed\":$([ $SECURITY_ISSUES -eq 0 ] && echo "true" || echo "false"),\"details\":{\"secrets\":$SECRETS_FOUND,\"dangerous_html\":$DANGEROUS_HTML,\"eval\":$EVAL_USAGE,\"vulnerabilities\":$VULNERABILITIES}}" >> "$TASK_OUTPUT_FOLDER/decision_tree.jsonl"
```

### 6. Performance Metrics

```bash
echo "📊 Checking performance metrics..."

# Mark todo as in progress
# Use TodoWrite tool to mark todo as in progress
# Update todo ID 6 status to "in_progress"

# Initialize performance report
PERF_ISSUES=0

# Check for console.log statements
CONSOLE_LOGS=$(grep -r "console.log" --include="*.ts" --include="*.tsx" --exclude-dir="node_modules" --exclude="*.test.*" . | wc -l)
if [ $CONSOLE_LOGS -gt 0 ]; then
  echo "⚠️  Found $CONSOLE_LOGS console.log statements"
  PERF_ISSUES=$((PERF_ISSUES + CONSOLE_LOGS))
fi

# Check for large dependencies
if [ -d "node_modules" ]; then
  LARGE_DEPS=$(find node_modules -name "*.js" -size +1M | wc -l)
  echo "📦 Found $LARGE_DEPS large JavaScript files (>1MB)"
fi

# Check for unoptimized images (simplified check)
UNOPTIMIZED_IMAGES=$(find . -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" | grep -v node_modules | grep -v ".next" | wc -l)
echo "🖼️  Found $UNOPTIMIZED_IMAGES image files to check for optimization"

# Analyze component complexity
COMPLEX_COMPONENTS=$(find . -name "*.tsx" -exec wc -l {} \; | awk '$1 > 300 {count++} END {print count+0}')
echo "📐 Found $COMPLEX_COMPONENTS components with >300 lines"

echo "⚡ Performance Metrics:"
echo "  - Console.logs: $CONSOLE_LOGS"
echo "  - Large deps: $LARGE_DEPS"
echo "  - Images to optimize: $UNOPTIMIZED_IMAGES"
echo "  - Complex components: $COMPLEX_COMPONENTS"

# Mark todo as completed
# Use TodoWrite tool to mark todo as completed
# Update todo ID 6 status to "completed"

# Record result
echo "{\"timestamp\":\"$TIMESTAMP\",\"phase\":\"validate\",\"check\":\"performance\",\"passed\":$([ $PERF_ISSUES -eq 0 ] && echo "true" || echo "false"),\"details\":{\"console_logs\":$CONSOLE_LOGS,\"large_deps\":$LARGE_DEPS,\"complex_components\":$COMPLEX_COMPONENTS}}" >> "$TASK_OUTPUT_FOLDER/decision_tree.jsonl"
```

### 7. Generate Comprehensive Quality Report

```bash
echo "📄 Generating quality report..."

# Mark todo as in progress
# Use TodoWrite tool to mark todo as in progress
# Update todo ID 7 status to "in_progress"

# Create comprehensive report
cat > "$TASK_OUTPUT_FOLDER/phase_outputs/validate/quality_report.md" << EOF
# Quality Validation Report
**Task**: $TASK_ID - $TASK_NAME
**Date**: $(date -u +"%Y-%m-%d %H:%M:%S UTC")

## Executive Summary

### Overall Status: $([ $TEST_EXIT_CODE -eq 0 ] && [ $LINT_EXIT_CODE -eq 0 ] && [ $TYPECHECK_EXIT_CODE -eq 0 ] && [ $BUILD_EXIT_CODE -eq 0 ] && echo "✅ PASSED" || echo "❌ FAILED")

## Test Results
- **Test Suite**: $([ $TEST_EXIT_CODE -eq 0 ] && echo "✅ Passed" || echo "❌ Failed")
  - Total Tests: $TOTAL_TESTS
  - Passing: $PASSING_TESTS
  - Failing: $FAILING_TESTS
  - Coverage: ${COVERAGE:-N/A}%

## Code Quality
- **Linting**: $([ $LINT_EXIT_CODE -eq 0 ] && echo "✅ Clean" || echo "❌ Issues")
  - Errors: $LINT_ERRORS
  - Warnings: $LINT_WARNINGS

- **Type Safety**: $([ $TYPECHECK_EXIT_CODE -eq 0 ] && echo "✅ Type Safe" || echo "❌ Type Errors")
  - Type Errors: $TYPE_ERRORS
  - Uses of 'any': $ANY_COUNT

## Build & Deployment
- **Build Status**: $([ $BUILD_EXIT_CODE -eq 0 ] && echo "✅ Success" || echo "❌ Failed")
  - Build Time: ${BUILD_TIME}s
  - Bundle Size: ${BUNDLE_SIZE:-N/A}

## Security Analysis
- **Security Issues**: $((SECURITY_ISSUES + VULNERABILITIES))
  - Hardcoded Secrets: $SECRETS_FOUND
  - Dangerous HTML: $DANGEROUS_HTML
  - Eval Usage: $EVAL_USAGE
  - NPM Vulnerabilities: $VULNERABILITIES

## Performance Metrics
- Console.log Statements: $CONSOLE_LOGS
- Large Dependencies: $LARGE_DEPS
- Complex Components: $COMPLEX_COMPONENTS
- Images to Optimize: $UNOPTIMIZED_IMAGES

## Recommendations

### Critical Issues
$([ $FAILING_TESTS -gt 0 ] && echo "- Fix $FAILING_TESTS failing tests")
$([ $TYPE_ERRORS -gt 0 ] && echo "- Resolve $TYPE_ERRORS TypeScript errors")
$([ $BUILD_EXIT_CODE -ne 0 ] && echo "- Fix build errors")
$([ $SECRETS_FOUND -gt 0 ] && echo "- Remove $SECRETS_FOUND hardcoded secrets")

### Quality Improvements
$([ $LINT_WARNINGS -gt 0 ] && echo "- Address $LINT_WARNINGS lint warnings")
$([ $ANY_COUNT -gt 0 ] && echo "- Replace $ANY_COUNT uses of 'any' with proper types")
$([ $CONSOLE_LOGS -gt 0 ] && echo "- Remove $CONSOLE_LOGS console.log statements")
$([ $COMPLEX_COMPONENTS -gt 0 ] && echo "- Refactor $COMPLEX_COMPONENTS complex components")

## Validation Checklist

- [$([ $TEST_EXIT_CODE -eq 0 ] && echo "x" || echo " ")] All tests passing
- [$([ $LINT_EXIT_CODE -eq 0 ] && echo "x" || echo " ")] No lint errors
- [$([ $TYPECHECK_EXIT_CODE -eq 0 ] && echo "x" || echo " ")] No type errors
- [$([ $BUILD_EXIT_CODE -eq 0 ] && echo "x" || echo " ")] Build successful
- [$([ $SECURITY_ISSUES -eq 0 ] && echo "x" || echo " ")] No security issues
- [$([ ${COVERAGE:-0} -ge 80 ] && echo "x" || echo " ")] Coverage ≥ 80%

## Next Steps

1. Review all failing checks
2. Address critical issues first
3. Improve code quality metrics
4. Re-run validation after fixes

---
Generated by AI-Driven Development Pipeline
EOF

# Create JSON summary
cat > "$TASK_OUTPUT_FOLDER/phase_outputs/validate/validation_summary.json" << EOF
{
  "task_id": "$TASK_ID",
  "validation_date": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "overall_status": $([ $TEST_EXIT_CODE -eq 0 ] && [ $LINT_EXIT_CODE -eq 0 ] && [ $TYPECHECK_EXIT_CODE -eq 0 ] && [ $BUILD_EXIT_CODE -eq 0 ] && echo "\"passed\"" || echo "\"failed\""),
  "checks": {
    "tests": {
      "passed": $([ $TEST_EXIT_CODE -eq 0 ] && echo "true" || echo "false"),
      "total": $TOTAL_TESTS,
      "passing": $PASSING_TESTS,
      "failing": $FAILING_TESTS,
      "coverage": ${COVERAGE:-null}
    },
    "lint": {
      "passed": $([ $LINT_EXIT_CODE -eq 0 ] && echo "true" || echo "false"),
      "errors": $LINT_ERRORS,
      "warnings": $LINT_WARNINGS
    },
    "types": {
      "passed": $([ $TYPECHECK_EXIT_CODE -eq 0 ] && echo "true" || echo "false"),
      "errors": $TYPE_ERRORS,
      "any_usage": $ANY_COUNT
    },
    "build": {
      "passed": $([ $BUILD_EXIT_CODE -eq 0 ] && echo "true" || echo "false"),
      "time_seconds": $BUILD_TIME,
      "bundle_size": "${BUNDLE_SIZE:-null}"
    },
    "security": {
      "passed": $([ $SECURITY_ISSUES -eq 0 ] && echo "true" || echo "false"),
      "total_issues": $((SECURITY_ISSUES + VULNERABILITIES)),
      "details": {
        "secrets": $SECRETS_FOUND,
        "dangerous_html": $DANGEROUS_HTML,
        "eval": $EVAL_USAGE,
        "vulnerabilities": $VULNERABILITIES
      }
    },
    "performance": {
      "console_logs": $CONSOLE_LOGS,
      "large_deps": $LARGE_DEPS,
      "complex_components": $COMPLEX_COMPONENTS
    }
  },
  "todos_completed": 7
}
EOF

# Mark todo as completed
# Use TodoWrite tool to mark todo as completed
# Update todo ID 7 status to "completed"

echo "✅ Quality report generated"
```

### 8. Update Shared Context

```bash
# Update context
OVERALL_PASSED=$([ $TEST_EXIT_CODE -eq 0 ] && [ $LINT_EXIT_CODE -eq 0 ] && [ $TYPECHECK_EXIT_CODE -eq 0 ] && [ $BUILD_EXIT_CODE -eq 0 ] && echo "true" || echo "false")

UPDATED_CONTEXT=$(cat "$TASK_OUTPUT_FOLDER/context.json" | jq \
  --arg phase "validate" \
  --arg passed "$OVERALL_PASSED" \
  --arg coverage "${COVERAGE:-0}" \
  '.current_phase = $phase |
   .phases_completed += [$phase] |
   .phase_history += [{
     phase: $phase,
     completed_at: (now | strftime("%Y-%m-%dT%H:%M:%SZ")),
     success: true,
     key_outputs: {
       validation_passed: ($passed == "true"),
       test_coverage: ($coverage | tonumber),
       quality_report_generated: true
     }
   }]')

echo "$UPDATED_CONTEXT" > "$TASK_OUTPUT_FOLDER/context.json"
```

### 9. Final Todo Completion

**CRITICAL: Before phase completion, ensure ALL todos are marked as completed using TodoWrite tool**

```bash
echo "📝 Finalizing todo status..."

# IMPORTANT: Use TodoWrite tool to ensure all todos are marked as completed
# This is REQUIRED for phase success determination
# All 7 validation todos should be marked as completed
```

### 10. Final Summary

```bash
echo ""
echo "===================================="
echo "📊 VALIDATION COMPLETE"
echo "===================================="
echo ""
echo "Overall Status: $([ "$OVERALL_PASSED" = "true" ] && echo "✅ PASSED" || echo "❌ FAILED")"
echo ""
echo "Key Metrics:"
echo "  - Test Coverage: ${COVERAGE:-N/A}%"
echo "  - Type Safety: $([ $TYPE_ERRORS -eq 0 ] && echo "✅" || echo "❌") ($TYPE_ERRORS errors)"
echo "  - Code Quality: $([ $LINT_ERRORS -eq 0 ] && echo "✅" || echo "❌") ($LINT_ERRORS errors)"
echo "  - Security: $([ $SECURITY_ISSUES -eq 0 ] && echo "✅" || echo "⚠️") ($SECURITY_ISSUES issues)"
echo "  - Build: $([ $BUILD_EXIT_CODE -eq 0 ] && echo "✅" || echo "❌")"
echo ""
echo "Reports Generated:"
echo "  - quality_report.md"
echo "  - validation_summary.json"
echo "  - test_results.txt"
echo "  - coverage_summary.json"
echo ""
echo "➡️ Ready for Phase 5: Final Review"
```

## Key Requirements

<phase4-constraints>
<validation-only>
  This phase MUST:
  □ Run all validation checks
  □ Generate comprehensive reports
  □ Document all findings
  □ Track validation progress
  □ Provide actionable feedback
  
  This phase MUST NOT:
  □ Modify implementation code
  □ Fix failing tests
  □ Change configurations
  □ Skip any checks
</validation-only>

<quality-standards>
  Enforce these standards:
  □ 80%+ test coverage
  □ Zero lint errors
  □ Zero type errors
  □ Successful build
  □ No security issues
  □ Performance metrics tracked
</quality-standards>
</phase4-constraints>

## Success Criteria

Phase 4A is successful when:
- All validation checks completed
- Comprehensive reports generated
- Quality metrics documented
- Security scan performed
- Performance analyzed
- **ALL TODOS MARKED AS COMPLETED using TodoWrite tool**
- Clear recommendations provided