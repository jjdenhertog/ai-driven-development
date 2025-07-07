# Prompts Directory

This directory contains templates for the automated AI development workflow.

## Templates

### feature-specification-template.md
Template used by `aidev-generate-project` to create feature specifications. These specifications are placed in `.aidev/features/queue/` and define what needs to be built.

### feature-specification-example.md
Example of a well-structured feature specification for user authentication. Shows how to properly fill out all sections of the template.

## Workflow

1. **Project Generation**: `aidev-generate-project` reads concept documents and creates feature specifications using `.aidev/templates/feature-specification-template.md`
2. **Task Queue**: Feature specifications are numbered and placed in `.aidev/features/queue/`
3. **Task Execution**: `aidev-next-task` picks the next task and automatically generates a PRP
4. **PRP Generation**: The PRP is generated using `.aidev/templates/automated-prp-template.md`
5. **Implementation**: The AI implements the feature following the generated PRP

## Note
This directory no longer contains manual PRP creation templates as the workflow is now fully automated. PRPs are generated on-the-fly by the `aidev-next-task` command.