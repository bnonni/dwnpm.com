import { Logger } from '../../utils/logger.js';
import { ICommand } from '../drpm.js';

export class RegistryCommand implements ICommand {
  async execute({ subcommand }: { subcommand?: string }): Promise<void> {
    if (subcommand === 'start') {
      await this.start();
    }
  }

  private async start() {
    try {
      Logger.info('Starting registry server ...');
      const { DPR } = await import('../../dpr/index.js');
      const server = new DPR();
      server.start();
    } catch (error: any) {
      Logger.error(`Failed to start registry server: ${error.message}`);
      throw error;
    }
  }
}