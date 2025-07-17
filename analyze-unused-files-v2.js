const fs = require('fs');
const path = require('path');

// Skip these directories
const SKIP_DIRS = new Set(['node_modules', '.next', 'dist']);

// Framework entry points - these are used by the framework even if not imported
const FRAMEWORK_ENTRY_POINTS = new Set([
  // CLI entry
  '/Users/jjdenhertog/Projects/nextjs-claude-scaffold/src/cli/index.ts',
  // Claude wrapper entry
  '/Users/jjdenhertog/Projects/nextjs-claude-scaffold/src/claude-wrapper/index.ts',
  // Next.js pages/routes - app directory structure
  '/Users/jjdenhertog/Projects/nextjs-claude-scaffold/src/web/src/app/layout.tsx',
  '/Users/jjdenhertog/Projects/nextjs-claude-scaffold/src/web/src/app/page.tsx',
  '/Users/jjdenhertog/Projects/nextjs-claude-scaffold/src/web/src/app/containers/page.tsx',
  '/Users/jjdenhertog/Projects/nextjs-claude-scaffold/src/web/src/app/settings/page.tsx',
  '/Users/jjdenhertog/Projects/nextjs-claude-scaffold/src/web/src/app/tasks/page.tsx',
  '/Users/jjdenhertog/Projects/nextjs-claude-scaffold/src/web/src/app/tasks/layout.tsx',
  '/Users/jjdenhertog/Projects/nextjs-claude-scaffold/src/web/src/app/tasks/[id]/page.tsx',
  '/Users/jjdenhertog/Projects/nextjs-claude-scaffold/src/web/src/app/plan/page.tsx',
  '/Users/jjdenhertog/Projects/nextjs-claude-scaffold/src/web/src/app/plan/layout.tsx',
  '/Users/jjdenhertog/Projects/nextjs-claude-scaffold/src/web/src/app/plan/concepts/page.tsx',
  '/Users/jjdenhertog/Projects/nextjs-claude-scaffold/src/web/src/app/plan/features/page.tsx',
  // API routes
  '/Users/jjdenhertog/Projects/nextjs-claude-scaffold/src/web/src/app/api/concepts/route.ts',
  '/Users/jjdenhertog/Projects/nextjs-claude-scaffold/src/web/src/app/api/concepts/[name]/route.ts',
  '/Users/jjdenhertog/Projects/nextjs-claude-scaffold/src/web/src/app/api/concept-features/route.ts',
  '/Users/jjdenhertog/Projects/nextjs-claude-scaffold/src/web/src/app/api/concept-features/[id]/route.ts',
  '/Users/jjdenhertog/Projects/nextjs-claude-scaffold/src/web/src/app/api/containers/route.ts',
  '/Users/jjdenhertog/Projects/nextjs-claude-scaffold/src/web/src/app/api/containers/[name]/route.ts',
  '/Users/jjdenhertog/Projects/nextjs-claude-scaffold/src/web/src/app/api/containers/[name]/logs/route.ts',
  '/Users/jjdenhertog/Projects/nextjs-claude-scaffold/src/web/src/app/api/examples/route.ts',
  '/Users/jjdenhertog/Projects/nextjs-claude-scaffold/src/web/src/app/api/examples/[...path]/route.ts',
  '/Users/jjdenhertog/Projects/nextjs-claude-scaffold/src/web/src/app/api/preferences/route.ts',
  '/Users/jjdenhertog/Projects/nextjs-claude-scaffold/src/web/src/app/api/preferences/[name]/route.ts',
  '/Users/jjdenhertog/Projects/nextjs-claude-scaffold/src/web/src/app/api/tasks/route.ts',
  '/Users/jjdenhertog/Projects/nextjs-claude-scaffold/src/web/src/app/api/tasks/[id]/route.ts',
  '/Users/jjdenhertog/Projects/nextjs-claude-scaffold/src/web/src/app/api/tasks/[id]/sessions/route.ts',
  '/Users/jjdenhertog/Projects/nextjs-claude-scaffold/src/web/src/app/api/tasks/[id]/sessions/[sessionId]/route.ts',
  '/Users/jjdenhertog/Projects/nextjs-claude-scaffold/src/web/src/app/api/tasks/[id]/specification/route.ts',
  '/Users/jjdenhertog/Projects/nextjs-claude-scaffold/src/web/src/app/api/tasks/[id]/output/[file]/route.ts',
  '/Users/jjdenhertog/Projects/nextjs-claude-scaffold/src/web/src/app/api/templates/route.ts',
  '/Users/jjdenhertog/Projects/nextjs-claude-scaffold/src/web/src/app/api/templates/[name]/route.ts',
  // Config files
  '/Users/jjdenhertog/Projects/nextjs-claude-scaffold/src/web/next.config.js',
  '/Users/jjdenhertog/Projects/nextjs-claude-scaffold/src/web/next-env.d.ts',
]);

// Files to analyze
const allFiles = new Set();
const importMap = new Map(); // file -> Set of imported files
const barrelExports = new Map(); // barrel file -> Set of exported files

function shouldSkipDir(dirPath) {
  const parts = dirPath.split(path.sep);
  return parts.some(part => SKIP_DIRS.has(part));
}

function findTsFiles(dir) {
  if (shouldSkipDir(dir)) return;
  
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      findTsFiles(fullPath);
    } else if (item.match(/\.(ts|tsx)$/)) {
      allFiles.add(fullPath);
    }
  }
}

function extractImports(filePath, content) {
  const imports = new Set();
  
  // ES6 imports
  const importRegex = /import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)\s+from\s+)?['"]([^'"]+)['"]/g;
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    const importPath = match[1];
    
    // Handle both relative and alias imports
    let resolvedPath;
    if (importPath.startsWith('.')) {
      resolvedPath = resolveImportPath(filePath, importPath);
    } else if (importPath.startsWith('@/')) {
      // Handle @/ alias for web project
      const webSrcPath = '/Users/jjdenhertog/Projects/nextjs-claude-scaffold/src/web/src';
      const aliasPath = importPath.replace('@/', './');
      resolvedPath = resolveImportPath(webSrcPath, aliasPath);
    } else {
      continue; // Skip node_modules
    }
    
    if (resolvedPath) {
      imports.add(resolvedPath);
    }
  }
  
  // CommonJS requires
  const requireRegex = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
  while ((match = requireRegex.exec(content)) !== null) {
    const importPath = match[1];
    if (!importPath.startsWith('.')) continue;
    
    const resolvedPath = resolveImportPath(filePath, importPath);
    if (resolvedPath) {
      imports.add(resolvedPath);
    }
  }
  
  return imports;
}

function resolveImportPath(fromFile, importPath) {
  const dir = path.dirname(fromFile);
  let resolved = path.resolve(dir, importPath);
  
  // Try various extensions
  const extensions = ['', '.ts', '.tsx', '.js', '.jsx'];
  for (const ext of extensions) {
    const candidate = resolved + ext;
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      return candidate;
    }
  }
  
  // Try index files
  for (const indexFile of ['index.ts', 'index.tsx', 'index.js']) {
    const candidate = path.join(resolved, indexFile);
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }
  
  return null;
}

function analyzeBarrelExports(filePath, content) {
  const exports = new Set();
  
  // Export from statements
  const exportFromRegex = /export\s+(?:\*|\{[^}]*\})\s+from\s+['"]([^'"]+)['"]/g;
  let match;
  while ((match = exportFromRegex.exec(content)) !== null) {
    const importPath = match[1];
    
    let resolvedPath;
    if (importPath.startsWith('.')) {
      resolvedPath = resolveImportPath(filePath, importPath);
    } else if (importPath.startsWith('@/')) {
      const webSrcPath = '/Users/jjdenhertog/Projects/nextjs-claude-scaffold/src/web/src';
      const aliasPath = importPath.replace('@/', './');
      resolvedPath = resolveImportPath(webSrcPath, aliasPath);
    } else {
      continue;
    }
    
    if (resolvedPath) {
      exports.add(resolvedPath);
    }
  }
  
  // Export type from statements
  const exportTypeRegex = /export\s+type\s+\{[^}]*\}\s+from\s+['"]([^'"]+)['"]/g;
  while ((match = exportTypeRegex.exec(content)) !== null) {
    const importPath = match[1];
    
    let resolvedPath;
    if (importPath.startsWith('.')) {
      resolvedPath = resolveImportPath(filePath, importPath);
    } else if (importPath.startsWith('@/')) {
      const webSrcPath = '/Users/jjdenhertog/Projects/nextjs-claude-scaffold/src/web/src';
      const aliasPath = importPath.replace('@/', './');
      resolvedPath = resolveImportPath(webSrcPath, aliasPath);
    } else {
      continue;
    }
    
    if (resolvedPath) {
      exports.add(resolvedPath);
    }
  }
  
  return exports;
}

function analyzeFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const imports = extractImports(filePath, content);
    importMap.set(filePath, imports);
    
    // Check if this is a barrel/index file
    const fileName = path.basename(filePath);
    if (fileName === 'index.ts' || fileName === 'index.tsx' || 
        (filePath.includes('/types/') && fileName === 'index.ts')) {
      const exports = analyzeBarrelExports(filePath, content);
      if (exports.size > 0) {
        barrelExports.set(filePath, exports);
      }
    }
  } catch (error) {
    console.error(`Error analyzing ${filePath}: ${error.message}`);
  }
}

// Find all TypeScript files
console.log('Finding all TypeScript files...');
findTsFiles('/Users/jjdenhertog/Projects/nextjs-claude-scaffold/src');

// Analyze imports in each file
console.log(`\nAnalyzing imports in ${allFiles.size} files...`);
for (const file of allFiles) {
  analyzeFile(file);
}

// Find unused files
const usedFiles = new Set(FRAMEWORK_ENTRY_POINTS);

// Add all files that are imported
for (const [file, imports] of importMap) {
  for (const imported of imports) {
    usedFiles.add(imported);
  }
}

// Handle barrel exports - if a barrel file is used, mark all its exports as used
function markBarrelExportsAsUsed(barrelFile) {
  const exports = barrelExports.get(barrelFile);
  if (!exports) return;
  
  for (const exportedFile of exports) {
    if (!usedFiles.has(exportedFile)) {
      usedFiles.add(exportedFile);
      // Recursively check if the exported file is also a barrel
      markBarrelExportsAsUsed(exportedFile);
    }
  }
}

// Recursively mark files as used starting from entry points
function markAsUsed(file) {
  if (!usedFiles.has(file)) return;
  
  // Check if this is a barrel file
  markBarrelExportsAsUsed(file);
  
  const imports = importMap.get(file);
  if (!imports) return;
  
  for (const imported of imports) {
    if (!usedFiles.has(imported)) {
      usedFiles.add(imported);
      markAsUsed(imported);
    }
  }
}

// Start from all entry points
for (const entryPoint of FRAMEWORK_ENTRY_POINTS) {
  markAsUsed(entryPoint);
}

// Find unused files
const unusedFiles = [];
for (const file of allFiles) {
  if (!usedFiles.has(file)) {
    unusedFiles.push(file);
  }
}

// Categorize unused files
const categorized = {
  cli: { types: [], utils: [], commands: [], other: [] },
  web: { 
    types: [], 
    components: [], 
    features: [], 
    lib: [], 
    other: [] 
  },
  claudeWrapper: []
};

for (const file of unusedFiles) {
  const relativePath = path.relative('/Users/jjdenhertog/Projects/nextjs-claude-scaffold/src', file);
  
  if (relativePath.startsWith('cli/')) {
    if (relativePath.includes('/types/')) {
      categorized.cli.types.push(file);
    } else if (relativePath.includes('/utils/')) {
      categorized.cli.utils.push(file);
    } else if (relativePath.includes('/commands/')) {
      categorized.cli.commands.push(file);
    } else {
      categorized.cli.other.push(file);
    }
  } else if (relativePath.startsWith('web/')) {
    if (relativePath.includes('/types/')) {
      categorized.web.types.push(file);
    } else if (relativePath.includes('/components/')) {
      categorized.web.components.push(file);
    } else if (relativePath.includes('/features/')) {
      categorized.web.features.push(file);
    } else if (relativePath.includes('/lib/')) {
      categorized.web.lib.push(file);
    } else {
      categorized.web.other.push(file);
    }
  } else if (relativePath.startsWith('claude-wrapper/')) {
    categorized.claudeWrapper.push(file);
  }
}

// Generate report
console.log('\n=== UNUSED FILES REPORT ===\n');
console.log(`Total files analyzed: ${allFiles.size}`);
console.log(`Total unused files: ${unusedFiles.length}`);
console.log(`Usage rate: ${((allFiles.size - unusedFiles.length) / allFiles.size * 100).toFixed(1)}%\n`);

// Summary by category
console.log('## Summary by Category:');
console.log(`CLI Types: ${categorized.cli.types.length} unused`);
console.log(`CLI Utils: ${categorized.cli.utils.length} unused`);
console.log(`CLI Commands: ${categorized.cli.commands.length} unused`);
console.log(`Web Types: ${categorized.web.types.length} unused`);
console.log(`Web Components: ${categorized.web.components.length} unused`);
console.log(`Web Features: ${categorized.web.features.length} unused`);
console.log(`Web Lib: ${categorized.web.lib.length} unused`);
console.log(`Claude Wrapper: ${categorized.claudeWrapper.length} unused`);

// Print CLI unused files
console.log('\n## CLI Module');
if (categorized.cli.types.length > 0) {
  console.log('\n### Unused Types:');
  categorized.cli.types.forEach(f => console.log(`  - ${path.relative('/Users/jjdenhertog/Projects/nextjs-claude-scaffold/src', f)}`));
}
if (categorized.cli.utils.length > 0) {
  console.log('\n### Unused Utils:');
  categorized.cli.utils.forEach(f => console.log(`  - ${path.relative('/Users/jjdenhertog/Projects/nextjs-claude-scaffold/src', f)}`));
}
if (categorized.cli.commands.length > 0) {
  console.log('\n### Unused Commands:');
  categorized.cli.commands.forEach(f => console.log(`  - ${path.relative('/Users/jjdenhertog/Projects/nextjs-claude-scaffold/src', f)}`));
}
if (categorized.cli.other.length > 0) {
  console.log('\n### Other Unused CLI Files:');
  categorized.cli.other.forEach(f => console.log(`  - ${path.relative('/Users/jjdenhertog/Projects/nextjs-claude-scaffold/src', f)}`));
}

// Print Web unused files
console.log('\n## Web Module');
if (categorized.web.types.length > 0) {
  console.log('\n### Unused Types:');
  categorized.web.types.forEach(f => console.log(`  - ${path.relative('/Users/jjdenhertog/Projects/nextjs-claude-scaffold/src', f)}`));
}
if (categorized.web.components.length > 0) {
  console.log('\n### Unused Components:');
  categorized.web.components.forEach(f => console.log(`  - ${path.relative('/Users/jjdenhertog/Projects/nextjs-claude-scaffold/src', f)}`));
}
if (categorized.web.features.length > 0) {
  console.log('\n### Unused Features:');
  categorized.web.features.forEach(f => console.log(`  - ${path.relative('/Users/jjdenhertog/Projects/nextjs-claude-scaffold/src', f)}`));
}
if (categorized.web.lib.length > 0) {
  console.log('\n### Unused Lib:');
  categorized.web.lib.forEach(f => console.log(`  - ${path.relative('/Users/jjdenhertog/Projects/nextjs-claude-scaffold/src', f)}`));
}
if (categorized.web.other.length > 0) {
  console.log('\n### Other Unused Web Files:');
  categorized.web.other.forEach(f => console.log(`  - ${path.relative('/Users/jjdenhertog/Projects/nextjs-claude-scaffold/src', f)}`));
}

// Print Claude Wrapper unused files
if (categorized.claudeWrapper.length > 0) {
  console.log('\n## Claude Wrapper Module');
  console.log('\n### Unused Files:');
  categorized.claudeWrapper.forEach(f => console.log(`  - ${path.relative('/Users/jjdenhertog/Projects/nextjs-claude-scaffold/src', f)}`));
}

// Check for potentially incorrect analysis
console.log('\n## Verification Notes:');
console.log('- Barrel exports analyzed:', barrelExports.size);
for (const [barrel, exports] of barrelExports) {
  console.log(`  - ${path.relative('/Users/jjdenhertog/Projects/nextjs-claude-scaffold/src', barrel)} exports ${exports.size} files`);
}

// List files that might be falsely marked as unused
console.log('\n## Files to Double-Check:');
const checkFiles = [
  '/Users/jjdenhertog/Projects/nextjs-claude-scaffold/src/web/src/lib/api.ts',
  '/Users/jjdenhertog/Projects/nextjs-claude-scaffold/src/web/src/types/index.ts'
];

for (const checkFile of checkFiles) {
  if (unusedFiles.includes(checkFile)) {
    console.log(`\nWARNING: ${path.relative('/Users/jjdenhertog/Projects/nextjs-claude-scaffold/src', checkFile)} marked as unused but might be used via:`)
    // Find who imports this file
    for (const [file, imports] of importMap) {
      if (imports.has(checkFile)) {
        console.log(`  - imported by: ${path.relative('/Users/jjdenhertog/Projects/nextjs-claude-scaffold/src', file)}`);
      }
    }
  }
}