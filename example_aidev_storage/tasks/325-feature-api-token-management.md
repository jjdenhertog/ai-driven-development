---
id: "325"
name: "feature-api-token-management"
type: "feature"
dependencies: ["023", "100"]
estimated_lines: 120
priority: "high"
---

# Feature: API Token Management Service

## Description
Create service to validate API tokens from headers and manage token-based authentication for external services.

## Acceptance Criteria
- [ ] Validate tokens from X-API-Token header
- [ ] Load tokens from environment variables
- [ ] Cache token lookups for performance
- [ ] Track token usage (optional)
- [ ] Support multiple client tokens
- [ ] Return token metadata

## Component Specifications
```yaml
service:
  ApiTokenService:
    methods:
      - validateToken(token: string): Promise<ApiToken  < /dev/null |  null>
      - loadTokensFromEnv(): void
      - getTokenClient(token: string): string | null
    
    middleware:
      - requireApiToken(): NextApiHandler
    
    environment:
      API_TOKEN_BRAVO: string
      API_TOKEN_PLUGIN: string
```

## Implementation
```typescript
class ApiTokenService {
  private tokens: Map<string, ApiToken> = new Map();
  
  constructor() {
    this.loadTokensFromEnv();
  }
  
  loadTokensFromEnv() {
    // Load tokens from environment
    const tokens = [
      { token: process.env.API_TOKEN_BRAVO, client: 'bravo' },
      { token: process.env.API_TOKEN_PLUGIN, client: 'ae-plugin' }
    ];
    
    tokens.forEach(({ token, client }) => {
      if (token) {
        this.tokens.set(token, {
          id: client,
          token,
          clientName: client,
          permissions: ['job.create', 'job.read']
        });
      }
    });
  }
  
  async validateToken(token: string): Promise<ApiToken | null> {
    return this.tokens.get(token) || null;
  }
}

// Middleware
export function requireApiToken(handler: NextApiHandler): NextApiHandler {
  return async (req, res) => {
    const token = req.headers['x-api-token'] as string;
    
    if (\!token) {
      return res.status(401).json({ error: 'Missing API token' });
    }
    
    const apiToken = await apiTokenService.validateToken(token);
    if (\!apiToken) {
      return res.status(401).json({ error: 'Invalid API token' });
    }
    
    req.apiToken = apiToken;
    return handler(req, res);
  };
}
```

## Test Specifications
```yaml
unit_tests:
  - "Loads tokens from environment"
  - "Validates correct tokens"
  - "Rejects invalid tokens"
  - "Middleware blocks missing tokens"
  - "Caches token lookups"
```

## Code Reuse
- Use ApiToken schema from task 023
- Apply middleware patterns
- Use environment config
