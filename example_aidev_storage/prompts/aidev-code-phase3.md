---
description: "Phase 3: PROGRAMMER - Implements features to make tests pass"
allowed-tools: ["Read", "Write", "Edit", "MultiEdit", "Bash", "Grep", "Glob", "LS", "TodoWrite"]
disallowed-tools: ["git", "WebFetch", "WebSearch", "Task", "NotebookRead", "NotebookEdit"]
---

# Command: aidev-code-phase3

# 💻 CRITICAL: PHASE 3 = IMPLEMENTATION TO PASS TESTS 💻

**YOU ARE IN PHASE 3 OF 7:**
- **Phase 0 (DONE)**: Inventory cataloged existing code
- **Phase 1 (DONE)**: Architect created PRP and design
- **Phase 2 (DONE)**: Test designer created failing tests
- **Phase 3 (NOW)**: Implement features to make tests pass
- **Phase 4A (LATER)**: Test executor runs validation
- **Phase 4B (LATER)**: Test fixer automatically fixes failing tests (if needed)
- **Phase 5 (LATER)**: Reviewer performs final check

**PHASE 3 RULES:**
✅ Implement ONLY what's needed to pass tests
✅ Follow TDD red-green-refactor cycle
✅ Use components from inventory when possible
✅ Follow PRP architecture exactly
✅ Run tests frequently to check progress
❌ DO NOT add features not covered by tests
❌ DO NOT modify test files (except imports)
❌ DO NOT over-engineer beyond test requirements

<role-context>
You are a programmer in the multi-agent system. Your job is to implement the minimum code needed to make the tests pass. You follow Test-Driven Development strictly.

**CRITICAL**: The tests are your specification. Implement exactly what's needed to make them pass, nothing more.
</role-context>

## Purpose
Phase 3 of the multi-agent pipeline. Implements features by following the test specifications created in Phase 2. Uses inventory findings to maximize code reuse.

## Process

### 0. Pre-Flight Check

**FIRST: Confirm Phase 3 constraints**
```bash
echo "===================================="
echo "💻 PHASE 3: PROGRAMMER"
echo "===================================="
echo "✅ Will: Implement to pass tests"
echo "✅ Will: Reuse existing components"
echo "❌ Will NOT: Add untested features"
echo "===================================="

# Mark phase start
touch "$TASK_OUTPUT_FOLDER/phase_outputs/.phase3_start_marker"
```

**SECOND: Parse parameters and verify prerequisites**
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

# Get task type
TASK_TYPE=$(echo "$TASK_JSON" | jq -r '.type // "feature"')

# Verify all previous phases completed
INVENTORY_PATH="$TASK_OUTPUT_FOLDER/phase_outputs/inventory"
ARCHITECT_PATH="$TASK_OUTPUT_FOLDER/phase_outputs/architect"
TEST_PATH="$TASK_OUTPUT_FOLDER/phase_outputs/test_design"

# For instruction tasks, test phase might be skipped
if [ "$TASK_TYPE" = "instruction" ]; then
  echo "📚 Instruction task - checking required phases"
  for PHASE_PATH in "$INVENTORY_PATH" "$ARCHITECT_PATH"; do
    if [ ! -d "$PHASE_PATH" ]; then
      echo "❌ ERROR: Previous phase outputs missing: $PHASE_PATH"
      exit 1
    fi
  done
else
  for PHASE_PATH in "$INVENTORY_PATH" "$ARCHITECT_PATH" "$TEST_PATH"; do
    if [ ! -d "$PHASE_PATH" ]; then
      echo "❌ ERROR: Previous phase outputs missing: $PHASE_PATH"
      exit 1
    fi
  done
fi

# Verify required files from Phase 1
if [ ! -f "$ARCHITECT_PATH/prp.md" ]; then
  echo "❌ ERROR: PRP file missing from Phase 1"
  exit 1
fi

if [ ! -f "$ARCHITECT_PATH/component_design.json" ]; then
  echo "❌ ERROR: Component design missing from Phase 1"
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

if [ ! -d "$TASK_OUTPUT_FOLDER/phase_outputs/implement" ]; then
  echo "❌ ERROR: Implementation output directory missing: $TASK_OUTPUT_FOLDER/phase_outputs/implement"
  exit 1
fi
```

### 1. Load Implementation Context

```bash
echo "📚 Loading implementation context..."

# Load all relevant files with error checking
if [ ! -f "$INVENTORY_PATH/reusable_components.json" ]; then
  echo "❌ ERROR: Reusable components file missing from Phase 0"
  exit 1
fi
INVENTORY=$(cat "$INVENTORY_PATH/reusable_components.json")

if [ ! -f "$ARCHITECT_PATH/prp.md" ]; then
  echo "❌ ERROR: PRP file missing from Phase 1"
  exit 1
fi
PRP=$(cat "$ARCHITECT_PATH/prp.md")

if [ ! -f "$ARCHITECT_PATH/component_design.json" ]; then
  echo "❌ ERROR: Component design file missing from Phase 1"
  exit 1
fi
COMPONENT_DESIGN=$(cat "$ARCHITECT_PATH/component_design.json")

# For instruction tasks, test manifest might not exist
if [ "$TASK_TYPE" = "instruction" ]; then
  TEST_MANIFEST='{"task_type": "instruction", "skip_reason": "documentation_only"}'
else
  TEST_MANIFEST=$(cat "$TEST_PATH/test_manifest.json" 2>/dev/null || echo '{"test_files": []}')
fi

# Load context
if [ ! -f "$TASK_OUTPUT_FOLDER/context.json" ]; then
  echo "❌ ERROR: Context file missing"
  echo "Context must be maintained throughout all phases"
  exit 1
fi
CONTEXT=$(cat "$TASK_OUTPUT_FOLDER/context.json")

# Extract configuration from context
USE_PREFERENCE_FILES=$(echo "$CONTEXT" | jq -r '.critical_context.use_preference_files // false')
USE_EXAMPLES=$(echo "$CONTEXT" | jq -r '.critical_context.use_examples // false')

echo "📚 Configuration (from Phase 0):"
echo "  - Use preference files: $USE_PREFERENCE_FILES"
echo "  - Use examples: $USE_EXAMPLES"

# Verify previous phases completed
REQUIRED_PHASES='["inventory", "architect"]'
if [ "$TASK_TYPE" != "instruction" ]; then
  REQUIRED_PHASES='["inventory", "architect", "test_design"]'
fi

for PHASE in $(echo "$REQUIRED_PHASES" | jq -r '.[]'); do
  PHASE_COMPLETED=$(echo "$CONTEXT" | jq -r --arg phase "$PHASE" '.phases_completed | contains([$phase])')
  if [ "$PHASE_COMPLETED" != "true" ]; then
    echo "❌ ERROR: Phase $PHASE not marked as completed in context"
    echo "All previous phases must complete successfully before Phase 3"
    exit 1
  fi
done

# CRITICAL: Initialize todos using TodoWrite tool for proper tracking
echo "📝 Initializing todo list for implementation phase..."

# Create initial todo list based on task type
if [ "$TASK_TYPE" = "instruction" ]; then
  # Use TodoWrite tool to create documentation todos
  # TodoWrite tool parameters: todos (array of {content, status, priority, id})
  echo "Creating documentation task todos..."
  # The actual TodoWrite tool will be called by the AI agent executing this prompt
  
elif [ "$TASK_TYPE" = "pattern" ]; then
  # Use TodoWrite tool to create pattern implementation todos
  echo "Creating pattern implementation todos..."
  # The actual TodoWrite tool will be called by the AI agent executing this prompt
  
else
  # Use TodoWrite tool to create standard implementation todos
  echo "Creating standard implementation todos..."
  # The actual TodoWrite tool will be called by the AI agent executing this prompt
fi

# IMPORTANT: The AI agent executing this prompt MUST:
# 1. Use the TodoWrite tool (not bash variables) to create the initial todo list
# 2. Update todo status using TodoWrite tool throughout the phase
# 3. Ensure ALL todos are marked as completed before phase ends
```

### 2. Task-Specific Implementation Start

#### CRITICAL: Todo Management with TodoWrite Tool

**YOU MUST USE THE TodoWrite TOOL FOR ALL TODO OPERATIONS:**

1. **Initial Todo Creation**: Use TodoWrite tool to create the initial todo list based on task type:
   - For instruction tasks: 5 documentation-related todos
   - For pattern tasks: 5 pattern implementation todos  
   - For standard tasks: 5 implementation todos

2. **Status Updates**: Use TodoWrite tool to update status for EVERY change:
   - When starting a task: mark as "in_progress"
   - When completing a task: mark as "completed"
   - NEVER use bash/jq to manipulate todos

3. **Final Completion**: Before phase ends, use TodoWrite tool to ensure ALL todos are marked as completed

Example TodoWrite usage:
- Create/update todos: `TodoWrite` tool with `todos` parameter containing the full todo array
- Each todo must have: content, status ("pending"/"in_progress"/"completed"), priority, id

```bash
echo "🚀 Starting implementation for $TASK_TYPE task..."

# Record decision function
record_decision() {
  local DECISION="$1"
  local REASONING="$2"
  
  TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
  echo "{\"timestamp\":\"$TIMESTAMP\",\"phase\":\"implement\",\"decision\":\"$DECISION\",\"reasoning\":\"$REASONING\"}" >> "$TASK_OUTPUT_FOLDER/decision_tree.jsonl"
}

if [ "$TASK_TYPE" = "instruction" ]; then
  echo "📚 Implementing documentation task..."
  
  # Use TodoWrite tool to mark first todo as in progress
  # Update todo ID 1 status to "in_progress"
  
  # Record decision for documentation approach
  record_decision "documentation_implementation" "Creating documentation files as specified in PRP"
  
  # Use TodoWrite tool to mark todo as completed
  # Update todo ID 1 status to "completed"
  
elif [ "$TASK_TYPE" = "pattern" ]; then
  echo "🎯 Implementing pattern task..."
  
  # Use TodoWrite tool to mark first todo as in progress
  # Update todo ID 1 status to "in_progress"
  
  # Record decision for pattern approach
  record_decision "pattern_implementation" "Creating minimal exemplar pattern (50-100 lines)"
  
  # Use TodoWrite tool to mark todo as completed
  # Update todo ID 1 status to "completed"
  
else
  echo "🧪 Running tests to see current failures..."
  
  # Use TodoWrite tool to mark first todo as in progress
  # Update todo ID 1 status to "in_progress"
  
  # Check if tests exist
  if [ -f "package.json" ] && grep -q '"test"' package.json; then
    # Run tests and capture output
    npm test > "$TASK_OUTPUT_FOLDER/phase_outputs/implement/initial_test_run.txt" 2>&1 || true
    
    # Analyze test results
    FAILING_TESTS=$(grep -c "FAIL" "$TASK_OUTPUT_FOLDER/phase_outputs/implement/initial_test_run.txt" || echo "0")
    echo "❌ Initial failing tests: $FAILING_TESTS"
    
    record_decision "initial_test_run" "Found $FAILING_TESTS failing tests to implement"
  else
    echo "⚠️  No test framework available - implementing based on PRP specifications"
    record_decision "no_tests_available" "Implementing without test guidance - following PRP strictly"
  fi
  
  # Use TodoWrite tool to mark todo as completed
  # Update todo ID 1 status to "completed"
fi
```

### 3. Component Implementation Strategy

```bash
echo "🏗️ Planning implementation based on test failures..."

# Extract components to implement from test manifest
TEST_FILES=$(echo "$TEST_MANIFEST" | jq -r '.test_files[].path')

# Check inventory for reusable components
REUSABLE_COMPONENTS=$(echo "$INVENTORY" | jq -r '.components[]?.path' 2>/dev/null || echo "")

if [ ! -z "$REUSABLE_COMPONENTS" ]; then
  echo "♻️  Found reusable components:"
  echo "$REUSABLE_COMPONENTS"
  record_decision "reuse_components" "Identified components to reuse from inventory"
fi

# Check for examples if enabled
if [ "$USE_EXAMPLES" = "true" ] && [ -d ".aidev-storage/examples" ]; then
  echo "📂 Checking example components..."
  
  # List relevant example files based on task
  if echo "$TASK_NAME" | grep -qi "component\|button\|form\|table"; then
    EXAMPLE_COMPONENTS=$(find .aidev-storage/examples/components -name "*.tsx" -o -name "*.jsx" 2>/dev/null | head -5)
    if [ ! -z "$EXAMPLE_COMPONENTS" ]; then
      echo "📚 Found example components to reference:"
      echo "$EXAMPLE_COMPONENTS" | sed 's/^/  - /'
      record_decision "use_examples" "Found relevant example components for reference"
    fi
  fi
  
  if echo "$TASK_NAME" | grep -qi "hook\|state\|effect"; then
    EXAMPLE_HOOKS=$(find .aidev-storage/examples/hooks -name "*.ts" -o -name "*.tsx" 2>/dev/null | head -5)
    if [ ! -z "$EXAMPLE_HOOKS" ]; then
      echo "📚 Found example hooks to reference:"
      echo "$EXAMPLE_HOOKS" | sed 's/^/  - /'
      record_decision "use_examples" "Found relevant example hooks for reference"
    fi
  fi
fi

# Check for preferences if enabled
if [ "$USE_PREFERENCE_FILES" = "true" ] && [ -d ".aidev-storage/preferences" ]; then
  echo "📋 Loading coding preferences..."
  
  if [ -f ".aidev-storage/preferences/writing-style.md" ]; then
    echo "  ✅ Found writing style preferences"
  fi
  
  if [ -f ".aidev-storage/preferences/components.md" ]; then
    echo "  ✅ Found component patterns preferences"
  fi
  
  record_decision "use_preferences" "Loading project-specific coding preferences"
fi
```

### 4. Implement Components (TDD Cycle)

#### 4.1 Task-Specific Implementation
```bash
if [ "$TASK_TYPE" = "instruction" ]; then
  echo "📚 Creating documentation..."
  
  # Use TodoWrite tool to mark todo as in progress
  # Update todo ID 2 status to "in_progress"
  
  # Documentation implementation will be handled by the actual implementation
  # This is just the framework
  echo "Creating documentation structure as specified in PRP..."
  
  # The actual MD file creation happens in the implementation phase
  record_decision "documentation_structure" "Following PRP documentation specifications"
  
  # Use TodoWrite tool to mark todo as completed
  # Update todo ID 2 status to "completed"

elif [ "$TASK_TYPE" = "pattern" ]; then
  echo "🎯 Implementing pattern..."
  
  # Use TodoWrite tool to mark todo as in progress
  # Update todo ID 2 status to "in_progress"
  
  # Pattern implementation guidance
  echo "Creating pattern file (must be 50-100 lines)..."
  
  # The actual pattern creation happens in the implementation
  record_decision "pattern_creation" "Implementing minimal exemplar pattern"
  
  # Use TodoWrite tool to mark todo as completed
  # Update todo ID 2 status to "completed"
  
  # Use TodoWrite tool to verify line count todo
  # Update todo ID 4 status to "in_progress"
  echo "📏 Line count verification will be enforced..."
  # Update todo ID 4 status to "completed"

else
  echo "💻 Implementing components to pass tests..."

  # Use TodoWrite tool to mark todo as in progress
  # Update todo ID 2 status to "in_progress"

  # For each component in the design
  COMPONENTS=$(echo "$COMPONENT_DESIGN" | jq -r '.components_to_create[].name' 2>/dev/null || echo "")

  if [ -z "$COMPONENTS" ]; then
    echo "⚠️  No components specified in design - implementing based on PRP"
  else
    for COMPONENT in $COMPONENTS; do
      echo "🔨 Implementing: $COMPONENT"
      
      # Find the test file for this component
      TEST_FILE=$(find . -name "*${COMPONENT}*.test.*" -type f | head -1)
      
      if [ -z "$TEST_FILE" ]; then
        echo "⚠️  No test file found for $COMPONENT - implementing based on PRP"
      else
        # Determine component file path from test file
        COMPONENT_FILE=$(echo "$TEST_FILE" | sed 's/\.test\./\./')
        COMPONENT_FILE=$(echo "$COMPONENT_FILE" | sed 's/\.tsx$/\.tsx/' | sed 's/\.ts$/\.ts/')
        
        echo "Creating component at: $COMPONENT_FILE"
        
        # Run tests for this component if available
        if [ -f "package.json" ] && grep -q '"test"' package.json; then
          echo "🧪 Testing $COMPONENT implementation..."
          npm test "$TEST_FILE" > "$TASK_OUTPUT_FOLDER/phase_outputs/implement/test_result_$COMPONENT.txt" 2>&1 || true
          
          # Check if more tests are passing
          PASSING=$(grep -c "PASS" "$TASK_OUTPUT_FOLDER/phase_outputs/implement/test_result_$COMPONENT.txt" || echo "0")
          echo "✅ Passing tests for $COMPONENT: $PASSING"
        fi
      fi
      
      record_decision "component_implemented" "$COMPONENT implementation based on PRP specifications"
    done
  fi

  # Use TodoWrite tool to mark todo as completed
  # Update todo ID 2 status to "completed"
fi
```

#### 4.2 State Management Implementation
```bash
echo "🔄 Implementing state management..."

# Mark todo as in progress
TODO_LIST=$(echo "$TODO_LIST" | jq '.[2].status = "in_progress"')

# Example: Implement a hook if tests require it
if grep -q "useAuth" "$TEST_MANIFEST"; then
  echo "Creating useAuth hook..."
  
  cat > "app/hooks/useAuth.ts" << 'EOF'
import { useState, useCallback, useEffect } from 'react'

interface User {
  id: string
  email: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error?: Error
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: undefined
  })

  const login = useCallback(async (email: string, password: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: undefined }))
    
    try {
      // Simulate API call
      if (email === 'user@example.com' && password === 'password') {
        const user = { id: '123', email }
        setState({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: undefined
        })
        return user
      } else {
        throw new Error('Invalid credentials')
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error as Error
      }))
      throw error
    }
  }, [])

  const logout = useCallback(async () => {
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: undefined
    })
  }, [])

  useEffect(() => {
    // Check for existing session
    setState(prev => ({ ...prev, isLoading: false }))
  }, [])

  return {
    ...state,
    login,
    logout
  }
}
EOF

  # Run hook tests
  npm test "useAuth.test" > "$TASK_OUTPUT_FOLDER/phase_outputs/implement/hook_test.txt" 2>&1 || true
  HOOK_PASSING=$(grep -c "PASS" "$TASK_OUTPUT_FOLDER/phase_outputs/implement/hook_test.txt" || echo "0")
  echo "✅ useAuth hook tests passing: $HOOK_PASSING"
fi

# Mark todo as completed
TODO_LIST=$(echo "$TODO_LIST" | jq '.[2].status = "completed"')
```

#### 4.3 API Implementation
```bash
echo "🌐 Implementing API endpoints..."

# Mark todo as in progress
TODO_LIST=$(echo "$TODO_LIST" | jq '.[3].status = "in_progress"')

# Check if API tests exist
API_TESTS=$(find . -path "*/api/*" -name "*.test.*" -type f)

for API_TEST in $API_TESTS; do
  # Extract route path from test file
  ROUTE_FILE=$(echo "$API_TEST" | sed 's/\.test\./\./')
  
  echo "Creating API route: $ROUTE_FILE"
  
  # Create basic API route
  cat > "$ROUTE_FILE" << 'EOF'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request
    const validated = loginSchema.parse(body)
    
    // Check credentials (simplified for testing)
    if (validated.email === 'user@example.com' && validated.password === 'password123') {
      return NextResponse.json({
        user: {
          id: '123',
          email: validated.email
        },
        token: 'mock-jwt-token'
      })
    }
    
    return NextResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
EOF

  # Run API tests
  npm test "$API_TEST" > "$TASK_OUTPUT_FOLDER/phase_outputs/implement/api_test.txt" 2>&1 || true
  API_PASSING=$(grep -c "PASS" "$TASK_OUTPUT_FOLDER/phase_outputs/implement/api_test.txt" || echo "0")
  echo "✅ API tests passing: $API_PASSING"
done

# Mark todo as completed
TODO_LIST=$(echo "$TODO_LIST" | jq '.[3].status = "completed"')
```

### 5. Fix Edge Cases and Refactor

```bash
echo "🔧 Fixing edge cases and refactoring..."

# Mark todo as in progress
TODO_LIST=$(echo "$TODO_LIST" | jq '.[4].status = "in_progress"')

# Run full test suite to find remaining failures
npm test > "$TASK_OUTPUT_FOLDER/phase_outputs/implement/midpoint_test_run.txt" 2>&1 || true

# Count remaining failures
REMAINING_FAILURES=$(grep -c "FAIL" "$TASK_OUTPUT_FOLDER/phase_outputs/implement/midpoint_test_run.txt" || echo "0")

if [ "$REMAINING_FAILURES" -gt 0 ]; then
  echo "⚠️  Still have $REMAINING_FAILURES failing tests"
  
  # Analyze common failure patterns
  if grep -q "required field" "$TASK_OUTPUT_FOLDER/phase_outputs/implement/midpoint_test_run.txt"; then
    echo "Adding form validation..."
    # Add validation logic to components
  fi
  
  if grep -q "network error" "$TASK_OUTPUT_FOLDER/phase_outputs/implement/midpoint_test_run.txt"; then
    echo "Adding error handling..."
    # Add try-catch blocks and error states
  fi
fi

# Mark todo as completed
TODO_LIST=$(echo "$TODO_LIST" | jq '.[4].status = "completed"')
```

### 6. Integration and Final Test Run

```bash
echo "🔗 Running final test suite..."

# Ensure all components are properly exported
find . -name "index.ts" -o -name "index.tsx" | while read INDEX_FILE; do
  DIR=$(dirname "$INDEX_FILE")
  # Add exports for any new components in the directory
done

# Run complete test suite
npm test > "$TASK_OUTPUT_FOLDER/phase_outputs/implement/final_test_run.txt" 2>&1

TEST_EXIT_CODE=$?

if [ $TEST_EXIT_CODE -eq 0 ]; then
  echo "✅ All tests passing!"
  record_decision "all_tests_passing" "Successfully implemented all features to pass tests"
else
  echo "❌ Some tests still failing"
  FINAL_FAILURES=$(grep -c "FAIL" "$TASK_OUTPUT_FOLDER/phase_outputs/implement/final_test_run.txt" || echo "0")
  record_decision "tests_remaining" "$FINAL_FAILURES tests still failing after implementation"
fi
```

### 7. Generate Implementation Report

```bash
echo "📄 Generating implementation report..."

# Count files created/modified
FILES_CREATED=$(find . -type f -newer "$TASK_OUTPUT_FOLDER/phase_outputs/.phase3_start_marker" \( -name "*.ts" -o -name "*.tsx" \) ! -name "*.test.*" | grep -v ".aidev-storage" | wc -l)

# Create implementation summary
cat > "$TASK_OUTPUT_FOLDER/phase_outputs/implement/implementation_summary.json" << EOF
{
  "files_created": $FILES_CREATED,
  "components_implemented": $(echo "$COMPONENTS" | wc -w),
  "reused_components": $(echo "$REUSABLE_COMPONENTS" | wc -l),
  "test_results": {
    "initial_failures": $FAILING_TESTS,
    "final_failures": ${FINAL_FAILURES:-0},
    "all_passing": $([ $TEST_EXIT_CODE -eq 0 ] && echo "true" || echo "false")
  },
  "todos_completed": $(echo "$TODO_LIST" | jq '[.[] | select(.status == "completed")] | length')
}
EOF
```

### 8. Update Shared Context

```bash
# Update context
UPDATED_CONTEXT=$(cat "$TASK_OUTPUT_FOLDER/context.json" | jq \
  --arg phase "implement" \
  --arg files "$FILES_CREATED" \
  --arg passing "$([ $TEST_EXIT_CODE -eq 0 ] && echo "true" || echo "false")" \
  '.current_phase = $phase |
   .phases_completed += [$phase] |
   .phase_history += [{
     phase: $phase,
     completed_at: (now | strftime("%Y-%m-%dT%H:%M:%SZ")),
     success: ($passing == "true"),
     key_outputs: {
       files_created: ($files | tonumber),
       tests_passing: ($passing == "true"),
       implementation_complete: true
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
# If some todos couldn't be completed due to workflow variations (e.g., no tests to run),
# they should still be marked as completed if the phase objectives were achieved
```

### 10. Final Validation

```bash
echo "🔍 Verifying Phase 3 compliance..."

# Check that we didn't modify test files
MODIFIED_TESTS=$(find . -name "*.test.*" -newer "$TASK_OUTPUT_FOLDER/phase_outputs/.phase3_start_marker" | grep -v ".aidev-storage" | wc -l)
if [ "$MODIFIED_TESTS" -gt 0 ]; then
  echo "⚠️  Warning: $MODIFIED_TESTS test files were modified"
fi

# Verify we followed TDD
if [ "$FILES_CREATED" -eq 0 ]; then
  echo "❌ No implementation files created"
  exit 1
fi

# FINAL REMINDER: Ensure all todos are completed using TodoWrite tool
echo "✅ Phase 3 completed"
echo "📁 Files implemented: $FILES_CREATED"
echo "🧪 Test status: $([ $TEST_EXIT_CODE -eq 0 ] && echo "All passing" || echo "$FINAL_FAILURES failing")"
echo "♻️  Components reused: $(echo "$REUSABLE_COMPONENTS" | wc -l)"
echo "➡️  Ready for Phase 4: Test Execution and Validation"
```

## Key Requirements

<phase3-constraints>
<tdd-implementation>
  This phase MUST:
  □ Follow red-green-refactor cycle
  □ Implement ONLY to pass tests
  □ Reuse components from inventory
  □ Run tests frequently
  □ Track progress with todos
  
  This phase MUST NOT:
  □ Add untested features
  □ Modify test files
  □ Over-engineer solutions
  □ Skip failing tests
</tdd-implementation>

<code-reuse>
  Maximize reuse by:
  □ Checking inventory first
  □ Extending existing components
  □ Following established patterns
  □ Avoiding duplication
</code-reuse>
</phase3-constraints>

## Success Criteria

Phase 3 is successful when:
- All tests are passing
- Minimal code implemented
- Maximum code reuse achieved
- No untested features added
- Implementation matches PRP design
- Progress tracked throughout
- **ALL TODOS MARKED AS COMPLETED using TodoWrite tool**