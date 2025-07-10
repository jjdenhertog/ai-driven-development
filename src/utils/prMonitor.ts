import { execSync } from "node:child_process";
import { promises as fs } from "node:fs";
import { join } from "node:path";

import { ensureDir } from "./filesystem";
import { updateTaskWithMergeInfo } from "./tasks/updateTaskWithMergeInfo";

type PRStatus = {
    merged: PRInfo[]
    needsAction: PRInfo[]
    waiting: PRInfo[]
    failed: PRInfo[]
}

type PRInfo = {
    taskId: string
    number: number
    title: string
    state: string
    action?: string
    mergeCommit?: string
}

type ProcessResult = {
    success: boolean
    error?: string
}

export async function checkAllPRs(targetRoot: string): Promise<PRStatus> {
    const status: PRStatus = {
        merged: [],
        needsAction: [],
        waiting: [],
        failed: []
    };
    
    try {
        // Get all open PRs
        const prsJson = execSync('gh pr list --json number,title,state,headRefName --limit 100', { 
            cwd: targetRoot 
        }).toString();
        
        const prs = JSON.parse(prsJson);
        
        for (const pr of prs) {
            // Check if this is an AI branch
            if (!pr.headRefName?.startsWith('ai/'))
                continue;
            
            const taskId = pr.headRefName.replace('ai/', '');
            const prInfo: PRInfo = {
                taskId,
                number: pr.number,
                title: pr.title,
                state: pr.state
            };
            
            // Get detailed PR info including merge commit
            const prDetailJson = execSync(`gh pr view ${pr.number} --json state,mergeable,reviews,mergeCommit`, {
                cwd: targetRoot
            }).toString();
            
            const prDetail = JSON.parse(prDetailJson);
            
            if (prDetail.state === 'MERGED') {
                // Add merge commit info if available
                if (prDetail.mergeCommit?.oid) {
                    prInfo.mergeCommit = prDetail.mergeCommit.oid;
                }
                
                status.merged.push(prInfo);
            } else if (prDetail.state === 'CLOSED') {
                status.failed.push(prInfo);
            } else if (prDetail.mergeable === 'CONFLICTING') {
                prInfo.action = 'Resolve conflicts';
                status.needsAction.push(prInfo);
            } else if (prDetail.reviews?.some((r: any) => r.state === 'CHANGES_REQUESTED')) {
                prInfo.action = 'Address review feedback';
                status.needsAction.push(prInfo);
            } else {
                status.waiting.push(prInfo);
            }
        }
    } catch (_error) {
        // Handle error
    }
    
    return status;
}

export async function processMergedPR(pr: PRInfo, targetRoot: string): Promise<ProcessResult> {
    try {
        // First, update the task with merge information
        if (pr.mergeCommit) {
            updateTaskWithMergeInfo(pr.taskId, pr.number, pr.mergeCommit);
        }
        
        const tasksDir = join(targetRoot, 'ai-dev', 'tasks');
        const pendingPath = join(tasksDir, 'pending');
        const inProgressPath = join(tasksDir, 'in_progress');
        const completedPath = join(tasksDir, 'completed');
        
        ensureDir(completedPath);
        
        // Find the task file
        let taskFile: string | null = null;
        let sourcePath: string | null = null;
        
        // Check in progress
        try {
            const inProgressFiles = await fs.readdir(inProgressPath);
            const found = inProgressFiles.find(f => f.startsWith(pr.taskId));
            if (found) {
                taskFile = found;
                sourcePath = join(inProgressPath, found);
            }
        } catch {
            // Directory doesn't exist
        }
        
        // Check pending if not found
        if (!taskFile) {
            try {
                const pendingFiles = await fs.readdir(pendingPath);
                const found = pendingFiles.find(f => f.startsWith(pr.taskId));
                if (found) {
                    taskFile = found;
                    sourcePath = join(pendingPath, found);
                }
            } catch {
                // Directory doesn't exist
            }
        }
        
        if (!taskFile || !sourcePath) {
            return { success: false, error: 'Task file not found' };
        }
        
        // Move to completed
        const destPath = join(completedPath, taskFile);
        await fs.rename(sourcePath, destPath);
        
        // Save learning data
        const learningDir = join(targetRoot, 'ai-dev', 'learning');
        ensureDir(learningDir);
        
        const learningFile = join(learningDir, `${pr.taskId}.json`);
        const learningData = {
            taskId: pr.taskId,
            prNumber: pr.number,
            title: pr.title,
            completedAt: new Date().toISOString()
        };
        
        await fs.writeFile(learningFile, JSON.stringify(learningData, null, 2));
        
        return { success: true };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to process PR'
        };
    }
}

export async function generateActionReport(status: PRStatus, targetRoot: string): Promise<string> {
    const reportsDir = join(targetRoot, 'ai-dev', 'reports');
    ensureDir(reportsDir);
    
    const timestamp = new Date().toISOString()
        .replace(/[.:]/g, '-');
    const reportPath = join(reportsDir, `pr-status-${timestamp}.md`);
    
    let reportContent = `# PR Status Report
Generated: ${new Date().toISOString()}

## Summary
- Merged: ${status.merged.length}
- Needs Action: ${status.needsAction.length}
- Waiting Review: ${status.waiting.length}
- Failed/Closed: ${status.failed.length}

`;
    
    if (status.merged.length > 0) {
        reportContent += '## Merged PRs\n';

        for (const pr of status.merged) {
            reportContent += `- [${pr.taskId}] ${pr.title} (#${pr.number})\n`;
        }
        reportContent += '\n';
    }
    
    if (status.needsAction.length > 0) {
        reportContent += '## PRs Needing Action\n';

        for (const pr of status.needsAction) {
            reportContent += `- [${pr.taskId}] ${pr.title} (#${pr.number}) - ${pr.action}\n`;
        }
        reportContent += '\n';
    }
    
    await fs.writeFile(reportPath, reportContent);
    
    return reportPath;
}