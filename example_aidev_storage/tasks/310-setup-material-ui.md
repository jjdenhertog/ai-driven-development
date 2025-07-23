---
id: "310"
name: "setup-material-ui"
type: "setup"
dependencies: ["001", "004"]
estimated_lines: 50
priority: "high"
---

# Setup: Material-UI Configuration

## Description
Install Material-UI v5 and configure the theme provider for the application dashboard.

## Acceptance Criteria
- [ ] Install @mui/material and dependencies
- [ ] Create custom theme configuration
- [ ] Setup ThemeProvider in layout
- [ ] Configure MUI with Next.js App Router
- [ ] Add Roboto font
- [ ] Setup emotion cache for SSR

## Implementation
```bash
npm install @mui/material @emotion/react @emotion/styled @mui/icons-material
```

## Configuration
```typescript
// app/theme.ts
import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});
```

## Test Specifications
```yaml
setup_tests:
  - "MUI components render without errors"
  - "Theme applies correctly"
  - "SSR works without hydration errors"
```

## Code Reuse
- Follow Next.js App Router patterns
- Use existing layout structure
