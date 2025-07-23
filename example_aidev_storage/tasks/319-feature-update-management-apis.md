---
id: "319"
name: "feature-update-management-apis"
type: "feature"
dependencies: ["101", "200"]
estimated_lines: 200
priority: "medium"
---

# Feature: Update Management API Endpoints

## Description
Create endpoints for checking and executing system updates including git operations and service restart.

## Acceptance Criteria
- [ ] Check for git updates
- [ ] Verify no active renders before update
- [ ] Pull latest code
- [ ] Run database migrations
- [ ] Restart service
- [ ] Return update status

## API Specifications
```yaml
endpoints:
  - method: GET
    path: /api/system/update/check
    auth: Admin session required
    response:
      200:
        currentVersion: string # git commit hash
        latestVersion: string # remote hash
        hasUpdate: boolean
        commits: # Recent commits
          - hash: string
            message: string
            date: string
      403:
        error: "Admin access required"
  
  - method: POST
    path: /api/system/update/execute
    auth: Admin session required
    response:
      200:
        status: "started"
        message: "Update process initiated"
      409:
        error: "Active renders in progress"
      403:
        error: "Admin access required"
```

## Implementation Notes
```typescript
// Check for updates
const checkUpdates = async () => {
  await exec('git fetch origin');
  const local = await exec('git rev-parse HEAD');
  const remote = await exec('git rev-parse origin/main');
  return {
    currentVersion: local.trim(),
    latestVersion: remote.trim(),
    hasUpdate: local \!== remote
  };
};

// Execute update (placeholder - actual implementation complex)
const executeUpdate = async () => {
  // 1. Check no active renders
  // 2. git pull
  // 3. npm install
  // 4. Run migrations
  // 5. Restart PM2 process
};
```

## Test Specifications
```yaml
api_tests:
  - "Checks git updates correctly"
  - "Blocks update with active renders"
  - "Requires admin access"
  - "Handles git errors"
```

## Code Reuse
- Use exec utility for git commands
- Apply error handling patterns
- Use job queue service for checks
