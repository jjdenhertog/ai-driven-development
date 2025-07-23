---
id: "329"
name: "feature-path-conversion-utility"
type: "feature"
dependencies: ["103"]
estimated_lines: 50
priority: "high"
---

# Feature: Path Conversion Utility

## Description
Create a utility to convert macOS Dropbox paths to Windows format for local file system access.

## Acceptance Criteria
- [ ] Convert macOS paths to Windows format
- [ ] Handle different Dropbox folder locations
- [ ] Support both directions (mac->win, win->mac)
- [ ] Validate converted paths exist
- [ ] Handle edge cases gracefully

## Implementation
```typescript
// utils/pathConverter.ts
export class PathConverter {
  private dropboxRoot: string;
  
  constructor() {
    this.dropboxRoot = process.env.DROPBOX_PATH || 'C:\\Users\\[username]\\Dropbox';
  }
  
  macToWindows(macPath: string): string {
    // Example: /Users/john/Dropbox/Projects/file.aep
    // -> C:\Users\[username]\Dropbox\Projects\file.aep
    
    if (\!macPath.includes('/Dropbox/')) {
      throw new Error('Path must be within Dropbox folder');
    }
    
    const dropboxRelative = macPath.split('/Dropbox/')[1];
    const windowsPath = `${this.dropboxRoot}\\${dropboxRelative.replace(/\//g, '\\')}`;
    
    return windowsPath;
  }
  
  windowsToMac(winPath: string, macUsername: string): string {
    // Reverse conversion for responses
    const dropboxRelative = winPath
      .replace(this.dropboxRoot, '')
      .replace(/\\/g, '/')
      .replace(/^\//, '');
    
    return `/Users/${macUsername}/Dropbox/${dropboxRelative}`;
  }
  
  isDropboxPath(path: string): boolean {
    return path.includes('/Dropbox/') || path.includes('\\Dropbox\\');
  }
}
```

## Test Specifications
```yaml
unit_tests:
  - "Converts macOS paths correctly"
  - "Converts Windows paths correctly"
  - "Validates Dropbox paths"
  - "Handles missing Dropbox folder"
  - "Preserves file extensions"
  - "Handles nested directories"
```

## Code Reuse
- Extend file validator from task 103
- Use environment configuration
- Apply validation patterns
