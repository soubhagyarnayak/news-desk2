import { AuthService } from './auth.service';

// Legacy Nest controller converted to plain class; routing handled in Express.
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  async register(user: any) {
    return this.authService.register(user);
  }

  async logIn(request: any, response: any) {
    const user = request.user;
    const cookie = this.authService.getCookieWithJwtToken(user.username);
    response.setHeader('Set-Cookie', cookie);
    user.password = undefined;
    return response.send(user);
  }

  async getLogInPage(req: any, res: any) {
    return res.render('login', {});
  }
}
