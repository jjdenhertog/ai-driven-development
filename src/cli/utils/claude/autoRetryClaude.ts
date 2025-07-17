import { log } from "../logger";
import { SessionReport } from "../storage/createSessionReport";
import { checkUsageLimitInSession } from "./checkUsageLimitInSession";
import { waitForUsageLimitReset } from "./checkUsageLimitInSession";

type Options = {
    claudeCommand: () => Promise<SessionReport>;
    logPath: string;
}

export async function autoRetryClaude(options: Options): Promise<SessionReport | undefined> {
    const { claudeCommand, logPath } = options;

    let sessionReport;
    const maxRetries = 3;
    let retryCount = 0;

    // Execute Claude with retry logic for usage limits
    while (retryCount <= maxRetries) {

        sessionReport = await claudeCommand();

        // Check for usage limit
        const usageLimitInfo = checkUsageLimitInSession(sessionReport);
        if (usageLimitInfo?.isUsageLimitReached) {
            if (retryCount < maxRetries) {
                retryCount++;
                log(`Retry attempt ${retryCount}/${maxRetries} due to usage limit`, 'info', undefined, logPath);
                await waitForUsageLimitReset(usageLimitInfo.waitTimeSeconds!, usageLimitInfo.resetTimestamp!, logPath);
                continue;
            } else {
                log(`Max retries (${maxRetries}) reached. Giving up.`, 'error', undefined, logPath);
                break;
            }
        }

        // If no usage limit reached, break out of retry loop
        return sessionReport;
    }


}