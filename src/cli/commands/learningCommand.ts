import { readFileSync } from 'fs-extra';

import { executeClaudeCommand } from '../../claude-wrapper';
import { MAIN_BRANCH } from '../config';
import { LearningOptions } from '../types/commands/LearningOptions';
import { Task } from '../types/tasks/Task';
import addHooks from '../utils/claude/addHooks';
/* eslint-disable max-depth */
import { autoRetryClaude } from '../utils/claude/autoRetryClaude';
import removeHooks from '../utils/claude/removeHooks';
import { checkBranchMerged } from '../utils/git/checkBranchMerged';
import { checkGitAuth } from '../utils/git/checkGitAuth';
import { getCommits } from '../utils/git/getCommits';
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
    if (!checkGitAuth()) {
        log('Git authentication required. Run: gh auth login', 'error');
        throw new Error('Git authentication required');
    }

    // Switch to main branch
    log('Learning command started. Monitoring for completed tasks...', 'success');

    if (dangerouslySkipPermission)
        log('Dangerously skipping permission checks of Claude Code', 'warn');

    const allTasks = await getTasks();
    let tasks = allTasks.filter(task => task.status != 'archived');

    const iterationAfterFullReload = 30;
    let iteration = 0;

    const mainBranch = MAIN_BRANCH;

    try {
        // eslint-disable-next-line no-constant-condition
        while (true) {

            // Reload the tasks
            if (iteration && iteration == iterationAfterFullReload) {
                iteration = 0;
                const refreshedTasks = await getTasks();
                tasks = refreshedTasks.filter(task => task.status != 'archived');
            }

            // Check for completed tasks
            const taskDatas: Task[] = []

            // Reload the JSON
            for (const task of tasks) {
                const taskData: Task = JSON.parse(readFileSync(task.path, 'utf8'));
                taskDatas.push(taskData);
            }

            const completedTasks = taskDatas.filter(task => task.status === 'completed');
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

                            const worktreePath = process.cwd();

                            const { logsDir, logPath } = createSession(task.id);
                            log(`Processing ${userCommits.length} user commits for learning...`, 'info', undefined, logPath);

                            // Add hooks for claude command
                            addHooks(worktreePath);

                            try {

                                saveUserChanges(task.id, userCommits);

                                const claudeCommand = async () => {
                                    const args = [];
                                    if (dangerouslySkipPermission)
                                        args.push('--dangerously-skip-permissions');

                                    const result = await executeClaudeCommand({
                                        cwd: worktreePath,
                                        command: `/aidev-learn ${task.id}-${task.name}`,
                                        args,
                                    });

                                    const sessionReport = await createSessionReport({
                                        taskId: task.id,
                                        taskName: task.name,
                                        worktreePath,
                                        logsDir,
                                        exitCode: result.exitCode
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


                        throw new Error("TODO: Implement learning from commits here");

                        // await processCompletedTask(task, dangerouslySkipPermission);
                    } catch (error) {

                        log(`Error processing task ${task.id}: ${String(error)}`, 'error');
                    }
                }
            }

            // Sleep for 30 seconds before next check

            console.log("Sleeping for 300 seconds, waiting for next iteration");

            iteration++;
            await sleep(300_000);
        }
    } catch (error) {
        log(`Learning command error: ${String(error)}`, 'error');
        throw error;
    }
}