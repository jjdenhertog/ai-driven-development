---
description: "Phase 0: INVENTORY & SEARCH - Catalogs existing code and finds reusable components"
allowed-tools: ["Read", "Grep", "Glob", "LS", "Bash", "Write"]
disallowed-tools: ["Edit", "MultiEdit", "NotebookEdit", "git", "Task", "TodoWrite", "WebFetch", "WebSearch"]
---

# Command: aidev-code-phase0

# 🔍 CRITICAL: PHASE 0 = INVENTORY & SEARCH ONLY 🔍

**YOU ARE IN PHASE 0 OF 7:**
- **Phase 0 (NOW)**: Inventory existing code and find reusable components
- **Phase 1 (LATER)**: Architect agent creates enhanced PRP
- **Phase 2 (LATER)**: Test designer creates test specifications
- **Phase 3 (LATER)**: Programmer implements based on tests
- **Phase 4A (LATER)**: Test executor validates implementation
- **Phase 4B (LATER)**: Test fixer automatically fixes failing tests (if needed)
- **Phase 5 (LATER)**: Reviewer agent performs final review

**PHASE 0 OUTPUTS ONLY:**
✅ `<task_output_folder>/phase_outputs/inventory/component_catalog.json`
✅ `<task_output_folder>/phase_outputs/inventory/reusable_components.json`
✅ `<task_output_folder>/phase_outputs/inventory/pattern_matches.json`
✅ `<task_output_folder>/phase_outputs/inventory/search_results.md`
✅ `<task_output_folder>/context.json` (initialize)
✅ `<task_output_folder>/decision_tree.jsonl` (initialize)

**PHASE 0 ABSOLUTELY FORBIDDEN:**
❌ Creating ANY source code files
❌ Running npm/yarn/pnpm install
❌ Setting up projects or environments
❌ Implementing features
❌ Writing files outside of .aidev-storage/tasks_output/

<role-context>
You are a code inventory specialist. Your job is to catalog the existing codebase and identify reusable components BEFORE any new code is written. This prevents the 4x code duplication problem identified in AI coding research.

**CRITICAL**: You MUST find and document existing implementations to maximize code reuse.
</role-context>


## Purpose
Phase 0 of the enhanced multi-agent pipeline. Uses pre-built codebase index to quickly identify reusable components and prevent code duplication.

## Process

### 0. Pre-Flight Check

```bash
echo "===================================="
echo "🔍 PHASE 0: INVENTORY & SEARCH ONLY"
echo "===================================="
echo "✅ Will: Query pre-built index"
echo "✅ Will: Find reusable components"
echo "❌ Will NOT: Create any source code"
echo "===================================="

# Check if index exists
if [ ! -d ".aidev-storage/index" ]; then
  echo "❌ FATAL ERROR: Codebase index not found!"
  echo "Please run: aidev index"
  exit 1
fi

# Verify required index files
REQUIRED_INDEX_FILES="components.json hooks.json utilities.json styles.json layouts.json api_routes.json patterns.json metadata.json"
for INDEX_FILE in $REQUIRED_INDEX_FILES; do
  if [ ! -f ".aidev-storage/index/$INDEX_FILE" ]; then
    echo "❌ ERROR: Index file missing: $INDEX_FILE"
    exit 1
  fi
done

# Check index age
INDEX_AGE=$(jq -r '.updated_at' .aidev-storage/index/metadata.json)
echo "📊 Using index from: $INDEX_AGE"

# Mark phase start
touch "$TASK_OUTPUT_FOLDER/phase_outputs/.phase0_start_marker"

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
if [ ! -f ".aidev-storage/tasks/$TASK_FILENAME.json" ]; then
  echo "Task not found: $TASK_FILENAME"
  exit 1
fi

TASK_JSON=$(cat .aidev-storage/tasks/$TASK_FILENAME.json)
TASK_ID=$(echo "$TASK_JSON" | jq -r '.id')
TASK_NAME=$(echo "$TASK_JSON" | jq -r '.name')
TASK_TYPE=$(echo "$TASK_JSON" | jq -r '.type // "feature"')

echo "📋 Task: $TASK_ID - $TASK_NAME (Type: $TASK_TYPE)"

# Detect simple tasks that could skip phases
TASK_COMPLEXITY="normal"
TASK_DESCRIPTION=$(echo "$TASK_JSON" | jq -r '.description // ""')

# Check for simple task indicators
if echo "$TASK_NAME $TASK_DESCRIPTION" | grep -qiE "fix.*typo|update.*comment|rename.*variable|change.*string|update.*readme|fix.*lint|format.*code"; then
  TASK_COMPLEXITY="simple"
  echo "🎯 Detected simple task - will streamline execution"
elif echo "$TASK_NAME $TASK_DESCRIPTION" | grep -qiE "refactor|new feature|api|integration|migrate|redesign"; then
  TASK_COMPLEXITY="complex"
  echo "🔧 Detected complex task - full pipeline recommended"
fi

# Parse additional parameters
USE_PREFERENCE_FILES=$(echo "$PARAMETERS_JSON" | jq -r '.use_preference_files // false')
USE_EXAMPLES=$(echo "$PARAMETERS_JSON" | jq -r '.use_examples // false')

echo "📚 Configuration:"
echo "  - Task complexity: $TASK_COMPLEXITY"
echo "  - Use preference files: $USE_PREFERENCE_FILES"
echo "  - Use examples: $USE_EXAMPLES"

# Verify storage directory exists
if [ ! -e ".aidev-storage" ]; then
  echo "❌ ERROR: .aidev-storage directory not found"
  exit 1
fi

# Verify output directories exist
if [ ! -d "$TASK_OUTPUT_FOLDER" ]; then
  echo "❌ ERROR: Task output folder missing: $TASK_OUTPUT_FOLDER"
  echo "This directory should be created by the task execution system"
  exit 1
fi

if [ ! -d "$TASK_OUTPUT_FOLDER/phase_outputs" ]; then
  echo "❌ ERROR: Phase outputs directory missing: $TASK_OUTPUT_FOLDER/phase_outputs"
  exit 1
fi

if [ ! -d "$TASK_OUTPUT_FOLDER/phase_outputs/inventory" ]; then
  echo "❌ ERROR: Inventory output directory missing: $TASK_OUTPUT_FOLDER/phase_outputs/inventory"
  exit 1
fi
```

### 1. Load Index and Search

```bash
echo "🔍 Loading codebase index..."

# Load all index files
COMPONENTS_INDEX=$(cat .aidev-storage/index/components.json)
HOOKS_INDEX=$(cat .aidev-storage/index/hooks.json)
UTILITIES_INDEX=$(cat .aidev-storage/index/utilities.json)
STYLES_INDEX=$(cat .aidev-storage/index/styles.json)
LAYOUTS_INDEX=$(cat .aidev-storage/index/layouts.json)
API_INDEX=$(cat .aidev-storage/index/api_routes.json)
PATTERNS_INDEX=$(cat .aidev-storage/index/patterns.json)
INDEX_METADATA=$(cat .aidev-storage/index/metadata.json)

# Display quick stats
TOTAL_INDEXED=$(echo "$INDEX_METADATA" | jq -r '.statistics.total_indexed_items')
echo "📊 Total indexed items: $TOTAL_INDEXED"

# Extract search terms from task name
SEARCH_TERMS=$(echo "$TASK_NAME" | tr '-_' ' ' | tr '[:upper:]' '[:lower:]')
echo "🔍 Search terms: $SEARCH_TERMS"

# Function to search index
search_index() {
  local INDEX="$1"
  local FIELD="$2"
  local OUTPUT_VAR="$3"
  
  local MATCHES='[]'
  for TERM in $SEARCH_TERMS; do
    local TERM_MATCHES=$(echo "$INDEX" | jq --arg term "$TERM" --arg field "$FIELD" '
      .[$field][] | 
      select(.name | ascii_downcase | contains($term)) |
      @json
    ')
    
    if [ ! -z "$TERM_MATCHES" ]; then
      while IFS= read -r match; do
        MATCHES=$(echo "$MATCHES" | jq --argjson item "$match" '. += [$item]')
      done <<< "$TERM_MATCHES"
    fi
  done
  
  eval "$OUTPUT_VAR='$MATCHES'"
}

# Search all index categories
search_index "$COMPONENTS_INDEX" "components" "MATCHED_COMPONENTS"
search_index "$HOOKS_INDEX" "hooks" "MATCHED_HOOKS"
search_index "$UTILITIES_INDEX" "utilities" "MATCHED_UTILITIES"
search_index "$API_INDEX" "api_routes" "MATCHED_API_ROUTES"

# Special handling for patterns
RELEVANT_PATTERNS='[]'
for TERM in $SEARCH_TERMS; do
  PATTERN_MATCHES=$(echo "$PATTERNS_INDEX" | jq --arg term "$TERM" '
    .patterns[] | 
    select(.name | ascii_downcase | contains($term)) |
    @json
  ')
  
  if [ ! -z "$PATTERN_MATCHES" ]; then
    while IFS= read -r match; do
      RELEVANT_PATTERNS=$(echo "$RELEVANT_PATTERNS" | jq --argjson item "$match" '. += [$item]')
    done <<< "$PATTERN_MATCHES"
  fi
done

# Count results
COMP_COUNT=$(echo "$MATCHED_COMPONENTS" | jq 'length')
HOOK_COUNT=$(echo "$MATCHED_HOOKS" | jq 'length')
UTIL_COUNT=$(echo "$MATCHED_UTILITIES" | jq 'length')
API_COUNT=$(echo "$MATCHED_API_ROUTES" | jq 'length')
PATTERN_COUNT=$(echo "$RELEVANT_PATTERNS" | jq 'length')

echo "📦 Found: $COMP_COUNT components, $HOOK_COUNT hooks, $UTIL_COUNT utilities, $API_COUNT APIs, $PATTERN_COUNT patterns"

# Include preferences if enabled
if [ "$USE_PREFERENCE_FILES" = "true" ]; then
  echo "📚 Including preference files..."
  
  PREFERENCES_INFO='{}'
  if [ -d ".aidev-storage/preferences" ]; then
    # Load preference index if available
    if [ -f ".aidev-storage/preferences/index.json" ]; then
      PREF_INDEX=$(cat .aidev-storage/preferences/index.json)
      # Extract relevant preferences based on task
      RELEVANT_PREFS=$(echo "$PREF_INDEX" | jq '.preferences | to_entries | map({key: .key, file: .value.file, priority: .value.priority})')
      PREFERENCES_INFO=$(echo "$PREFERENCES_INFO" | jq --argjson prefs "$RELEVANT_PREFS" '. + {preferences: $prefs}')
      echo "✅ Found $(echo "$RELEVANT_PREFS" | jq 'length') preference files"
    fi
  fi
fi

# Include examples if enabled
if [ "$USE_EXAMPLES" = "true" ]; then
  echo "📂 Including example files..."
  
  EXAMPLES_INFO='{}'
  if [ -d ".aidev-storage/examples" ]; then
    # Count example files by type
    EXAMPLE_COMPONENTS=$(find .aidev-storage/examples/components -name "*.tsx" -o -name "*.jsx" 2>/dev/null | wc -l || echo 0)
    EXAMPLE_HOOKS=$(find .aidev-storage/examples/hooks -name "*.ts" -o -name "*.tsx" 2>/dev/null | wc -l || echo 0)
    EXAMPLE_API=$(find .aidev-storage/examples/api -name "*.ts" -o -name "*.js" 2>/dev/null | wc -l || echo 0)
    
    EXAMPLES_INFO=$(jq -n \
      --arg components "$EXAMPLE_COMPONENTS" \
      --arg hooks "$EXAMPLE_HOOKS" \
      --arg api "$EXAMPLE_API" \
      '{
        components: ($components | tonumber),
        hooks: ($hooks | tonumber),
        api: ($api | tonumber)
      }')
    echo "✅ Found examples: $EXAMPLE_COMPONENTS components, $EXAMPLE_HOOKS hooks, $EXAMPLE_API API routes"
  fi
fi

# Always check for learned patterns
LEARNED_PATTERNS_INFO='{}'
HIGH_PRIORITY_PATTERNS='[]'
echo "🧠 Checking for learned patterns from user corrections..."

if [ -f ".aidev-storage/planning/learned-patterns.json" ]; then
    LEARNED_PATTERNS=$(cat .aidev-storage/planning/learned-patterns.json)
    PATTERN_COUNT=$(echo "$LEARNED_PATTERNS" | jq '.patterns | length')
    
    # Extract high-priority patterns (user corrections)
    HIGH_PRIORITY_PATTERNS=$(echo "$LEARNED_PATTERNS" | jq '
      .patterns | to_entries | map(
        select(.value.metadata.source == "user_correction" and .value.metadata.priority >= 0.9) |
        {
          id: .key,
          rule: .value.rule,
          category: .value.category,
          implementation: .value.implementation,
          priority: .value.metadata.priority,
          confidence: .value.confidence
        }
      )
    ')
    
    LEARNED_PATTERNS_INFO=$(jq -n \
      --arg total "$PATTERN_COUNT" \
      --argjson high_priority "$HIGH_PRIORITY_PATTERNS" \
      '{
        total_patterns: ($total | tonumber),
        user_correction_patterns: ($high_priority | length),
        patterns: $high_priority
      }')
    
    echo "✅ Found $PATTERN_COUNT learned patterns ($(echo "$HIGH_PRIORITY_PATTERNS" | jq 'length') from user corrections)"
    
    # Add warnings for critical patterns
    for pattern in $(echo "$HIGH_PRIORITY_PATTERNS" | jq -r '.[] | @base64'); do
      _jq() {
        echo ${pattern} | base64 --decode | jq -r ${1}
      }
      PATTERN_RULE=$(_jq '.rule')
      PATTERN_CAT=$(_jq '.category')
      
      # Add pattern-specific warnings to reusable components
      if [ "$PATTERN_CAT" = "api" ] || [ "$PATTERN_CAT" = "architecture" ]; then
        echo "⚠️  CRITICAL USER PATTERN: $PATTERN_RULE"
      fi
    done
else
  echo "📝 No learned patterns found yet"
fi
```

### 2. Create Catalogs and Identify Reusable Components

```bash
# Create component catalog
CATALOG=$(jq -n \
  --argjson components "$MATCHED_COMPONENTS" \
  --argjson hooks "$MATCHED_HOOKS" \
  --argjson utilities "$MATCHED_UTILITIES" \
  --argjson api_routes "$MATCHED_API_ROUTES" \
  --argjson preferences "${PREFERENCES_INFO:-{}}" \
  --argjson examples "${EXAMPLES_INFO:-{}}" \
  --argjson learned_patterns "${LEARNED_PATTERNS_INFO:-{}}" \
  --arg use_preferences "$USE_PREFERENCE_FILES" \
  --arg use_examples "$USE_EXAMPLES" \
  '{
    components: $components,
    hooks: $hooks,
    utilities: $utilities,
    api_routes: $api_routes,
    configuration: {
      use_preference_files: ($use_preferences == "true"),
      use_examples: ($use_examples == "true"),
      preferences_info: $preferences,
      examples_info: $examples,
      learned_patterns_info: $learned_patterns
    }
  }')

echo "$CATALOG" > "$TASK_OUTPUT_FOLDER/phase_outputs/inventory/component_catalog.json"

# Identify reusable components with warnings
REUSABLE='{
  "components": [],
  "hooks": [],
  "utilities": [],
  "patterns": [],
  "layouts": [],
  "styles": [],
  "learned_patterns": [],
  "warnings": []
}'

# Add top-used components
if [ "$COMP_COUNT" -gt 0 ]; then
  TOP_COMPONENTS=$(echo "$MATCHED_COMPONENTS" | jq 'sort_by(.usage_count) | reverse | .[0:5]')
  REUSABLE=$(echo "$REUSABLE" | jq --argjson comps "$TOP_COMPONENTS" '.components = $comps')
  
  HIGH_USAGE=$(echo "$TOP_COMPONENTS" | jq '[.[] | select(.usage_count > 10)] | length')
  if [ "$HIGH_USAGE" -gt 0 ]; then
    REUSABLE=$(echo "$REUSABLE" | jq '.warnings += ["Found highly-used components - strongly consider reusing these"]')
  fi
fi

# Add hooks and utilities
[ "$HOOK_COUNT" -gt 0 ] && REUSABLE=$(echo "$REUSABLE" | jq --argjson hooks "$MATCHED_HOOKS" '.hooks = $hooks')
[ "$UTIL_COUNT" -gt 0 ] && REUSABLE=$(echo "$REUSABLE" | jq --argjson utils "$MATCHED_UTILITIES" '.utilities = $utils')
[ "$PATTERN_COUNT" -gt 0 ] && REUSABLE=$(echo "$REUSABLE" | jq --argjson patterns "$RELEVANT_PATTERNS" '.patterns = $patterns')

# Add learned patterns with HIGH priority
if [ $(echo "$HIGH_PRIORITY_PATTERNS" | jq 'length') -gt 0 ]; then
  REUSABLE=$(echo "$REUSABLE" | jq --argjson learned "$HIGH_PRIORITY_PATTERNS" '.learned_patterns = $learned')
  
  # Add critical warning for user patterns
  REUSABLE=$(echo "$REUSABLE" | jq '.warnings += ["🔴 CRITICAL: User-corrected patterns detected! These MUST be followed with highest priority"]')
  
  # Add specific warnings for each high-priority pattern
  for pattern in $(echo "$HIGH_PRIORITY_PATTERNS" | jq -r '.[] | @base64'); do
    _jq() {
      echo ${pattern} | base64 --decode | jq -r ${1}
    }
    PATTERN_RULE=$(_jq '.rule')
    REUSABLE=$(echo "$REUSABLE" | jq --arg rule "$PATTERN_RULE" '.warnings += ["USER PATTERN: " + $rule]')
  done
fi

# Task-specific duplication warnings
if echo "$TASK_NAME" | grep -qi "auth\|login"; then
  AUTH_COUNT=$(echo "$COMPONENTS_INDEX" | jq '[.components[] | select(.name | test("Auth|Login"; "i"))] | length')
  [ "$AUTH_COUNT" -gt 0 ] && REUSABLE=$(echo "$REUSABLE" | jq --arg c "$AUTH_COUNT" '.warnings += ["CRITICAL: Found \($c) existing auth components - DO NOT create new!"]')
fi

if echo "$TASK_NAME" | grep -qi "form"; then
  FORM_COUNT=$(echo "$COMPONENTS_INDEX" | jq '[.components[] | select(.name | test("Form"; "i"))] | length')
  [ "$FORM_COUNT" -gt 0 ] && REUSABLE=$(echo "$REUSABLE" | jq --arg c "$FORM_COUNT" '.warnings += ["Found \($c) existing form components - reuse instead of creating new"]')
fi

echo "$REUSABLE" > "$TASK_OUTPUT_FOLDER/phase_outputs/inventory/reusable_components.json"

# Create pattern matches
PATTERN_MATCHES=$(jq -n --argjson patterns "$RELEVANT_PATTERNS" '{
  matched_patterns: $patterns | map({
    name: .name,
    type: .type,
    description: .description,
    files: .files,
    relevance: "high"
  })
}')

echo "$PATTERN_MATCHES" > "$TASK_OUTPUT_FOLDER/phase_outputs/inventory/pattern_matches.json"
```

### 3. Generate Search Results and Context

```bash
# Generate search results documentation
cat > "$TASK_OUTPUT_FOLDER/phase_outputs/inventory/search_results.md" << EOF
# Search Results for Task: $TASK_NAME

## Index Search Date: $INDEX_AGE

## Search Terms Used
$(echo "$SEARCH_TERMS" | tr ' ' '\n' | sed 's/^/- /')

## Components Found ($COMP_COUNT)
$(echo "$MATCHED_COMPONENTS" | jq -r '.[] | "- **\(.name)** (\(.path)) - Usage: \(.usage_count)"')

## Hooks Found ($HOOK_COUNT)
$(echo "$MATCHED_HOOKS" | jq -r '.[] | "- **\(.name)** (\(.path)) - Usage: \(.usage_count)"')

## Utilities Found ($UTIL_COUNT)
$(echo "$MATCHED_UTILITIES" | jq -r '.[] | "- **\(.name)** (\(.path)) - Category: \(.category) - Usage: \(.usage_count)"')

## API Routes Found ($API_COUNT)
$(echo "$MATCHED_API_ROUTES" | jq -r '.[] | "- **\(.route)** (\(.path))"')

## Relevant Patterns ($PATTERN_COUNT)
$(echo "$RELEVANT_PATTERNS" | jq -r '.[] | "- **\(.name)** - \(.description)"')

## Reuse Summary
- Total reusable items: $(($(echo "$REUSABLE" | jq '.components | length') + $(echo "$REUSABLE" | jq '.hooks | length') + $(echo "$REUSABLE" | jq '.utilities | length')))
- Warnings: $(echo "$REUSABLE" | jq '.warnings | length')

### Duplication Warnings
$(echo "$REUSABLE" | jq -r '.warnings[] | "⚠️  " + .')

## Configuration
- Use Preferences: $USE_PREFERENCE_FILES
- Use Examples: $USE_EXAMPLES

$(if [ "$USE_PREFERENCE_FILES" = "true" ] && [ ! -z "$PREFERENCES_INFO" ]; then
  echo "### Available Preferences"
  echo "$PREFERENCES_INFO" | jq -r '.preferences[]? | "- **\(.key)** (\(.file)) - Priority: \(.priority)"'
fi)

$(if [ "$USE_EXAMPLES" = "true" ] && [ ! -z "$EXAMPLES_INFO" ]; then
  echo "### Available Examples"
  echo "- Components: $(echo "$EXAMPLES_INFO" | jq -r '.components // 0')"
  echo "- Hooks: $(echo "$EXAMPLES_INFO" | jq -r '.hooks // 0')"
  echo "- API Routes: $(echo "$EXAMPLES_INFO" | jq -r '.api // 0')"
fi)

$(if [ ! -z "$LEARNED_PATTERNS_INFO" ] && [ $(echo "$LEARNED_PATTERNS_INFO" | jq -r '.total_patterns // 0') -gt 0 ]; then
  echo "### 🧠 Learned Patterns (User Corrections)"
  echo "- Total Patterns: $(echo "$LEARNED_PATTERNS_INFO" | jq -r '.total_patterns // 0')"
  echo "- User Correction Patterns: $(echo "$LEARNED_PATTERNS_INFO" | jq -r '.user_correction_patterns // 0')"
  echo ""
  if [ $(echo "$HIGH_PRIORITY_PATTERNS" | jq 'length') -gt 0 ]; then
    echo "#### High-Priority Patterns:"
    echo "$HIGH_PRIORITY_PATTERNS" | jq -r '.[] | "- **\(.rule)** (Category: \(.category), Priority: \(.priority))"'
  fi
fi)
EOF

# Initialize context
CONTEXT=$(jq -n \
  --arg task_id "$TASK_ID" \
  --arg task_name "$TASK_NAME" \
  --arg task_type "$TASK_TYPE" \
  '{
    task_id: $task_id,
    current_phase: "inventory",
    phases_completed: ["inventory"],
    phase_history: [{
      phase: "inventory",
      completed_at: (now | strftime("%Y-%m-%dT%H:%M:%SZ")),
      success: true,
      key_outputs: {
        components_found: '$COMP_COUNT',
        hooks_found: '$HOOK_COUNT',
        api_routes_found: '$API_COUNT'
      }
    }],
    critical_context: {
      task_type: $task_type,
      task_name: $task_name,
      task_complexity: "'$TASK_COMPLEXITY'",
      reuse_opportunities: [],
      use_preference_files: ('$USE_PREFERENCE_FILES' == "true"),
      use_examples: ('$USE_EXAMPLES' == "true")
    }
  }')

echo "$CONTEXT" > "$TASK_OUTPUT_FOLDER/context.json"

# Initialize decision tree
echo '{"timestamp":"'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'","phase":"inventory","decision":"phase_started","context":{"task_id":"'$TASK_ID'","task_name":"'$TASK_NAME'"}}' > "$TASK_OUTPUT_FOLDER/decision_tree.jsonl"
```

### 4. Final Validation

```bash
# Verify compliance
CODE_FILES=$(find . -type f -newer "$TASK_OUTPUT_FOLDER/phase_outputs/.phase0_start_marker" \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) | grep -v ".aidev-storage" | wc -l)

if [ "$CODE_FILES" -gt 0 ]; then
  echo "❌ FATAL ERROR: Phase 0 created $CODE_FILES source code files!"
  exit 1
fi

# Verify outputs
for OUTPUT in "component_catalog.json" "reusable_components.json" "pattern_matches.json" "search_results.md"; do
  if [ ! -f "$TASK_OUTPUT_FOLDER/phase_outputs/inventory/$OUTPUT" ]; then
    echo "❌ Missing required output: $OUTPUT"
    exit 1
  fi
done

# Summary
WARNING_COUNT=$(jq '.warnings | length' "$TASK_OUTPUT_FOLDER/phase_outputs/inventory/reusable_components.json")
REUSABLE_COUNT=$(($(echo "$REUSABLE" | jq '.components | length') + $(echo "$REUSABLE" | jq '.hooks | length') + $(echo "$REUSABLE" | jq '.utilities | length')))

echo "✅ Phase 0 completed successfully"
echo "📊 Index queried: $TOTAL_INDEXED items"
echo "📦 Relevant items found: $((COMP_COUNT + HOOK_COUNT + UTIL_COUNT + API_COUNT))"
echo "♻️  Reusable items identified: $REUSABLE_COUNT"
echo "⚠️  Duplication warnings: $WARNING_COUNT"
echo ""
echo "🚀 Performance: Index query completed in seconds"
echo "🎯 Key Finding: Always check reusable components before creating new code!"
```

## Key Requirements

<phase0-constraints>
<inventory-only>
  This phase MUST:
  □ Search extensively using index
  □ Catalog all components and utilities
  □ Identify reuse opportunities
  □ Warn about potential duplications
  □ Create comprehensive inventory
  
  This phase MUST NOT:
  □ Write any code files
  □ Modify existing code
  □ Make architectural decisions
  □ Run tests or builds
</inventory-only>

<duplication-prevention>
  Focus on preventing the 4x duplication problem:
  □ Search before creating
  □ Document what exists
  □ Highlight reuse opportunities
  □ Warn about redundancy
</duplication-prevention>
</phase0-constraints>

## Success Criteria/

Phase 0 is successful when:
- Comprehensive component catalog exists
- Reusable components are identified
- Search results document findings
- Pattern matches are recorded
- No code files were created
- Context initialized for next phase