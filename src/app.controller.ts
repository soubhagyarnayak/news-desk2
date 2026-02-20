import { AppService } from './app.service';

// AppController converted to plain class; routing handled by Express routes.
export class AppController {
  constructor(private readonly appService: AppService) {}

  getIndex(req: any, res: any) {
    return res.render('index');
  }

  async login(req: any) {
    return req.user;
  }
}
