---
description: "INDEXATION - Build comprehensive codebase index for reuse"
allowed-tools: ["Read", "Grep", "Glob", "LS", "Bash", "Write"]
disallowed-tools: ["Edit", "MultiEdit", "NotebookEdit", "git", "Task", "TodoWrite", "WebFetch", "WebSearch"]
---

# Command: aidev-indexation

# 🗂️ CODEBASE INDEXATION SYSTEM 🗂️

**PURPOSE:**
Build a comprehensive, searchable index of the entire codebase to:
- Prevent code duplication (4x problem)
- Enable fast component discovery
- Track usage patterns
- Identify reusable patterns
- Support semantic search

**OUTPUTS:**
✅ `.aidev-storage/index/components.json` - All React components
✅ `.aidev-storage/index/hooks.json` - Custom React hooks
✅ `.aidev-storage/index/utilities.json` - Utility functions
✅ `.aidev-storage/index/styles.json` - CSS/SCSS classes and modules
✅ `.aidev-storage/index/layouts.json` - Layout components
✅ `.aidev-storage/index/api_routes.json` - API endpoints
✅ `.aidev-storage/index/patterns.json` - Identified patterns
✅ `.aidev-storage/index/metadata.json` - Index metadata and stats

<role-context>
You are a codebase indexer. Your job is to analyze the entire codebase and create a comprehensive, searchable index that future AI agents can query efficiently. Focus on identifying reusable components and patterns.
</role-context>

## Process

### 0. Pre-Flight Check

```bash
echo "===================================="
echo "🗂️ CODEBASE INDEXATION"
echo "===================================="
echo "✅ Will: Build comprehensive index"
echo "✅ Will: Analyze all components"
echo "✅ Will: Track usage patterns"
echo "===================================="

# This is the full indexation command
echo "📋 Running full codebase indexation"

# Create index directory (respecting symlinks)
if [ -e ".aidev-storage" ]; then
  # Create index subdirectory if it doesn't exist
  [ ! -d ".aidev-storage/index" ] && mkdir ".aidev-storage/index"
  echo "✅ Index directory ready"
else
  echo "❌ ERROR: .aidev-storage directory not found"
  echo "Please run 'aidev init' first"
  exit 1
fi

# Initialize timestamp
INDEX_START=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
```

### 1. Component Discovery and Analysis

```bash
echo "🔍 Discovering React components..."

# Initialize components index
COMPONENTS_INDEX='{"components": []}'

# Find all React component files
COMPONENT_FILES=$(find . -name "*.tsx" -o -name "*.jsx" | grep -v node_modules | grep -v ".next" | sort)

for FILE in $COMPONENT_FILES; do
  # Skip test files
  if echo "$FILE" | grep -q "\.test\.\|\.spec\."; then
    continue
  fi
  
  # Extract component information
  FILENAME=$(basename "$FILE")
  COMPONENT_NAME="${FILENAME%.*}"
  
  # Check if it's actually a component (exports a function starting with capital)
  if grep -q "export.*function\s\+[A-Z]" "$FILE" 2>/dev/null || \
     grep -q "export.*const\s\+[A-Z].*=.*=>" "$FILE" 2>/dev/null || \
     grep -q "export\s\+default.*function\s\+[A-Z]" "$FILE" 2>/dev/null; then
    
    # Extract props if TypeScript
    PROPS="[]"
    if [[ "$FILE" == *.tsx ]]; then
      # Look for Props interface/type
      PROPS_DEF=$(grep -A 10 "interface.*Props\|type.*Props" "$FILE" 2>/dev/null | head -20)
      if [ ! -z "$PROPS_DEF" ]; then
        # Simple extraction of prop names
        PROPS=$(echo "$PROPS_DEF" | grep -E "^\s*\w+\s*:" | sed 's/^\s*//' | sed 's/:.*$//' | jq -R -s 'split("\n") | map(select(. != ""))')
      fi
    fi
    
    # Count usage (how many times imported)
    USAGE_COUNT=$(grep -r "import.*$COMPONENT_NAME.*from.*['\"].*$(basename $(dirname $FILE))" . --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" 2>/dev/null | wc -l)
    
    # Get file stats
    LAST_MODIFIED=$(stat -f "%Sm" -t "%Y-%m-%dT%H:%M:%SZ" "$FILE" 2>/dev/null || date -u +"%Y-%m-%dT%H:%M:%SZ")
    FILE_SIZE=$(wc -l < "$FILE")
    
    # Determine complexity based on file size
    if [ $FILE_SIZE -lt 50 ]; then
      COMPLEXITY="low"
    elif [ $FILE_SIZE -lt 150 ]; then
      COMPLEXITY="medium"
    else
      COMPLEXITY="high"
    fi
    
    # Extract imports
    IMPORTS=$(grep "^import" "$FILE" | sed 's/import.*from//' | sed "s/['\";]//g" | jq -R -s 'split("\n") | map(select(. != "")) | map(ltrimstr(" "))')
    
    # Add to index
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
    
    COMPONENTS_INDEX=$(echo "$COMPONENTS_INDEX" | jq --argjson entry "$COMPONENT_ENTRY" '.components += [$entry]')
  fi
done

# Save components index
echo "$COMPONENTS_INDEX" | jq '.' > .aidev-storage/index/components.json
COMPONENT_COUNT=$(echo "$COMPONENTS_INDEX" | jq '.components | length')
echo "✅ Indexed $COMPONENT_COUNT components"
```

### 2. Hooks Discovery

```bash
echo "🪝 Discovering React hooks..."

HOOKS_INDEX='{"hooks": []}'

# Find all potential hook files
HOOK_FILES=$(find . \( -name "*.ts" -o -name "*.tsx" \) | xargs grep -l "^export.*function.*use[A-Z]" 2>/dev/null | grep -v node_modules | sort -u)

for FILE in $HOOK_FILES; do
  # Skip test files
  if echo "$FILE" | grep -q "\.test\.\|\.spec\."; then
    continue
  fi
  
  # Extract hook names
  HOOKS_IN_FILE=$(grep "export.*function.*use[A-Z]" "$FILE" | sed 's/export.*function\s*//' | sed 's/(.*//' | sed 's/\s*$//')
  
  for HOOK_NAME in $HOOKS_IN_FILE; do
    # Extract hook signature
    SIGNATURE=$(grep -A 1 "function $HOOK_NAME" "$FILE" | tr '\n' ' ' | sed 's/export.*function//' | sed 's/{.*//' | sed 's/\s\+/ /g')
    
    # Count usage
    USAGE_COUNT=$(grep -r "$HOOK_NAME" . --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" 2>/dev/null | grep -v "function $HOOK_NAME" | wc -l)
    
    # Extract dependencies (what hooks it uses)
    DEPS=$(grep -A 20 "function $HOOK_NAME" "$FILE" | grep -E "use[A-Z][a-zA-Z]*\(" | sed 's/.*\(use[A-Z][a-zA-Z]*\).*/\1/' | sort -u | jq -R -s 'split("\n") | map(select(. != ""))')
    
    # Add to index
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
    
    HOOKS_INDEX=$(echo "$HOOKS_INDEX" | jq --argjson entry "$HOOK_ENTRY" '.hooks += [$entry]')
  done
done

# Save hooks index
echo "$HOOKS_INDEX" | jq '.' > .aidev-storage/index/hooks.json
HOOKS_COUNT=$(echo "$HOOKS_INDEX" | jq '.hooks | length')
echo "✅ Indexed $HOOKS_COUNT hooks"
```

### 3. Utility Functions Discovery

```bash
echo "🔧 Discovering utility functions..."

UTILITIES_INDEX='{"utilities": []}'

# Find utility directories
UTIL_DIRS=$(find . -type d -name "utils" -o -name "utilities" -o -name "helpers" -o -name "lib" | grep -v node_modules)

for DIR in $UTIL_DIRS; do
  # Find all JS/TS files in utility directories
  UTIL_FILES=$(find "$DIR" -name "*.ts" -o -name "*.js" | grep -v ".test." | grep -v ".spec.")
  
  for FILE in $UTIL_FILES; do
    # Extract exported functions
    FUNCTIONS=$(grep -E "^export\s+(async\s+)?function|^export\s+const.*=.*=>|^export\s+const.*=.*function" "$FILE" | \
                sed 's/export.*function\s*//' | \
                sed 's/export.*const\s*//' | \
                sed 's/\s*=.*//' | \
                sed 's/(.*//')
    
    for FUNC_NAME in $FUNCTIONS; do
      # Skip if it's a React component or hook
      if [[ "$FUNC_NAME" =~ ^[A-Z] ]] || [[ "$FUNC_NAME" =~ ^use[A-Z] ]]; then
        continue
      fi
      
      # Extract function signature
      SIGNATURE=$(grep -A 1 -E "(function|const)\s+$FUNC_NAME" "$FILE" | tr '\n' ' ' | sed 's/.*\(function\|const\)\s*'$FUNC_NAME'//' | sed 's/{.*//' | sed 's/=>.*//' | sed 's/\s\+/ /g')
      
      # Count usage
      USAGE_COUNT=$(grep -r "\b$FUNC_NAME\b" . --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" 2>/dev/null | grep -v "function $FUNC_NAME" | grep -v "const $FUNC_NAME" | wc -l)
      
      # Categorize utility
      CATEGORY="general"
      if echo "$FILE" | grep -q "date\|time"; then
        CATEGORY="date/time"
      elif echo "$FILE" | grep -q "string\|text"; then
        CATEGORY="string"
      elif echo "$FILE" | grep -q "array\|list"; then
        CATEGORY="array"
      elif echo "$FILE" | grep -q "object"; then
        CATEGORY="object"
      elif echo "$FILE" | grep -q "format"; then
        CATEGORY="formatting"
      elif echo "$FILE" | grep -q "valid"; then
        CATEGORY="validation"
      fi
      
      # Add to index
      UTIL_ENTRY=$(jq -n \
        --arg name "$FUNC_NAME" \
        --arg path "$FILE" \
        --arg signature "$SIGNATURE" \
        --arg category "$CATEGORY" \
        --arg usage "$USAGE_COUNT" \
        '{
          name: $name,
          path: $path,
          type: "utility",
          signature: $signature,
          category: $category,
          usage_count: ($usage | tonumber)
        }')
      
      UTILITIES_INDEX=$(echo "$UTILITIES_INDEX" | jq --argjson entry "$UTIL_ENTRY" '.utilities += [$entry]')
    done
  done
done

# Save utilities index
echo "$UTILITIES_INDEX" | jq '.' > .aidev-storage/index/utilities.json
UTILITIES_COUNT=$(echo "$UTILITIES_INDEX" | jq '.utilities | length')
echo "✅ Indexed $UTILITIES_COUNT utility functions"
```

### 4. Styles Discovery

```bash
echo "🎨 Discovering styles and CSS modules..."

STYLES_INDEX='{"styles": []}'

# Find all CSS/SCSS files
STYLE_FILES=$(find . \( -name "*.css" -o -name "*.scss" -o -name "*.module.css" -o -name "*.module.scss" \) | grep -v node_modules | sort)

for FILE in $STYLE_FILES; do
  # Determine if it's a CSS module
  IS_MODULE="false"
  if echo "$FILE" | grep -q "\.module\."; then
    IS_MODULE="true"
  fi
  
  # Extract class names
  CLASSES=$(grep -E "^\s*\." "$FILE" | sed 's/^\s*\.//' | sed 's/\s*{.*//' | sed 's/:.*//' | sort -u)
  
  for CLASS in $CLASSES; do
    # Count usage in TSX/JSX files
    if [ "$IS_MODULE" = "true" ]; then
      # For CSS modules, look for styles.className or styles['className']
      USAGE_COUNT=$(grep -r "styles\.$CLASS\|styles\['$CLASS'\]\|styles\[\"$CLASS\"\]" . --include="*.tsx" --include="*.jsx" 2>/dev/null | wc -l)
    else
      # For global CSS, look for className="class" or className={`class`}
      USAGE_COUNT=$(grep -r "className=.*$CLASS" . --include="*.tsx" --include="*.jsx" 2>/dev/null | wc -l)
    fi
    
    # Add to index
    STYLE_ENTRY=$(jq -n \
      --arg name "$CLASS" \
      --arg path "$FILE" \
      --arg module "$IS_MODULE" \
      --arg usage "$USAGE_COUNT" \
      '{
        name: $name,
        path: $path,
        type: "style",
        is_module: ($module == "true"),
        usage_count: ($usage | tonumber)
      }')
    
    STYLES_INDEX=$(echo "$STYLES_INDEX" | jq --argjson entry "$STYLE_ENTRY" '.styles += [$entry]')
  done
done

# Save styles index
echo "$STYLES_INDEX" | jq '.' > .aidev-storage/index/styles.json
STYLES_COUNT=$(echo "$STYLES_INDEX" | jq '.styles | length')
echo "✅ Indexed $STYLES_COUNT style classes"
```

### 5. Layout Components Discovery

```bash
echo "📐 Discovering layout components..."

LAYOUTS_INDEX='{"layouts": []}'

# Find layout components (common patterns)
LAYOUT_PATTERNS="Layout|Container|Wrapper|Grid|Flex|Stack|Column|Row|Header|Footer|Sidebar|Main"
LAYOUT_FILES=$(find . \( -name "*.tsx" -o -name "*.jsx" \) | xargs grep -l -E "export.*(${LAYOUT_PATTERNS})" 2>/dev/null | grep -v node_modules | grep -v ".test." | sort -u)

for FILE in $LAYOUT_FILES; do
  # Extract layout component names
  LAYOUTS=$(grep -E "export.*(${LAYOUT_PATTERNS})" "$FILE" | sed 's/export.*\(function\|const\)\s*//' | sed 's/[(:=].*//' | sed 's/\s*$//')
  
  for LAYOUT_NAME in $LAYOUTS; do
    # Check if it accepts children
    HAS_CHILDREN="false"
    if grep -A 10 "$LAYOUT_NAME" "$FILE" | grep -q "children"; then
      HAS_CHILDREN="true"
    fi
    
    # Count usage
    USAGE_COUNT=$(grep -r "<$LAYOUT_NAME" . --include="*.tsx" --include="*.jsx" 2>/dev/null | wc -l)
    
    # Identify layout type
    LAYOUT_TYPE="generic"
    if echo "$LAYOUT_NAME" | grep -qi "header"; then
      LAYOUT_TYPE="header"
    elif echo "$LAYOUT_NAME" | grep -qi "footer"; then
      LAYOUT_TYPE="footer"
    elif echo "$LAYOUT_NAME" | grep -qi "sidebar"; then
      LAYOUT_TYPE="sidebar"
    elif echo "$LAYOUT_NAME" | grep -qi "grid"; then
      LAYOUT_TYPE="grid"
    elif echo "$LAYOUT_NAME" | grep -qi "flex\|stack"; then
      LAYOUT_TYPE="flex"
    fi
    
    # Add to index
    LAYOUT_ENTRY=$(jq -n \
      --arg name "$LAYOUT_NAME" \
      --arg path "$FILE" \
      --arg type "$LAYOUT_TYPE" \
      --arg children "$HAS_CHILDREN" \
      --arg usage "$USAGE_COUNT" \
      '{
        name: $name,
        path: $path,
        type: "layout",
        layout_type: $type,
        accepts_children: ($children == "true"),
        usage_count: ($usage | tonumber)
      }')
    
    LAYOUTS_INDEX=$(echo "$LAYOUTS_INDEX" | jq --argjson entry "$LAYOUT_ENTRY" '.layouts += [$entry]')
  done
done

# Save layouts index
echo "$LAYOUTS_INDEX" | jq '.' > .aidev-storage/index/layouts.json
LAYOUTS_COUNT=$(echo "$LAYOUTS_INDEX" | jq '.layouts | length')
echo "✅ Indexed $LAYOUTS_COUNT layout components"
```

### 6. API Routes Discovery

```bash
echo "🌐 Discovering API routes..."

API_INDEX='{"api_routes": []}'

# Find Next.js API routes (app router)
API_ROUTES=$(find . -path "*/api/*" -name "route.ts" -o -path "*/api/*" -name "route.js" | grep -v node_modules | sort)

for FILE in $API_ROUTES; do
  # Extract route path
  ROUTE_PATH=$(echo "$FILE" | sed 's|^\./||' | sed 's|/route\.[jt]s$||' | sed 's|^app||')
  
  # Extract HTTP methods
  METHODS=$(grep -E "^export\s+(async\s+)?function\s+(GET|POST|PUT|DELETE|PATCH)" "$FILE" | sed 's/export.*function\s*//' | sed 's/(.*//')
  
  # Check for middleware
  HAS_MIDDLEWARE="false"
  if grep -q "middleware" "$FILE"; then
    HAS_MIDDLEWARE="true"
  fi
  
  # Check for authentication
  REQUIRES_AUTH="false"
  if grep -q "auth\|token\|session" "$FILE"; then
    REQUIRES_AUTH="true"
  fi
  
  # Add to index
  API_ENTRY=$(jq -n \
    --arg path "$FILE" \
    --arg route "$ROUTE_PATH" \
    --argjson methods "$(echo "$METHODS" | jq -R -s 'split("\n") | map(select(. != ""))')" \
    --arg middleware "$HAS_MIDDLEWARE" \
    --arg auth "$REQUIRES_AUTH" \
    '{
      path: $path,
      route: $route,
      methods: $methods,
      has_middleware: ($middleware == "true"),
      requires_auth: ($auth == "true")
    }')
  
  API_INDEX=$(echo "$API_INDEX" | jq --argjson entry "$API_ENTRY" '.api_routes += [$entry]')
done

# Save API routes index
echo "$API_INDEX" | jq '.' > .aidev-storage/index/api_routes.json
API_COUNT=$(echo "$API_INDEX" | jq '.api_routes | length')
echo "✅ Indexed $API_COUNT API routes"
```

### 7. Pattern Recognition

```bash
echo "🎯 Identifying common patterns..."

PATTERNS_INDEX='{"patterns": []}'

# Authentication pattern
if grep -r "useAuth\|AuthContext\|AuthProvider" . --include="*.tsx" --include="*.ts" 2>/dev/null | grep -v node_modules | head -1 > /dev/null; then
  AUTH_FILES=$(grep -r "useAuth\|AuthContext\|AuthProvider" . --include="*.tsx" --include="*.ts" 2>/dev/null | cut -d: -f1 | sort -u | jq -R -s 'split("\n") | map(select(. != ""))')
  
  PATTERNS_INDEX=$(echo "$PATTERNS_INDEX" | jq --argjson files "$AUTH_FILES" '.patterns += [{
    name: "authentication",
    type: "context-hook",
    description: "Authentication using Context + Hook pattern",
    files: $files
  }]')
fi

# Form handling pattern
if grep -r "useForm\|FormProvider\|react-hook-form" . --include="*.tsx" --include="*.ts" 2>/dev/null | grep -v node_modules | head -1 > /dev/null; then
  FORM_FILES=$(grep -r "useForm\|FormProvider" . --include="*.tsx" --include="*.ts" 2>/dev/null | cut -d: -f1 | sort -u | jq -R -s 'split("\n") | map(select(. != ""))')
  
  PATTERNS_INDEX=$(echo "$PATTERNS_INDEX" | jq --argjson files "$FORM_FILES" '.patterns += [{
    name: "form-handling",
    type: "library-pattern",
    description: "Form handling with react-hook-form or similar",
    files: $files
  }]')
fi

# State management pattern
if grep -r "createContext\|useReducer\|Redux\|Zustand" . --include="*.tsx" --include="*.ts" 2>/dev/null | grep -v node_modules | head -1 > /dev/null; then
  STATE_FILES=$(grep -r "createContext\|useReducer\|store" . --include="*.tsx" --include="*.ts" 2>/dev/null | cut -d: -f1 | sort -u | jq -R -s 'split("\n") | map(select(. != ""))')
  
  PATTERNS_INDEX=$(echo "$PATTERNS_INDEX" | jq --argjson files "$STATE_FILES" '.patterns += [{
    name: "state-management",
    type: "architectural",
    description: "Centralized state management pattern",
    files: $files
  }]')
fi

# Save patterns index
echo "$PATTERNS_INDEX" | jq '.' > .aidev-storage/index/patterns.json
PATTERNS_COUNT=$(echo "$PATTERNS_INDEX" | jq '.patterns | length')
echo "✅ Identified $PATTERNS_COUNT patterns"
```

### 8. Generate Metadata and Summary

```bash
echo "📊 Generating index metadata..."

# Calculate statistics
TOTAL_FILES=$(find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) | grep -v node_modules | wc -l)
TOTAL_INDEXED=$((COMPONENT_COUNT + HOOKS_COUNT + UTILITIES_COUNT + API_COUNT))

# Find most used components
MOST_USED_COMPONENTS=$(jq -r '.components | sort_by(.usage_count) | reverse | .[0:5] | map(.name + " (" + (.usage_count | tostring) + ")")' .aidev-storage/index/components.json)
MOST_USED_HOOKS=$(jq -r '.hooks | sort_by(.usage_count) | reverse | .[0:5] | map(.name + " (" + (.usage_count | tostring) + ")")' .aidev-storage/index/hooks.json)
MOST_USED_UTILITIES=$(jq -r '.utilities | sort_by(.usage_count) | reverse | .[0:5] | map(.name + " (" + (.usage_count | tostring) + ")")' .aidev-storage/index/utilities.json)

# Create metadata
METADATA=$(jq -n \
  --arg version "1.0" \
  --arg created "$INDEX_START" \
  --arg updated "$(date -u +"%Y-%m-%dT%H:%M:%SZ")" \
  --arg mode "full" \
  --arg total_files "$TOTAL_FILES" \
  --arg total_indexed "$TOTAL_INDEXED" \
  --arg components "$COMPONENT_COUNT" \
  --arg hooks "$HOOKS_COUNT" \
  --arg utilities "$UTILITIES_COUNT" \
  --arg styles "$STYLES_COUNT" \
  --arg layouts "$LAYOUTS_COUNT" \
  --arg api_routes "$API_COUNT" \
  --arg patterns "$PATTERNS_COUNT" \
  --argjson top_components "$MOST_USED_COMPONENTS" \
  --argjson top_hooks "$MOST_USED_HOOKS" \
  --argjson top_utilities "$MOST_USED_UTILITIES" \
  '{
    version: $version,
    created_at: $created,
    updated_at: $updated,
    mode: $mode,
    statistics: {
      total_source_files: ($total_files | tonumber),
      total_indexed_items: ($total_indexed | tonumber),
      breakdown: {
        components: ($components | tonumber),
        hooks: ($hooks | tonumber),
        utilities: ($utilities | tonumber),
        styles: ($styles | tonumber),
        layouts: ($layouts | tonumber),
        api_routes: ($api_routes | tonumber),
        patterns: ($patterns | tonumber)
      }
    },
    insights: {
      most_used_components: $top_components,
      most_used_hooks: $top_hooks,
      most_used_utilities: $top_utilities
    }
  }')

# Save metadata
echo "$METADATA" | jq '.' > .aidev-storage/index/metadata.json

echo "✅ Index metadata generated"
```

### 9. Create Search Helper

```bash
echo "🔍 Creating search helper..."

# Create a unified search index for quick lookups
SEARCH_INDEX='{}'

# Add all indexed items with searchable terms
SEARCH_INDEX=$(echo "$SEARCH_INDEX" | jq --slurpfile components .aidev-storage/index/components.json '
  . + {
    components: $components[0].components | map({
      name: .name,
      path: .path,
      type: "component",
      search_terms: [.name | ascii_downcase, (.name | gsub("(?<=[a-z])(?=[A-Z])"; " ") | ascii_downcase | split(" ") | join(" "))]
    })
  }')

SEARCH_INDEX=$(echo "$SEARCH_INDEX" | jq --slurpfile hooks .aidev-storage/index/hooks.json '
  . + {
    hooks: $hooks[0].hooks | map({
      name: .name,
      path: .path,
      type: "hook",
      search_terms: [.name | ascii_downcase, (.name | gsub("use"; "") | ascii_downcase)]
    })
  }')

SEARCH_INDEX=$(echo "$SEARCH_INDEX" | jq --slurpfile utilities .aidev-storage/index/utilities.json '
  . + {
    utilities: $utilities[0].utilities | map({
      name: .name,
      path: .path,
      type: "utility",
      category: .category,
      search_terms: [.name | ascii_downcase, .category]
    })
  }')

# Save search index
echo "$SEARCH_INDEX" | jq '.' > .aidev-storage/index/search_index.json
```

### 10. Final Summary

```bash
echo ""
echo "===================================="
echo "✅ INDEXATION COMPLETE"
echo "===================================="
echo ""
echo "📊 Statistics:"
echo "  - Components: $COMPONENT_COUNT"
echo "  - Hooks: $HOOKS_COUNT"
echo "  - Utilities: $UTILITIES_COUNT"
echo "  - Styles: $STYLES_COUNT"
echo "  - Layouts: $LAYOUTS_COUNT"
echo "  - API Routes: $API_COUNT"
echo "  - Patterns: $PATTERNS_COUNT"
echo ""
echo "📁 Index Location: .aidev-storage/index/"
echo ""
echo "🔍 Usage:"
echo "  - Phase 0 can now query this index"
echo "  - No need to scan entire codebase"
echo "  - Semantic search available"
```

## Key Features

<index-capabilities>
✅ **Component Analysis**
  - Props extraction
  - Import tracking
  - Usage counting
  - Complexity assessment

✅ **Smart Categorization**
  - Automatic type detection
  - Pattern recognition
  - Usage statistics

✅ **Searchable Index**
  - Semantic search terms
  - Category-based lookup
  - Usage-based ranking

✅ **Full Indexation**
  - Analyzes entire codebase
  - Creates comprehensive index
  - Use `aidev-update-index` for incremental updates
</index-capabilities>

## Success Criteria

Indexation is successful when:
- All source files are analyzed
- Reusable components identified
- Usage patterns tracked
- Search index created
- No source code modified