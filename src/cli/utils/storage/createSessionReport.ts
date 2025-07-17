/* eslint-disable max-lines */
import { ensureDirSync, existsSync, readdirSync, rmSync, writeFileSync } from 'fs-extra';
import { join } from 'node:path';

import { log } from '../logger';
import { SessionReport } from '../../types/session-report/SessionReport';
import { CreateSessionReportOptions } from '../../types/session-report/CreateSessionReportOptions';
import { TranscriptEntry } from '../../types/session-report/TranscriptEntry';
import { findTranscriptPath } from '../session-report/findTranscriptPath';
import { buildSessionReport } from '../session-report/buildSessionReport';
import { parseLogFile } from '../session-report/parseLogFile';
import { parseTranscriptFile } from '../session-report/parseTranscriptFile';
import { saveErrorReport } from '../session-report/saveErrorReport';

export { SessionReport } from '../../types/session-report/SessionReport';

/**
 * Creates a session report from debug logs and transcript files
 */
export async function createSessionReport(options: CreateSessionReportOptions): Promise<SessionReport> {
    const { taskId, taskName, worktreePath, logsDir, exitCode } = options;
    const debugLogsPath = join(worktreePath, 'debug_logs');
    const outputPath = join(logsDir, 'claude.json');
    ensureDirSync(logsDir);

    try {
        // Check if debug logs directory exists
        if (!existsSync(debugLogsPath)) {
            log('No debug logs found, creating error report', 'warn');

            return await saveErrorReport({
                taskId,
                taskName,
                errorMessage: 'Debug logs directory not found',
                outputPath: join(logsDir, 'claude.json')
            });
        }

        // Find the first log file
        const logFiles = readdirSync(debugLogsPath).filter(f => f.endsWith('.jsonl'));
        if (logFiles.length === 0) {
            log('No log files found in debug_logs', 'warn');

            return await saveErrorReport({
                taskId,
                taskName,
                errorMessage: 'No log files found in debug_logs directory',
                outputPath: join(logsDir, 'claude.json')
            });
        }

        const logFilePath = join(debugLogsPath, logFiles[0]);
        log(`Processing log file: ${logFiles[0]}`, 'info');

        // Read and parse the log file
        const logEntries = parseLogFile(logFilePath);

        // Extract session ID from the first valid entry
        const sessionId = logEntries.find(entry => entry.sessionId)?.sessionId;
        if (!sessionId) {
            log('Could not find session ID in logs', 'warn');

            return await saveErrorReport({
                taskId,
                taskName,
                errorMessage: 'Session ID not found in logs',
                outputPath: join(logsDir, 'claude.json')
            });
        }

        // Find transcript path from logs
        const transcriptPath = findTranscriptPath(logEntries);
        let transcriptEntries: TranscriptEntry[] = [];

        if (transcriptPath && existsSync(transcriptPath)) {
            transcriptEntries = parseTranscriptFile(transcriptPath);
        }

        // Build the session report
        const report = buildSessionReport(
            sessionId,
            taskId,
            taskName,
            logEntries,
            transcriptEntries,
            exitCode
        );

        // Save the report
        writeFileSync(outputPath, JSON.stringify(report, null, 2));
        log(`Session report created: ${outputPath}`, 'success');

        // Clean up debug logs
        try {
            rmSync(debugLogsPath, { recursive: true, force: true });
            log('Debug logs cleaned up', 'info');
        } catch (cleanupError) {
            log(`Failed to clean up debug logs: ${String(cleanupError)}`, 'warn');
        }
        
        return report;

    } catch (error) {
        log(`Error creating session report: ${String(error)}`, 'error');

        return saveErrorReport({
            errorMessage: `Failed to create session report: ${error instanceof Error ? error.message : String(error)}`,
            outputPath
        });
    }
}