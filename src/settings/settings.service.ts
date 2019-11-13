import { Injectable } from '@nestjs/common';
import { connect } from 'amqplib';
import { ConfigService } from '../config.service';

@Injectable()
export class SettingsService {
    private queueConnectionString: string;

    constructor(config: ConfigService) {
        this.queueConnectionString = config.get('QUEUE_CONNECTION_STRING');
    }

    async runCommand(command:any):Promise<boolean>{
        connect(this.queueConnectionString)
        .then(connection => {
            connection.createChannel()
                .tap(channel => channel.checkQueue('newsparser'))
                .then(channel => channel.sendToQueue('newsparser', new Buffer(command)))
                .finally(() => setTimeout(function() { connection.close();}, 500));
        }).error(function(reason:any){
            console.log(`Encountered error:${reason}`);
            return false;
        });
        return true;
    }
}
