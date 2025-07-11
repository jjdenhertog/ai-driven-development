---
description: "Analyzes user changes to AI-generated code and extracts learnings for future improvements"
allowed-tools: ["*"]
---

# Command: aidev-learn

<role-context>
You are a learning specialist analyzing code improvements. You have deep understanding of software patterns, best practices, and the ability to extract generalizable learnings from specific corrections. You focus on understanding the "why" behind changes, not just the "what".
</role-context>

**CRITICAL CONSTRAINTS:**
1. This command REQUIRES a task filename argument (format: taskId-taskName). If no argument is provided (#$ARGUMENTS is empty), immediately stop with an error message.
2. **FILE WRITE RESTRICTION**: You may ONLY write to the `.aidev/patterns/` directory. Writing to any other location is FORBIDDEN.
3. **MANDATORY PRE-FLIGHT**: The pre-flight validation MUST pass completely before ANY other operations. Do NOT skip or bypass these checks.

## Purpose
Analyzes user changes to AI-generated code for a specific task, extracting learnings to improve future AI implementations.

## File Operations
**This command writes to EXACTLY ONE location:**
- `.aidev/patterns/learned-patterns.json` - The patterns database

**This command READS from these locations:**
- `.aidev/tasks/[taskId-taskName].json` - Task metadata
- `.aidev/tasks/[taskId-taskName].md` - Task specification  
- `.aidev/logs/[taskId]/prp.md` - Implementation plan (MUST exist and be non-empty)
- `.aidev/logs/[taskId]/user_changes.json` - User's corrections (MUST exist and be valid JSON)

## Process

### 0. Pre-Flight Check

```bash
# CRITICAL: Pre-flight validation - MUST NOT PROCEED if any check fails

# 1. Validate task argument
if [ -z "#$ARGUMENTS" ]; then
  echo "ERROR: No task filename provided. Usage: /aidev-learn <taskId-taskName>"
  echo "FATAL: Cannot proceed without task identifier"
  exit 1
fi

# 2. Extract and validate task ID
TASK_ID=$(echo "#$ARGUMENTS" | cut -d'-' -f1)
if [ -z "$TASK_ID" ] || ! [[ "$TASK_ID" =~ ^[0-9]+$ ]]; then
  echo "ERROR: Invalid task ID format. Expected format: 001-task-name"
  echo "FATAL: Cannot determine task ID from: #$ARGUMENTS"
  exit 1
fi

# 3. Check ALL required files exist before proceeding
MISSING_FILES=()
for file in ".aidev/tasks/#$ARGUMENTS.json" ".aidev/tasks/#$ARGUMENTS.md" ".aidev/logs/$TASK_ID/prp.md" ".aidev/logs/$TASK_ID/user_changes.json"; do
  if [ ! -f "$file" ]; then
    MISSING_FILES+=("$file")
  fi
done

if [ ${#MISSING_FILES[@]} -gt 0 ]; then
  echo "ERROR: Required files not found:"
  for file in "${MISSING_FILES[@]}"; do
    echo "  - $file"
  done
  echo "FATAL: Cannot proceed without ALL required files"
  exit 1
fi

# 4. Verify PRP is not empty
if [ ! -s ".aidev/logs/$TASK_ID/prp.md" ]; then
  echo "ERROR: PRP file exists but is empty: .aidev/logs/$TASK_ID/prp.md"
  echo "FATAL: Cannot learn without implementation plan"
  exit 1
fi

# 5. Verify user_changes.json is valid JSON
if ! jq . ".aidev/logs/$TASK_ID/user_changes.json" >/dev/null 2>&1; then
  echo "ERROR: user_changes.json is not valid JSON"
  echo "FATAL: Cannot parse user changes"
  exit 1
fi

echo "✅ Pre-flight validation PASSED for task #$ARGUMENTS"
echo "📁 All required files present and valid"
```

<pre-flight-validation>
<mandatory-checks>
  □ Task argument provided
  □ Task JSON/MD files exist
  □ PRP exists at `.aidev/logs/$TASK_ID/prp.md`
  □ User changes exist at `.aidev/logs/$TASK_ID/user_changes.json`
</mandatory-checks>
</pre-flight-validation>

### 1. Context Loading

#### 1.1 Load Task Context
- Read task specification from `.aidev/tasks/#$ARGUMENTS.md`
- Extract task type, objectives, and requirements

#### 1.2 Load PRP
- Read PRP from `.aidev/logs/$TASK_ID/prp.md`
- Understand the AI's implementation plan and decisions

#### 1.3 Load User Changes
- Read user changes JSON with structure:
  ```json
  {
    "taskId": "001",
    "branch": "ai/001-setup-nextjs-project",
    "commits": [{"hash": "...", "author": "...", "date": "...", "message": "..."}],
    "fileChanges": [{"file": "app/layout.tsx", "diff": "diff --git..."}]
  }
  ```

### 2. Load Existing Patterns

```bash
# Check for existing patterns database
if [ -f ".aidev/patterns/learned-patterns.json" ]; then
  echo "✅ Found existing patterns database"
  PATTERN_COUNT=$(jq '.patterns | length' .aidev/patterns/learned-patterns.json)
  echo "📊 Existing patterns: $PATTERN_COUNT"
else
  echo "📝 Creating new patterns database"
  echo '{"patterns": {}, "antipatterns": {}, "statistics": {"totalPatterns": 0, "totalAntipatterns": 0, "lastLearningSession": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'", "tasksAnalyzed": [], "averageConfidence": 0}}' > .aidev/patterns/learned-patterns.json
fi
```

### 3. Analyze User Changes

For each file in `fileChanges`:
1. Parse git diff to compare:
   - Lines removed (AI code): `^-`
   - Lines added (user corrections): `^+`
   
2. Categorize changes:
   - **Style**: Formatting, quotes, naming
   - **Architecture**: Structure, organization
   - **Logic**: Algorithms, conditions
   - **Security**: Validation, auth
   - **Performance**: Optimization, caching
   - **Patterns**: Project conventions
   - **TypeScript**: Types, strictness
   - **Testing**: Test coverage

3. Extract generalizable patterns (not file-specific)

### 4. Extract Learnings

Example analysis:
```diff
+type RootLayoutProps = {
+    readonly children: React.ReactNode;
+}
```

Generates pattern:
```json
{
  "readonly-react-props": {
    "id": "readonly-react-props",
    "description": "Mark React component props as readonly",
    "category": "typescript",
    "rule": "Always use readonly for React component prop types",
    "implementation": "type ComponentProps = { readonly propName: PropType; }",
    "reason": "Prevents accidental prop mutations",
    "confidence": 0.7,
    "examples": ["app/layout.tsx:12-14"],
    "contexts": ["react-components"]
  }
}
```

<learning-extraction-rules>
<quality-criteria>
  Only extract learnings that are:
  □ Generalizable beyond this task
  □ Clear improvements (not preferences)
  □ Likely to occur again
  □ Have clear reasoning
  □ Not bug fixes
</quality-criteria>

<confidence-calculation>
  High (0.8+): Best practice violations, security/performance fixes
  Medium (0.5-0.8): Clear stylistic improvements, architecture changes
  Low (<0.5): Personal preferences, first occurrence
</confidence-calculation>
</learning-extraction-rules>

### 5. Pattern Consolidation

```bash
# Check for duplicates in JSON database
if [ -f ".aidev/patterns/learned-patterns.json" ]; then
  for pattern_rule in "${NEW_PATTERN_RULES[@]}"; do
    SIMILAR=$(jq --arg rule "$pattern_rule" '.patterns | to_entries | map(select(.value.rule | contains($rule))) | .key' .aidev/patterns/learned-patterns.json)
    if [ -n "$SIMILAR" ]; then
      echo "📌 Found similar pattern: $SIMILAR"
      # Increment frequency and update confidence
    else
      echo "✨ New unique pattern"
    fi
  done
fi
```

### 6. Update Learning Database

Update `.aidev/patterns/learned-patterns.json`:

```json
{
  "patterns": {
    "[pattern-id]": {
      "id": "[pattern-id]",
      "description": "[What this pattern does]",
      "category": "[category]",
      "examples": ["[file:line]"],
      "confidence": 0.75,
      "lastUpdated": "[ISO date]",
      "occurrences": 3,
      "implementation": "[How to apply]",
      "rule": "[Concise rule]",
      "antiPattern": "[What to avoid]",
      "reason": "[Why important]",
      "contexts": ["[where-applicable]"],
      "sources": ["#$ARGUMENTS"],
      "codeExample": {
        "good": "[correct code]",
        "bad": "[incorrect code]"
      }
    }
  },
  "antipatterns": {
    "[antipattern-id]": {
      "id": "[antipattern-id]",
      "description": "[What to avoid]",
      "category": "[category]",
      "avoid": "[Specific thing not to do]",
      "instead": "[What to do instead]",
      "reason": "[Why problematic]",
      "examples": ["[file:line]"],
      "confidence": 0.85,
      "occurrences": 5,
      "severity": "high|medium|low",
      "sources": ["#$ARGUMENTS"]
    }
  },
  "statistics": {
    "totalPatterns": 45,
    "totalAntipatterns": 23,
    "lastLearningSession": "[ISO timestamp]",
    "tasksAnalyzed": ["#$ARGUMENTS"],
    "averageConfidence": 0.72,
    "highConfidencePatterns": 12
  }
}
```

### 7. Apply Confidence Algorithm

```
New pattern: 0.5
Each occurrence: +0.1 (max 0.95)
Successful application: +0.05 (max 0.95)
Conflicting correction: -0.2 (min 0.1)
Best practice bonus: +0.2
Security/performance bonus: +0.15
```

### 8. Validation and Output

<validation-requirements>
<deduplication>
  If 80%+ similar: merge and increment
  If 50-80% similar: create variant
  If <50% similar: create new pattern
</deduplication>
</validation-requirements>

```
📚 Learning Analysis Complete for Task #$ARGUMENTS

✨ New Patterns Learned: [X]
  - [Pattern 1] (confidence: [level])
  
📈 Patterns Reinforced: [Y]
  - [Pattern A] (confidence: [old] → [new])

⚠️  Anti-Patterns Identified: [Z]
  - [Anti-pattern 1] (severity: [level])

💾 Database Updated:
  - Total patterns: [count]
  - Average confidence: [score]

✅ Learning captured successfully
```

## Error Handling

<error-scenarios>
<recovery-strategies>
  If no PRP found: Use task spec alone with limited context note
  If user changes empty: Check if task was accepted as-is
  If JSON corrupted: Create backup and start fresh
  If pattern conflicts: Document both and flag for review
</recovery-strategies>
</error-scenarios>

## Key Requirements

- **Objective Analysis**: Focus on improvements, not criticism
- **Generalization**: Extract patterns, not task-specific fixes
- **Clear Documentation**: Every learning must have clear reasoning
- **Actionable Rules**: Patterns must be implementable
- **Confidence Tracking**: Accurate assessment of pattern reliability
- **No Overfitting**: Avoid creating patterns from one-off corrections

## Example Patterns

### Pattern Example
```json
{
  "use-named-exports": {
    "id": "use-named-exports",
    "description": "Use named exports for React components",
    "category": "patterns",
    "examples": ["components/UserProfile.tsx:1"],
    "confidence": 0.90,
    "lastUpdated": "2024-01-10T15:30:00Z",
    "occurrences": 12,
    "implementation": "export const ComponentName: React.FC<Props> = ...",
    "rule": "Always use named exports for React components",
    "antiPattern": "export default MyComponent",
    "reason": "Improves refactoring, tree-shaking, and IDE support",
    "contexts": ["component-files"],
    "sources": ["001-setup-nextjs-project"]
  }
}
```

### Anti-Pattern Example
```json
{
  "unvalidated-user-input": {
    "id": "unvalidated-user-input",
    "description": "Never use request body without Zod validation",
    "category": "security",
    "avoid": "Directly using request.body",
    "instead": "Parse with Zod schema first",
    "reason": "Prevents injection attacks",
    "examples": ["api/users/route.ts:45"],
    "confidence": 0.95,
    "occurrences": 8,
    "severity": "high",
    "sources": ["003-api-endpoints"]
  }
}
```