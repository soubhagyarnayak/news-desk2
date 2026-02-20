// Removed Nest `@Injectable` decorator — plain class
import { Channel, Connection, connect } from 'amqplib';
import { ConfigService } from '../config.service';

type Command = 'processHN' | 'processOpEd' | 'purgeHN';

export class SettingsService {
  private queueConnectionString: string;

  constructor(config: ConfigService) {
    this.queueConnectionString = config.get('QUEUE_CONNECTION_STRING');
  }

  async runCommand(command: Command): Promise<boolean> {
    let connection: Connection, channel: Channel;
    try {
      connection = await connect(this.queueConnectionString);
      channel = await connection.createChannel();
      await channel.sendToQueue(
        'newsparser',
        Buffer.from(`{"command": "${command}"}`, 'utf-8'),
      );
    } catch (error) {
      console.log(`Encountered error:${error}`);
      return false;
    } finally {
      await channel.close();
      await connection.close();
    }
    return true;
  }
}
