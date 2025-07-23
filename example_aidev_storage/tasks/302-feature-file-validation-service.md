---
id: "302"
name: "feature-file-validation-service"
type: "feature"
dependencies: ["103", "006"]
estimated_lines: 150
priority: "high"
---

# Feature: File Validation Service

## Description
Create a service to validate files in the Dropbox folder including existence checks, size stability validation, and age verification.

## Acceptance Criteria
- [ ] Check file exists at given path
- [ ] Verify file age > 30 seconds
- [ ] Check file size stability (3-second interval)
- [ ] Convert macOS paths to Windows format
- [ ] Handle Dropbox sync edge cases
- [ ] Retry validation up to 10 times
- [ ] Return detailed validation errors

## Component Specifications
```yaml
services:
  FileValidationService:
    methods:
      - validateFile(path: string, timestamp: Date): Promise<ValidationResult>
      - checkFileExists(path: string): Promise<boolean>
      - checkFileAge(path: string, minAgeSeconds: number): Promise<boolean>
      - checkSizeStability(path: string, intervalMs: number): Promise<boolean>
      - convertPath(macPath: string): string
      - getFileInfo(path: string): Promise<FileInfo>
    
    interfaces:
      ValidationResult:
        - valid: boolean
        - errors: string[]
        - fileInfo?: FileInfo
      
      FileInfo:
        - size: number
        - modifiedTime: Date
        - createdTime: Date
```

## Test Specifications
```yaml
unit_tests:
  - "Validates existing files successfully"
  - "Rejects non-existent files"
  - "Checks file age correctly"
  - "Detects size changes during validation"
  - "Converts macOS paths to Windows"
  - "Retries validation on failure"
  - "Returns specific error messages"
```

## Code Reuse
- Extend file validator from task 103
- Use environment variables for Dropbox path
- Apply retry logic patterns
