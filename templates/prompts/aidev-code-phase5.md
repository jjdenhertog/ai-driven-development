---
description: "Phase 5: REVIEWER - Final quality review and PR preparation"
allowed-tools: ["Read", "Write", "Bash", "Grep", "Glob", "LS"]
disallowed-tools: ["Edit", "MultiEdit", "git", "WebFetch", "WebSearch", "Task", "TodoWrite", "NotebookRead", "NotebookEdit"]
---

# Command: aidev-code-phase5

# 👁️ CRITICAL: PHASE 5 = FINAL REVIEW & PR PREPARATION 👁️

**YOU ARE IN PHASE 5 OF 7:**
- **Phase 0 (DONE)**: Inventory completed
- **Phase 1 (DONE)**: Architecture designed
- **Phase 2 (DONE)**: Tests created
- **Phase 3 (DONE)**: Implementation completed
- **Phase 4A (DONE)**: Validation executed
- **Phase 4B (DONE)**: Test fixes applied (if needed)
- **Phase 5 (NOW)**: Final review and PR preparation

**PHASE 5 RESPONSIBILITIES:**
✅ Review all phase outputs
✅ Assess code quality
✅ Check pattern adherence
✅ Verify best practices
✅ Create PR documentation
✅ Generate learning insights
❌ DO NOT modify code
❌ DO NOT re-run tests

<role-context>
You are a senior reviewer in the multi-agent system. Your role is to perform a final quality review, ensure all standards are met, and prepare comprehensive PR documentation.

**CRITICAL**: You review and document. The implementation is complete.
</role-context>

## Purpose
Phase 5 of the multi-agent pipeline. Performs final quality review, documents the implementation, and prepares PR message with insights for continuous learning.

## Process

### 0. Pre-Flight Check

**FIRST: Confirm Phase 5 constraints**
```bash
echo "===================================="
echo "👁️ PHASE 5: REVIEWER"
echo "===================================="
echo "✅ Will: Review implementation quality"
echo "✅ Will: Create PR documentation"
echo "❌ Will NOT: Modify any code"
echo "===================================="
```

**SECOND: Parse parameters and verify all phases**
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

# Verify required phases completed
REQUIRED_PHASES="inventory architect test_design implement validate"

for PHASE in $REQUIRED_PHASES; do
  if [ ! -d "$TASK_OUTPUT_FOLDER/phase_outputs/$PHASE" ]; then
    echo "❌ ERROR: Phase $PHASE outputs missing"
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

if [ ! -d "$TASK_OUTPUT_FOLDER/phase_outputs/review" ]; then
  echo "❌ ERROR: Review output directory missing: $TASK_OUTPUT_FOLDER/phase_outputs/review"
  exit 1
fi
```

### 1. Load All Phase Outputs

```bash
echo "📚 Loading all phase outputs for review..."

# Verify and load key documents
if [ ! -f "$TASK_OUTPUT_FOLDER/phase_outputs/inventory/component_catalog.json" ]; then
  echo "❌ ERROR: Inventory catalog missing"
  exit 1
fi
INVENTORY=$(cat "$TASK_OUTPUT_FOLDER/phase_outputs/inventory/component_catalog.json")

if [ ! -f "$TASK_OUTPUT_FOLDER/phase_outputs/architect/prp.md" ]; then
  echo "❌ ERROR: PRP missing from architect phase"
  exit 1
fi
PRP=$(cat "$TASK_OUTPUT_FOLDER/phase_outputs/architect/prp.md")

# Load test manifest
if [ ! -f "$TASK_OUTPUT_FOLDER/phase_outputs/test_design/test_manifest.json" ]; then
  echo "❌ ERROR: Test manifest missing"
  exit 1
fi
TEST_MANIFEST=$(cat "$TASK_OUTPUT_FOLDER/phase_outputs/test_design/test_manifest.json")

if [ ! -f "$TASK_OUTPUT_FOLDER/phase_outputs/implement/implementation_summary.json" ]; then
  echo "❌ ERROR: Implementation summary missing"
  exit 1
fi
IMPLEMENTATION=$(cat "$TASK_OUTPUT_FOLDER/phase_outputs/implement/implementation_summary.json")

if [ ! -f "$TASK_OUTPUT_FOLDER/phase_outputs/validate/validation_summary.json" ]; then
  echo "❌ ERROR: Validation summary missing"
  echo "Phase 4 must complete validation before review"
  exit 1
fi
VALIDATION=$(cat "$TASK_OUTPUT_FOLDER/phase_outputs/validate/validation_summary.json")

# Load context and decision tree
if [ ! -f "$TASK_OUTPUT_FOLDER/context.json" ]; then
  echo "❌ ERROR: Context file missing"
  exit 1
fi
CONTEXT=$(cat "$TASK_OUTPUT_FOLDER/context.json")

# Verify Phase 4 completed
PHASE4_COMPLETED=$(echo "$CONTEXT" | jq -r '.phases_completed | contains(["validate"])')
if [ "$PHASE4_COMPLETED" != "true" ]; then
  echo "❌ ERROR: Phase 4 (Validation) not marked as completed"
  echo "All phases must complete successfully before final review"
  exit 1
fi

# Check if test_fix phase was executed (optional phase)
TEST_FIX_EXECUTED=$(echo "$CONTEXT" | jq -r '.phases_completed | contains(["test_fix"])')
if [ "$TEST_FIX_EXECUTED" = "true" ] && [ -f "$TASK_OUTPUT_FOLDER/phase_outputs/test_fix/fix_summary.json" ]; then
  echo "✅ Test fix phase was executed - loading results"
  TEST_FIX_SUMMARY=$(cat "$TASK_OUTPUT_FOLDER/phase_outputs/test_fix/fix_summary.json")
  FIXES_APPLIED=$(echo "$TEST_FIX_SUMMARY" | jq -r '.fixes_applied // 0')
  REMAINING_FAILURES=$(echo "$TEST_FIX_SUMMARY" | jq -r '.remaining_failures // 0')
  echo "  - Fixes applied: $FIXES_APPLIED"
  echo "  - Remaining failures: $REMAINING_FAILURES"
else
  TEST_FIX_EXECUTED="false"
  FIXES_APPLIED=0
  REMAINING_FAILURES=0
fi

if [ ! -f "$TASK_OUTPUT_FOLDER/decision_tree.jsonl" ]; then
  echo "❌ ERROR: Decision tree missing"
  exit 1
fi
DECISIONS=$(cat "$TASK_OUTPUT_FOLDER/decision_tree.jsonl")

# Extract key metrics with task type awareness
COMPONENTS_REUSED=$(echo "$IMPLEMENTATION" | jq -r '.reused_components // 0')
FILES_CREATED=$(echo "$IMPLEMENTATION" | jq -r '.files_created // 0')
TESTS_WRITTEN=$(echo "$TEST_MANIFEST" | jq -r '.total_test_cases // 0')

# Handle different validation types
if [ "$TASK_TYPE" = "pattern" ]; then
  COVERAGE="N/A"
  OVERALL_STATUS=$(echo "$VALIDATION" | jq -r '.overall_status // "pattern_validated"')
else
  COVERAGE=$(echo "$VALIDATION" | jq -r '.checks.tests.coverage // 0')
  OVERALL_STATUS=$(echo "$VALIDATION" | jq -r '.overall_status // "unknown"')
fi
```

### 2. Code Quality Review

```bash
echo "🔍 Performing code quality review..."

# Initialize review findings with practical quality focus
# Scoring: 40% code quality, 30% test effectiveness, 20% architecture, 10% documentation
REVIEW_FINDINGS='{
  "code_quality": {
    "strengths": [],
    "improvements": [],
    "score": 0,
    "max_score": 40
  },
  "test_effectiveness": {
    "coverage": '$COVERAGE',
    "strengths": [],
    "improvements": [],
    "score": 0,
    "max_score": 30
  },
  "architecture": {
    "strengths": [],
    "improvements": [],
    "score": 0,
    "max_score": 20
  },
  "documentation": {
    "strengths": [],
    "improvements": [],
    "score": 0,
    "max_score": 10
  }
}'

# Review code quality
echo "Analyzing code quality..."

# Code Quality Assessment (40% of total score)
# Focus on actual implementation quality, not just metrics

# Check for code reuse (10 points)
if [ "$COMPONENTS_REUSED" -gt 0 ]; then
  REVIEW_FINDINGS=$(echo "$REVIEW_FINDINGS" | jq '.code_quality.strengths += ["Excellent code reuse - '$COMPONENTS_REUSED' components reused"]')
  REVIEW_FINDINGS=$(echo "$REVIEW_FINDINGS" | jq '.code_quality.score += 10')
fi

# Check implementation simplicity (15 points)
# Look for signs of over-engineering
CONSOLE_LOGS=$(echo "$VALIDATION" | jq -r '.checks.performance.console_logs // 0')
if [ "$CONSOLE_LOGS" -eq 0 ]; then
  REVIEW_FINDINGS=$(echo "$REVIEW_FINDINGS" | jq '.code_quality.strengths += ["Clean implementation without debug artifacts"]')
  REVIEW_FINDINGS=$(echo "$REVIEW_FINDINGS" | jq '.code_quality.score += 5')
fi

# Check type safety and code cleanliness (15 points)
TYPE_ERRORS=$(echo "$VALIDATION" | jq -r '.checks.types.errors // 0')
LINT_ERRORS=$(echo "$VALIDATION" | jq -r '.checks.lint.errors // 0')

if [ "$TYPE_ERRORS" -eq 0 ] && [ "$LINT_ERRORS" -eq 0 ]; then
  REVIEW_FINDINGS=$(echo "$REVIEW_FINDINGS" | jq '.code_quality.strengths += ["Clean, type-safe code with no errors"]')
  REVIEW_FINDINGS=$(echo "$REVIEW_FINDINGS" | jq '.code_quality.score += 15')
elif [ "$TYPE_ERRORS" -eq 0 ]; then
  REVIEW_FINDINGS=$(echo "$REVIEW_FINDINGS" | jq '.code_quality.strengths += ["Type-safe implementation"]')
  REVIEW_FINDINGS=$(echo "$REVIEW_FINDINGS" | jq '.code_quality.score += 10')
else
  REVIEW_FINDINGS=$(echo "$REVIEW_FINDINGS" | jq '.code_quality.improvements += ["Address '$TYPE_ERRORS' type errors and '$LINT_ERRORS' lint issues"]')
  REVIEW_FINDINGS=$(echo "$REVIEW_FINDINGS" | jq '.code_quality.score += 5')
fi
```

### 3. Test Effectiveness Review

```bash
echo "🧪 Reviewing test effectiveness..."

# Test Effectiveness Assessment (30% of total score)
# Focus on practical test coverage, not just metrics

if [ "$TASK_COMPLEXITY" = "simple" ]; then
  # Simple tasks get full points if implementation works
  if [ "$OVERALL_STATUS" = "passed" ]; then
    REVIEW_FINDINGS=$(echo "$REVIEW_FINDINGS" | jq '.test_effectiveness.strengths += ["Simple task completed successfully"]')
    REVIEW_FINDINGS=$(echo "$REVIEW_FINDINGS" | jq '.test_effectiveness.score += 30')
  else
    REVIEW_FINDINGS=$(echo "$REVIEW_FINDINGS" | jq '.test_effectiveness.improvements += ["Simple task but validation failed"]')
    REVIEW_FINDINGS=$(echo "$REVIEW_FINDINGS" | jq '.test_effectiveness.score += 15')
  fi
else
  # Regular feature tasks - evaluate test quality
  if [ "$COVERAGE" != "N/A" ] && [ "$COVERAGE" -ge 80 ]; then
    REVIEW_FINDINGS=$(echo "$REVIEW_FINDINGS" | jq '.test_effectiveness.strengths += ["Excellent test coverage at '$COVERAGE'%"]')
    REVIEW_FINDINGS=$(echo "$REVIEW_FINDINGS" | jq '.test_effectiveness.score += 20')
  elif [ "$COVERAGE" != "N/A" ] && [ "$COVERAGE" -ge 60 ]; then
    REVIEW_FINDINGS=$(echo "$REVIEW_FINDINGS" | jq '.test_effectiveness.strengths += ["Good test coverage at '$COVERAGE'%"]')
    REVIEW_FINDINGS=$(echo "$REVIEW_FINDINGS" | jq '.test_effectiveness.score += 15')
  else
    REVIEW_FINDINGS=$(echo "$REVIEW_FINDINGS" | jq '.test_effectiveness.improvements += ["Improve test coverage from '$COVERAGE'%"]')
    REVIEW_FINDINGS=$(echo "$REVIEW_FINDINGS" | jq '.test_effectiveness.score += 10')
  fi
  
  # Bonus for all tests passing
  FAILING_TESTS=$(echo "$VALIDATION" | jq -r '.checks.tests.failing // 0')
  if [ "$FAILING_TESTS" -eq 0 ] && [ "$TESTS_WRITTEN" -gt 0 ]; then
    REVIEW_FINDINGS=$(echo "$REVIEW_FINDINGS" | jq '.test_effectiveness.strengths += ["All '$TESTS_WRITTEN' tests passing"]')
    REVIEW_FINDINGS=$(echo "$REVIEW_FINDINGS" | jq '.test_effectiveness.score += 10')
  fi
fi
```

### 4. Architecture Review

```bash
echo "🏗️ Reviewing architecture..."

# Architecture Assessment (20% of total score)
# Focus on practical design decisions, not over-engineering

# Get task complexity for context
TASK_COMPLEXITY=$(echo "$CONTEXT" | jq -r '.critical_context.task_complexity // "normal"')

# Load architecture decisions
if [ -f "$TASK_OUTPUT_FOLDER/phase_outputs/architect/architecture_decisions.json" ]; then
  ARCH_DECISIONS=$(cat "$TASK_OUTPUT_FOLDER/phase_outputs/architect/architecture_decisions.json")
  DECISION_COUNT=$(echo "$ARCH_DECISIONS" | jq '.decisions | length')
else
  DECISION_COUNT=0
fi

# Check pattern usage
PATTERNS_MATCHED=$(cat "$TASK_OUTPUT_FOLDER/phase_outputs/inventory/pattern_matches.json" | jq -r '.matched_patterns | length')

if [ "$TASK_COMPLEXITY" = "simple" ]; then
  # Simple tasks should have minimal architecture
  REVIEW_FINDINGS=$(echo "$REVIEW_FINDINGS" | jq '.architecture.strengths += ["Appropriately simple architecture for task"]')
  REVIEW_FINDINGS=$(echo "$REVIEW_FINDINGS" | jq '.architecture.score += 20')
else
  # Complex tasks - evaluate architecture quality
  if [ "$DECISION_COUNT" -gt 0 ] && [ "$PATTERNS_MATCHED" -gt 0 ]; then
    REVIEW_FINDINGS=$(echo "$REVIEW_FINDINGS" | jq '.architecture.strengths += ["Well-documented architecture with pattern reuse"]')
    REVIEW_FINDINGS=$(echo "$REVIEW_FINDINGS" | jq '.architecture.score += 20')
  elif [ "$DECISION_COUNT" -gt 0 ]; then
    REVIEW_FINDINGS=$(echo "$REVIEW_FINDINGS" | jq '.architecture.strengths += ["Architecture decisions documented"]')
    REVIEW_FINDINGS=$(echo "$REVIEW_FINDINGS" | jq '.architecture.score += 15')
  else
    REVIEW_FINDINGS=$(echo "$REVIEW_FINDINGS" | jq '.architecture.improvements += ["Document key architecture decisions"]')
    REVIEW_FINDINGS=$(echo "$REVIEW_FINDINGS" | jq '.architecture.score += 10')
  fi
fi
```

### 5. Documentation Review

```bash
echo "📝 Reviewing documentation..."

# Documentation Assessment (10% of total score)
# Focus on essential docs only

# Check PR description quality (will be generated)
REVIEW_FINDINGS=$(echo "$REVIEW_FINDINGS" | jq '.documentation.strengths += ["PR documentation will be auto-generated"]')
REVIEW_FINDINGS=$(echo "$REVIEW_FINDINGS" | jq '.documentation.score += 5')

# Check if code is self-documenting
if [ "$TYPE_ERRORS" -eq 0 ]; then
  REVIEW_FINDINGS=$(echo "$REVIEW_FINDINGS" | jq '.documentation.strengths += ["Type-safe code is self-documenting"]')
  REVIEW_FINDINGS=$(echo "$REVIEW_FINDINGS" | jq '.documentation.score += 5')
fi

# Calculate total score
TOTAL_SCORE=$(echo "$REVIEW_FINDINGS" | jq '[.code_quality.score, .test_effectiveness.score, .architecture.score, .documentation.score] | add')
REVIEW_FINDINGS=$(echo "$REVIEW_FINDINGS" | jq '.total_score = '$TOTAL_SCORE)

# Save review findings
echo "$REVIEW_FINDINGS" > "$TASK_OUTPUT_FOLDER/phase_outputs/review/review_findings.json"
```

### 6. Generate Learning Insights

```bash
echo "💡 Generating learning insights..."

# Analyze what worked well
INSIGHTS='{
  "successes": [],
  "challenges": [],
  "patterns_to_capture": [],
  "improvements_for_next_time": []
}'

# Successes
if [ "$COMPONENTS_REUSED" -gt 0 ]; then
  INSIGHTS=$(echo "$INSIGHTS" | jq '.successes += ["Code reuse prevented duplication - '$COMPONENTS_REUSED' components reused"]')
fi

if [ "$OVERALL_STATUS" = "passed" ]; then
  INSIGHTS=$(echo "$INSIGHTS" | jq '.successes += ["All quality checks passed on first implementation"]')
fi

# Challenges
FAILING_TESTS=$(echo "$VALIDATION" | jq -r '.checks.tests.failing')
if [ "$TEST_FIX_EXECUTED" = "true" ]; then
  if [ "$REMAINING_FAILURES" -eq 0 ]; then
    INSIGHTS=$(echo "$INSIGHTS" | jq '.successes += ["Automatic test fixing successfully resolved all '$FAILING_TESTS' failing tests"]')
  else
    INSIGHTS=$(echo "$INSIGHTS" | jq '.challenges += ["'$REMAINING_FAILURES' tests still failing after automatic fixes (original: '$FAILING_TESTS')"]')
  fi
elif [ "$FAILING_TESTS" -gt 0 ]; then
  INSIGHTS=$(echo "$INSIGHTS" | jq '.challenges += ["'$FAILING_TESTS' tests still failing - need investigation"]')
fi

# Patterns to capture
if [ "$TOTAL_SCORE" -ge 80 ]; then
  INSIGHTS=$(echo "$INSIGHTS" | jq '.patterns_to_capture += ["High quality implementation (score: '$TOTAL_SCORE'/100) - consider as reusable pattern"]')
  
  # Specific pattern recommendations based on strengths
  CODE_SCORE=$(echo "$REVIEW_FINDINGS" | jq -r '.code_quality.score')
  if [ "$CODE_SCORE" -ge 32 ]; then
    INSIGHTS=$(echo "$INSIGHTS" | jq '.patterns_to_capture += ["Excellent code quality practices worth replicating"]')
  fi
fi

# Improvements
if [ "$COVERAGE" -lt 80 ]; then
  INSIGHTS=$(echo "$INSIGHTS" | jq '.improvements_for_next_time += ["Increase test coverage target to 80%+ from current '$COVERAGE'%"]')
fi

# Save insights
echo "$INSIGHTS" > "$TASK_OUTPUT_FOLDER/phase_outputs/review/learning_insights.json"
```

### 7. Create Comprehensive PR Message

```bash
echo "📝 Creating PR documentation..."

# Generate PR title
PR_TITLE="feat: Implement $TASK_NAME (#$TASK_ID)"

# Create detailed PR message
cat > "$TASK_OUTPUT_FOLDER/last_result.md" << 'EOF'
## 🤖 AI Multi-Agent Implementation

### Task
**ID**: $TASK_ID
**Name**: $TASK_NAME
**Type**: $TASK_TYPE

### Implementation Summary

This task was implemented using a multi-phase AI agent approach:

1. **Phase 0 - Inventory**: Cataloged existing code and identified $COMPONENTS_REUSED reusable components
2. **Phase 1 - Architect**: Created comprehensive design with test specifications
3. **Phase 2 - Test Designer**: Wrote $TESTS_WRITTEN tests following TDD principles
4. **Phase 3 - Programmer**: Implemented features to pass all tests
5. **Phase 4 - Test Executor**: Validated with $COVERAGE% test coverage
$TEST_FIX_PHASE_SUMMARY
6. **Phase 5 - Reviewer**: Quality score: $TOTAL_SCORE/100

### Changes Made

#### Files Created/Modified
- **New Files**: $FILES_CREATED
- **Reused Components**: $COMPONENTS_REUSED
- **Test Files**: $(echo "$TEST_MANIFEST" | jq -r '.test_files | length')

#### Key Implementation Details
$(echo "$REVIEW_FINDINGS" | jq -r '.code_quality.strengths[]' | sed 's/^/- /')

### Quality Metrics

| Metric | Result | Status |
|--------|--------|--------|
| Test Coverage | $COVERAGE% | $([ "$COVERAGE" -ge 80 ] && echo "✅" || echo "⚠️") |
| Type Safety | $TYPE_ERRORS errors | $([ "$TYPE_ERRORS" -eq 0 ] && echo "✅" || echo "❌") |
| Lint Clean | $LINT_ERRORS errors | $([ "$LINT_ERRORS" -eq 0 ] && echo "✅" || echo "❌") |
| Build Status | $(echo "$VALIDATION" | jq -r 'if .checks.build.passed then "Success" else "Failed" end') | $(echo "$VALIDATION" | jq -r 'if .checks.build.passed then "✅" else "❌" end') |
| Security | $SECURITY_ISSUES issues | $([ "$SECURITY_ISSUES" -eq 0 ] && echo "✅" || echo "⚠️") |

### Architecture Decisions

$(echo "$ARCH_DECISIONS" | jq -r '.decisions[] | "- **" + .title + "**: " + .decision')

### Testing

All tests were written before implementation following TDD principles:

```
Total Tests: $TESTS_WRITTEN
Passing: $(echo "$VALIDATION" | jq -r '.checks.tests.passing')
Coverage: $COVERAGE%
```

### Learning Insights

#### What Worked Well
$(echo "$INSIGHTS" | jq -r '.successes[]' | sed 's/^/- /')

#### Areas for Improvement
$(echo "$INSIGHTS" | jq -r '.improvements_for_next_time[]' | sed 's/^/- /')

### Review Checklist

- [x] Code follows project conventions
- [x] Tests written and passing
- [x] Type-safe implementation
- [x] Security best practices followed
- [x] Performance considered
- [$([ "$COVERAGE" -ge 80 ] && echo "x" || echo " ")] Test coverage ≥ 80%
- [$([ "$OVERALL_STATUS" = "passed" ] && echo "x" || echo " ")] All quality checks passed

### Session Details

- **Session ID**: $(date +%s)
- **Decision Tree**: `<task_output_folder>/decision_tree.jsonl`
- **Quality Report**: `<task_output_folder>/phase_outputs/validate/quality_report.md`
- **Review Score**: $TOTAL_SCORE/100

---
Generated by AI Multi-Agent Pipeline
Corrections and feedback will be captured for continuous improvement
EOF

# Create test fix phase summary
if [ "$TEST_FIX_EXECUTED" = "true" ]; then
  TEST_FIX_PHASE_SUMMARY="5a. **Phase 4A - Test Fixer**: Applied $FIXES_APPLIED automatic fixes ($REMAINING_FAILURES tests still failing)"
else
  TEST_FIX_PHASE_SUMMARY=""
fi

# Replace all variables in the PR message
sed -i "s/\$TASK_ID/$TASK_ID/g" "$TASK_OUTPUT_FOLDER/last_result.md"
sed -i "s/\$TASK_NAME/$TASK_NAME/g" "$TASK_OUTPUT_FOLDER/last_result.md"
sed -i "s/\$TASK_TYPE/$TASK_TYPE/g" "$TASK_OUTPUT_FOLDER/last_result.md"
sed -i "s/\$FILES_CREATED/$FILES_CREATED/g" "$TASK_OUTPUT_FOLDER/last_result.md"
sed -i "s/\$COMPONENTS_REUSED/$COMPONENTS_REUSED/g" "$TASK_OUTPUT_FOLDER/last_result.md"
sed -i "s/\$TESTS_WRITTEN/$TESTS_WRITTEN/g" "$TASK_OUTPUT_FOLDER/last_result.md"
sed -i "s/\$COVERAGE/$COVERAGE/g" "$TASK_OUTPUT_FOLDER/last_result.md"
sed -i "s/\$TOTAL_SCORE/$TOTAL_SCORE/g" "$TASK_OUTPUT_FOLDER/last_result.md"
sed -i "s/\$TYPE_ERRORS/$TYPE_ERRORS/g" "$TASK_OUTPUT_FOLDER/last_result.md"
sed -i "s/\$LINT_ERRORS/$LINT_ERRORS/g" "$TASK_OUTPUT_FOLDER/last_result.md"
sed -i "s/\$SECURITY_ISSUES/$SECURITY_ISSUES/g" "$TASK_OUTPUT_FOLDER/last_result.md"
sed -i "s/\$OVERALL_STATUS/$OVERALL_STATUS/g" "$TASK_OUTPUT_FOLDER/last_result.md"
sed -i "s|\$TEST_FIX_PHASE_SUMMARY|$TEST_FIX_PHASE_SUMMARY|g" "$TASK_OUTPUT_FOLDER/last_result.md"
```

### 8. Create Pattern Recommendation

```bash
echo "🎯 Creating pattern recommendations..."

# If this implementation scored well, recommend it as a pattern
if [ "$TOTAL_SCORE" -ge 80 ]; then
  cat > "$TASK_OUTPUT_FOLDER/phase_outputs/review/pattern_recommendation.md" << EOF
# Pattern Recommendation

## Task: $TASK_NAME

This implementation achieved a quality score of $TOTAL_SCORE/100 and demonstrates excellent practices that should be captured as a pattern.

### Key Patterns Demonstrated

1. **Code Reuse**: Successfully reused $COMPONENTS_REUSED existing components
2. **Test-First Development**: $TESTS_WRITTEN tests written before implementation
3. **Type Safety**: Zero TypeScript errors
4. **Clean Code**: Follows all linting rules

### Recommended for Pattern Library

This implementation should be added to the pattern library as an example of:
- $([ "$TASK_TYPE" = "feature" ] && echo "Feature implementation pattern" || echo "$TASK_TYPE pattern")
- Test-driven development approach
- Effective code reuse strategy

### Files to Include in Pattern

\`\`\`
$(find . -type f -name "*.ts" -o -name "*.tsx" | grep -v node_modules | grep -v ".test." | head -5)
\`\`\`

EOF
fi
```

### 9. Update Context and Complete

```bash
# Update context for completion
UPDATED_CONTEXT=$(echo "$CONTEXT" | jq \
  --arg phase "review" \
  --arg score "$TOTAL_SCORE" \
  '.current_phase = $phase |
   .phases_completed += [$phase] |
   .phase_history += [{
     phase: $phase,
     completed_at: (now | strftime("%Y-%m-%dT%H:%M:%SZ")),
     success: true,
     key_outputs: {
       quality_score: ($score | tonumber),
       pr_message_created: true,
       insights_generated: true
     }
   }] |
   .pipeline_complete = true')

echo "$UPDATED_CONTEXT" > "$TASK_OUTPUT_FOLDER/context.json"

# Final summary
echo ""
echo "===================================="
echo "✅ REVIEW COMPLETE"
echo "===================================="
echo ""
echo "Quality Score: $TOTAL_SCORE/100"
echo ""
echo "Strengths:"
echo "$REVIEW_FINDINGS" | jq -r '.code_quality.strengths[]' | sed 's/^/  - /'
echo ""
echo "Files Generated:"
echo "  - last_result.md (PR message)"
echo "  - review_findings.json"
echo "  - learning_insights.json"
$([ "$TOTAL_SCORE" -ge 80 ] && echo "  - pattern_recommendation.md")
echo ""
echo "🎉 Multi-agent pipeline completed successfully!"
echo ""
echo "Next Steps:"
echo "1. Review the PR message in last_result.md"
echo "2. Address any remaining issues noted in the review"
echo "3. Create PR when ready"
```

## Key Requirements

<phase5-constraints>
<review-only>
  This phase MUST:
  □ Review all implementation aspects
  □ Assess quality objectively
  □ Create comprehensive PR docs
  □ Generate learning insights
  □ Recommend patterns
  
  This phase MUST NOT:
  □ Modify any code
  □ Re-run tests
  □ Change configurations
  □ Fix issues found
</review-only>

<documentation-focus>
  PR documentation must include:
  □ Clear summary of changes
  □ Quality metrics
  □ Architecture decisions
  □ Test results
  □ Learning insights
  □ Review checklist
</documentation-focus>
</phase5-constraints>

## Success Criteria

Phase 5 is successful when:
- Comprehensive review completed
- Quality score calculated
- PR message created
- Learning insights documented
- Pattern recommendations made (if applicable)
- All phase outputs reviewed