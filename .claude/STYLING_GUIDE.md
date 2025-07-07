# Styling Guide

This guide contains detailed styling patterns from mypreferences/styling.md

## Styling Approaches

### Approach 1: CSS Modules with SCSS (Feature-Rich Apps)
Used when: Building complex applications with custom designs and animations

```json
{
  "styling": "CSS Modules with SCSS",
  "component-library": "Material-UI",
  "css-variables": "For design tokens",
  "animations": "CSS @keyframes"
}
```

### Approach 2: MUI sx Prop (Rapid Development)
Used when: Building quickly with Material Design patterns

```json
{
  "styling": "MUI sx prop + Emotion",
  "component-library": "Material-UI",
  "global-styles": "Minimal SCSS",
  "animations": "MUI transitions"
}
```

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
```typescript
// Component-specific modules
import styles from './ComponentName.module.scss';

// Shared modules with descriptive names
import tabsStyle from '@/styles/Tabs.module.scss';
import linkStyle from '@/styles/Link.module.scss';
```

### Class Naming Conventions
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
```typescript
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
```typescript
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

### Conditional Styling with sx
```typescript
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

## Color System with CSS Variables

### Define in _app.tsx or theme
```typescript
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

## Material-UI Theme Configuration

### Component Overrides
```typescript
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

### Typography System
```typescript
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

### Dark Mode Implementation
```typescript
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

## Icon Systems

```typescript
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

## Utility Classes

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

## Container Strategies

```typescript
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

## Form Patterns

```typescript
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

## Performance Optimization

### Style Memoization
```typescript
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

## Loading States Pattern

```typescript
// With React Query
const { isLoading, isFetching } = useQuery({
  queryKey: ['users'],
  queryFn: fetchUsers,
});

if (isLoading) return <ContentLoader />;

// Loading button for actions
<LoadingButton 
  loading={mutation.isPending} 
  onClick={handleClick}
  variant="contained"
>
  Save
</LoadingButton>

// Skeleton loading
{isLoading ? (
  <>
    <Skeleton variant="text" width={200} height={40} />
    <Skeleton variant="rectangular" width="100%" height={200} />
  </>
) : (
  <DataContent data={data} />
)}
```

## Notifications: Notistack

```typescript
// Layout or _app.tsx
import { SnackbarProvider } from 'notistack';

<SnackbarProvider 
  maxSnack={3}
  anchorOrigin={{
    vertical: 'bottom',
    horizontal: 'left',
  }}
>
  {children}
</SnackbarProvider>

// Usage
import { enqueueSnackbar } from 'notistack';

// Success
enqueueSnackbar('User created successfully!', { variant: 'success' });

// Error
enqueueSnackbar('Failed to save changes', { variant: 'error' });

// With action
enqueueSnackbar('File uploaded', {
  variant: 'success',
  action: (key) => (
    <Button onClick={() => closeSnackbar(key)}>
      Dismiss
    </Button>
  ),
});
```

## Environment Variables

### Naming Convention
- **Client-visible**: `NEXT_PUBLIC_*`
- **Server-only**: Standard names without prefix

```env
# Authentication
NEXTAUTH_URL=
NEXTAUTH_SECRET=

# Database
DATABASE_URL=

# Redis
REDIS_URL=

# External Services
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=

# Sentry
SENTRY_DSN=
NEXT_PUBLIC_SENTRY_DSN=

# OAuth Providers
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

## Package.json Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:studio": "prisma studio",
    "db:generate": "prisma generate"
  }
}
```

## What NOT to Do

1. Don't mix inline styles with sx prop or CSS modules
2. Don't hardcode colors - use theme or CSS variables
3. Don't use !important unless overriding third-party styles
4. Don't create deeply nested selectors in SCSS
5. Don't use px for MUI spacing when theme units available
6. Don't forget responsive considerations
7. Don't use var declarations in styles
8. Don't mix styling approaches unnecessarily in same component