---
id: "208"
name: "feature-system-management-api"
type: "feature"
dependencies: ["100", "200"]
estimated_lines: 400
priority: "medium"
---

# Feature: System Management API

## Overview
Implement system management API endpoints for health monitoring, update checking, and update execution. These provide admins with system oversight and maintenance capabilities.

Creating task because concept states at lines 293-303: System management endpoints including health, update check, and update execution.

## User Stories
- As an admin, I want to monitor system health so I can prevent issues
- As an admin, I want to check for updates so I can keep the system current
- As an admin, I want to trigger updates so I can apply improvements

## Technical Requirements
- GET /api/system/health for metrics
- GET /api/system/update/check for version check
- POST /api/system/update/execute for updates
- Real-time system metrics collection
- Git integration for updates
- Safe update process with job queue check
- Admin-only access control

## Acceptance Criteria
- [ ] Health endpoint returns CPU, memory, disk metrics
- [ ] Queue depth included in health data
- [ ] Update check compares git versions
- [ ] Update blocks if jobs are running
- [ ] Update pulls latest code from git
- [ ] Database migrations run if needed
- [ ] Service restarts after update
- [ ] All endpoints require admin role

## Testing Requirements

### Test Coverage Target
- System metrics: 85% coverage
- Update logic: 90% coverage
- Git operations: 80% coverage

### Required Test Types
- **Unit Tests**: Metric collection, version comparison
- **Integration Tests**: Update flow simulation
- **E2E Tests**: Admin system management

### Test Scenarios
#### Happy Path
- [ ] Metrics return accurate data
- [ ] Update check detects new version
- [ ] Update executes successfully

#### Error Handling
- [ ] Handles missing git repo
- [ ] Blocks update during renders
- [ ] Rollback on failed migration

## Implementation Notes
- Use node-os-utils for system metrics
- Simple git operations with child_process
- Check for active renders before update
- Graceful shutdown and restart
- Log all update operations

## API Specifications

```typescript
// GET /api/system/health
interface SystemHealthResponse {
  cpu: {
    usage: number;      // Percentage
    cores: number;
  };
  memory: {
    used: number;       // Bytes
    total: number;      // Bytes
    percentage: number;
  };
  disk: {
    used: number;       // Bytes
    total: number;      // Bytes
    percentage: number;
  };
  queue: {
    depth: number;
    activeJob: Job | null;
  };
  uptime: number;       // Seconds
}

// GET /api/system/update/check
interface UpdateCheckResponse {
  currentVersion: string;
  latestVersion: string;
  updateAvailable: boolean;
  changelog: string[];
}

// POST /api/system/update/execute
interface UpdateExecuteResponse {
  success: boolean;
  message: string;
  newVersion: string;
}

// Update process
async function executeUpdate() {
  // Check for active renders
  if (await hasActiveRenders()) {
    throw new Error('Cannot update while renders active');
  }
  
  // Pull latest code
  await exec('git pull origin main');
  
  // Install dependencies
  await exec('npm install');
  
  // Run migrations
  await exec('npm run db:migrate');
  
  // Rebuild
  await exec('npm run build');
  
  // Restart via PM2
  await exec('pm2 restart ae-render-manager');
}
```

## Examples to Reference
- `.aidev-worktree/preferences/api.md` for API patterns
- Node.js system monitoring patterns

## Documentation Links
- [node-os-utils](https://www.npmjs.com/package/node-os-utils)
- [PM2 Programmatic API](https://pm2.keymetrics.io/docs/usage/pm2-api/)

## Potential Gotchas
- System metrics vary by OS
- Git conflicts block updates
- Migration failures need rollback
- PM2 restart timing issues

## Out of Scope
- Automatic updates
- Rollback functionality
- Update scheduling
- Distributed system updates
- Configuration management

## Testing Notes
- Mock system calls
- Simulate git operations
- Test with active jobs
- Verify restart handling