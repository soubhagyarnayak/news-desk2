import { Body, Req, Controller, HttpCode, Post, UseGuards, Res, Get } from '@nestjs/common'
import { AuthService } from './auth.service'
import RequestWithUser from './requestWithUser.interface';
import { LocalAuthenticationGuard } from './local.auth.guard';
import { User } from '../users/user.interface';

@Controller('authentication')
export class AuthController {
  constructor(
    private readonly authService: AuthService
  ) {}
 
  @Post('register')
  async register(@Body() user: User) {
    return this.authService.register(user);
  }
 
  @HttpCode(200)
  @UseGuards(LocalAuthenticationGuard)
  @Post('log-in')
  async logIn(@Req() request: RequestWithUser, @Res() response) {
    const user = request.user
    const cookie = this.authService.getCookieWithJwtToken(user.username)
    response.setHeader('Set-Cookie', cookie)
    user.password = undefined
    return response.send(user);
  }

  @Get()
  async getLogInPage(@Req() req, @Res() res) {
    return res.render('login',{});
  }

}