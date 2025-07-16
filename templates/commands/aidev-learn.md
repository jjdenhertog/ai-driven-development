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
2. **FILE WRITE RESTRICTION**: You may ONLY write to the `.aidev-storage/patterns/` directory. Writing to any other location is FORBIDDEN.
3. **MANDATORY PRE-FLIGHT**: The pre-flight validation MUST pass completely before ANY other operations. Do NOT skip or bypass these checks.

## Purpose
Analyzes user changes to AI-generated code for a specific task, extracting learnings to improve future AI implementations.

## File Operations
**This command writes to EXACTLY ONE location:**
- `.aidev-storage/patterns/learned-patterns.json` - The patterns database

**This command READS from these locations:**
- `.aidev-storage/tasks/[taskId-taskName].json` - Task metadata
- `.aidev-storage/tasks/[taskId-taskName].md` - Task specification  
- `.aidev-storage/tasks_output/[taskId]/prp.md` - Implementation plan (MUST exist and be non-empty)
- `.aidev-storage/tasks_output/[taskId]/user_changes.json` - User's corrections (MUST exist and be valid JSON)

## Process

### 0. Pre-Flight Check

```bash
# CRITICAL: Pre-flight validation - MUST NOT PROCEED if any check fails

# 0. Verify .aidev-storage directory exists
if [ ! -d ".aidev-storage" ]; then
    echo "ERROR: Cannot find .aidev-storage directory"
    exit 1
fi

echo "✅ Found .aidev-storage directory"

# 1. Validate task argument
if [ -z "#$ARGUMENTS" ]; then
  echo "ERROR: No task filename provided. Usage: /aidev-learn <taskId-taskName>"
  echo "ERROR: Cannot proceed without task identifier"
  exit 1
fi

# 2. Extract and validate task ID
TASK_ID=$(echo "#$ARGUMENTS" | cut -d'-' -f1)
if [ -z "$TASK_ID" ] || ! [[ "$TASK_ID" =~ ^[0-9]+$ ]]; then
  echo "ERROR: Invalid task ID format. Expected format: 001-task-name"
  echo "ERROR: Cannot determine task ID from: #$ARGUMENTS"
  exit 1
fi

# 3. Check ALL required files exist before proceeding
MISSING_FILES=()
for file in ".aidev-storage/tasks/#$ARGUMENTS.json" ".aidev-storage/tasks/#$ARGUMENTS.md" ".aidev-storage/tasks_output/$TASK_ID/prp.md" ".aidev-storage/tasks_output/$TASK_ID/user_changes.json"; do
  if [ ! -f "$file" ]; then
    MISSING_FILES+=("$file")
  fi
done

if [ ${#MISSING_FILES[@]} -gt 0 ]; then
  echo "ERROR: Required files not found:"
  for file in "${MISSING_FILES[@]}"; do
    echo "  - $file"
  done
  echo "ERROR: Cannot proceed without ALL required files"
  exit 1
fi

# 4. Verify PRP is not empty
if [ ! -s ".aidev-storage/tasks_output/$TASK_ID/prp.md" ]; then
  echo "ERROR: PRP file exists but is empty: .aidev-storage/tasks_output/$TASK_ID/prp.md"
  echo "ERROR: Cannot learn without implementation plan"
  exit 1
fi

# 5. Verify user_changes.json is valid JSON
if ! jq . ".aidev-storage/tasks_output/$TASK_ID/user_changes.json" >/dev/null 2>&1; then
  echo "ERROR: user_changes.json is not valid JSON"
  echo "ERROR: Cannot parse user changes"
  exit 1
fi

echo "✅ Pre-flight validation PASSED for task #$ARGUMENTS"
echo "📁 All required files present and valid"
```

<pre-flight-validation>
<mandatory-checks>
  □ Task argument provided
  □ Task JSON/MD files exist
  □ PRP exists at `.aidev-storage/tasks_output/$TASK_ID/prp.md`
  □ User changes exist at `.aidev-storage/tasks_output/$TASK_ID/user_changes.json`
</mandatory-checks>
</pre-flight-validation>

### 1. Context Loading

#### 1.1 Load Task Context
- Read task specification from `.aidev-storage/tasks/#$ARGUMENTS.md`
- Extract task type, objectives, and requirements

#### 1.2 Load PRP
- Read PRP from `.aidev-storage/tasks_output/$TASK_ID/prp.md`
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
if [ -f ".aidev-storage/patterns/learned-patterns.json" ]; then
  echo "✅ Found existing patterns database"
  PATTERN_COUNT=$(jq '.patterns | length' .aidev-storage/patterns/learned-patterns.json)
  echo "📊 Existing patterns: $PATTERN_COUNT"
else
  echo "📝 Creating new patterns database"
  mkdir -p .aidev-storage/patterns
  echo '{"patterns": {}, "antipatterns": {}, "statistics": {"totalPatterns": 0, "totalAntipatterns": 0, "lastLearningSession": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'", "tasksAnalyzed": [], "averageConfidence": 0}}' > .aidev-storage/patterns/learned-patterns.json
fi
```

### 3. Analyze User Changes

For each file in `fileChanges`:
1. Parse git diff to identify change patterns:
   - Lines removed (AI code): `^-`
   - Lines added (user corrections): `^+`
   - Context lines for understanding the change
   
2. Deep Analysis Categories:
   - **TypeScript Patterns**:
     - Type vs Interface usage (e.g., `interface Props` → `type Props`)
     - Readonly modifiers (e.g., `children: ReactNode` → `readonly children: ReactNode`)
     - Type definition placement (inline vs separate)
     - Generic type usage and constraints
     - Strict null checks and optional chaining
   
   - **React Patterns**:
     - Props destructuring location (parameter vs function body)
     - Component definition style (function declaration vs arrow function)
     - Hook usage patterns and custom hooks
     - Component composition patterns
     - State management approaches
   
   - **Code Organization**:
     - Import ordering and grouping
     - File structure conventions
     - Naming conventions (files, variables, functions)
     - Export patterns (named vs default)
     - Module boundaries and separation of concerns
   
   - **Style Consistency**:
     - Indentation (spaces vs tabs, number of spaces)
     - Quote style (single vs double)
     - Semicolon usage
     - Trailing commas
     - Line length preferences
   
   - **Architecture Decisions**:
     - Folder structure preferences
     - Component vs container patterns
     - Service layer organization
     - State management architecture
     - API integration patterns
   
   - **Best Practices**:
     - Error handling patterns
     - Loading state management
     - Validation approaches
     - Security considerations
     - Performance optimizations
   
   - **Testing Patterns**:
     - Test file placement
     - Test naming conventions
     - Testing utilities usage
     - Mock patterns
     - Coverage requirements

3. Pattern Extraction Process:
   - Identify repeated changes across multiple files
   - Look for systematic replacements (e.g., all `interface` → `type`)
   - Detect structural patterns (e.g., consistent prop destructuring)
   - Find preference indicators (e.g., always using readonly for props)
   - Recognize project-specific conventions

### 4. Extract Learnings

#### 4.1 Pattern Recognition Examples

**Example 1: TypeScript Type Definitions**
```diff
-interface ThemeProviderProps {
-  children: React.ReactNode;
-}
+type ThemeProviderProps = {
+    readonly children: React.ReactNode;
+};
```

Generates patterns:
```json
{
  "prefer-type-over-interface": {
    "id": "prefer-type-over-interface",
    "description": "Use type instead of interface for React component props",
    "category": "typescript",
    "rule": "Prefer type definitions over interfaces for React props",
    "implementation": "type ComponentProps = { ... } instead of interface ComponentProps { ... }",
    "reason": "Consistent with project conventions, better for unions and intersections",
    "confidence": 0.85,
    "examples": ["app/layout.tsx:8-10", "src/providers/ThemeProvider.tsx:7-9"],
    "contexts": ["react-components", "typescript"],
    "antiPattern": "interface ComponentProps { ... }",
    "codeExample": {
      "good": "type ButtonProps = { readonly onClick: () => void; }",
      "bad": "interface ButtonProps { onClick: () => void; }"
    }
  },
  "readonly-react-props": {
    "id": "readonly-react-props",
    "description": "Mark all React component props as readonly",
    "category": "typescript",
    "rule": "Always use readonly modifier for React component prop properties",
    "implementation": "type ComponentProps = { readonly propName: PropType; }",
    "reason": "Enforces immutability, prevents accidental prop mutations, follows functional programming principles",
    "confidence": 0.9,
    "examples": ["app/layout.tsx:9", "src/providers/ThemeProvider.tsx:8"],
    "contexts": ["react-components", "typescript"]
  }
}
```

**Example 2: Props Destructuring Pattern**
```diff
-export default function RootLayout({
-  children,
-}: Readonly<{
-  children: React.ReactNode;
-}>) {
+export default function RootLayout(props: RootLayoutProps) {
+    const { children } = props;
```

Generates pattern:
```json
{
  "props-destructuring-in-body": {
    "id": "props-destructuring-in-body",
    "description": "Destructure props inside function body, not in parameters",
    "category": "react",
    "rule": "Accept props as a single parameter and destructure inside the function body",
    "implementation": "function Component(props: Props) { const { prop1, prop2 } = props; ... }",
    "reason": "Clearer function signature, easier to add props validation, better TypeScript inference",
    "confidence": 0.8,
    "examples": ["app/layout.tsx:12-13", "src/providers/ThemeProvider.tsx:11-12"],
    "contexts": ["react-components"],
    "antiPattern": "function Component({ prop1, prop2 }: Props) { ... }",
    "codeExample": {
      "good": "function Button(props: ButtonProps) {\\n    const { onClick, label } = props;\\n    return <button onClick={onClick}>{label}</button>;\\n}",
      "bad": "function Button({ onClick, label }: ButtonProps) {\\n    return <button onClick={onClick}>{label}</button>;\\n}"
    }
  }
}
```

**Example 3: Indentation Style**
```diff
-  return (
-    <Container maxWidth="lg">
+    return (
+        <Container maxWidth="lg">
```

Generates pattern:
```json
{
  "four-space-indentation": {
    "id": "four-space-indentation",
    "description": "Use 4 spaces for indentation",
    "category": "style",
    "rule": "Always use 4 spaces for indentation, not 2 spaces or tabs",
    "implementation": "Configure editor/prettier to use 4-space indentation",
    "reason": "Consistency with project style guide, better readability",
    "confidence": 0.95,
    "examples": ["app/globals.css:*", "app/layout.tsx:*", "app/page.tsx:*"],
    "contexts": ["all-files"],
    "severity": "high"
  }
}
```

#### 4.2 Advanced Pattern Detection

**Detecting Systematic Changes:**
1. **Consistency Analysis**: If the same change appears in 3+ files, confidence increases by 0.2
2. **Context Matching**: Changes in similar contexts (e.g., all React components) gain +0.1 confidence
3. **Pattern Reinforcement**: If a pattern was already learned and appears again, +0.15 confidence

**Complex Pattern Examples:**

```javascript
// Analyze import order changes
const importOrderPattern = {
  "id": "import-order-convention",
  "description": "Specific import ordering: external → internal → relative",
  "category": "code-organization",
  "rule": "Order imports: 1) Node modules, 2) External packages, 3) Aliases (@/), 4) Relative paths",
  "implementation": "// External\nimport React from 'react';\nimport { Box } from '@mui/material';\n\n// Internal\nimport { theme } from '@/lib/theme';\n\n// Relative\nimport './styles.css';",
  "contexts": ["all-typescript-files"]
}
```

#### 4.3 Contextual Learning Extraction

**Understanding the "Why" Behind Changes:**

1. **TypeScript Strictness Patterns**
   - When user adds `readonly` → Learn: "Project values immutability"
   - When user changes `interface` to `type` → Learn: "Prefer type aliases for object shapes"
   - Context: These indicate a preference for functional programming principles

2. **Component Structure Patterns**
   ```diff
   // AI generated:
   -export default function Component({ prop1, prop2 }: Props) {
   // User corrected:
   +export default function Component(props: Props) {
   +    const { prop1, prop2 } = props;
   ```
   - Learn: "Destructure props in function body for clarity"
   - Reason: Better for debugging, adding prop validation, and TypeScript inference

3. **Code Organization Patterns**
   - Consistent file structure across components
   - Type definitions before implementation
   - Imports organized by source

**Pattern Correlation:**
- If user makes similar changes across multiple files → High confidence pattern
- If changes only in specific file types → Context-specific pattern
- If changes align with known best practices → Reinforced pattern

<learning-extraction-rules>
<quality-criteria>
  Only extract learnings that are:
  □ Generalizable beyond this task
  □ Consistent across multiple files (3+ occurrences = high confidence)
  □ Clear improvements with reasoning (not arbitrary preferences)
  □ Likely to occur again in similar contexts
  □ Not one-off bug fixes or typos
  □ Aligned with known best practices or project conventions
</quality-criteria>

<pattern-detection-heuristics>
  □ Repeated replacements (e.g., all `interface` → `type`)
  □ Structural changes (e.g., consistent prop handling)
  □ Style consistency (e.g., always 4-space indent)
  □ TypeScript strictness (e.g., always readonly)
  □ React patterns (e.g., functional components only)
  □ Testing patterns (e.g., test file naming)
</pattern-detection-heuristics>

<confidence-calculation>
  Base confidence starts at 0.5, then adjust:
  +0.2: Pattern appears in 3+ files
  +0.15: Aligns with TypeScript/React best practices
  +0.1: Consistent within same file type/context
  +0.1: Has clear technical justification
  +0.05: Each additional occurrence
  -0.2: Only appears once
  -0.15: Could be personal preference
  -0.1: Contradicts common conventions
  
  Final ranges:
  High (0.8+): Systematic changes, best practices, security/performance
  Medium (0.5-0.8): Clear improvements, consistent patterns
  Low (<0.5): Single occurrences, unclear benefit
</confidence-calculation>

<pattern-categories>
  1. **Enforcement Patterns** (confidence 0.9+):
     - Security fixes (e.g., input validation)
     - TypeScript strictness (e.g., no any, readonly)
     - React best practices (e.g., key props, memo)
  
  2. **Convention Patterns** (confidence 0.7-0.9):
     - Naming conventions
     - File organization
     - Import structure
     - Component patterns
  
  3. **Style Patterns** (confidence 0.6-0.8):
     - Formatting preferences
     - Code organization
     - Comment styles
  
  4. **Architecture Patterns** (confidence 0.7-0.9):
     - Folder structure
     - Module boundaries
     - State management
     - API patterns
</pattern-categories>
</learning-extraction-rules>

### 5. Implementation Guide for Learning Extraction

#### 5.1 Diff Analysis Algorithm
```javascript
// Pseudo-code for analyzing diffs
function analyzeDiff(fileChange) {
    const patterns = [];
    const lines = fileChange.diff.split('\n');
    
    // Track consecutive changes for pattern detection
    const changeBlocks = groupConsecutiveChanges(lines);
    
    for (const block of changeBlocks) {
        // Analyze type definition changes
        if (hasTypeDefinitionChange(block)) {
            patterns.push(extractTypePattern(block));
        }
        
        // Analyze structural changes
        if (hasStructuralChange(block)) {
            patterns.push(extractStructuralPattern(block));
        }
        
        // Analyze style changes
        if (hasStyleChange(block)) {
            patterns.push(extractStylePattern(block));
        }
    }
    
    return patterns;
}
```

#### 5.2 Pattern Matching Logic
- **Type Pattern Detection**: Look for `interface` → `type`, `readonly` additions, generic constraints
- **React Pattern Detection**: Props handling, component structure, hook usage
- **Style Pattern Detection**: Indentation changes, quote styles, formatting
- **Import Pattern Detection**: Order changes, grouping, path aliases

### 6. Pattern Consolidation

```bash
# Enhanced deduplication with similarity scoring
consolidate_patterns() {
    local NEW_PATTERN="$1"
    local PATTERN_ID=$(echo "$NEW_PATTERN" | jq -r '.id')
    local PATTERN_RULE=$(echo "$NEW_PATTERN" | jq -r '.rule')
    
    # Check for existing similar patterns
    EXISTING_PATTERNS=$(jq '.patterns | to_entries[] | select(.value.rule != null)' .aidev-storage/patterns/learned-patterns.json 2>/dev/null || echo "")
    
    BEST_MATCH=""
    BEST_SCORE=0
    
    while IFS= read -r existing; do
        if [ -z "$existing" ]; then continue; fi
        
        EXISTING_ID=$(echo "$existing" | jq -r '.key')
        EXISTING_RULE=$(echo "$existing" | jq -r '.value.rule')
        
        # Calculate similarity score (simplified)
        SCORE=$(calculate_similarity "$PATTERN_RULE" "$EXISTING_RULE")
        
        if (( $(echo "$SCORE > $BEST_SCORE" | bc -l) )); then
            BEST_SCORE=$SCORE
            BEST_MATCH=$EXISTING_ID
        fi
    done <<< "$EXISTING_PATTERNS"
    
    # Decide action based on similarity
    if (( $(echo "$BEST_SCORE >= 0.8" | bc -l) )); then
        echo "📌 Merging with existing pattern: $BEST_MATCH (similarity: $BEST_SCORE)"
        # Merge patterns, increment occurrence count
        merge_patterns "$PATTERN_ID" "$BEST_MATCH"
    elif (( $(echo "$BEST_SCORE >= 0.5" | bc -l) )); then
        echo "🔀 Creating variant of: $BEST_MATCH (similarity: $BEST_SCORE)"
        # Create as variant
        create_variant "$PATTERN_ID" "$BEST_MATCH"
    else
        echo "✨ New unique pattern: $PATTERN_ID"
        # Add as new pattern
        add_new_pattern "$NEW_PATTERN"
    fi
}

# Helper function to calculate similarity between rules
calculate_similarity() {
    local RULE1="$1"
    local RULE2="$2"
    
    # Simple word-based similarity (in practice, use more sophisticated algorithm)
    local WORDS1=$(echo "$RULE1" | tr '[:upper:]' '[:lower:]' | tr -cs '[:alnum:]' '\n' | sort -u)
    local WORDS2=$(echo "$RULE2" | tr '[:upper:]' '[:lower:]' | tr -cs '[:alnum:]' '\n' | sort -u)
    
    local COMMON=$(comm -12 <(echo "$WORDS1") <(echo "$WORDS2") | wc -l)
    local TOTAL=$(echo "$WORDS1" "$WORDS2" | tr ' ' '\n' | sort -u | wc -l)
    
    echo "scale=2; $COMMON / $TOTAL" | bc
}
```

### 7. Update Learning Database

Update `.aidev-storage/patterns/learned-patterns.json`:

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

### 8. Apply Confidence Algorithm

```
New pattern: 0.5
Each occurrence: +0.1 (max 0.95)
Successful application: +0.05 (max 0.95)
Conflicting correction: -0.2 (min 0.1)
Best practice bonus: +0.2
Security/performance bonus: +0.15
```

### 9. Validation and Output

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

AI Development command was successful
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

## Practical Learning Example

### Real-World Scenario
Given the user changes from task 001-setup-nextjs-project, here's how the learning extraction would work:

#### Step 1: Analyze Changes
```bash
# From user_changes.json, we see systematic changes:
# 1. All files: 2-space → 4-space indentation
# 2. React files: interface → type for props
# 3. React files: Added readonly to all props
# 4. React files: Props destructuring moved to function body
```

#### Step 2: Extract Patterns
The system would generate these patterns from the analysis:

```json
{
  "patterns": {
    "four-space-indentation": {
      "id": "four-space-indentation",
      "description": "Use 4 spaces for indentation consistently",
      "category": "style",
      "rule": "Always use 4 spaces for indentation",
      "implementation": "Configure formatter to use 4-space indentation",
      "reason": "Project convention for readability",
      "confidence": 0.95,
      "occurrences": 5,
      "examples": ["app/globals.css:1-30", "app/layout.tsx:1-27", "app/page.tsx:1-25"],
      "contexts": ["all-files"],
      "sources": ["001-setup-nextjs-project"]
    },
    "react-props-type-definition": {
      "id": "react-props-type-definition",
      "description": "Use type with readonly for React props",
      "category": "typescript",
      "rule": "Define React props as: type ComponentProps = { readonly prop: Type; }",
      "implementation": "type ComponentProps = {\n    readonly children: React.ReactNode;\n    readonly onClick: () => void;\n};",
      "reason": "Enforces immutability and prevents accidental mutations",
      "confidence": 0.9,
      "occurrences": 2,
      "examples": ["app/layout.tsx:8-10", "src/providers/ThemeProvider.tsx:7-9"],
      "contexts": ["react-components"],
      "antiPattern": "interface ComponentProps { children: React.ReactNode; }",
      "sources": ["001-setup-nextjs-project"],
      "codeExample": {
        "good": "type ButtonProps = {\n    readonly label: string;\n    readonly onClick: () => void;\n};",
        "bad": "interface ButtonProps {\n    label: string;\n    onClick: () => void;\n}"
      }
    },
    "props-destructuring-pattern": {
      "id": "props-destructuring-pattern",
      "description": "Destructure props inside function body",
      "category": "react",
      "rule": "Accept props parameter and destructure in function body",
      "implementation": "function Component(props: Props) {\n    const { prop1, prop2 } = props;\n    // component logic\n}",
      "reason": "Clearer function signatures and better TypeScript support",
      "confidence": 0.85,
      "occurrences": 2,
      "examples": ["app/layout.tsx:12-13", "src/providers/ThemeProvider.tsx:11-12"],
      "contexts": ["react-components"],
      "sources": ["001-setup-nextjs-project"]
    }
  },
  "statistics": {
    "totalPatterns": 3,
    "totalAntipatterns": 0,
    "lastLearningSession": "2025-07-16T12:00:00Z",
    "tasksAnalyzed": ["001-setup-nextjs-project"],
    "averageConfidence": 0.9,
    "highConfidencePatterns": 3
  }
}
```

#### Step 3: Apply to Future Tasks
When generating code for future tasks, the AI would:
1. Use 4-space indentation (confidence: 0.95)
2. Define React props as types with readonly (confidence: 0.9)
3. Destructure props in function body (confidence: 0.85)

## Example Patterns

### High-Confidence Pattern Example
```json
{
  "typescript-readonly-props": {
    "id": "typescript-readonly-props",
    "description": "Mark all React component props as readonly",
    "category": "typescript",
    "rule": "Always use readonly modifier for React component props",
    "implementation": "type Props = { readonly children: React.ReactNode; }",
    "reason": "Prevents prop mutations, enforces immutability",
    "confidence": 0.92,
    "lastUpdated": "2025-07-16T12:00:00Z",
    "occurrences": 15,
    "examples": ["app/layout.tsx:9", "components/Button.tsx:5"],
    "contexts": ["react-components", "typescript"],
    "sources": ["001-setup-nextjs", "005-add-components"],
    "codeExample": {
      "good": "type CardProps = {\n    readonly title: string;\n    readonly content: React.ReactNode;\n};",
      "bad": "type CardProps = {\n    title: string;\n    content: React.ReactNode;\n};"
    }
  }
}
```

### Anti-Pattern Example
```json
{
  "avoid-inline-prop-types": {
    "id": "avoid-inline-prop-types",
    "description": "Don't use inline prop type definitions",
    "category": "typescript",
    "avoid": "Defining props inline in function parameters",
    "instead": "Create separate type definition before component",
    "reason": "Better readability, reusability, and TypeScript performance",
    "examples": ["app/layout.tsx:8-17"],
    "confidence": 0.88,
    "occurrences": 4,
    "severity": "medium",
    "sources": ["001-setup-nextjs-project"],
    "codeExample": {
      "bad": "function Button({ onClick, label }: { onClick: () => void; label: string; }) { }",
      "good": "type ButtonProps = {\n    readonly onClick: () => void;\n    readonly label: string;\n};\n\nfunction Button(props: ButtonProps) { }"
    }
  }
}
```