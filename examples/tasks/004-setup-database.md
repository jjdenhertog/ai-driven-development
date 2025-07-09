---
id: "004"
name: "setup-database"
type: "feature"
dependencies: ["003-install-dependencies", "002-setup-environment-config"]
estimated_lines: 200
priority: "critical"
---

# Setup: Database Configuration with Prisma

## Overview
Configure Prisma ORM with the database schema for users, jobs, and API tokens. Set up database connection and create initial migrations.

## Technical Requirements
- Initialize Prisma with SQLite/PostgreSQL support
- Define complete database schema
- Create relationships between entities
- Set up database migrations
- Configure Prisma client generation
- Create seed script for development

## Acceptance Criteria
- [ ] Prisma schema file created with all entities
- [ ] Database migrations generated and applied
- [ ] Prisma client generates without errors
- [ ] Database connection established successfully
- [ ] Seed data script created for development
- [ ] All relationships properly defined with cascading rules

## Implementation Notes

### 1. Initialize Prisma
```bash
npx prisma init --datasource-provider sqlite
```

### 2. Define Schema
Create complete schema in `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

enum Role {
  USER
  ADMIN
}

enum JobStatus {
  PENDING
  VALIDATING
  QUEUED
  RENDERING
  COMPLETED
  FAILED
  CANCELLED
}

model User {
  id            String   @id @default(cuid())
  email         String   @unique
  name          String?
  image         String?
  role          Role     @default(USER)
  macUsernames  String[] // Array of macOS usernames
  slackUserId   String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  jobs          Job[]
  
  @@index([email])
}

model Job {
  id              String    @id @default(cuid())
  userId          String
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Submission metadata
  projectPath     String
  submittedAt     DateTime  @default(now())
  source          String    // "bravo" or "plugin"
  macUsername     String
  fileTimestamp   DateTime
  
  // Job configuration
  nexrenderConfig Json      // Complete nexrender job specification
  priority        Int       @default(0)
  
  // Status tracking
  status          JobStatus @default(PENDING)
  startedAt       DateTime?
  completedAt     DateTime?
  
  // Validation
  validationAttempts Int    @default(0)
  lastValidationAt   DateTime?
  
  // Output
  outputPath      String?
  outputUrl       String?
  
  // Progress and logs
  progress        Int       @default(0)
  logs            String?
  error           String?
  
  // Cleanup - SQLite doesn't support dbgenerated, will handle in application
  expiresAt       DateTime?
  
  @@index([status, priority])
  @@index([projectPath])
  @@index([userId])
  @@index([submittedAt])
}

model ApiToken {
  id          String   @id @default(cuid())
  token       String   @unique
  clientName  String   @unique // "bravo" or "plugin"
  createdAt   DateTime @default(now())
  lastUsedAt  DateTime?
  
  @@index([token])
}

model SystemConfig {
  id          String   @id @default("system")
  version     String   @default("1.0.0")
  updatedAt   DateTime @updatedAt
}
```

### 3. Create Migration
```bash
npx prisma migrate dev --name init
```

### 4. Create Seed Script
Create `prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client'
import { hash } from 'crypto'

const prisma = new PrismaClient()

async function main() {
  // Create API tokens
  const bravoToken = await prisma.apiToken.create({
    data: {
      token: process.env.API_TOKEN_BRAVO || 'dev-bravo-token',
      clientName: 'bravo',
    },
  })

  const pluginToken = await prisma.apiToken.create({
    data: {
      token: process.env.API_TOKEN_PLUGIN || 'dev-plugin-token',
      clientName: 'plugin',
    },
  })

  console.log({ bravoToken, pluginToken })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

### 5. Update package.json
Add Prisma commands to scripts section:
```json
{
  "scripts": {
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:seed": "prisma db seed",
    "db:studio": "prisma studio"
  },
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
}
```

### 6. SQLite-specific Notes
- The database file will be created at `./render-manager.db`
- No additional database server installation required
- Automatic file-based backups can be implemented
- For production, ensure database file is on a reliable disk
- The `expiresAt` field will be calculated in application code since SQLite doesn't support generated columns

## Documentation Links
- [Prisma Getting Started](https://www.prisma.io/docs/getting-started)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [Prisma Migrations](https://www.prisma.io/docs/concepts/components/prisma-migrate)

## Out of Scope
- User authentication implementation
- Job processing logic
- API endpoint creation