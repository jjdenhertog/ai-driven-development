---
id: "326"
name: "feature-user-service"
type: "feature"
dependencies: ["323", "325"]
estimated_lines: 150
priority: "high"
---

# Feature: User Service

## Description
Create user service that handles user lookup by macOS username, profile management, and job ownership validation.

## Acceptance Criteria
- [ ] Find user by macOS username for job submission
- [ ] Validate username format (A-z only)
- [ ] Update user profile fields
- [ ] Check job ownership
- [ ] Get user with statistics
- [ ] Handle username conflicts

## Component Specifications
```yaml
service:
  UserService:
    methods:
      - findByMacUsername(username: string, apiToken: ApiToken): Promise<User>
      - validateUsername(username: string): ValidationResult
      - updateProfile(userId: string, updates: ProfileUpdate): Promise<User>
      - canAccessJob(userId: string, jobId: string): Promise<boolean>
      - getUserWithStats(userId: string): Promise<UserWithStats>
    
    validation:
      - Username must be A-Za-z only
      - No special characters or numbers
      - Case sensitive matching
```

## Implementation
```typescript
class UserService {
  async findByMacUsername(username: string, apiToken: ApiToken): Promise<User> {
    // Validate username format
    if (\!this.validateUsername(username).valid) {
      throw new Error('Invalid username format');
    }
    
    // Find user
    const user = await userRepository.findByMacUsername(username);
    if (\!user) {
      throw new Error(`No user found with macOS username: ${username}`);
    }
    
    return user;
  }
  
  validateUsername(username: string): ValidationResult {
    const valid = /^[A-Za-z]+$/.test(username);
    return {
      valid,
      error: valid ? null : 'Username must contain only letters A-Z'
    };
  }
  
  async canAccessJob(userId: string, jobId: string): Promise<boolean> {
    const user = await userRepository.findById(userId);
    if (user.role === 'ADMIN') return true;
    
    const job = await jobRepository.findById(jobId);
    return job?.userId === userId;
  }
}
```

## Test Specifications
```yaml
unit_tests:
  - "Finds user by valid username"
  - "Rejects invalid username format"
  - "Updates profile successfully"
  - "Validates job ownership"
  - "Admins can access all jobs"
  - "Handles missing users"
```

## Code Reuse
- Use UserRepository from task 323
- Use validation patterns
- Apply service architecture
