import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { HttpException } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common';
import { User } from '../users/user.interface';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '../config.service';
import { TokenPayload } from './tokenPayload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(username: string, pass: string): Promise<User> {
    try {
      const password = await this.usersService.getPassword(username);
      const isValidPassword = await bcrypt.compare(pass, password);
      if (!isValidPassword) {
        throw new HttpException(
          'Wrong credentials provided',
          HttpStatus.BAD_REQUEST,
        );
      }
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Wrong credentials provided',
        HttpStatus.BAD_REQUEST,
      );
    }
    return { username: username, password: pass };
  }

  async register(user: User) {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    console.log(hashedPassword);
    try {
      await this.usersService.create(user.username, hashedPassword);
      user.password = undefined;
      return user;
    } catch (error) {
      //TODO:handle unique key violation differently
      throw new HttpException(
        'Failed to create user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  public getCookieWithJwtToken(username: string) {
    const payload: TokenPayload = { username };
    const token = this.jwtService.sign(payload);
    console.log(token);
    return `Authentication=${token}; HttpOnly; Path=/; Max-Age=${this.configService.get(
      'JWT_EXPIRATION_TIME',
    )}`;
  }
}
