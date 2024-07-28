import { Controller,Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import JwtAuthGuard from '../auth/jwt.auth.guard';
import { SettingsService } from './settings.service'

@Controller('settings')
@UseGuards(JwtAuthGuard)
export class SettingsController {
    constructor(private readonly settingsService: SettingsService) {}
    @Get()
    async getHn(@Req() req, @Res() res) {
        return res.render('settings');
    }
    @Post("command")
    async command(@Req() req, @Res() res){
        let result = true;
		console.log(`Trying to run command:${req.body.command}`);
        if(req.body.command == 'hnrefresh'){
            result = await this.settingsService.runCommand('processHN');
        }
        else if(req.body.command == 'opedrefresh'){
            result = await this.settingsService.runCommand('processOpEd');
        }
        else if(req.body.command == 'purgehn'){
            result = await this.settingsService.runCommand('purgeHN');
        }
        else{
            console.log(`Command ${req.body.command} is not currently supported.`);
            res.status(400).send();
        }
        console.log(`Ran command: ${req.body.command} and got result: ${result}`);
		if(!result){
			res.status(500).send();
		}
    }
}
