# AI-Driven Development Instructions

## 🤖 AI-Dev Workflow

This project uses AI-Driven Development with learning capabilities. The AI learns from your corrections and improves over time.

### Key Directories

- **`.ai-dev/`** - Main AI development workspace
  - `concept/` - High-level project vision
  - `features/` - Feature queue and completed features
  - `patterns/` - Learned patterns and conventions
  - `learning/` - Correction analysis and improvements
  - `sessions/` - Development session logs
  - `prompts/` - Generated PRP prompts
  - `examples/` - Code style examples
  
- **`.claude/commands/`** - Custom Claude commands for AI workflow

### Available Commands

- `/aidev-generate-project` - Break down concept into features
- `/aidev-next-task` - Pick and implement next feature
- `/aidev-review-complete` - Capture corrections and learn
- `/aidev-retry-feature` - Re-implement with learned patterns
- `/aidev-execute-prp` - Execute production-ready implementation
- `/aidev-generate-prp` - Generate multiple implementation plans
- `/aidev-export-patterns` - Export learned patterns
- `/aidev-update-project` - Update PROJECT.md documentation
- `/aidev-check-errors` - Fix all code quality issues
- `/aidev-check-security` - Fix security vulnerabilities
- `/aidev-check-api-database` - Optimize API and database calls

### Workflow

1. **Add Concept**: Write your project vision in `.ai-dev/concept/`
2. **Customize Examples**: Add your code style to `.ai-dev/examples/`
3. **Generate Features**: Run `/aidev-generate-project`
4. **Implement**: Run `/aidev-next-task` to implement features
5. **Review**: Make corrections to the PR
6. **Learn**: Run `/aidev-review-complete --pr=<number>`
7. **Improve**: Future implementations apply learned patterns

### Learning System

- AI commits are attributed with 🤖 marker
- Corrections are analyzed for patterns
- Patterns gain confidence through consistency
- High-confidence patterns (>0.8) are automatically applied

### Best Practices

- One feature = One PR = One review cycle
- Keep features small (200-500 lines)
- Correct patterns, not just code
- Use `/aidev-retry-feature` after major corrections