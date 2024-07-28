import { Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthGuard } from '@nestjs/passport';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  //@UseGuards(AuthGuard('local'))
  getIndex(@Req() req, @Res() res) {
    return res.render('index');
  }

  @UseGuards(AuthGuard('local'))
  @Post('auth/login')
  async login(@Req() req) {
    return req.user;
  }
}
