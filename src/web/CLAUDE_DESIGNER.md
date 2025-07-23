# Design System Style Guide

## Last Updated: 2025-07-23

## Current Design Brief
Transform the web interface to a modern dark theme with warm accents:
- Subtle gradients for interactive boxes
- New color palette: #2C3639, #3F4E4F, #A27B5C, #DCD7C9
- Minimal but modern styling
- Consistent styling across all components
- Max-width constraint of 1600px
- Left-aligned navigation with home button

## Color Palette
### Previous Colors
- Background Primary: #0a0a0a (near black)
- Background Secondary: #111111 (dark gray)
- Background Tertiary: #1a1a1a (lighter dark gray)
- Accent: #3b82f6 (blue)
- Text Primary: #fafafa (near white)

### New Colors (Darker Theme Update)
- Background Primary: #1A1E1F (very dark charcoal)
- Background Secondary: #242A2B (dark charcoal)
- Background Tertiary: #2E3536 (medium dark charcoal)
- Background Hover: #3A4142 (hover state charcoal)
- Primary: #A27B5C (warm brown/tan)
- Primary Hover: #B08968 (lighter warm brown)
- Accent: #A27B5C (same as primary for consistency)
- Text Primary: #DCD7C9 (warm off-white)
- Text Secondary: #B0ACA3 (muted warm gray)
- Gradient Subtle: linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%)
- Gradient Hover: linear-gradient(135deg, var(--bg-tertiary) 0%, var(--bg-hover) 100%)
- Gradient Page: linear-gradient(180deg, var(--bg-primary) 0%, #141718 100%)

## Component States

### Buttons
- Default: Background gradient-subtle, text primary
- Hover: Background gradient-hover, translateY(-1px)
- Active: Brightness 90%, translateY(0)
- Focus: 2px accent-color outline
- Disabled: 50% opacity
- Primary variant: Background accent-color, text white

### Form Inputs
- Default: Background #3F4E4F, border #4A5858
- Hover: Border color #566262
- Focus: Border accent-color, box-shadow with accent-muted
- Disabled: 50% opacity

### Priority Indicators
- Critical: Error color (#ef4444)
- High: Warning/Accent color (#A27B5C)
- Medium: Accent color (#A27B5C)
- Low: Text secondary (#B0ACA3)

### Status Colors
- Pending: Text secondary
- In Progress: Warning/Accent color (#A27B5C)
- Completed: Success color (#10b981)
- Failed: Error color (#ef4444)
- Archived: Text tertiary

## Implementation Details
- Theme location: /src/app/globals.css
- Component styles: CSS Modules throughout
- Global styles: /src/app/globals.css

## CSS Variables Added
- --button-secondary: var(--bg-tertiary)
- --button-secondary-hover: var(--bg-hover)
- --button-danger: var(--error-color)
- --button-danger-hover: #dc2626
- --overlay-bg: rgba(9, 0, 64, 0.8)
- --modal-shadow: 0 8px 16px rgba(0, 0, 0, 0.6)
- --card-shadow: 0 4px 6px rgba(0, 0, 0, 0.3)
- --modal-border: rgba(177, 59, 255, 0.2)

## Change Log
### 2025-07-23 - Darker Theme Update with Enhanced UI
- Updated: Made overall theme darker with new color palette (#1A1E1F, #242A2B, #2E3536, #3A4142)
- Maintained: Warm accent colors and text colors from previous update
- Added: Page-wide subtle background gradient for depth
- Implemented: Tab-based sub-navigation for plan/concepts, preferences, and settings pages
- Updated: Containers page layout to match code/tasks page structure (sidebar + main content)
- Changed: Homepage layout to 2x2 grid (2 rows of 2 blocks)
- Enhanced: Consistent file display and gradient styling across all pages
- Files modified: globals.css, page.module.css, ConceptSection.module.css, PreferencesSection.module.css, SettingsSection.module.css, ContainerSection.module.css, ContainerList.module.css

### 2025-07-23 - Modern Dark Theme with Warm Accents
- Changed: Previous dark blue/purple theme to modern dark with warm brown accents
- Updated: Complete color palette to #2C3639, #3F4E4F, #A27B5C, #DCD7C9
- Added: Subtle gradients for all interactive boxes and components
- Implemented: Max-width constraint (1600px) for better readability
- Modified: Navigation alignment to left with home button
- Enhanced: Button interactions with gradient transitions
- Updated: Task list items with gradient backgrounds
- Applied: Consistent styling across all pages and components
- Files modified: globals.css, page.module.css, TaskList.module.css, ContainerList.module.css, Button.module.css, Navigation.module.css, Navigation.tsx, ConfirmDialog.module.css, layout.module.css

### 2025-07-23 - CSS Variable Consolidation
- Added: New CSS variables for consistent theming
- Updated: Replaced all hardcoded rgba colors with CSS variables
- Fixed: Modal overlays, borders, and shadows
- Updated files: globals.css, ConfirmDialog.module.css, NewFeatureModal.module.css, NewConceptModal.module.css, TaskList.module.css, SettingsForm.module.css, Navigation.module.css, Button.module.css, ErrorNotification.module.css