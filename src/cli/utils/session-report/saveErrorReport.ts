import { ensureDirSync, writeFileSync } from 'fs-extra';
import { dirname } from 'node:path';
import { SessionReport } from '../../types/session-report/SessionReport';
import { SaveErrorReportOptions } from '../../types/session-report/SaveErrorReportOptions';

export async function saveErrorReport(options: SaveErrorReportOptions): Promise<SessionReport> {
    const { taskId, taskName, errorMessage, outputPath } = options;

    const report: SessionReport = {
        session_id: 'unknown',
        task_id: taskId || 'unknown',
        task_name: taskName || 'unknown',
        user_prompt: 'Unable to retrieve user prompt',
        success: false,
        success_reason: errorMessage,
        timeline: [{
            type: 'error',
            timestamp: new Date().toISOString(),
            message: errorMessage
        }]
    };

    // Ensure directory exists
    ensureDirSync(dirname(outputPath));

    writeFileSync(outputPath, JSON.stringify(report, null, 2));

    return report;
} 