import { Router } from 'express';
import passport = require('passport');
import { join } from 'path';
import { ConfigService } from '../config.service';
import { SettingsService } from '../settings/settings.service';

const router = Router();
const config = new ConfigService(join(__dirname, '..', '..','.env'));
const settingsService = new SettingsService(config);

//router.use(passport.authenticate('jwt', { session: false }));

router.get('/', async (req, res) => {
  return res.render('settings');
});

router.post('/command', async (req, res) => {
  let result = true;
  console.log(`Trying to run command:${req.body.command}`);
  if (req.body.command == 'hnrefresh') {
    result = await settingsService.runCommand('processHN');
  } else if (req.body.command == 'opedrefresh') {
    result = await settingsService.runCommand('processOpEd');
  } else if (req.body.command == 'purgehn') {
    result = await settingsService.runCommand('purgeHN');
  } else {
    console.log(`Command ${req.body.command} is not currently supported.`);
    return res.status(400).send();
  }
  console.log(`Ran command: ${req.body.command} and got result: ${result}`);
  if (!result) {
    res.status(500).send();
  } else {
    res.status(200).send();
  }
});

export default router;
