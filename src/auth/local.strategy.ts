import { Strategy } from 'passport-local';
import { AuthService } from './auth.service';
import { User } from 'src/users/user.interface';

// LocalStrategy removed — passport-local is configured directly in src/auth/passport.ts
export class LocalStrategy {}
