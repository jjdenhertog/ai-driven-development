---
name: "Styling Guide"
description: "Defines styling approaches using MUI sx prop and CSS Modules with SCSS"
ai_instructions: |
  When implementing styles:
  1. DEFAULT to MUI sx prop for most styling needs
  2. Use CSS Modules ONLY when specified or for complex animations
  3. Always use MUI theme colors, never hardcode colors
  4. Follow the B-prefix convention for custom UI components
  5. Memoize complex sx prop objects with useMemo
---

# Styling Guide

<ai-context>
This document defines HOW to style Next.js applications. The PRIMARY approach is using MUI's sx prop
for rapid development. CSS Modules with SCSS is a SECONDARY approach used only when needed for 
complex designs or animations. AI should default to sx prop unless specifically told otherwise.
</ai-context>

This document defines HOW I style Next.js applications. My approach varies based on project requirements, but follows consistent patterns.

## Core Principles

<ai-rules>
- DEFAULT to MUI sx prop approach unless told otherwise
- NEVER hardcode colors - use theme or CSS variables
- ALWAYS memoize complex sx prop objects
- USE B-prefix for custom UI components
- AVOID !important unless overriding third-party styles
</ai-rules>

1. **Flexibility First** - Choose the right styling solution for the project
2. **Material-UI Foundation** - Leverage MUI components and theming
3. **Performance Conscious** - Optimize for runtime performance
4. **Maintainability** - Keep styles organized and scalable

## Styling Approaches

### PRIMARY APPROACH: MUI sx Prop (Default)

<ai-decision-tree>
Should I use sx prop or CSS Modules?
1. Is it a simple style? → Use sx prop
2. Does it need animations? → Complex? Use CSS Modules. Simple? Use sx prop
3. Is it a one-off style? → Use sx prop
4. Does it need BEM-like organization? → Use CSS Modules
5. Default choice? → Use sx prop
</ai-decision-tree>
**This is my main preference for most projects** - Using MUI sx prop for rapid development

```json
{
  "styling": "MUI sx prop + Emotion",
  "component-library": "Material-UI",
  "global-styles": "Minimal SCSS",
  "animations": "MUI transitions"
}
```

### SECONDARY APPROACH: CSS Modules with SCSS (When Needed)
Used when: Building complex applications with custom designs and heavy animations

```json
{
  "styling": "CSS Modules with SCSS",
  "component-library": "Material-UI",
  "css-variables": "For design tokens",
  "animations": "CSS @keyframes"
}
```

**Note**: Unless specified otherwise, always use the sx prop approach as the default styling method.

## CSS Modules Implementation

### File Organization
```
/src
  /components
    /ComponentName
      ComponentName.tsx
      ComponentName.module.scss    # Co-located styles
  /styles
    app.scss                       # Global styles
    Tabs.module.scss              # Shared component modules
    Link.module.scss
```

### Module Import Patterns
```tsx
// Component-specific modules
import styles from './ComponentName.module.scss';

// Shared modules with descriptive names
import tabsStyle from '@/styles/Tabs.module.scss';
import linkStyle from '@/styles/Link.module.scss';
```

### Class Naming Conventions

<validation-schema>
CSS Module Class Names:
- ✅ .NavigationButton (PascalCase for component root)
- ✅ .TabsVerticalItem (BEM-like for elements)
- ✅ &[aria-selected="true"] (attribute selectors for state)
- ❌ .navigation-button (no kebab-case)
- ❌ .navigationButton (no camelCase for CSS)
- ❌ .navigation_button (no snake_case)
</validation-schema>
```scss
// PascalCase for component root
.NavigationButton { }
.HintLabel { }

// BEM-like for elements
.TabsVerticalItem { }
.cloud__icon { }

// State with attributes
&[aria-selected="true"] { }
&[data-active="true"] { }
```

### Conditional Classes
```tsx
// Ternary for simple conditions
className={variant == 'vertical' ? tabsStyle.TabsVerticalItem : tabsStyle.TabsItem}

// Template literals for dynamic classes
className={`tiptap--comment ${editor?.isFocused ? 'tiptap--comment-focused' : ''}`}

// Array join for multiple classes
const classNames = [styles.Hint];
if (className) classNames.push(className);
<Box className={classNames.join(' ')}>
```

## MUI sx Prop Implementation

### Basic Patterns

<code-template name="mui-sx-basic">
```tsx
// Simple inline styles
<Typography sx={{ mb: 2 }} variant="body2">

// Complex styles with useMemo
const paperStyles = useMemo(() => ({
    p: 1,
    mb: 1,
    display: 'flex',
    alignItems: 'center',
    bgcolor: 'background.paper',
    border: '1px solid transparent'
}), []);

// Responsive sx prop
sx={{ 
    textAlign: { 
        xs: "center", 
        md: "left",
        lg: "center"
    } 
}}
```
</code-template>

### Conditional Styling with sx

<code-template name="mui-sx-conditional">
```tsx
// Memoized conditional styles
const paperStyles = useMemo(() => {
    const styles = { /* base */ };
    if (layerSelected)
        styles.border = `1px solid #edaf07`;
    return styles;
}, [layerSelected]);

// Hover states
sx={{ 
    '&:hover': { 
        bgcolor: "#1aa34a",
        opacity: 1 
    }
}}
```
</code-template>

## Design System

### Color System with CSS Variables
```tsx
// Define in _app.tsx or theme
'--color-primary': hexToPlainRgb(theme.palette.primary.main)
'--color-primary-contrast': hexToPlainRgb(theme.palette.primary.contrastText)
'--color-secondary': hexToPlainRgb(theme.palette.secondary.main)
'--color-success': hexToPlainRgb(theme.palette.success.main)
'--color-error': hexToPlainRgb(theme.palette.error.main)
'--color-warning': hexToPlainRgb(theme.palette.warning.main)
'--color-info': hexToPlainRgb(theme.palette.info.main)
'--color-background-default': hexToPlainRgb(theme.palette.background.default)
'--color-background-paper': hexToPlainRgb(theme.palette.background.paper)

// Domain-specific colors
'--color-flight-unknown': hexToPlainRgb(theme.palette.flight_states.unknown)
'--color-flight-production': hexToPlainRgb(theme.palette.flight_states.production)
```

### Color Usage Patterns
```scss
// In SCSS
background: rgb(var(--color-background-paper));
border: 1px solid rgba(var(--color-info), 0.5);

// In sx prop
sx={{ background: 'rgb(var(--color-error))' }}

// Direct MUI palette
sx={{ bgcolor: 'background.paper', color: 'text.secondary' }}
```

### Typography System
```tsx
// Custom theme typography
typography: {
    fontFamily: 'Noto Sans',
    h1: { fontSize: "1.2em", lineHeight: "1.4em", fontWeight: 400 },
    h2: { fontSize: "1.15em", lineHeight: "1.4em", fontWeight: 300 },
    body1: { fontSize: '.95em', lineHeight: "1.2em", fontWeight: 200 },
    body2: { lineHeight: "1.4em", fontWeight: 200 }
}

// Global overrides when needed
h1 { font-size: 1.7em !important; font-weight: 500 !important; }
h2 { font-size: 1.4em !important; font-weight: 500 !important; }
```

### Spacing Conventions
```tsx
// MUI spacing (8px base)
sx={{ p: 2, mb: 2, gap: 1 }}

// Custom spacing in SCSS
padding: 8px 16px;
margin-bottom: 24px;
```

## Material-UI Theme Configuration

### Component Overrides
```tsx
components: {
    MuiButton: {
        defaultProps: {
            variant: 'outlined',
            disableElevation: true
        },
        styleOverrides: {
            root: {
                textTransform: 'none',
                fontWeight: 'normal',
                borderRadius: '2px'
            }
        }
    },
    MuiTooltip: {
        defaultProps: {
            arrow: true,
            enterDelay: 400,
            placement: "bottom"
        }
    },
    MuiContainer: {
        styleOverrides: {
            root: {
                maxWidth: 1300,
                '@media(max-width:600px)': {
                    paddingLeft: 8,
                    paddingRight: 8
                }
            }
        }
    }
}
```

### Dark Mode Implementation
```tsx
// Theme toggle with context
const ColorModeContext = createContext({ toggleColorMode: () => {} });

// Cookie persistence
document.cookie = `theme=${mode};max-age=31536000;path=/`;

// Current preference: dark mode
palette: {
    mode: 'dark',
    primary: { main: '#edaf07' },
    secondary: { main: '#cccccc' }
}
```

## Layout Patterns

### Container Strategies
```tsx
// Full-width container
<Container style={{ maxWidth: "100%", padding: 0 }}>

// Custom max-width
<Container style={{ maxWidth: 1600 }}>

// Responsive padding
<Container sx={{ 
    paddingLeft: { xs: 0, xl: 3 }, 
    paddingRight: { xs: 0, xl: 3 } 
}}>
```

### Grid Usage
```tsx
// MUI Grid2 (preferred)
<Grid container spacing={2}>
    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        {content}
    </Grid>
</Grid>

// Flexbox layouts
<Box sx={{ display: 'flex', gap: 2 }}>
    <Box sx={{ flexGrow: 1 }}>
```

### Utility Classes
```scss
// Global utilities in app.scss
.verticalCenter {
    display: flex;
    flex-direction: column !important;
    justify-content: center;
}

.flexBottom {
    display: flex;
    flex-direction: column !important;
    justify-content: flex-end;
}

.overflowEllipsis {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
```

## Animation Patterns

### CSS Keyframes (When Using Modules)
```scss
@keyframes cloudFloating {
    0% { transform: translateY(0px); }
    50% { transform: translateY(10px); }
    100% { transform: translateY(0px); }
}

.cloud__icon {
    animation: cloudFloating 10s ease-in-out infinite;
    will-change: transform;
}
```

### Transitions
```scss
// CSS transitions
.element {
    transition: opacity 0.2s, border-color 0.5s;
    
    &:hover {
        opacity: 1;
    }
}

// MUI transitions
sx={{ transition: 'opacity 0.2s' }}
```

## Component Patterns

### Custom Wrappers
```tsx
// Wrap MUI components for consistency
export const BTextField = (props: TextFieldProps) => {
    return <TextField {...props} />
}

export const BInput = ({ value, onChange, onPressEnter }) => {
    return <TextField 
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
    />
}
```

### Icon Systems
```tsx
// FontAwesome Pro for custom icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloud } from '@fortawesome/pro-light-svg-icons';
<FontAwesomeIcon icon={faCloud} size="3x" className="cloud__icon" />

// MUI Icons for standard UI
import { Add, Check, Edit } from '@mui/icons-material';
<IconButton size="small">
    <Check sx={{ fontSize: '1em' }} />
</IconButton>
```

## Form Patterns

### Input Components
```tsx
// Full width by default
<TextField 
    fullWidth
    required
    placeholder="Descriptive placeholder"
    variant="outlined"
    size="small"
/>

// Custom validation wrapper
<BTextField 
    validation="email"
    error={!!errors.email}
    helperText={errors.email}
/>
```

## Responsive Design

### Breakpoint Usage
```tsx
// Responsive props
<Grid size={{ xs: 12, sm: 6, md: 4 }}>

// Responsive sx
sx={{ 
    display: { xs: 'none', md: 'block' },
    p: { xs: 2, md: 3, lg: 4 }
}}

// Window-based calculations
const size = window.innerWidth < 400 ? 50 : 80;
```

## Performance Optimization

### Style Memoization
```tsx
// Memoize complex style objects
const styles = useMemo(() => ({
    complex: 'styles',
    that: 'change',
    based: 'on',
    props: true
}), [dependencies]);
```

### CSS Loading Strategy
- CSS Modules: Automatic code splitting
- Global styles: Minimal, only utilities
- Critical CSS: Handled by Next.js
- Animations: Use `will-change` for performance

## Decision Tree

### When to Use CSS Modules
- Custom animations needed
- Complex component-specific styles
- BEM-like organization preferred
- Maximum style isolation required

### When to Use MUI sx Prop
- Rapid prototyping
- Simple layouts
- Theme-based styling only
- Minimal custom CSS needed

## File Structure Examples

### CSS Modules Approach
```tsx
// NavigationButton.tsx
import styles from './NavigationButton.module.scss';

export const NavigationButton = ({ href, selected }) => (
    <Link 
        href={href}
        className={styles.NavigationButton}
        aria-selected={selected ? "true" : undefined}
    >
        {children}
    </Link>
);
```

### MUI sx Approach
```tsx
// SpotifyButton.tsx
export const SpotifyButton = ({ onClick }) => (
    <Button 
        onClick={onClick}
        sx={{ 
            bgcolor: "#1db954", 
            '&:hover': { bgcolor: "#1aa34a" },
            color: '#fff'
        }}
    >
        Connect Spotify
    </Button>
);
```

## What NOT to Do

<ai-rules>
- DON'T mix inline styles with sx prop or CSS modules
- DON'T hardcode colors - use theme or CSS variables
- DON'T use !important unless overriding third-party styles
- DON'T create deeply nested selectors in SCSS
- DON'T use px for MUI spacing when theme units available
- DON'T forget responsive considerations
- DON'T use var declarations in styles
- DON'T mix styling approaches unnecessarily in same component
</ai-rules>

1. Don't mix inline styles with sx prop or CSS modules
2. Don't hardcode colors - use theme or CSS variables
3. Don't use !important unless overriding third-party styles
4. Don't create deeply nested selectors in SCSS
5. Don't use px for MUI spacing when theme units available
6. Don't forget responsive considerations
7. Don't use var declarations in styles
8. Don't mix styling approaches unnecessarily in same component

## Summary

<ai-decision-tree>
Which styling approach for this component?

1. Is this a new component?
   → YES: Use MUI sx prop (default)
   → NO: Match existing pattern

2. Does it need complex animations?
   → YES: Use CSS Modules with @keyframes
   → NO: Use sx prop

3. Is it a custom UI library component?
   → YES: Name with B-prefix, use sx prop
   → NO: Continue with chosen approach

4. Does it need scoped styles?
   → YES: CSS Modules provide automatic scoping
   → NO: sx prop is sufficient
</ai-decision-tree>

Choose the right styling approach for your project needs. Use CSS Modules for complex, animation-heavy applications with custom designs. Use MUI sx prop for rapid development with Material Design patterns. Always maintain consistency within a project, leverage MUI's theming system, and prioritize performance through proper memoization and minimal runtime styles.