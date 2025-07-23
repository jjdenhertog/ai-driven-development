---
id: "311"
name: "feature-dashboard-layout"
type: "feature"
dependencies: ["310", "200"]
estimated_lines: 200
priority: "high"
---

# Feature: Dashboard Layout

## Description
Create the main dashboard layout with responsive navigation, user menu, and content area using Material-UI components.

## Acceptance Criteria
- [ ] Responsive app bar with logo
- [ ] Navigation drawer for mobile
- [ ] User avatar and menu
- [ ] Sign out functionality
- [ ] Admin/User role indicators
- [ ] Content area with proper spacing
- [ ] Dark mode toggle (future)

## Component Specifications
```yaml
components:
  DashboardLayout:
    props:
      - children: React.ReactNode
    
    features:
      - AppBar with title and user menu
      - Drawer for navigation (mobile)
      - Main content area
      - Loading states
  
  UserMenu:
    features:
      - User avatar from Google
      - Display name and email
      - Profile link
      - Sign out button
      - Admin badge if applicable
```

## Navigation Items
- Jobs (default view)
- Profile
- Admin Panel (if admin)
- API Tokens

## Test Specifications
```yaml
component_tests:
  - "Renders layout with user info"
  - "Shows admin menu for admins"
  - "Handles sign out"
  - "Responsive drawer works"
  - "Navigation highlights active page"
```

## Code Reuse
- Use MUI AppBar and Drawer
- Integrate with NextAuth session
- Use existing auth patterns
