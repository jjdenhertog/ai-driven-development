---
description: "UPDATE INDEX - Refresh codebase index after changes"
allowed-tools: ["Read", "Grep", "Glob", "LS", "Bash", "Write"]
disallowed-tools: ["Edit", "MultiEdit", "NotebookEdit", "git", "Task", "TodoWrite", "WebFetch", "WebSearch"]
---

# Command: aidev-update-index

# 🔄 CODEBASE INDEX UPDATE 🔄

**PURPOSE:**
Incrementally update the existing codebase index after AI work to:
- Track new components and utilities
- Update usage counts
- Remove deleted items
- Refresh modification times
- Maintain index accuracy

**PREREQUISITES:**
✅ Existing index in `.aidev-storage/index/`
✅ Previous indexation completed

**OUTPUTS:**
✅ Updated index files with changes
✅ `.aidev-storage/index/changes.json` - Change summary
✅ Refreshed metadata with update timestamp

<role-context>
You are a codebase index updater. Your job is to efficiently update the existing index by detecting changes since the last indexation, avoiding full rescans when possible.
</role-context>

<structured-prompt>
This command updates an existing index:
- Detects modified files since last index
- Updates only changed components
- Preserves historical data
- Generates change summary
</structured-prompt>

## Process

### 0. Verify Existing Index

```bash
echo "===================================="
echo "🔄 INDEX UPDATE"
echo "===================================="

# Check for existing index
if [ ! -d ".aidev-storage/index" ]; then
  echo "❌ No existing index found!"
  echo "💡 Run 'aidev indexation' first"
  exit 1
fi

# Load existing metadata
if [ ! -f ".aidev-storage/index/metadata.json" ]; then
  echo "❌ Index metadata missing!"
  echo "💡 Run full indexation first"
  exit 1
fi

LAST_UPDATE=$(jq -r '.updated_at' .aidev-storage/index/metadata.json)
echo "📅 Last update: $LAST_UPDATE"

# Initialize change tracking
CHANGES='{"added": [], "modified": [], "removed": [], "summary": {}}'
UPDATE_START=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
```

### 1. Detect Changed Files

```bash
echo "🔍 Detecting changes since last update..."

# Find all files modified since last update
# Convert date to timestamp for comparison
if command -v gdate >/dev/null 2>&1; then
  # GNU date (from coreutils on macOS)
  LAST_TIMESTAMP=$(gdate -d "$LAST_UPDATE" +%s)
else
  # BSD date (macOS default)
  LAST_TIMESTAMP=$(date -j -f "%Y-%m-%dT%H:%M:%SZ" "$LAST_UPDATE" +%s 2>/dev/null || echo "0")
fi

# Find modified source files
MODIFIED_FILES=""
if [ "$LAST_TIMESTAMP" -gt 0 ]; then
  MODIFIED_FILES=$(find . \( -name "*.tsx" -o -name "*.jsx" -o -name "*.ts" -o -name "*.js" -o -name "*.css" -o -name "*.scss" \) -newer .aidev-storage/index/metadata.json 2>/dev/null | grep -v node_modules | sort)
fi

# If timestamp comparison fails, fallback to checking all files
if [ -z "$MODIFIED_FILES" ] && [ "$LAST_TIMESTAMP" -eq 0 ]; then
  echo "⚠️  Unable to detect by timestamp, scanning all files..."
  MODIFIED_FILES=$(find . \( -name "*.tsx" -o -name "*.jsx" -o -name "*.ts" -o -name "*.js" -o -name "*.css" -o -name "*.scss" \) | grep -v node_modules | sort)
fi

MODIFIED_COUNT=$(echo "$MODIFIED_FILES" | grep -c . || echo 0)
echo "📝 Found $MODIFIED_COUNT modified files"
```

### 2. Update Component Index

```bash
echo "🔄 Updating component index..."

# Load existing components
COMPONENTS_INDEX=$(cat .aidev-storage/index/components.json)
EXISTING_PATHS=$(echo "$COMPONENTS_INDEX" | jq -r '.components[].path' | sort)

# Track changes
COMPONENT_CHANGES='{"added": 0, "modified": 0, "removed": 0}'

# Process modified files
for FILE in $MODIFIED_FILES; do
  # Skip if not a component file
  if ! echo "$FILE" | grep -q "\.tsx$\|\.jsx$"; then
    continue
  fi
  
  # Skip test files
  if echo "$FILE" | grep -q "\.test\.\|\.spec\."; then
    continue
  fi
  
  # Check if file still exists
  if [ ! -f "$FILE" ]; then
    # Remove from index
    COMPONENTS_INDEX=$(echo "$COMPONENTS_INDEX" | jq --arg path "$FILE" '.components |= map(select(.path != $path))')
    COMPONENT_CHANGES=$(echo "$COMPONENT_CHANGES" | jq '.removed += 1')
    continue
  fi
  
  # Extract component name
  FILENAME=$(basename "$FILE")
  COMPONENT_NAME="${FILENAME%.*}"
  
  # Check if it's a component
  if grep -q "export.*function\s\+[A-Z]" "$FILE" 2>/dev/null || \
     grep -q "export.*const\s\+[A-Z].*=.*=>" "$FILE" 2>/dev/null || \
     grep -q "export\s\+default.*function\s\+[A-Z]" "$FILE" 2>/dev/null; then
    
    # Extract component data (same as original indexation)
    PROPS="[]"
    if [[ "$FILE" == *.tsx ]]; then
      PROPS_DEF=$(grep -A 10 "interface.*Props\|type.*Props" "$FILE" 2>/dev/null | head -20)
      if [ ! -z "$PROPS_DEF" ]; then
        PROPS=$(echo "$PROPS_DEF" | grep -E "^\s*\w+\s*:" | sed 's/^\s*//' | sed 's/:.*$//' | jq -R -s 'split("\n") | map(select(. != ""))')
      fi
    fi
    
    # Count usage
    USAGE_COUNT=$(grep -r "import.*$COMPONENT_NAME.*from.*['\"].*$(basename $(dirname $FILE))" . --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" 2>/dev/null | wc -l)
    
    # Get file stats
    LAST_MODIFIED=$(stat -f "%Sm" -t "%Y-%m-%dT%H:%M:%SZ" "$FILE" 2>/dev/null || date -u +"%Y-%m-%dT%H:%M:%SZ")
    FILE_SIZE=$(wc -l < "$FILE")
    
    # Determine complexity
    if [ $FILE_SIZE -lt 50 ]; then
      COMPLEXITY="low"
    elif [ $FILE_SIZE -lt 150 ]; then
      COMPLEXITY="medium"
    else
      COMPLEXITY="high"
    fi
    
    # Extract imports
    IMPORTS=$(grep "^import" "$FILE" | sed 's/import.*from//' | sed "s/['\";]//g" | jq -R -s 'split("\n") | map(select(. != "")) | map(ltrimstr(" "))')
    
    # Create component entry
    COMPONENT_ENTRY=$(jq -n \
      --arg name "$COMPONENT_NAME" \
      --arg path "$FILE" \
      --arg complexity "$COMPLEXITY" \
      --arg modified "$LAST_MODIFIED" \
      --argjson props "$PROPS" \
      --argjson imports "$IMPORTS" \
      --arg usage "$USAGE_COUNT" \
      --arg size "$FILE_SIZE" \
      '{
        name: $name,
        path: $path,
        type: "component",
        props: $props,
        imports: $imports,
        usage_count: ($usage | tonumber),
        complexity: $complexity,
        last_modified: $modified,
        line_count: ($size | tonumber)
      }')
    
    # Check if component exists in index
    if echo "$COMPONENTS_INDEX" | jq --arg path "$FILE" '.components[] | select(.path == $path)' | grep -q .; then
      # Update existing
      COMPONENTS_INDEX=$(echo "$COMPONENTS_INDEX" | jq --arg path "$FILE" --argjson entry "$COMPONENT_ENTRY" \
        '.components |= map(if .path == $path then $entry else . end)')
      COMPONENT_CHANGES=$(echo "$COMPONENT_CHANGES" | jq '.modified += 1')
    else
      # Add new
      COMPONENTS_INDEX=$(echo "$COMPONENTS_INDEX" | jq --argjson entry "$COMPONENT_ENTRY" '.components += [$entry]')
      COMPONENT_CHANGES=$(echo "$COMPONENT_CHANGES" | jq '.added += 1')
    fi
  fi
done

# Check for removed components
for PATH in $EXISTING_PATHS; do
  if [ ! -f "$PATH" ]; then
    COMPONENTS_INDEX=$(echo "$COMPONENTS_INDEX" | jq --arg path "$PATH" '.components |= map(select(.path != $path))')
    COMPONENT_CHANGES=$(echo "$COMPONENT_CHANGES" | jq '.removed += 1')
  fi
done

# Save updated components
echo "$COMPONENTS_INDEX" | jq '.' > .aidev-storage/index/components.json
echo "✅ Components: +$(echo "$COMPONENT_CHANGES" | jq -r '.added') ~$(echo "$COMPONENT_CHANGES" | jq -r '.modified') -$(echo "$COMPONENT_CHANGES" | jq -r '.removed')"
```

### 3. Update Hooks Index

```bash
echo "🔄 Updating hooks index..."

# Similar pattern for hooks
HOOKS_INDEX=$(cat .aidev-storage/index/hooks.json)
HOOK_CHANGES='{"added": 0, "modified": 0, "removed": 0}'

# Process modified TypeScript files for hooks
for FILE in $MODIFIED_FILES; do
  if ! echo "$FILE" | grep -q "\.ts$\|\.tsx$"; then
    continue
  fi
  
  # Check for hook exports
  if grep -q "export.*function.*use[A-Z]" "$FILE" 2>/dev/null; then
    # Process each hook in the file
    HOOKS_IN_FILE=$(grep "export.*function.*use[A-Z]" "$FILE" | sed 's/export.*function\s*//' | sed 's/(.*//' | sed 's/\s*$//')
    
    for HOOK_NAME in $HOOKS_IN_FILE; do
      # Extract hook data
      SIGNATURE=$(grep -A 1 "function $HOOK_NAME" "$FILE" | tr '\n' ' ' | sed 's/export.*function//' | sed 's/{.*//' | sed 's/\s\+/ /g')
      USAGE_COUNT=$(grep -r "$HOOK_NAME" . --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" 2>/dev/null | grep -v "function $HOOK_NAME" | wc -l)
      DEPS=$(grep -A 20 "function $HOOK_NAME" "$FILE" | grep -E "use[A-Z][a-zA-Z]*\(" | sed 's/.*\(use[A-Z][a-zA-Z]*\).*/\1/' | sort -u | jq -R -s 'split("\n") | map(select(. != ""))')
      
      # Create hook entry
      HOOK_ENTRY=$(jq -n \
        --arg name "$HOOK_NAME" \
        --arg path "$FILE" \
        --arg signature "$SIGNATURE" \
        --argjson deps "$DEPS" \
        --arg usage "$USAGE_COUNT" \
        '{
          name: $name,
          path: $path,
          type: "hook",
          signature: $signature,
          dependencies: $deps,
          usage_count: ($usage | tonumber)
        }')
      
      # Update or add
      if echo "$HOOKS_INDEX" | jq --arg name "$HOOK_NAME" --arg path "$FILE" '.hooks[] | select(.name == $name and .path == $path)' | grep -q .; then
        HOOKS_INDEX=$(echo "$HOOKS_INDEX" | jq --arg name "$HOOK_NAME" --arg path "$FILE" --argjson entry "$HOOK_ENTRY" \
          '.hooks |= map(if .name == $name and .path == $path then $entry else . end)')
        HOOK_CHANGES=$(echo "$HOOK_CHANGES" | jq '.modified += 1')
      else
        HOOKS_INDEX=$(echo "$HOOKS_INDEX" | jq --argjson entry "$HOOK_ENTRY" '.hooks += [$entry]')
        HOOK_CHANGES=$(echo "$HOOK_CHANGES" | jq '.added += 1')
      fi
    done
  fi
done

# Save updated hooks
echo "$HOOKS_INDEX" | jq '.' > .aidev-storage/index/hooks.json
echo "✅ Hooks: +$(echo "$HOOK_CHANGES" | jq -r '.added') ~$(echo "$HOOK_CHANGES" | jq -r '.modified') -$(echo "$HOOK_CHANGES" | jq -r '.removed')"
```

### 4. Update Other Indices

```bash
echo "🔄 Updating utilities, styles, and layouts..."

# Update utilities (similar pattern)
UTILITIES_INDEX=$(cat .aidev-storage/index/utilities.json)
# ... (similar update logic for utilities)

# Update styles
STYLES_INDEX=$(cat .aidev-storage/index/styles.json)
# ... (similar update logic for styles)

# Update layouts
LAYOUTS_INDEX=$(cat .aidev-storage/index/layouts.json)
# ... (similar update logic for layouts)

# Update API routes
API_INDEX=$(cat .aidev-storage/index/api_routes.json)
# ... (similar update logic for API routes)

echo "✅ All indices updated"
```

### 5. Recalculate Usage Counts

```bash
echo "📊 Recalculating usage counts..."

# Update component usage counts for ALL components (even unchanged ones)
TEMP_COMPONENTS='{"components": []}'
COMPONENTS=$(echo "$COMPONENTS_INDEX" | jq -r '.components[]')

echo "$COMPONENTS_INDEX" | jq -c '.components[]' | while read -r COMPONENT; do
  COMPONENT_NAME=$(echo "$COMPONENT" | jq -r '.name')
  COMPONENT_PATH=$(echo "$COMPONENT" | jq -r '.path')
  COMPONENT_DIR=$(basename $(dirname "$COMPONENT_PATH"))
  
  # Recalculate usage
  NEW_USAGE=$(grep -r "import.*$COMPONENT_NAME.*from.*['\"].*$COMPONENT_DIR" . --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" 2>/dev/null | wc -l)
  
  # Update usage count
  UPDATED_COMPONENT=$(echo "$COMPONENT" | jq --arg usage "$NEW_USAGE" '.usage_count = ($usage | tonumber)')
  TEMP_COMPONENTS=$(echo "$TEMP_COMPONENTS" | jq --argjson comp "$UPDATED_COMPONENT" '.components += [$comp]')
done

# Apply updated usage counts
if [ "$(echo "$TEMP_COMPONENTS" | jq '.components | length')" -gt 0 ]; then
  echo "$TEMP_COMPONENTS" | jq '.' > .aidev-storage/index/components.json
fi

echo "✅ Usage counts updated"
```

### 6. Generate Change Summary

```bash
echo "📝 Generating change summary..."

# Collect all changes
TOTAL_ADDED=$(echo "$COMPONENT_CHANGES $HOOK_CHANGES" | jq -s 'map(.added) | add')
TOTAL_MODIFIED=$(echo "$COMPONENT_CHANGES $HOOK_CHANGES" | jq -s 'map(.modified) | add')
TOTAL_REMOVED=$(echo "$COMPONENT_CHANGES $HOOK_CHANGES" | jq -s 'map(.removed) | add')

# Create change summary
CHANGES_SUMMARY=$(jq -n \
  --arg start "$LAST_UPDATE" \
  --arg end "$UPDATE_START" \
  --arg files "$MODIFIED_COUNT" \
  --arg added "$TOTAL_ADDED" \
  --arg modified "$TOTAL_MODIFIED" \
  --arg removed "$TOTAL_REMOVED" \
  --argjson component_changes "$COMPONENT_CHANGES" \
  --argjson hook_changes "$HOOK_CHANGES" \
  '{
    update_period: {
      from: $start,
      to: $end
    },
    files_scanned: ($files | tonumber),
    total_changes: {
      added: ($added | tonumber),
      modified: ($modified | tonumber),
      removed: ($removed | tonumber)
    },
    by_type: {
      components: $component_changes,
      hooks: $hook_changes
    }
  }')

# Save change summary
echo "$CHANGES_SUMMARY" | jq '.' > .aidev-storage/index/changes.json
```

### 7. Update Metadata

```bash
echo "📊 Updating metadata..."

# Load current counts
COMPONENT_COUNT=$(jq '.components | length' .aidev-storage/index/components.json)
HOOKS_COUNT=$(jq '.hooks | length' .aidev-storage/index/hooks.json)
UTILITIES_COUNT=$(jq '.utilities | length' .aidev-storage/index/utilities.json)
STYLES_COUNT=$(jq '.styles | length' .aidev-storage/index/styles.json)
LAYOUTS_COUNT=$(jq '.layouts | length' .aidev-storage/index/layouts.json)
API_COUNT=$(jq '.api_routes | length' .aidev-storage/index/api_routes.json)

# Get top used items
MOST_USED_COMPONENTS=$(jq -r '.components | sort_by(.usage_count) | reverse | .[0:5] | map(.name + " (" + (.usage_count | tostring) + ")")' .aidev-storage/index/components.json)
MOST_USED_HOOKS=$(jq -r '.hooks | sort_by(.usage_count) | reverse | .[0:5] | map(.name + " (" + (.usage_count | tostring) + ")")' .aidev-storage/index/hooks.json)

# Update metadata
EXISTING_METADATA=$(cat .aidev-storage/index/metadata.json)
UPDATED_METADATA=$(echo "$EXISTING_METADATA" | jq \
  --arg updated "$UPDATE_START" \
  --arg components "$COMPONENT_COUNT" \
  --arg hooks "$HOOKS_COUNT" \
  --arg utilities "$UTILITIES_COUNT" \
  --arg styles "$STYLES_COUNT" \
  --arg layouts "$LAYOUTS_COUNT" \
  --arg api_routes "$API_COUNT" \
  --argjson top_components "$MOST_USED_COMPONENTS" \
  --argjson top_hooks "$MOST_USED_HOOKS" \
  --argjson changes "$CHANGES_SUMMARY" \
  '.updated_at = $updated |
   .statistics.breakdown.components = ($components | tonumber) |
   .statistics.breakdown.hooks = ($hooks | tonumber) |
   .statistics.breakdown.utilities = ($utilities | tonumber) |
   .statistics.breakdown.styles = ($styles | tonumber) |
   .statistics.breakdown.layouts = ($layouts | tonumber) |
   .statistics.breakdown.api_routes = ($api_routes | tonumber) |
   .insights.most_used_components = $top_components |
   .insights.most_used_hooks = $top_hooks |
   .last_update = $changes')

# Save updated metadata
echo "$UPDATED_METADATA" | jq '.' > .aidev-storage/index/metadata.json
```

### 8. Final Summary

```bash
echo ""
echo "===================================="
echo "✅ INDEX UPDATE COMPLETE"
echo "===================================="
echo ""
echo "📊 Changes Summary:"
echo "  - Files scanned: $MODIFIED_COUNT"
echo "  - Items added: $TOTAL_ADDED"
echo "  - Items modified: $TOTAL_MODIFIED"
echo "  - Items removed: $TOTAL_REMOVED"
echo ""
echo "📈 Current Totals:"
echo "  - Components: $COMPONENT_COUNT"
echo "  - Hooks: $HOOKS_COUNT"
echo "  - Utilities: $UTILITIES_COUNT"
echo "  - Styles: $STYLES_COUNT"
echo "  - Layouts: $LAYOUTS_COUNT"
echo "  - API Routes: $API_COUNT"
echo ""
echo "📁 Updated indices: .aidev-storage/index/"
echo "📝 Change log: .aidev-storage/index/changes.json"
echo ""
echo "⏰ Last update: $UPDATE_START"
```

## Key Features

<update-features>
✅ **Incremental Updates**
  - Only scans modified files
  - Preserves unchanged entries
  - Faster than full reindex

✅ **Change Tracking**
  - Records what was added/modified/removed
  - Maintains update history
  - Provides change summary

✅ **Usage Recalculation**
  - Updates all usage counts
  - Reflects current imports
  - Maintains accuracy

✅ **Efficient Processing**
  - Timestamp-based detection
  - Minimal file scanning
  - Preserves existing data
</update-features>

## Success Criteria

Update is successful when:
- Modified files are detected
- Changes are tracked
- Usage counts are accurate
- Metadata is refreshed
- No data is lost