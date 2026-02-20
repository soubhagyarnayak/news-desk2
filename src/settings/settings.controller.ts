import { SettingsService } from './settings.service';

export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}
  async getHn(req: any, res: any) {
    return res.render('settings');
  }
  async command(req: any, res: any) {
    let result = true;
    console.log(`Trying to run command:${req.body.command}`);
    if (req.body.command == 'hnrefresh') {
      result = await this.settingsService.runCommand('processHN');
    } else if (req.body.command == 'opedrefresh') {
      result = await this.settingsService.runCommand('processOpEd');
    } else if (req.body.command == 'purgehn') {
      result = await this.settingsService.runCommand('purgeHN');
    } else {
      console.log(`Command ${req.body.command} is not currently supported.`);
      res.status(400).send();
      return;
    }
    console.log(`Ran command: ${req.body.command} and got result: ${result}`);
    if (!result) {
      res.status(500).send();
    }
  }
}
