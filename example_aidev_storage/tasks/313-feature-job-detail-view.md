---
id: "313"
name: "feature-job-detail-view"
type: "feature"
dependencies: ["311", "306"]
estimated_lines: 250
priority: "high"
---

# Feature: Job Detail View

## Description
Create a comprehensive job detail view showing all job information, render logs, and available actions.

## Acceptance Criteria
- [ ] Show all job metadata
- [ ] Display nexrender configuration (formatted JSON)
- [ ] Show real-time progress for active jobs
- [ ] Display render logs with auto-scroll
- [ ] Download button for completed jobs
- [ ] Admin actions (cancel, boost priority, edit config)
- [ ] Copy job configuration
- [ ] Retry failed jobs

## Component Specifications
```yaml
components:
  JobDetail:
    sections:
      - Header: Status, ID, progress
      - Metadata: User, dates, priority
      - Configuration: Nexrender JSON editor
      - Logs: Scrollable log viewer
      - Actions: Based on status and role
    
  LogViewer:
    features:
      - Auto-scroll to bottom
      - Search within logs
      - Copy logs button
      - Syntax highlighting
      - Line numbers
    
  ConfigEditor:
    features:
      - JSON syntax highlighting
      - Edit mode for admins
      - Validation on save
      - Diff view for changes
```

## Admin Features
- Edit nexrender configuration
- Save changes and re-queue
- Boost priority inline
- Force retry with modifications

## Test Specifications
```yaml
component_tests:
  - "Displays all job information"
  - "Shows logs with auto-scroll"
  - "Updates progress in real-time"
  - "Admin can edit configuration"
  - "Download works for completed jobs"
  - "Copy config to clipboard"
```

## Code Reuse
- Use MUI Card and Paper components
- Use Monaco editor for JSON
- Apply WebSocket for updates
