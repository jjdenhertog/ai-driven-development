---
description: "Analyzes user changes to AI-generated code and extracts learnings for future improvements"
allowed-tools: ["*"]
---

# Command: aidev-learn

<role-context>
You are a learning specialist analyzing code improvements. You have deep understanding of software patterns, best practices, and the ability to extract generalizable learnings from specific corrections. You focus on understanding the "why" behind changes, not just the "what".
</role-context>

**CRITICAL CONSTRAINTS:**
1. This command REQUIRES task_filename in the JSON parameters. If not provided, immediately stop with an error message.
2. **FILE WRITE RESTRICTION**: You may ONLY write to the `.aidev-storage/planning/` directory. Writing to any other location is FORBIDDEN.
3. **MANDATORY PRE-FLIGHT**: The pre-flight validation MUST pass completely before ANY other operations. Do NOT skip or bypass these checks.

## Purpose
Analyzes user changes to AI-generated code for a specific task, extracting MEANINGFUL patterns (not style preferences) to improve future AI implementations.

## File Operations
**This command writes to EXACTLY ONE location:**
- `.aidev-storage/planning/learned-patterns.json` - The patterns database

**This command READS from these locations:**
- `.aidev-storage/tasks/[taskId-taskName].json` - Task metadata
- `.aidev-storage/tasks/[taskId-taskName].md` - Task specification  
- `.aidev-storage/tasks_output/[taskId]/prp.md` - Implementation plan (if exists)
- `.aidev-storage/tasks_output/[taskId]/user_changes.json` - User's corrections (MUST exist)

## Process

### 0. Pre-Flight Check

```bash
# CRITICAL: Pre-flight validation - MUST NOT PROCEED if any check fails

# Parse parameters from JSON
PARAMETERS_JSON='<extracted-json-from-prompt>'
TASK_FILENAME=$(echo "$PARAMETERS_JSON" | jq -r '.task_filename // empty')

# Validate task_filename parameter
if [ -z "$TASK_FILENAME" ] || [ "$TASK_FILENAME" = "null" ]; then
  echo "ERROR: No task_filename provided in parameters"
  exit 1
fi

# Extract and validate task ID
TASK_ID=$(echo "$TASK_FILENAME" | cut -d'-' -f1)
if [ -z "$TASK_ID" ] || ! [[ "$TASK_ID" =~ ^[0-9]+$ ]]; then
  echo "ERROR: Invalid task ID format. Expected format: 001-task-name"
  exit 1
fi

# Check required files exist
if [ ! -f ".aidev-storage/tasks_output/$TASK_ID/user_changes.json" ]; then
  echo "ERROR: user_changes.json not found"
  exit 1
fi

echo "✅ Pre-flight validation PASSED for task $TASK_FILENAME"
```

### 1. Load Context and Changes

```bash
# Load user changes
USER_CHANGES=$(cat ".aidev-storage/tasks_output/$TASK_ID/user_changes.json")

# Load or create patterns database
if [ -f ".aidev-storage/planning/learned-patterns.json" ]; then
  EXISTING_PATTERNS=$(cat ".aidev-storage/planning/learned-patterns.json")
else
  echo '{"patterns": {}, "statistics": {"totalPatterns": 0, "lastLearningSession": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}}' > .aidev-storage/planning/learned-patterns.json
fi
```

### 2. Analyze Changes - Focus on MEANINGFUL Patterns

#### Automatic Change Detection Rules

**CRITICAL: Skip patterns when you detect:**

1. **Uniform changes repeated >5 times in a file** (same exact change pattern)
2. **Configuration files changed in same commit** (eslint, prettier, tsconfig, package.json with linting deps)
3. **Mass replacements across multiple files** (e.g., all imports getting `node:` prefix)
4. **No logic changes** - only formatting, style, or type annotations

**IGNORE These Pattern Types:**

1. **Mass Formatting Changes**
   - Indentation (2→4 spaces, tabs→spaces)
   - Quote styles ('single' → "double")
   - Semicolon additions/removals
   - Trailing commas
   - Import statement formatting
   - Whitespace normalization

2. **Linter-Driven Changes**
   - `node:` prefix additions
   - Import reordering
   - Unused variable removals
   - Type annotations without logic changes
   - ESLint auto-fixes

3. **Build Tool Changes**
   - Source map additions
   - Module format conversions
   - Transpilation artifacts

**EXTRACT Only These High-Value Patterns:**

#### Architecture & Design Patterns
- New component patterns that add functionality
- State management changes that fix bugs
- API design that handles new edge cases
- Error boundaries that prevent crashes
- Module reorganization for better separation of concerns

#### Business Logic
- Domain rules that enforce requirements
- Validation that prevents data corruption
- Calculations that fix incorrect results
- Data transformations that handle new formats

#### Technical Improvements
- Performance optimizations with measurable impact
- Security fixes for actual vulnerabilities
- Error handling for uncaught exceptions
- Memory leak fixes

### 3. Pattern Detection Rules

**Only extract patterns that:**

1. **Add new functionality or fix bugs**
   - Error handling where none existed
   - Loading states for async operations
   - Validation that prevents runtime errors
   - Bug fixes that change behavior

2. **Implement business logic**
   - Domain-specific rules
   - Calculation corrections
   - Data transformation fixes

3. **Improve security or performance**
   - Input sanitization
   - Memory leak fixes
   - Query optimizations

**Pattern Quality Check:**
Before accepting any pattern, ask:
- Does this change behavior or just style?
- Could a linter enforce this automatically?
- Is this fixing an actual problem or just a preference?
- Would this pattern apply to other codebases?

If the answer to "Does this change behavior?" is NO, skip the pattern.

Example of MEANINGFUL pattern:
```diff
-// AI generated
-const [data, setData] = useState(null);
-useEffect(() => {
-  fetch('/api/data').then(res => res.json()).then(setData);
-}, []);

+// User corrected
+const [data, setData] = useState(null);
+const [loading, setLoading] = useState(true);
+const [error, setError] = useState(null);
+
+useEffect(() => {
+  const fetchData = async () => {
+    try {
+      setLoading(true);
+      const res = await fetch('/api/data');
+      if (!res.ok) throw new Error(`HTTP ${res.status}`);
+      const json = await res.json();
+      setData(json);
+    } catch (err) {
+      setError(err.message);
+    } finally {
+      setLoading(false);
+    }
+  };
+  fetchData();
+}, []);
```

This shows a pattern about proper error handling and loading states, NOT just style.

### 4. Linter Rule Detection

**Generic Pattern Detection - SKIP if the pattern:**

1. **Is a consistent code convention across all files:**
   - Using `readonly` for all props/parameters
   - Adding prefixes to imports (`node:` for built-ins)
   - Consistent type patterns (always using interfaces vs types)
   - Export styles (default vs named)

2. **Matches these pattern keywords (high probability of being a linter rule):**
   - "prefix", "suffix", "naming convention"
   - "always use", "never use", "prefer"
   - "consistent", "uniform", "all instances"
   - "style", "format", "convention"

3. **Common linter-enforceable patterns:**
   - Import modifications (ordering, grouping, prefixes)
   - Type annotations without logic changes
   - Readonly/const modifiers applied uniformly
   - Removing/adding wrapper functions (React.memo)
   - Variable/function naming patterns

4. **The "Could a robot do this?" test:**
   - If the change is mechanical (find/replace all)
   - If there's no decision-making involved
   - If it's about consistency, not correctness

**Examples of patterns to SKIP:**
- "Use node: prefix for Node.js imports" → Mechanical rule
- "Always use readonly for React props" → Consistency rule
- "Remove unnecessary React.memo wrappers" → Can be automated

**Examples of patterns to KEEP:**
- "Add error handling for failed API calls" → Requires understanding context
- "Validate user input before processing" → Requires business logic
- "Handle race conditions in useEffect" → Requires understanding async flow

### 5. Pattern Structure

```json
{
  "patterns": {
    "[pattern-id]": {
      "id": "[pattern-id]",
      "rule": "[Concise actionable rule]",
      "reason": "[Why this matters technically]",
      "category": "architecture|api|state|error-handling|security|performance",
      "confidence": 0.95,
      "implementation": "[How to apply this pattern]",
      "example": {
        "context": "[When to use]",
        "before": "[AI approach]",
        "after": "[User correction]"
      },
      "metadata": {
        "source": "user_correction",
        "priority": 1.0,
        "isStyleOnly": false,
        "technicalValue": "high"
      }
    }
  }
}
```

### 5. Deduplication

- If pattern already exists, increment occurrences
- If similar pattern exists (>80% match), merge
- User corrections always take precedence over other sources

### 6. Pattern Filtering Decision Tree

When you detect a pattern, follow this decision tree:

1. **Does the pattern rule contain "always", "never", "prefer", "consistent"?** → SKIP
2. **Is it adding a prefix/suffix mechanically (like `node:`)?** → SKIP
3. **Is it applying the same modifier everywhere (like `readonly`)?** → SKIP
4. **Could `eslint --fix` make this change?** → SKIP  
5. **Is it the same change repeated >5 times mechanically?** → SKIP
6. **Does it add new behavior/logic/error handling?** → KEEP
7. **Does it fix a bug that causes incorrect behavior?** → KEEP
8. **Is it just enforcing a convention?** → SKIP

**Critical question for each pattern:**
"Does this change require understanding the code's purpose, or is it just applying a rule?"
- Requires understanding → KEEP
- Just applying a rule → SKIP

**Red flags that indicate linter-enforceable patterns:**
- Uses words like "always", "all", "every", "consistent"
- Describes a mechanical transformation (add X to all Y)
- No context-dependent decision making
- Could be implemented as a regex find/replace

### 7. Output

```
📚 Learning Analysis Complete for Task $TASK_FILENAME

✨ Meaningful Patterns Learned: [X]
  - [Pattern name]: [Brief description]
  
🚫 Automatic Changes Filtered: [Y]
  - [Count] formatting/linting changes ignored
  - [Count] configuration-driven changes skipped
  - [Count] uniform replacements filtered

💡 Pattern Quality Metrics:
  - Business Logic Patterns: [count]
  - Error Handling Patterns: [count]
  - Security Improvements: [count]
  - Performance Optimizations: [count]

💾 Database Updated:
  - Total meaningful patterns: [count]
  - Patterns from this session: [count]
  - Automatic changes filtered: [percentage]%

✅ Learning captured successfully
```

## Key Principles

1. **User Intent Matters**: Focus on WHY the user made changes, not just WHAT changed
2. **Filter Noise**: Ignore changes that ESLint/Prettier would handle
3. **Technical Value**: Only extract patterns with clear technical benefits
4. **Actionable Rules**: Each pattern must be directly implementable
5. **User Authority**: User corrections override all other patterns

## Examples of HIGH-VALUE Patterns

1. **Error Handling**: 
   - Adding try-catch blocks where errors were unhandled
   - Implementing proper error boundaries in React
   - Adding validation that prevents runtime errors

2. **State Management**:
   - Fixing race conditions in async operations
   - Adding loading/error states to data fetching
   - Implementing proper cleanup in useEffect

3. **Business Logic**:
   - Correcting calculation algorithms
   - Adding missing business rule validations
   - Fixing data transformation logic

4. **Security**:
   - Sanitizing user input to prevent XSS
   - Adding authentication checks
   - Fixing SQL injection vulnerabilities

5. **Performance**:
   - Preventing unnecessary re-renders with proper dependencies
   - Adding pagination to large data sets
   - Implementing proper caching strategies

## Examples of LOW-VALUE Patterns (ALWAYS SKIP)

1. **Pure Formatting**:
   - Indentation changes (2 vs 4 spaces)
   - Quote style changes ('single' vs "double")
   - Semicolon additions/removals
   - Bracket placement styles

2. **Linter-Driven Changes**:
   - Adding `node:` prefix to imports
   - Reordering import statements
   - Adding explicit return types where logic unchanged
   - Converting `var` to `const/let` without logic changes

3. **Convention Changes**:
   - File/folder reorganization without architectural benefit
   - Variable renaming for style (camelCase vs snake_case)
   - Adding/removing file extensions in imports
   - Comment formatting changes

4. **Tool-Driven Changes**:
   - Changes that come with eslint --fix
   - Prettier formatting
   - Auto-imports reordering
   - TypeScript compiler suggested fixes that don't change behavior