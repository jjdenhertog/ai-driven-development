// import { monitorPRs } from '../utils/prMonitor.js';
// import { log } from '../utils/logger.js';

// export async function monitorCommand(options: { 
//   watch?: boolean; 
//   interval?: number;
//   repo?: string;
// }): Promise<void> {
//     try {
//         const { watch = false, interval = 60, repo } = options;
    
//         log('Starting PR monitoring...', 'info');
    
//         if (!repo) {
//             log('No repository specified, using current directory', 'info');
//         }
    
//         // Initial check
//         await monitorPRs(repo || process.cwd());
    
//         if (watch) {
//             log(`Watching for PR updates every ${interval} seconds...`, 'info');
//             log('Press Ctrl+C to stop', 'info');
      
//             // Set up interval for continuous monitoring
//             setInterval(async () => {
//                 log('\n--- Checking for updates ---', 'info');
//                 await monitorPRs(repo || process.cwd());
//             }, interval * 1000);
      
//             // Keep the process running
//             process.stdin.resume();
//         }
//     } catch (error) {
//         log(`Error in monitor command: ${  error}`, 'error');
//         throw error;
//     }
// }