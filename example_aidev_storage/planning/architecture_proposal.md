# 🏗️ ARCHITECTURE APPROVAL REQUIRED

Based on your requirements and preferences, here's the proposed technical architecture for the AFX Render Manager:

## 📱 FRONTEND ARCHITECTURE
- **Framework**: Next.js 15.x with App Router
- **UI Library**: Material-UI (MUI) v5 with B-prefixed custom components
- **State Management**: React Context API + TanStack Query v5
- **Styling**: MUI sx prop + CSS Modules
- **Real-time Updates**: Socket.io-client for live render progress

## 🔧 BACKEND ARCHITECTURE
- **API Pattern**: Next.js Route Handlers (/app/api/)
- **Database**: SQLite with Prisma ORM (simple single-machine setup)
- **Authentication**: NextAuth.js with Google OAuth (@meningreen.agency restriction)
- **Job Queue**: In-memory priority queue with database persistence
- **Process Management**: @nexrender/core with child_process monitoring

## 🧪 TESTING STRATEGY
- **Unit Testing**: Vitest + React Testing Library
- **Integration Testing**: Vitest with test database
- **E2E Testing**: Playwright (optional)
- **Coverage Target**: 80% for core features

## 📝 CODE STYLE & ESLINT CONFIGURATION
The project will enforce your specific ESLint rules including:
- **4-space indentation** with SwitchCase: 1
- **Comma dangle rules**: 
  - Arrays: never
  - Objects: only-multiline
  - Imports/Exports/Functions: never
- **Strict React rules**:
  - Functional components only
  - Proper event handler naming (onClick, onChange)
  - Destructuring assignment required
  - No .bind() in JSX
  - Maximum JSX depth of 10 levels
  - Boolean prop naming convention
  - Self-closing components
- **TypeScript conventions**:
  - Underscore prefix for unused variables
  - Careful promise handling in event handlers
  - Strict type definitions

## 📋 IMPLEMENTATION PLAN
The implementation will be organized into 8 phases:

1. **Foundation** (13 tasks): Project setup, database, folder structure
2. **Core Patterns & Auth** (14 tasks): Authentication, error handling, utilities
3. **Job Management** (12 tasks): Queue system, API endpoints, validation
4. **Nexrender Integration** (7 tasks): Render execution and monitoring
5. **Dashboard & Real-time** (14 tasks): Admin UI with live updates
6. **Notifications** (6 tasks): Slack webhook and bot integration
7. **Testing & Docs** (6 tasks): Test coverage and documentation
8. **Production Prep** (5 tasks): Deployment and monitoring setup

## 📊 ESTIMATED SCOPE
- **Total Tasks**: 77 tasks
- **Estimated Lines**: ~8,000-10,000 lines of code
- **Development Time**: ~24-30 hours
- **Key Integrations**: After Effects 2025, Dropbox folders, Slack, Google OAuth

## 🔑 KEY ARCHITECTURAL DECISIONS

1. **SQLite Database**: Perfect for single-machine deployment, no external dependencies
2. **Local Nexrender**: Installed as project dependency for easy updates
3. **Socket.io**: Bi-directional communication for real-time render progress
4. **Priority Queue**: In-memory with DB backup for fast job processing
5. **MUI Components**: Consistent UI with custom B-prefix pattern
6. **Your ESLint Config**: Enforced throughout the codebase

## ⚡ PERFORMANCE & RELIABILITY

- **Single Render Limit**: Only one After Effects render at a time
- **Auto-cancellation**: Old pending jobs automatically cancelled
- **Retry Logic**: Failed renders retry with exponential backoff
- **File Validation**: Multiple checks with size stability monitoring
- **Silent Failures**: Slack errors won't crash the application

## 🚀 DEPLOYMENT APPROACH

- **PM2 Process Manager**: For Windows service management (manual setup)
- **Port 3000**: As specified for web interface
- **Environment Variables**: For sensitive configuration
- **Manual Updates**: Git pull with migration support (repo setup later)

---

**📝 Architecture Updated!**

I've incorporated your complete ESLint configuration into the architecture. The project will enforce:
- 4-space indentation with proper switch case handling
- Your specific comma-dangle rules
- All React best practices from your config
- TypeScript conventions with underscore prefixes for unused variables

**Do you approve this updated architecture?** If you'd like any other changes, please describe them.