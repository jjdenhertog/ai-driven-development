---
id: "103"
name: "create-file-validator"
type: "pattern"
dependencies: ["001-init-nextjs-project"]
estimated_lines: 120
priority: "high"
---

# Pattern: File Validator

## Description
Create a file validation utility that checks Dropbox file existence, stability, and age requirements with proper Windows path handling.

## Pattern Requirements
- Check file exists at path
- Verify file size stability (not actively syncing)
- Check file age requirements
- Handle Windows paths with spaces
- Convert macOS paths to Windows format
- Retry logic for temporary failures

## Implementation
Create a 100-120 line pattern that demonstrates:
```typescript
// utils/file-validator.ts
interface FileValidationOptions {
  minAge?: number // seconds
  maxRetries?: number
  stabilityCheckInterval?: number // milliseconds
}

export class FileValidationError extends Error {
  constructor(
    public code: string,
    message: string,
    public path?: string
  ) {
    super(message)
  }
}

export async function validateFile(
  filePath: string,
  options?: FileValidationOptions
): Promise<boolean> {
  // Pattern implementation
  // Handles path conversion
  // Checks file stability
  // Validates age requirements
}
```

## Test Specifications
```yaml
pattern_tests:
  - scenario: "Valid file"
    input: "C:\\Dropbox\\project\\file.aep"
    expected: true
    
  - scenario: "File not found"
    input: "C:\\Dropbox\\missing.aep"
    throws: FileValidationError
    error_code: "FILE_NOT_FOUND"
  
  - scenario: "File too new"
    input: 
      path: "C:\\Dropbox\\new.aep"
      options: { minAge: 60 }
    throws: FileValidationError
    error_code: "FILE_TOO_NEW"
    
  - scenario: "Path with spaces"
    input: "C:\\Men in Green Dropbox\\My Project\\file.aep"
    expected: true
    
  - scenario: "macOS path conversion"
    input: "/Users/john/Dropbox/project/file.aep"
    converts_to: "C:\\Users\\jjdenhertog\\Men in Green Dropbox\\project\\file.aep"
    expected: true
```

## Usage Examples
Show 3+ places this pattern will be used:
1. Job submission validation - Verify template exists
2. Data file validation - Check CSV/JSON files
3. Output path validation - Ensure directory exists
4. Pre-render checks in job queue

## Code Reuse
- Used by job validation service
- Import for all file-based operations
- Standard error handling for file issues

## Documentation Links
- [Node.js fs module](https://nodejs.org/api/fs.html)
- [Path module](https://nodejs.org/api/path.html)

## Potential Gotchas
- Windows path escaping
- Dropbox sync delays
- Network drive access
- File permissions

## Testing Notes
- Mock file system for tests
- Test various path formats
- Verify retry logic works