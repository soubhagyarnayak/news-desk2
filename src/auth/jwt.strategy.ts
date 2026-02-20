import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { UsersService } from '../users/users.service';
import { TokenPayload } from './tokenPayload.interface';
import { ConfigService } from '../config.service';

// JwtStrategy wrapper removed — passport-jwt is configured in src/auth/passport.ts
export class JwtStrategy {}
