import passport = require('passport');
import { Strategy as LocalStrategy } from 'passport-local';
import { ExtractJwt, Strategy as JwtStrategy } from 'passport-jwt';
import * as bcrypt from 'bcrypt';
import { join } from 'path';
import { ConfigService } from '../config.service';
import { UsersService } from '../users/users.service';

export function configurePassport() {
  const configService = new ConfigService(join(__dirname, '..', '.env'));
  const usersService = new UsersService(configService);

  passport.use(
    new LocalStrategy(async (username: string, password: string, done) => {
      try {
        // debug logging to diagnose auth failures
        // eslint-disable-next-line no-console
        console.log('LocalStrategy: authenticating', { username });
        const hash = await usersService.getPassword(username);
        // eslint-disable-next-line no-console
        console.log('LocalStrategy: password hash retrieved', { username, hasHash: !!hash });
        if (!hash) return done(null, false);
        const valid = await bcrypt.compare(password, hash);
        // eslint-disable-next-line no-console
        console.log('LocalStrategy: password compare result', { username, valid });
        if (!valid) return done(null, false);
        return done(null, { username });
      } catch (err) {
        return done(err as any);
      }
    }),
  );

  passport.use(
    new JwtStrategy(
      {
        jwtFromRequest: ExtractJwt.fromExtractors([
          (req: any) => req?.cookies?.Authentication,
        ]),
        secretOrKey: configService.get('JWT_SECRET'),
      },
      async (payload: any, done: any) => {
        try {
          const pw = await usersService.getPassword(payload.username);
          if (!pw) return done(null, false);
          return done(null, { username: payload.username });
        } catch (err) {
          return done(err);
        }
      },
    ),
  );
}

export default configurePassport;
