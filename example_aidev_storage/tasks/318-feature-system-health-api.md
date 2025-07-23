---
id: "318"
name: "feature-system-health-api"
type: "feature"
dependencies: ["101", "102", "200"]
estimated_lines: 100
priority: "high"
---

# Feature: System Health API Endpoint

## Description
Create GET /api/system/health endpoint to provide system metrics and queue status for admin monitoring.

## Acceptance Criteria
- [ ] Return CPU, memory, disk usage
- [ ] Include queue depth and status
- [ ] Show render engine status
- [ ] Require admin session
- [ ] Cache results for 5 seconds
- [ ] Include uptime information

## API Specification
```yaml
endpoint:
  method: GET
  path: /api/system/health
  auth: Admin session required
  
  response:
    200:
      status: "healthy"  < /dev/null |  "degraded" | "unhealthy"
      metrics:
        cpu:
          usage: number # percentage
          cores: number
        memory:
          used: number # GB
          total: number # GB
          percentage: number
        disk:
          used: number # GB
          total: number # GB
          percentage: number
      queue:
        depth: number
        processing: boolean
        currentJob: string | null
      uptime:
        seconds: number
        since: string # ISO date
      timestamp: string
    
    403:
      error: "Admin access required"
```

## Implementation
```typescript
import os from 'os';
import { diskUsage } from 'disk-usage';

// Get system metrics
const getCpuUsage = () => {
  const cpus = os.cpus();
  // Calculate CPU usage
};

const getMemoryUsage = () => ({
  used: (os.totalmem() - os.freemem()) / 1e9,
  total: os.totalmem() / 1e9,
  percentage: ((os.totalmem() - os.freemem()) / os.totalmem()) * 100
});
```

## Test Specifications
```yaml
api_tests:
  - "Returns system metrics"
  - "Shows queue status"
  - "Requires admin authentication"
  - "Caches results appropriately"
  - "Handles metric collection errors"
```

## Code Reuse
- Use error handler from task 101
- Use response utility from task 102
- Apply admin auth check
