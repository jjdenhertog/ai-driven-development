import { startProxyServer, stopProxyServer } from '../utils/docker/proxyServer';
import { log } from '../utils/logger';

type Options = {
    action: 'start' | 'stop';
};

export async function proxyCommand(options: Options): Promise<void> {
    const { action } = options;

    try {
        if (action === 'start') {
            startProxyServer();
        } else if (action === 'stop') {
            stopProxyServer();
            log('Proxy server stopped', 'success');
        }
    } catch (error) {
        log(`Failed to ${action} proxy server: ${error instanceof Error ? error.message : String(error)}`, 'error');
        throw error;
    }
}