/* eslint-disable @typescript-eslint/restrict-template-expressions */

import { existsSync, rmSync } from 'fs-extra';
import { executeClaudeCommand } from '../../claude-wrapper';
import { checkGitInitialized } from '../utils/git/checkGitInitialized';
import { isInWorktree } from '../utils/git/isInWorktree';
import { log } from "../utils/logger";
import { join } from 'node:path';

type Options = {
    dangerouslySkipPermission: boolean
    phase: number
    reset: boolean
}

type PhaseConfig = {
    file: string;
    name: string;
    requiredFiles?: string[];
    completionMarker?: string;
}

const PHASES: PhaseConfig[] = [
    {
        file: 'aidev-plan-phase0-analyze.md',
        name: 'Phase 0: Concept Analysis',
        completionMarker: '.aidev-storage/planning/PHASE0_COMPLETE'
    },
    {
        file: 'aidev-plan-phase1-architect.md',
        name: 'Phase 1: Architecture Planning',
        requiredFiles: ['.aidev-storage/planning/PHASE0_COMPLETE'],
        completionMarker: '.aidev-storage/planning/PHASE1_COMPLETE'
    },
    {
        file: 'aidev-plan-phase2-generate.md',
        name: 'Phase 2: Task Generation',
        requiredFiles: ['.aidev-storage/planning/PHASE1_COMPLETE'],
        completionMarker: '.aidev-storage/planning/PHASE2_COMPLETE'
    },
    {
        file: 'aidev-plan-phase3-validate.md',
        name: 'Phase 3: Validation & Refinement',
        requiredFiles: [
            '.aidev-storage/planning/PHASE0_COMPLETE',
            '.aidev-storage/planning/PHASE1_COMPLETE',
            '.aidev-storage/planning/PHASE2_COMPLETE'
        ],
        completionMarker: '.aidev-storage/planning/READY'
    }
];

function validatePhasePrerequisites(phase: PhaseConfig): boolean {
    log(`Validating prerequisites for ${phase.name}...`, 'info');

    // Check if phase was already completed
    if (phase.completionMarker && existsSync(phase.completionMarker)) {
        if (phase.completionMarker === '.aidev-storage/planning/READY') {
            log('Planning was already completed and finalized. Tasks are ready for implementation.', 'warn');

            return false;
        }

        log(`${phase.name} was already completed. To re-run, delete: ${phase.completionMarker}`, 'warn');

        return false;
    }

    // Check required files
    if (phase.requiredFiles) {
        for (const file of phase.requiredFiles) {
            if (!existsSync(file)) {
                log(`ERROR: Missing required file from previous phase: ${file}`, 'error');
                log(`You must complete the previous phase first.`, 'error');

                return false;
            }
        }
    }

    log(`✅ All prerequisites validated for ${phase.name}`, 'success');

    return true;
}

export async function executePlanCommand(options: Options) {
    const { dangerouslySkipPermission, phase, reset } = options;

    // Ensure git auth
    if (!await checkGitInitialized())
        throw new Error('Git is not initialized. Please run `git init` in the root of the repository.');

    // Check if we are in a worktree
    if (await isInWorktree())
        throw new Error('This command must be run from the root of the repository.');

    // @TODO: Remove .aidev-storage/planning/ directory
    if (reset) {
        const planningPath = join(process.cwd(), '.aidev-storage', 'planning');
        if (existsSync(planningPath))
            rmSync(planningPath, { force: true, recursive: true });
    }


    // Step 3: Execute Claude
    log('Starting Claude with aidev-plan commands...', 'success');

    if (phase > 1)
        log(`Starting from phase ${phase}`, 'warn');

    if (dangerouslySkipPermission)
        log('Dangerously skipping permission checks of Claude Code', 'warn');

    const claudeCommand = async (prompt: string) => {
        const args = [];
        if (dangerouslySkipPermission)
            args.push('--dangerously-skip-permissions');

        // Execute Claude and wait for completion
        await executeClaudeCommand({
            cwd: process.cwd(),
            command: `Please complete the following steps IN ORDER:

1. First, use the Read tool to read the entire contents of the file: .aidev-storage/prompts/${prompt}
2. After reading the file, list the key constraints and outputs for this phase.
3. Then execute the instructions from that file
4. Show me progress as you work through the phase.
`,
            args,
            preventAutoExit:true,
        });
    }

    for (let i = phase - 1; i < PHASES.length; i++) {
        const currentPhase = PHASES[i];

        log(`\n=== Starting ${currentPhase.name} ===`, 'info');

        // Validate prerequisites before starting phase
        const isValid = validatePhasePrerequisites(currentPhase);
        if (!isValid) {
            log(`Stopping execution due to prerequisite validation failure.`, 'error');
            break;
        }

        // Execute the phase
        await claudeCommand(currentPhase.file);

        log(`✅ ${currentPhase.name} completed`, 'success');
    }

    log(`Claude commands success...`, 'success');
}