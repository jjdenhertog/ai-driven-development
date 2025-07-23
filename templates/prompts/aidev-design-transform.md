---
description: "AI-driven design transformation using visual validation with Playwright MCP"
allowed-tools: ["Read", "Write", "Edit", "MultiEdit", "Bash", "Grep", "Glob", "LS", "playwright_*"]
disallowed-tools: ["git", "WebFetch", "WebSearch", "Task", "NotebookRead", "NotebookEdit"]
---

# Command: aidev-design-transform

# 🎨 DESIGN TRANSFORMATION WITH VISUAL VALIDATION 🎨

You are performing a design transformation task. You will use Playwright MCP to visually inspect the current design, implement changes, and validate the results.

## Purpose
Transform an application's visual design based on user requirements while maintaining code quality and visual consistency.

## Critical Files
- **CLAUDE_DESIGNER.md**: Living style guide you must read first and update after changes

## Process

### 0. Pre-Flight Setup

```bash
echo "===================================="
echo "🎨 DESIGN TRANSFORMATION TASK"
echo "===================================="
echo "✅ Will: Navigate and inspect current design"
echo "✅ Will: Transform styles to match brief"
echo "✅ Will: Validate changes visually"
echo "✅ Will: Update style guide documentation"
echo "===================================="

# Check if CLAUDE_DESIGNER.md exists
if [ -f "CLAUDE_DESIGNER.md" ]; then
  echo "📖 Found existing style guide - reading..."
  # Read the file to understand current design system
else
  echo "📝 No style guide found - will create CLAUDE_DESIGNER.md"
fi

# Verify server is running
echo "🌐 Checking if application is accessible..."
# User should have provided URLs like http://localhost:3000
```

### 1. Read & Analyze Style Guide

If CLAUDE_DESIGNER.md exists, analyze it for:
- Current color palette
- Component state definitions
- Previously documented patterns
- Change history

Create or initialize CLAUDE_DESIGNER.md with this structure:

```markdown
# Design System Style Guide

## Last Updated: [timestamp]

## Current Design Brief
[Document the transformation request]

## Color Palette
### Previous Colors
[Document what existed before]

### New Colors
[Document the new palette]

## Component States
[Document all interactive states]

## Change Log
[Track all modifications]
```

### 2. Visual Discovery Phase

Using Playwright MCP tools, navigate to each provided URL and:

```bash
# For each page provided by user
# 1. Navigate to the page
# 2. Take full page screenshot
# 3. Identify key components (buttons, forms, cards, navigation)
# 4. Document current styling approach
```

Analyze and document:
- Current color usage
- Typography scales
- Spacing patterns
- Component styles
- Interactive states

### 3. Codebase Analysis

```bash
# Find styling methodology
echo "🔍 Analyzing styling approach..."

# Check for CSS modules
find . -name "*.module.css" -o -name "*.module.scss" | head -5

# Check for styled-components
grep -r "styled\." --include="*.tsx" --include="*.jsx" | head -5

# Check for Tailwind
[ -f "tailwind.config.js" ] && echo "Found Tailwind configuration"

# Find theme files
find . -name "*theme*" -name "*colors*" -name "*design*" | grep -E "\.(ts|js|css|scss)$"

# Locate global styles
find . -name "globals.css" -o -name "global.scss" -o -name "app.css"
```

### 4. Create Design Implementation Plan

Based on the analysis, determine:
1. Where to define new color variables
2. Which files need updating
3. Component modification strategy
4. State implementation approach

### 5. Implement Design System

#### 5.1 Define Color System

Create/update theme configuration with the new colors:

```css
:root {
  /* New Color Palette */
  --color-background: #090040;
  --color-surface: #0D0050;
  --color-primary: #B13BFF;
  --color-accent: #FFCC00;
  --color-primary-dark: #471396;
  
  /* State Variations */
  --hover-brightness: 1.1;
  --active-brightness: 0.9;
  --disabled-opacity: 0.5;
  
  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-normal: 200ms ease;
}
```

#### 5.2 Implement Component States

For each component type, implement ALL states:

```css
/* Button Example */
.button {
  background: var(--color-primary);
  transition: var(--transition-normal);
  
  /* Hover */
  &:hover:not(:disabled) {
    filter: brightness(var(--hover-brightness));
    transform: translateY(-1px);
  }
  
  /* Active */
  &:active:not(:disabled) {
    filter: brightness(var(--active-brightness));
    transform: translateY(0);
  }
  
  /* Focus */
  &:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }
  
  /* Disabled */
  &:disabled {
    opacity: var(--disabled-opacity);
    cursor: not-allowed;
  }
}
```

### 6. Visual Validation Loop

After implementing changes for each component/page:

```bash
# Use Playwright to validate changes
# 1. Navigate to the page
# 2. Take screenshot
# 3. Visually confirm the design matches the brief
# 4. Test interactive states (hover, focus, etc.)
# 5. Check text readability
# 6. Verify consistent application
```

If issues are found:
1. Identify the specific problem
2. Locate the relevant code
3. Apply fix
4. Re-validate visually

### 7. Cross-Page Consistency Check

Navigate through all pages to ensure:
- Consistent color application
- Uniform component styling  
- Proper state implementations
- No missed elements

### 8. Update Style Guide

After completing implementation, update CLAUDE_DESIGNER.md:

```markdown
## Component Specifications

### Buttons
- Default: Background #B13BFF, text white
- Hover: Brightness 110%, translateY(-1px)
- Active: Brightness 90%, translateY(0)
- Focus: 2px #FFCC00 outline
- Disabled: 50% opacity

### Form Inputs
[Document each component similarly]

## Implementation Details
- Theme location: /styles/theme.css
- Component styles: [list key files]
- Global styles: /styles/globals.css

## Change Log
### [Date] - Dark Minimalist Theme
- Changed: Light theme to dark minimalist
- Updated: All interactive components
- Files modified: [count] files
- Colors: #090040, #471396, #B13BFF, #FFCC00
```

### 9. Quality Checks

```bash
# Run tests to ensure nothing broke
npm test

# Build to verify no errors
npm run build

# Type check if using TypeScript
npm run type-check
```

### 10. Final Visual Review

Use Playwright to:
1. Navigate through entire application
2. Capture final screenshots
3. Create before/after comparison
4. Verify all requirements met

## Important Patterns

### When Style Guide Shows Conflicts

If CLAUDE_DESIGNER.md documents a pattern that differs from implementation:

```bash
# Expand search to find all instances
echo "⚠️  Style conflict detected - expanding search..."

# Search for the conflicting pattern
grep -r "old-color-value" --include="*.css" --include="*.scss"
grep -r "old-class-name" --include="*.tsx" --include="*.jsx"

# Update all instances systematically
```

### State Implementation Priority

Always implement in this order:
1. Default state
2. Hover state  
3. Active state
4. Focus state
5. Disabled state
6. Error state (if applicable)
7. Loading state (if applicable)

### Visual Validation Checklist

For each component, verify:
- [ ] Colors match design brief
- [ ] Text is readable (contrast ratio)
- [ ] Interactive states are clear
- [ ] Transitions feel smooth
- [ ] No visual glitches
- [ ] Consistent with other components

## Success Criteria

The design transformation is complete when:
- ✅ All specified pages use new color scheme
- ✅ All interactive states implemented
- ✅ Visual validation confirms design brief met
- ✅ CLAUDE_DESIGNER.md fully documents new system
- ✅ All tests pass
- ✅ Build succeeds
- ✅ No accessibility issues introduced

## Common Issues & Solutions

### Issue: Colors not applying
- Check CSS specificity
- Verify variable definitions
- Look for hardcoded values

### Issue: States not working
- Ensure proper CSS selectors
- Check for JavaScript interference  
- Verify transition properties

### Issue: Inconsistent application
- Search for inline styles
- Check for component variants
- Look for conditional styling

## Final Output

1. Transformed application with new design
2. Updated CLAUDE_DESIGNER.md with complete documentation
3. List of all modified files
4. Visual validation screenshots
5. Any identified issues or limitations