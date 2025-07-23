---
id: "317"
name: "feature-job-actions-ui"
type: "feature"
dependencies: ["312", "308"]
estimated_lines: 150
priority: "high"
---

# Feature: Job Actions UI Components

## Description
Create reusable action components for job operations including cancel, retry, download, and admin actions.

## Acceptance Criteria
- [ ] Action buttons based on job status
- [ ] Confirmation dialogs for destructive actions
- [ ] Loading states during operations
- [ ] Success/error notifications
- [ ] Admin-only actions properly gated
- [ ] Keyboard shortcuts for common actions

## Component Specifications
```yaml
components:
  JobActions:
    props:
      - job: Job
      - isAdmin: boolean
      - onUpdate: () => void
    
    actions:
      pending/active:
        - Cancel (with confirmation)
        - Boost Priority (admin)
      
      completed:
        - Download Output
        - Copy Output Path
        - Remove Job (admin)
      
      failed:
        - Retry Job
        - View Error Details
        - Edit & Retry (admin)
    
  ConfirmDialog:
    props:
      - title: string
      - message: string
      - onConfirm: () => void
      - severity: 'warning'  < /dev/null |  'error'
```

## Test Specifications
```yaml
component_tests:
  - "Shows correct actions per status"
  - "Requires confirmation for cancel"
  - "Admin actions only for admins"
  - "Handles action errors"
  - "Updates UI after action"
```

## Code Reuse
- Use MUI Button and IconButton
- Use existing API methods
- Apply loading patterns
