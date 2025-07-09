// import { createCommit } from '../utils/git/createCommit';
// import { createPR } from '../utils/git/createPR';
// import { getChangedFiles } from '../utils/git/getChangedFiles';
// import { validateBranchState } from '../utils/git/validateBranchState';
// import { extractPRDescriptionFromTask } from '../utils/prUtils';
// import { getTaskById } from '../utils/tasks/getTaskById';
// import { updateTaskFile } from '../utils/tasks/updateTaskFile';
// import { log } from "node:console";
// import { promises as fs } from "node:fs";


// type Options = {
//     taskId: string
//     prFile?: string
//     draft?: boolean
// }

// export async function completeCommand(options: Options) {
//     const { taskId, prFile, draft } = options;
//     const TARGET_ROOT = process.cwd();

//     // Get task details
//     const task = getTaskById(taskId);
//     if (!task) {
//         log(`❌ Task ${taskId} not found`, 'error');
//         throw new Error(`Task ${taskId} not found`);
//     }

//     log(`\n🏁 Completing task ${task.id}: ${task.name}`, 'info');

//     // Validate git state
//     const gitState = validateBranchState();

//     if (!gitState.isAIBranch) {
//         log(`❌ Not on an AI branch. Current branch: ${gitState.currentBranch}`, 'error');
//         log(`   Run: aidev execute ${taskId}`, 'warn');
//         throw new Error('Not on an AI branch');
//     }

//     if (!gitState.hasChanges) {
//         log('❌ No changes to commit', 'error');
//         log('   Make sure Claude has implemented the task', 'warn');
//         throw new Error('No changes to commit');
//     }

//     // Get changed files
//     const changes = getChangedFiles();
//     log(`\n📝 Changed files:`, 'info');
//     changes.all.forEach((file: string) => {
//         log(`   ${file}`, 'info');
//     });

//     // Step 4a: Extract PR description
//     let prDescription = '';

//     if (prFile) {
//         // Read from specified file
//         prDescription = await fs.readFile(prFile, 'utf8');
//         log(`   📄 Read PR description from: ${prFile}`, 'success');
//     } else {
//         prDescription = await extractPRDescriptionFromTask(task, TARGET_ROOT);
//     }

//     // Create commits
//     log(`\n💾 Creating commits...`, 'info');

//     // Stage all changes
//     const commitResult = createCommit(
//         `Implement ${task.name}`,
//         {
//             prefix: `feat(${task.id})`,
//             all: true,
//             body: `Task: ${task.id}\nImplemented: ${task.name}`
//         }
//     );

//     if (commitResult.success && commitResult.commitHash) {
//         log(`   ✅ Created commit: ${commitResult.commitHash.slice(0, 7)}`, 'success');
//     } else {
//         log(`   ❌ Commit failed: ${commitResult.error}`, 'error');
//         throw new Error(`Commit failed: ${commitResult.error}`);
//     }

//     // Create PR
//     log(`\n🚀 Creating pull request...`, 'info');

//     const prResult = await createPR(
//         `feat(${task.id}): ${task.name}`,
//         prDescription,
//         { draft },
//         TARGET_ROOT
//     );

//     if (prResult.success && prResult.url && prResult.number) {
//         log(`\n✅ Pull request created!`, 'success');
//         log(`   URL: ${prResult.url}`, 'info');
//         log(`   Number: #${prResult.number}`, 'info');

//         // Update task file with PR info
//         await updateTaskFile(task.path, {
//             pr_number: prResult.number,
//             pr_url: prResult.url,
//             pr_created_at: new Date().toISOString()
//         });

//     } else {
//         log(`\n❌ Failed to create PR: ${prResult.error}`, 'error');
//         throw new Error(`Failed to create PR: ${prResult.error}`);
//     }
// }