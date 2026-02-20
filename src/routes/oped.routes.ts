import { Router } from 'express';
import passport = require('passport');
import { join } from 'path';
import { ConfigService } from '../config.service';
import { OpedService } from '../oped/oped.service';

const router = Router();

const config = new ConfigService(join(__dirname, '..', '.env'));
const opedService = new OpedService(config);

router.use(passport.authenticate('jwt', { session: false }));

router.get('/', async (req, res) => {
  const categories = await opedService.getAll();
  console.log(categories);
  console.log(categories.pending);
  res.render('oped', {
    categories: categories.categories,
    pending: categories.pending,
  });
});

router.post('/', async (req, res) => {
  let result = false;
  if (req.body.operation == 'markRead') {
    result = await opedService.markRead(req.body.id);
  } else if (req.body.operation == 'remove') {
    result = await opedService.remove(req.body.id);
  } else if (req.body.operation == 'annotate') {
    result = await opedService.annotate(
      req.body.id,
      req.body.notes,
      req.body.tags,
    );
  }
  if (result) {
    res.status(200).send('success');
  } else {
    res.status(400).send('failure');
  }
});

router.get('/article', async (req, res) => {
  const annotation = await opedService.getArticle(req.query.id as string);
  if (annotation == null) {
    res.status(500).send('Error');
  } else {
    res.status(200).send(annotation);
  }
});

export default router;
