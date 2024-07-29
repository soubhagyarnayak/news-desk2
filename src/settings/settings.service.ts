import { Injectable } from '@nestjs/common';
import { connect } from 'amqplib';
import { ConfigService } from '../config.service';

type Command = 'processHN' | 'processOpEd' | 'purgeHN';

@Injectable()
export class SettingsService {
  private queueConnectionString: string;

  constructor(config: ConfigService) {
    this.queueConnectionString = config.get('QUEUE_CONNECTION_STRING');
  }

  async runCommand(command: Command): Promise<boolean> {
    try {
      const connection = await connect(this.queueConnectionString);
      const channel = await connection.createChannel();
      await channel.sendToQueue(
        'newsparser',
        Buffer.from(`{"command": "${command}"}`, 'utf-8'),
      );
      await connection.close();
    } catch (error) {
      console.log(`Encountered error:${error}`);
      return false;
    }
    return true;
  }
}
