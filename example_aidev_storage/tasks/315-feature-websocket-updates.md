---
id: "315"
name: "feature-websocket-updates"
type: "feature"
dependencies: ["304", "312"]
estimated_lines: 200
priority: "high"
---

# Feature: WebSocket Real-time Updates

## Description
Implement WebSocket connection for real-time job status updates, progress tracking, and queue changes in the dashboard.

## Acceptance Criteria
- [ ] Establish WebSocket connection on dashboard load
- [ ] Subscribe to job updates by ID
- [ ] Receive progress updates for active jobs
- [ ] Update job list without refresh
- [ ] Handle connection drops and reconnect
- [ ] Clean up subscriptions on unmount

## Implementation
```yaml
websocket:
  events:
    client_to_server:
      - subscribe: { jobIds: string[] }
      - unsubscribe: { jobIds: string[] }
      - subscribeQueue: {} # For job list updates
    
    server_to_client:
      - jobUpdate: { job: Job }
      - progressUpdate: { jobId: string, progress: number }
      - logAppend: { jobId: string, log: string }
      - queueUpdate: { added?: Job[], removed?: string[] }
```

## Component Integration
```typescript
// Custom hook for WebSocket
export function useJobUpdates(jobId: string) {
  const [job, setJob] = useState<Job>();
  
  useEffect(() => {
    socket.emit('subscribe', { jobIds: [jobId] });
    
    socket.on('jobUpdate', (data) => {
      if (data.job.id === jobId) {
        setJob(data.job);
      }
    });
    
    return () => {
      socket.emit('unsubscribe', { jobIds: [jobId] });
    };
  }, [jobId]);
  
  return job;
}
```

## Test Specifications
```yaml
integration_tests:
  - "Connects to WebSocket server"
  - "Receives job status updates"
  - "Updates progress in real-time"
  - "Handles reconnection"
  - "Cleans up on unmount"
```

## Code Reuse
- Use Socket.io client
- Integrate with existing components
- Apply React hooks patterns
