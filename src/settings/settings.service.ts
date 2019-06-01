import { Injectable } from '@nestjs/common';
import { connect } from 'amqplib';

@Injectable()
export class SettingsService {
    async runCommand(command:any):Promise<boolean>{
        connect('amqp://localhost')
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
