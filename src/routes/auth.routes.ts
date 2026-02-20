import { Router } from 'express';
import passport = require('passport');
import { join } from 'path';
import { ConfigService } from '../config.service';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import jwt = require('jsonwebtoken');

const router = Router();
const config = new ConfigService(join(__dirname, '..', '.env'));
const usersService = new UsersService(config);

router.get('/', (req, res) => {
  return res.render('login', {});
});

router.post(
  '/log-in',
  passport.authenticate('local', { session: false }),
  (req, res) => {
    const user = (req as any).user;
    const jwtSecret = config.get<string>('JWT_SECRET');
    const expires = Number(config.get<number>('JWT_EXPIRATION_TIME')) || 3600;
    const token = jwt.sign({ username: user.username }, jwtSecret || 'changeme', {
      expiresIn: expires,
    });
    const cookie = `Authentication=${token}; HttpOnly; Path=/; Max-Age=${expires}`;
    res.setHeader('Set-Cookie', cookie);
    if (user.password) user.password = undefined;
    return res.send(user);
  },
);

router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    await usersService.create(username, hashed);
    return res.status(201).send({ username });
  } catch (err) {
    return res.status(500).send({ message: 'Failed to register' });
  }
});

export default router;
