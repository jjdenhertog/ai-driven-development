---
id: "104"
name: "create-b-component-base"
type: "pattern"
dependencies: ["004-install-core-dependencies"]
estimated_lines: 100
priority: "high"
---

# Pattern: B-Component Base Pattern

## Description
Create the base pattern for B-prefixed MUI components that extend Material-UI components with custom styling and additional props.

## Pattern Requirements
- Extend MUI component props
- Apply custom theme styles
- Support all MUI variants
- TypeScript prop validation
- Consistent naming convention
- Loading states where applicable

## Implementation
Create an 80-100 line pattern that demonstrates:
```typescript
// components/ui/BButton.tsx
import { Button, ButtonProps, CircularProgress } from '@mui/material'

export interface BButtonProps extends ButtonProps {
  loading?: boolean
  loadingText?: string
}

export function BButton({ 
  loading, 
  loadingText, 
  children, 
  disabled,
  ...props 
}: BButtonProps) {
  // Pattern implementation
  // Shows loading state
  // Maintains MUI compatibility
}
```

## Test Specifications
```yaml
pattern_tests:
  - scenario: "Normal button"
    props: { children: "Click me" }
    renders: "Button with text"
    
  - scenario: "Loading state"
    props: { loading: true, children: "Submit" }
    renders: "Spinner with disabled state"
    
  - scenario: "All MUI props work"
    props: { variant: "contained", color: "primary" }
    renders: "MUI styled button"
    
  - scenario: "Custom theme styles"
    props: { variant: "primary" }
    renders: "Custom primary style"
```

## Usage Examples
Show 3+ places this pattern will be used:
1. Login form submit button
2. Job submission button
3. Admin action buttons
4. All buttons throughout the app

Additional B-components following this pattern:
- BTextField
- BCard  
- BDialog
- BAlert

## Code Reuse
- Base pattern for all B-components
- Consistent prop extension approach
- Shared loading state pattern

## Documentation Links
- [MUI Component Customization](https://mui.com/material-ui/customization/how-to-customize/)
- [TypeScript with MUI](https://mui.com/material-ui/guides/typescript/)

## Potential Gotchas
- Props spreading order matters
- Theme typing requirements
- Ref forwarding needed

## Testing Notes
- Test prop inheritance
- Verify MUI theme integration
- Check TypeScript types