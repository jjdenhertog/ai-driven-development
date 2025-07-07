#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const PACKAGE_ROOT = path.join(__dirname, '..');
const TARGET_ROOT = process.cwd();
const AI_DEV_DIR = '.ai-dev';
const CLAUDE_DIR = '.claude';

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

function log(message, color = '') {
  console.log(`${color}${message}${colors.reset}`);
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  
  const stats = fs.statSync(src);
  
  if (stats.isDirectory()) {
    ensureDir(dest);
    fs.readdirSync(src).forEach(child => {
      copyRecursive(path.join(src, child), path.join(dest, child));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

function init() {
  log('\n🚀 AI-Driven Development Setup', colors.bright + colors.cyan);
  log('================================\n', colors.cyan);
  
  // Check if already initialized
  if (fs.existsSync(path.join(TARGET_ROOT, AI_DEV_DIR))) {
    log('⚠️  AI-Dev already initialized in this project', colors.yellow);
    process.exit(1);
  }
  
  try {
    // Create main .ai-dev directory
    log('📁 Creating .ai-dev directory...', colors.blue);
    ensureDir(path.join(TARGET_ROOT, AI_DEV_DIR));
    
    // Create subdirectories
    const dirs = [
      'commands',
      'templates',
      'patterns',
      'learning',
      'features/queue',
      'features/completed',
      'concept',
      'sessions',
      'prompts',
      'examples'
    ];
    
    dirs.forEach(dir => {
      ensureDir(path.join(TARGET_ROOT, AI_DEV_DIR, dir));
    });
    
    // Create .claude directory structure
    log('📁 Setting up .claude directory...', colors.blue);
    ensureDir(path.join(TARGET_ROOT, CLAUDE_DIR));
    ensureDir(path.join(TARGET_ROOT, CLAUDE_DIR, 'commands'));
    
    // Copy commands to .claude/commands
    log('📋 Installing custom commands...', colors.blue);
    const commandsSource = path.join(PACKAGE_ROOT, 'templates', 'commands');
    const commandsDest = path.join(TARGET_ROOT, CLAUDE_DIR, 'commands');
    copyRecursive(commandsSource, commandsDest);
    
    // Copy templates and other files to .ai-dev
    log('📋 Copying templates and configuration...', colors.blue);
    const templateFiles = [
      'templates/VISION.md',
      'templates/PROJECT.md.template',
      'templates/TODO.md.template',
      'templates/learning-patterns.json',
      'templates/prp-template.md',
      'templates/feature-template.md'
    ];
    
    templateFiles.forEach(file => {
      const src = path.join(PACKAGE_ROOT, file);
      const filename = path.basename(file).replace('.template', '');
      const dest = path.join(TARGET_ROOT, AI_DEV_DIR, 'templates', filename);
      if (fs.existsSync(src)) {
        fs.copyFileSync(src, dest);
      }
    });
    
    // Copy examples folder if it exists
    log('📚 Setting up code style examples...', colors.blue);
    const examplesSource = path.join(PACKAGE_ROOT, 'templates', 'examples');
    const examplesDest = path.join(TARGET_ROOT, AI_DEV_DIR, 'examples');
    if (fs.existsSync(examplesSource)) {
      copyRecursive(examplesSource, examplesDest);
    }
    
    // Create or update CLAUDE.md
    log('📝 Setting up CLAUDE.md...', colors.blue);
    const claudeMdSource = path.join(PACKAGE_ROOT, 'templates', 'CLAUDE.md');
    const claudeMdDest = path.join(TARGET_ROOT, 'CLAUDE.md');
    
    if (fs.existsSync(claudeMdDest)) {
      // Append AI-Dev section to existing CLAUDE.md
      const existingContent = fs.readFileSync(claudeMdDest, 'utf8');
      const aiDevSection = fs.readFileSync(claudeMdSource, 'utf8');
      fs.writeFileSync(claudeMdDest, existingContent + '\n\n' + aiDevSection);
      log('✅ Updated existing CLAUDE.md', colors.green);
    } else {
      fs.copyFileSync(claudeMdSource, claudeMdDest);
      log('✅ Created CLAUDE.md', colors.green);
    }
    
    // Create initial files
    log('📄 Creating initial files...', colors.blue);
    
    // Create TODO.md in .claude
    if (!fs.existsSync(path.join(TARGET_ROOT, CLAUDE_DIR, 'TODO.md'))) {
      fs.writeFileSync(
        path.join(TARGET_ROOT, CLAUDE_DIR, 'TODO.md'),
        '# TODO List\n\n## Pending Tasks\n\n## Completed Tasks\n'
      );
    }
    
    // Create PROJECT.md in .claude
    if (!fs.existsSync(path.join(TARGET_ROOT, CLAUDE_DIR, 'PROJECT.md'))) {
      fs.writeFileSync(
        path.join(TARGET_ROOT, CLAUDE_DIR, 'PROJECT.md'),
        '# Project Overview\n\nPlease run `/update-project` to generate project documentation.\n'
      );
    }
    
    // Create learning patterns file
    fs.writeFileSync(
      path.join(TARGET_ROOT, AI_DEV_DIR, 'patterns', 'learned-patterns.json'),
      JSON.stringify({ patterns: [], metadata: { created: new Date().toISOString() } }, null, 2)
    );
    
    // Create .gitignore for AI-Dev
    const gitignoreContent = `
# AI-Dev temporary files
sessions/
prompts/
*.tmp
*.log

# Keep structure but ignore content
features/queue/*
!features/queue/.gitkeep
features/completed/*
!features/completed/.gitkeep
`;
    
    fs.writeFileSync(
      path.join(TARGET_ROOT, AI_DEV_DIR, '.gitignore'),
      gitignoreContent.trim()
    );
    
    // Create .gitkeep files
    ['features/queue', 'features/completed', 'concept', 'sessions', 'examples'].forEach(dir => {
      fs.writeFileSync(path.join(TARGET_ROOT, AI_DEV_DIR, dir, '.gitkeep'), '');
    });
    
    // Success message
    log('\n✅ AI-Driven Development initialized successfully!', colors.bright + colors.green);
    log('\n📚 Next steps:', colors.yellow);
    log('   1. Add your project concept to .ai-dev/concept/', colors.reset);
    log('   2. Customize code examples in .ai-dev/examples/', colors.reset);
    log('   3. Run /aidev-generate-project to generate features', colors.reset);
    log('   4. Run /aidev-next-task to start implementation', colors.reset);
    log('\n💡 All AI-Dev files are in .ai-dev/ (except commands in .claude/)', colors.cyan);
    
  } catch (error) {
    log(`\n❌ Error: ${error.message}`, colors.red);
    process.exit(1);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case 'init':
    init();
    break;
  default:
    log('AI-Driven Development CLI', colors.bright + colors.cyan);
    log('\nUsage:', colors.yellow);
    log('  aidev init    Initialize AI-Dev in current project', colors.reset);
    log('\nCommands:', colors.yellow);
    log('  init           Set up AI-driven development workflow', colors.reset);
    break;
}