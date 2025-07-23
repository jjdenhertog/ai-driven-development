---
id: "324"
name: "feature-auth-configuration"
type: "feature"
dependencies: ["200", "201", "323"]
estimated_lines: 100
priority: "critical"
---

# Feature: Auth Configuration Extension

## Description
Extend NextAuth configuration to restrict domain, auto-create users, and set admin role by default.

## Acceptance Criteria
- [ ] Restrict to company email domain
- [ ] Auto-create user on first login
- [ ] Set all users as admin
- [ ] Include role in session
- [ ] Store macOS usernames in JWT
- [ ] Handle non-company emails gracefully

## Implementation
```typescript
// lib/auth.ts extension
export const authOptions: NextAuthOptions = {
  // ... existing config
  callbacks: {
    async signIn({ user, account, profile }) {
      // Domain restriction
      if (\!user.email?.endsWith('@company.com')) {
        return false;
      }
      
      // Auto-create user
      const existingUser = await userRepo.findByEmail(user.email);
      if (\!existingUser) {
        await userRepo.createFromGoogle({
          email: user.email,
          name: user.name || '',
          image: user.image || ''
        });
      }
      
      return true;
    },
    
    async session({ session, token }) {
      if (session.user) {
        const dbUser = await userRepo.findByEmail(session.user.email\!);
        session.user.id = dbUser.id;
        session.user.role = dbUser.role; // Always ADMIN initially
        session.user.macUsernames = dbUser.macUsernames;
      }
      return session;
    }
  }
};

// Extend session types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "ADMIN" | "USER";
      macUsernames: string[];
    } & DefaultSession["user"];
  }
}
```

## Test Specifications
```yaml
auth_tests:
  - "Allows company domain emails"
  - "Rejects external emails"
  - "Creates user on first login"
  - "Sets admin role by default"
  - "Includes role in session"
```

## Code Reuse
- Extend auth from tasks 200-201
- Use UserRepository from task 323
- Apply existing patterns
