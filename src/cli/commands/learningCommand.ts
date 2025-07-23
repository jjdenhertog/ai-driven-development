import { executeClaudeCommand } from '../../claude-wrapper';
import { MAIN_BRANCH } from '../config';
import { LearningOptions } from '../types/commands/LearningOptions';
import addHooks from '../utils/claude/addHooks';
/* eslint-disable max-depth */
import { autoRetryClaude } from '../utils/claude/autoRetryClaude';
import removeHooks from '../utils/claude/removeHooks';
import { checkBranchMerged } from '../utils/git/checkBranchMerged';
import { checkGitInitialized } from '../utils/git/checkGitInitialized';
import { getCommits } from '../utils/git/getCommits';
import { isInWorktree } from '../utils/git/isInWorktree';
import { log } from '../utils/logger';
import { sleep } from '../utils/sleep';
import { createSession } from '../utils/storage/createSession';
import { createSessionReport } from '../utils/storage/createSessionReport';
import { saveUserChanges } from '../utils/storage/saveUserChanges';
import { getTasks } from '../utils/tasks/getTasks';
import { updateTaskFile } from '../utils/tasks/updateTaskFile';

export async function learningCommand(options: LearningOptions) {
    const { dangerouslySkipPermission } = options;

    // Ensure git auth
    if (!await checkGitInitialized())
        throw new Error('Git is not initialized. Please run `git init` in the root of the repository.');

    // Check if we are in a worktree
    if (await isInWorktree())
        throw new Error('This command must be run from the root of the repository.');

    // Switch to main branch
    log('Learning command started. Monitoring for completed tasks...', 'success');

    if (dangerouslySkipPermission)
        log('Dangerously skipping permission checks of Claude Code', 'warn');

    const allTasks = await getTasks();
    let tasks = allTasks.filter(task => task.status != 'archived');


    const mainBranch = MAIN_BRANCH;

    try {
        // eslint-disable-next-line no-constant-condition
        while (true) {

            // Reload the tasks
            const refreshedTasks = await getTasks();
            tasks = refreshedTasks.filter(task => task.status != 'archived');

            // Check for completed tasks
            const completedTasks = tasks.filter(task => task.status === 'completed');
            if (completedTasks.length > 0) {
                log(`Found ${completedTasks.length} completed tasks to process`, 'info');

                // Process each completed task sequentially
                for (const task of completedTasks) {
                    try {

                        // Check if the task branch has been merged into main branch
                        if (!task.branch) {
                            log(`Task ${task.id} has no branch associated. Skipping...`, 'warn');
                            continue;
                        }

                        const isMerged = await checkBranchMerged(task.branch, mainBranch);
                        if (!isMerged) {
                            log(`Task ${task.id} branch '${task.branch}' is not merged into ${mainBranch}. Skipping...`, 'info');
                            continue;
                        }

                        // Branch is merged, now get the commits
                        log(`Task ${task.id} branch '${task.branch}' is merged. Processing commits...`, 'info');
                        const commits = await getCommits(task.branch);

                        if (!commits || commits.length === 0) {
                            log(`No commits found for task ${task.id}`, 'warn');
                            continue;
                        }

                        const userCommits = commits.filter(commit => !commit.isAI);
                        const aiCommits = commits.filter(commit => commit.isAI);

                        log(`Found ${commits.length} commits (${userCommits.length} user, ${aiCommits.length} AI) for task ${task.id}`, 'info');



                        if (userCommits.length > 0) {

                            saveUserChanges(task.id, userCommits);

                            const worktreePath = process.cwd();

                            const { logsDir, logPath } = createSession(task.id);
                            log(`Processing ${userCommits.length} user commits for learning...`, 'info', undefined, logPath);

                            // Add hooks for claude command
                            addHooks(worktreePath);

                            try {

                                const claudeCommand = async () => {
                                    const args = [];
                                    if (dangerouslySkipPermission)
                                        args.push('--dangerously-skip-permissions');

                                    const result = await executeClaudeCommand({
                                        cwd: worktreePath,
                                        command: `Please complete the following steps IN ORDER:
1. First, use the Read tool to read the entire contents of the file: .aidev-storage/prompts/aidev-learn.md
2. After reading the file, list the key constraints and outputs for this phase.
3. Then execute the instructions from that file with these parameters: {"task_filename": "${task.id}-${task.name}" }
4. Show me progress as you work through the phase.
                                        `,
                                        args,
                                    });

                                    const sessionReport = await createSessionReport({
                                        taskId: task.id,
                                        taskName: task.name,
                                        worktreePath,
                                        logsDir,
                                        exitCode: result.exitCode,
                                        fileName: 'aidev-learn'
                                    });

                                    return sessionReport;
                                }
                                // Run Claude with retry logic for usage limits
                                await autoRetryClaude({ claudeCommand, logPath })

                                updateTaskFile(task.path, {
                                    status: 'archived'
                                });

                            } catch (_e) {
                                log(`Error processing task ${task.id}: ${String(_e)}`, 'error', undefined, logPath);
                            }

                            removeHooks(worktreePath);

                        }

                        // await processCompletedTask(task, dangerouslySkipPermission);
                    } catch (error) {
                        log(`Error processing task ${task.id}: ${String(error)}`, 'error');
                    }
                }
            }

            // Sleep for 30 seconds before next check

            log("Sleeping for 300 seconds, waiting for next iteration", 'info');

            await sleep(300_000);
        }
    } catch (error) {
        log(`Learning command error: ${String(error)}`, 'error');
        throw error;
    }
}