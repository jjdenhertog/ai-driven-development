---
id: "312"
name: "feature-job-list-view"
type: "feature"
dependencies: ["311", "300"]
estimated_lines: 300
priority: "critical"
---

# Feature: Job List View

## Description
Create the main job list view with infinite scroll, status filtering, and real-time updates using Material-UI components.

## Acceptance Criteria
- [ ] Display jobs in a responsive list/table
- [ ] Infinite scroll loads more jobs
- [ ] Filter by status (all, active, completed, failed)
- [ ] Sort by date or priority
- [ ] Show job status with color coding
- [ ] Click job to view details
- [ ] Real-time status updates
- [ ] Bulk selection for admin actions
- [ ] Show all jobs (no date filtering)

## Component Specifications
```yaml
components:
  JobList:
    features:
      - Infinite scroll with react-window
      - Status filter chips
      - Sort dropdown
      - Job items/rows
      - Loading skeleton
      - Empty state
    
  JobListItem:
    displays:
      - Job ID
      - Project name (from path)
      - Status badge
      - Progress bar (if active)
      - Priority indicator
      - Created time
      - User name
      - Actions menu
    
    status_colors:
      - PENDING: grey
      - VALIDATING: blue
      - QUEUED: orange
      - RENDERING: blue (animated)
      - COMPLETED: green
      - FAILED: red
      - CANCELLED: grey
```

## Infinite Scroll Implementation
```typescript
// Using react-window and react-window-infinite-loader
<InfiniteLoader
  isItemLoaded={isItemLoaded}
  itemCount={hasNextPage ? jobs.length + 1 : jobs.length}
  loadMoreItems={loadMoreJobs}
>
  {({ onItemsRendered, ref }) => (
    <FixedSizeList
      height={600}
      itemCount={jobs.length}
      itemSize={80}
      onItemsRendered={onItemsRendered}
      ref={ref}
    >
      {JobRow}
    </FixedSizeList>
  )}
</InfiniteLoader>
```

## Test Specifications
```yaml
component_tests:
  - "Renders job list with data"
  - "Loads more jobs on scroll"
  - "Filters by status correctly"
  - "Sorts by date/priority"
  - "Updates job status in real-time"
  - "Handles empty state"
  - "Shows loading skeleton"
```

## Code Reuse
- Use MUI DataGrid or List components
- Use existing API client
- Apply loading patterns
