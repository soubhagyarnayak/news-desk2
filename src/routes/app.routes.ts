import { Router } from 'express';
import { join } from 'path';
import passport = require('passport');
import { ConfigService } from '../config.service';
import { StocksService } from '../stocks/stocks.service';

const router = Router();

const config = new ConfigService(join(__dirname, '..', '..', '.env'));
const stocksService = new StocksService(config);

router.get('/', async (req, res) => {
  let stocks = [];
  try {
    stocks = await stocksService.getAllStocks();
  } catch (error) {
    console.error('Error fetching stocks for index:', error);
  }
  return res.render('index', { stocks });
});

router.post('/auth/login',
  passport.authenticate('local', { session: false }),
  (req, res) => {
    return res.json(req.user);
  },
);

export default router;
