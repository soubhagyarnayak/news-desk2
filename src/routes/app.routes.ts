import { Router } from 'express';
import passport = require('passport');

const router = Router();

router.get('/', (req, res) => {
  return res.render('index');
});

router.post('/auth/login',
  passport.authenticate('local', { session: false }),
  (req, res) => {
    // `passport` attaches the authenticated user to `req.user`
    return res.json(req.user);
  },
);

export default router;
